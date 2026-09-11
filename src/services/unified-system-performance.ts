/**
 * UNIFIED SYSTEM PERFORMANCE SERVICE
 * 
 * This is the SINGLE SOURCE OF TRUTH for system performance data.
 * ALL pages must use this service to ensure consistency.
 */

import { prisma } from "@/lib/prisma";

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

export async function getUnifiedSystemPerformance(
    systemName: string,
    limit?: number
): Promise<SystemPerformanceData | null> {
    try {
        const uniquePerformances = await prisma.systemPrediction.findMany({
            where: { systemName, domain: "NUMBERS" },
            include: { draw: true },
            orderBy: { draw: { date: "desc" } }
        });

        if (uniquePerformances.length === 0) return null;

        const limitedPerformances = limit
            ? uniquePerformances.slice(0, limit)
            : uniquePerformances;

        const distribution = [0, 0, 0, 0, 0, 0];
        let totalHits = 0;

        uniquePerformances.forEach(p => {
            const hits = Math.min(5, Math.max(0, p.num_hits_25 || 0));
            distribution[hits]++;
            totalHits += hits;
        });

        const accuracy = uniquePerformances.length > 0
            ? ((totalHits / uniquePerformances.length) / 5) * 100
            : 0;

        const jackpots = distribution[5];

        const history = limitedPerformances.map(p => {
            let actualNums: number[] = [];
            try { actualNums = typeof p.draw.numbers === "string" ? JSON.parse(p.draw.numbers) : p.draw.numbers; } catch(e){}
            
            let predNums: number[] = [];
            try { predNums = typeof p.prediction === "string" ? JSON.parse(p.prediction) : p.prediction; } catch(e){}
            
            // For UI purposes, we slice to top 25 (the old default size of predictions)
            const top25 = Array.isArray(predNums) ? predNums.slice(0, 25) : [];

            return {
                date: p.draw.date,
                drawNumbers: actualNums,
                predictedNumbers: top25,
                hits: p.num_hits_25 || 0
            };
        });

        // The next prediction is usually the top 25 from the most recent system run for a future draw
        // If there is no future draw run, we just return empty
        let nextPrediction: number[] = [];

        return {
            systemName,
            totalDraws: uniquePerformances.length,
            accuracy,
            distribution,
            jackpots,
            history,
            nextPrediction
        };
    } catch (error) {
        console.error(`[Unified Performance] Error for ${systemName}:`, error);
        return null;
    }
}

export async function getAllSystemsPerformance(): Promise<SystemPerformanceData[]> {
    try {
        const systems = await prisma.rankedSystem.findMany({
            where: { isActive: true },
            select: { name: true }
        });

        const results: SystemPerformanceData[] = [];
        
        for (const system of systems) {
            const data = await getUnifiedSystemPerformance(system.name);
            if (data) {
                results.push(data);
            }
        }

        return results;
    } catch (error) {
        console.error(`[Unified Performance] Error fetching all systems:`, error);
        return [];
    }
}

