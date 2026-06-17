/**
 * UNIFIED SYSTEM PERFORMANCE SERVICE
 * 
 * This is the SINGLE SOURCE OF TRUTH for system performance data.
 * ALL pages must use this service to ensure consistency.
 * 
 * Data Source Priority:
 * 1. Database (SystemPerformance table) - Always up-to-date
 * 2. Deduplication: Only 1 record per draw (most recent)
 * 3. Consistent calculations across all pages
 */

import { prisma } from '@/lib/prisma';

export interface SystemPerformanceData {
    systemName: string;
    totalDraws: number;
    accuracy: number;
    distribution: number[]; // [0hits, 1hit, 2hits, 3hits, 4hits, 5hits]
    jackpots: number; // Count of 5 hits
    history: Array<{
        date: Date;
        drawNumbers: number[];
        predictedNumbers: number[];
        hits: number;
    }>;
    nextPrediction?: number[];
}

/**
 * Get system performance data with deduplication
 * Ensures only ONE record per draw (the most recent one)
 */
export async function getUnifiedSystemPerformance(
    systemName: string,
    limit?: number
): Promise<SystemPerformanceData | null> {
    try {
        // Step 1: Get ALL performances for this system
        const allPerformances = await prisma.systemPerformance.findMany({
            where: { systemName },
            include: { draw: true },
            orderBy: { draw: { date: 'desc' } }
        });

        if (allPerformances.length === 0) return null;

        // Step 2: DEDUPLICATE - Keep only the most recent record per draw
        const seenDrawIds = new Set<number>();
        const uniquePerformances = allPerformances.filter(p => {
            if (seenDrawIds.has(p.drawId)) {
                return false; // Skip duplicate
            }
            seenDrawIds.add(p.drawId);
            return true;
        });

        // Step 3: Apply limit if specified (for display purposes only)
        const limitedPerformances = limit
            ? uniquePerformances.slice(0, limit)
            : uniquePerformances;

        // Step 4: Calculate statistics from UNIQUE records
        const distribution = [0, 0, 0, 0, 0, 0];
        let totalHits = 0;

        uniquePerformances.forEach(p => {
            const hits = Math.min(5, Math.max(0, p.hits));
            distribution[hits]++;
            totalHits += hits;
        });

        const accuracy = uniquePerformances.length > 0
            ? ((totalHits / uniquePerformances.length) / 5) * 100
            : 0;

        const jackpots = distribution[5];

        // Step 5: Format history
        const gameType = uniquePerformances[0]?.draw.game || 'EUROMILLIONS';
        const defaultPredCount = (gameType === 'EURODREAMS') ? 20 : (gameType === 'MEGASENA' ? 30 : 25);

        const history = limitedPerformances.map(p => {
            const predRaw = JSON.parse(p.predictedNumbers);
            const predSliced = Array.isArray(predRaw) ? predRaw.slice(0, defaultPredCount) : [];
            return {
                date: p.draw.date,
                drawNumbers: JSON.parse(p.actualNumbers),
                predictedNumbers: predSliced,
                hits: p.hits
            };
        });

        // Step 6: Get next prediction (if available)
        const nextPred = await prisma.cachedPrediction.findFirst({
            where: { systemName }
        });

        let nextPredictionSliced: number[] | undefined = undefined;
        if (nextPred) {
            const nextPredRaw = JSON.parse(nextPred.numbers);
            nextPredictionSliced = Array.isArray(nextPredRaw) ? nextPredRaw.slice(0, defaultPredCount) : [];
        }

        return {
            systemName,
            totalDraws: uniquePerformances.length,
            accuracy,
            distribution,
            jackpots,
            history,
            nextPrediction: nextPredictionSliced || undefined
        };

    } catch (error) {
        console.error(`Error fetching unified performance for ${systemName}:`, error);
        return null;
    }
}

/**
 * Get jackpot leaders (systems with most 5-hit predictions)
 * Uses the same deduplication logic
 */
export async function getJackpotLeaders(topN: number = 3) {
    try {
        // Get all active systems
        const systems = await prisma.rankedSystem.findMany({
            where: { isActive: true },
            select: { name: true }
        });

        const leaderboard = await Promise.all(
            systems.map(async (system) => {
                const data = await getUnifiedSystemPerformance(system.name);
                return {
                    systemName: system.name,
                    jackpots: data?.jackpots || 0
                };
            })
        );

        return leaderboard
            .sort((a, b) => b.jackpots - a.jackpots)
            .slice(0, topN);

    } catch (error) {
        console.error('Error fetching jackpot leaders:', error);
        return [];
    }
}
