
'use server';

import { prisma } from '@/lib/prisma';

export type YearlyStat = {
    systemName: string;
    year: string;
    jackpots: number;
    highPrizes: number;
    rank?: number;
};

export async function getTopSystemsYearlyAnalysis() {
    // 1. Get Top 6 Systems
    const topRankings = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 6,
        select: { systemName: true, avgAccuracy: true }
    });

    const systems = topRankings.map(r => r.systemName);

    // 1.1 Also include Jackpot Leaders (so they appear in the table even if accuracy is lower)
    const jackpotLeaders = await getJackpotLeaders();
    const leaderNames = jackpotLeaders.map(l => l.systemName);

    // Merge and Deduplicate
    const allSystems = Array.from(new Set([...systems, ...leaderNames]));

    // 2. Get Performance Data
    const data = await prisma.systemPerformance.findMany({
        where: { systemName: { in: allSystems } },
        include: { draw: { select: { date: true } } }
    });

    const yearlyStats: Record<string, Record<string, { jackpots: number, highPrizes: number }>> = {};

    data.forEach(p => {
        const year = p.draw.date.getFullYear().toString();
        const sys = p.systemName;

        if (!yearlyStats[year]) yearlyStats[year] = {};
        if (!yearlyStats[year][sys]) yearlyStats[year][sys] = { jackpots: 0, highPrizes: 0 };

        if (p.hits === 5) yearlyStats[year][sys].jackpots++;
        if (p.hits === 4) yearlyStats[year][sys].highPrizes++;
    });

    // 3. Format for UI
    // We want the last 5 years
    const years = Object.keys(yearlyStats).sort().reverse().slice(0, 5);
    const result: Record<string, YearlyStat[]> = {};

    for (const year of years) {
        const stats = yearlyStats[year];
        const yearData: YearlyStat[] = [];

        for (const sys of allSystems) {
            const s = stats[sys] || { jackpots: 0, highPrizes: 0 };
            yearData.push({
                systemName: sys,
                year,
                jackpots: s.jackpots,
                highPrizes: s.highPrizes,
                rank: topRankings.findIndex(r => r.systemName === sys) + 1
            });
        }

        // Sort by Jackpots desc
        result[year] = yearData.sort((a, b) => (b.jackpots - a.jackpots) || (b.highPrizes - a.highPrizes));
    }

    return result;
}


export async function getJackpotLeaders() {
    // Get all active systems
    const activeSystems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        select: { name: true }
    });

    // Calculate jackpots for each system with deduplication
    const leadersData = await Promise.all(
        activeSystems.map(async (system) => {
            // Get all performances for this system
            const allPerformances = await prisma.systemPerformance.findMany({
                where: {
                    systemName: system.name,
                    hits: 5  // Only get jackpots
                },
                select: { drawId: true }
            });

            // DEDUPLICATE - Count unique draws with 5 hits
            const uniqueDrawIds = new Set(allPerformances.map(p => p.drawId));
            const jackpots = uniqueDrawIds.size;

            return {
                systemName: system.name,
                jackpots
            };
        })
    );

    // Sort by jackpots and return top 3
    return leadersData
        .sort((a, b) => b.jackpots - a.jackpots)
        .slice(0, 3);
}


export async function getLastDrawNumberSystems() {
    // 1. Get the most recent draw date from SystemPrediction table
    const lastPred = await prisma.systemPrediction.findFirst({
        orderBy: { draw: { date: 'desc' } },
        select: { drawId: true, draw: { select: { date: true, numbers: true } } }
    });

    if (!lastPred) return { date: null, systems: [] };

    // 2. Get all predictions for this draw
    const predictions = await prisma.systemPrediction.findMany({
        where: { drawId: lastPred.drawId },
        orderBy: { hits: 'desc' },
        take: 20 // Process top 20 to find winners
    });

    const drawDate = lastPred.draw.date.toLocaleDateString('pt-PT');
    const drawNumbers = typeof lastPred.draw.numbers === 'string'
        ? JSON.parse(lastPred.draw.numbers)
        : lastPred.draw.numbers;

    return {
        date: drawDate,
        systems: predictions.map(p => ({
            systemName: p.systemName,
            hits: p.hits,
            predicted: undefined // We might not store the exact prediction in performance, but hits is enough
        })).filter(s => s.hits > 0)
    };
}

/**
 * Get next prediction for a specific number system
 */
export async function getNumberPrediction(systemName: string): Promise<number[]> {
    try {
        // Get the system's prediction function
        const system = await prisma.rankedSystem.findUnique({
            where: { name: systemName }
        });

        if (!system) return [];

        // Get cached prediction if available
        const cached = await prisma.cachedPrediction.findFirst({
            where: { systemName },
            orderBy: { updatedAt: 'desc' }
        });

        if (cached && cached.numbers) {
            const prediction = typeof cached.numbers === 'string'
                ? JSON.parse(cached.numbers)
                : cached.numbers;
            return prediction.slice(0, 25); // Return top 25
        }

        return [];
    } catch (error) {
        console.error(`Error getting prediction for ${systemName}:`, error);
        return [];
    }
}

/**
 * Get aggregated stats for a specific range of history (e.g. Last 100)
 */
export async function getSystemStatsForRange(systemName: string, range: number) {
    try {
        // 1. Get the last N predictions
        // We switch to SystemPerformance as the Source of Truth for historical stats
        const predictions = await prisma.systemPerformance.findMany({
            where: { systemName },
            orderBy: { draw: { date: 'desc' } },
            take: range,
            select: { hits: true } // We don't need 'jackpot' boolean, we calculate from hits
        });

        if (predictions.length === 0) {
            return {
                accuracy: 0,
                total: 0,
                distribution: [0, 0, 0, 0, 0, 0]
            };
        }

        // 2. Calculate Stats in Memory (fast for < 2000 items)
        let totalHits = 0;
        const distribution = [0, 0, 0, 0, 0, 0];

        for (const p of predictions) {
            if (p.hits >= 0 && p.hits <= 5) {
                distribution[p.hits]++;
                totalHits += p.hits;
            }
        }

        // Accuracy: (Total Hits / (Predictions * 5)) * 100
        // Or Average Hits / 5 * 100
        const avgHits = totalHits / predictions.length;
        const accuracy = (avgHits / 5) * 100;

        return {
            accuracy,
            total: predictions.length,
            distribution
        };

    } catch (error) {
        console.error("Error calculating range stats:", error);
        return {
            accuracy: 0,
            total: 0,
            distribution: [0, 0, 0, 0, 0, 0]
        };
    }
}


// ... (imports)

export async function getRankingMetrics() {
    // 1. Determine the Draw Range (Last 100 Draws)
    const lastDraw = await prisma.draw.findFirst({ orderBy: { id: 'desc' } });
    if (!lastDraw) return [];

    const startDrawId = Math.max(1, lastDraw.id - 100);

    // 2. Fetch Performance Data for this range
    const performances = await prisma.systemPerformance.findMany({
        where: {
            drawId: { gte: startDrawId }
        },
        select: {
            systemName: true,
            hits: true,
            accuracy: true,
            system: { select: { description: true } }
        }
    });

    // 3. Aggregate Stats
    const stats: Record<string, {
        name: string,
        description: string,
        hits3: number,
        hits4: number,
        hits5: number,
        totalPreds: number,
        sumAccuracy: number
    }> = {};

    performances.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = {
                name: p.systemName,
                description: p.system?.description || '',
                hits3: 0, hits4: 0, hits5: 0,
                totalPreds: 0, sumAccuracy: 0
            };
        }

        const s = stats[p.systemName];
        s.totalPreds++;
        s.sumAccuracy += p.accuracy;

        if (p.hits === 3) s.hits3++;
        if (p.hits === 4) s.hits4++;
        if (p.hits === 5) s.hits5++;
    });

    // 4. Calculate Scores and Format
    const ranking = Object.values(stats).map(s => {
        // Scoring: 3hits=1pt, 4hits=10pts, 5hits=100pts
        const qualityScore = (s.hits3 * 1) + (s.hits4 * 10) + (s.hits5 * 100);

        // Win Rate (3+):
        const totalWins = s.hits3 + s.hits4 + s.hits5;
        const winRate = s.totalPreds > 0 ? (totalWins / s.totalPreds) * 100 : 0;

        // Old Accuracy
        const oldAccuracy = s.totalPreds > 0 ? s.sumAccuracy / s.totalPreds : 0;

        return {
            systemName: s.name,
            description: s.description,
            accuracy: oldAccuracy,
            winRate: winRate,
            qualityScore: qualityScore,
            hits3: s.hits3,
            hits4: s.hits4,
            hits5: s.hits5,
            totalPredictions: s.totalPreds
        };
    });

    // 5. Sort by Quality Score
    return ranking.sort((a, b) => b.qualityScore - a.qualityScore);
}


export async function getAllTimeRankingMetrics() {
    // 1. Fetch Performance Data for ALL history
    const performances = await prisma.systemPerformance.findMany({
        select: {
            systemName: true,
            hits: true,
            accuracy: true,
            system: { select: { description: true } }
        }
    });

    // 2. Aggregate Stats
    const stats: Record<string, {
        name: string,
        description: string,
        hits3: number,
        hits4: number,
        hits5: number,
        totalPreds: number,
        sumAccuracy: number
    }> = {};

    performances.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = {
                name: p.systemName,
                description: p.system?.description || '',
                hits3: 0, hits4: 0, hits5: 0,
                totalPreds: 0, sumAccuracy: 0
            };
        }

        const s = stats[p.systemName];
        s.totalPreds++;
        s.sumAccuracy += p.accuracy;

        if (p.hits === 3) s.hits3++;
        if (p.hits === 4) s.hits4++;
        if (p.hits === 5) s.hits5++;
    });

    // 3. Calculate Scores and Format
    const ranking = Object.values(stats).map(s => {
        // Scoring: 3hits=1pt, 4hits=10pts, 5hits=100pts
        const qualityScore = (s.hits3 * 1) + (s.hits4 * 10) + (s.hits5 * 100);

        // Win Rate (3+):
        const totalWins = s.hits3 + s.hits4 + s.hits5;
        const winRate = s.totalPreds > 0 ? (totalWins / s.totalPreds) * 100 : 0;

        // Old Accuracy
        const oldAccuracy = s.totalPreds > 0 ? s.sumAccuracy / s.totalPreds : 0;

        return {
            systemName: s.name,
            description: s.description,
            accuracy: oldAccuracy,
            winRate: winRate,
            qualityScore: qualityScore,
            hits3: s.hits3,
            hits4: s.hits4,
            hits5: s.hits5,
            totalPredictions: s.totalPreds
        };
    });

    // 4. Sort by Quality Score
    return ranking.sort((a, b) => b.qualityScore - a.qualityScore);
}
