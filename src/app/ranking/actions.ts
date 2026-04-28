
'use server';

import { prisma } from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export type YearlyStat = {
    systemName: string;
    year: string;
    jackpots: number;
    highPrizes: number;
    rank?: number;
};

export async function getTopSystemsYearlyAnalysis(game: string = 'EUROMILLIONS') {
    // 1. Get Top 6 Systems for this specific game
    const topRankings = await prisma.systemRanking.findMany({
        where: {
            system: {
                game,
                isActive: true,
                domain: 'NUMBERS' // Only number systems, not stars
            }
        },
        orderBy: { avgAccuracy: 'desc' },
        take: 6,
        select: { systemName: true, avgAccuracy: true }
    });

    const systems = topRankings.map(r => r.systemName);

    // 1.1 Also include Jackpot Leaders (so they appear in the table even if accuracy is lower)
    const jackpotLeaders = await getJackpotLeaders(game);
    const leaderNames = jackpotLeaders.map(l => l.systemName);

    // 1.2 Include Current Year Winners (Anyone who got a High Prize/Jackpot this year)
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const minHits = game === 'EURODREAMS' ? 5 : 4;

    const recentWinners = await prisma.systemPerformance.findMany({
        where: {
            draw: {
                game,
                date: { gte: startOfYear }
            },
            hits: { gte: minHits }
        },
        select: { systemName: true },
        distinct: ['systemName']
    });
    const winnerNames = recentWinners.map(w => w.systemName);

    // Merge and Deduplicate
    const allSystems = Array.from(new Set([...systems, ...leaderNames, ...winnerNames]));

    // 2. Get Performance Data for this game only
    const data = await prisma.systemPerformance.findMany({
        where: {
            systemName: { in: allSystems },
            draw: { game } // Filter by game
        },
        include: { draw: { select: { date: true } } }
    });

    const yearlyStats: Record<string, Record<string, { jackpots: number, highPrizes: number }>> = {};

    data.forEach(p => {
        const year = p.draw.date.getFullYear().toString();
        const sys = p.systemName;

        if (!yearlyStats[year]) yearlyStats[year] = {};
        if (!yearlyStats[year][sys]) yearlyStats[year][sys] = { jackpots: 0, highPrizes: 0 };

        // Logic depends on Game
        if (game === 'EURODREAMS') {
            // For EuroDreams: 6 is Jackpot/Tier1, 5 is High Prize
            if (p.hits === 6) yearlyStats[year][sys].jackpots++;
            if (p.hits === 5) yearlyStats[year][sys].highPrizes++;
        } else {
            // For Euromillions/Totoloto: 5 is Jackpot/Tier1, 4 is High Prize
            if (p.hits === 5) yearlyStats[year][sys].jackpots++;
            if (p.hits === 4) yearlyStats[year][sys].highPrizes++;
        }
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


export async function getJackpotLeaders(game: string = 'EUROMILLIONS') {
    // Get all active systems for this specific game
    const activeSystems = await prisma.rankedSystem.findMany({
        where: {
            isActive: true,
            game: game,
            domain: 'NUMBERS' // Only number systems, not stars
        },
        select: { name: true }
    });

    // Calculate jackpots for each system with deduplication
    const leadersData = await Promise.all(
        activeSystems.map(async (system) => {
            // Get all performances for this system in this game
            const allPerformances = await prisma.systemPerformance.findMany({
                where: {
                    systemName: system.name,
                    hits: game === 'EURODREAMS' ? 6 : 5,
                    draw: { game } // Filter by game
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



export async function getLastDrawNumberSystems(game: string = 'EUROMILLIONS') {
    noStore();
    // 1. Get the most recent draw
    const lastDraw = await prisma.draw.findFirst({
        where: { game },
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    });

    if (!lastDraw) return { date: null, systems: [] };

    // 2. Get all performances for this draw
    const performances = await prisma.systemPerformance.findMany({
        where: {
            drawId: lastDraw.id,
            system: {
                domain: 'NUMBERS'
            }
        },
        orderBy: { hits: 'desc' }
    });

    // 3. AGGRESSIVE DEDUPLICATION - Ensure each systemName appears once
    const uniqueSystems = new Map();
    performances.forEach(p => {
        if (!uniqueSystems.has(p.systemName)) {
            uniqueSystems.set(p.systemName, {
                systemName: p.systemName,
                hits: p.hits
            });
        }
    });

    const drawDate = lastDraw.date.toLocaleDateString('pt-PT');

    return {
        date: drawDate,
        systems: Array.from(uniqueSystems.values()).filter((s: any) => s.hits > 0)
    };
}

/**
 * Get next prediction for a specific number system
 */
export async function getNumberPrediction(systemName: string, game: string = 'EUROMILLIONS'): Promise<number[]> {
    try {
        // Get the system's prediction function
        const system = await prisma.rankedSystem.findUnique({
            where: {
                name_game: {
                    name: systemName,
                    game
                }
            }
        });

        if (!system) return [];

        // Get cached prediction if available
        const cached = await prisma.cachedPrediction.findUnique({
            where: {
                systemName_game: {
                    systemName,
                    game
                }
            }
        });

        if (cached && cached.numbers) {
            const prediction = typeof cached.numbers === 'string'
                ? (typeof cached.numbers === "string" ? JSON.parse(cached.numbers) : cached.numbers)
                : cached.numbers;
            return prediction.slice(0, 25); // Return top 25
        }

        return [];
    } catch (error) {
        console.error(`Error getting prediction for ${systemName}:`, error);
        return [];
    }
}


export async function getSystemStatsForRange(systemName: string, range: number, game: string = 'EUROMILLIONS') {
    try {
        const maxNumbers = game === 'EURODREAMS' ? 6 : 5;

        // 1. Get the last N predictions
        const predictions = await prisma.systemPerformance.findMany({
            where: { systemName, game },
            orderBy: { draw: { date: 'desc' } },
            take: range,
            select: { hits: true }
        });

        if (predictions.length === 0) {
            return {
                accuracy: 0,
                total: 0,
                distribution: Array(maxNumbers + 1).fill(0)
            };
        }

        // 2. Calculate Stats in Memory
        let totalHits = 0;
        const distribution = Array(maxNumbers + 1).fill(0);

        for (const p of predictions) {
            const hits = Math.min(maxNumbers, Math.max(0, p.hits));
            distribution[hits]++;
            totalHits += hits;
        }

        const avgHits = totalHits / predictions.length;
        const accuracy = (avgHits / maxNumbers) * 100;

        return {
            accuracy,
            total: predictions.length,
            distribution,
            maxNumbers // Add this to help frontend rendering
        };

    } catch (error) {
        console.error("Error calculating range stats:", error);
        return {
            accuracy: 0,
            total: 0,
            distribution: [0, 0, 0, 0, 0, 0],
            maxNumbers: 5
        };
    }
}


// ... (imports)

export async function getRankingMetrics(game: string = 'EUROMILLIONS', timeframe: 'historical' | 'last100' | 'last20' = 'last100') {
    noStore();
    // 1. Determine the Draw Range based on timeframe
    let draws;

    if (timeframe === 'historical') {
        // For historical, we fetch all relevant performance records directly
        // But to be consistent and efficient, we can just let the performance query handle it
        // Or fetch all IDs if needed. 
        // Actually, for historical we want ALL draws.
        // Let's keep the draw fetch to ensure we have the IDs if we want to filter specific games
        draws = await prisma.draw.findMany({
            where: { game },
            select: { id: true }
        });
    } else {
        // Get last N draws based on timeframe
        const drawCount = timeframe === 'last20' ? 20 : 100;
        draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'desc' }, // Fix: Order by Date, not ID
            take: drawCount,
            select: { id: true }
        });
    }

    if (draws.length === 0) return [];

    const drawIds = draws.map(d => d.id);

    // 2. Fetch Performance Data for this range
    const performances = await prisma.systemPerformance.findMany({
        where: {
            drawId: { in: drawIds },
            game,
            system: { domain: 'NUMBERS' }
        },
        select: {
            systemName: true,
            drawId: true,
            hits: true,
            accuracy: true,
            system: { select: { description: true } }
        }
    });

    // AGGRESSIVE DEDUPLICATION by systemName + drawId
    const seenPerf = new Set<string>();
    const uniquePerformances = performances.filter(p => {
        const key = `${p.systemName}-${p.drawId}`;
        if (seenPerf.has(key)) return false;
        seenPerf.add(key);
        return true;
    });

    // 3. Aggregate Stats
    const maxNumbers = game === 'EURODREAMS' ? 6 : 5;
    const stats: Record<string, {
        name: string,
        description: string,
        hits3: number,
        hits4: number,
        hits5: number,
        hits6: number,
        totalPreds: number,
        sumAccuracy: number
    }> = {};

    uniquePerformances.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = {
                name: p.systemName,
                description: p.system?.description || '',
                hits3: 0, hits4: 0, hits5: 0, hits6: 0,
                totalPreds: 0, sumAccuracy: 0
            };
        }

        const s = stats[p.systemName];
        s.totalPreds++;
        s.sumAccuracy += p.accuracy;

        if (p.hits === 3) s.hits3++;
        if (p.hits === 4) s.hits4++;
        if (p.hits === 5) s.hits5++;
        if (p.hits === 6 && game === 'EURODREAMS') s.hits6++;
    });

    // 4. Calculate Scores and Format
    const ranking = Object.values(stats).map(s => {
        // Scoring universal: 3hits=10pts, 4hits=100pts, 5hits=1000pts, 6hits=10000pts
        let qualityScore = (s.hits3 * 10) + (s.hits4 * 100) + (s.hits5 * 1000);
        if (game === 'EURODREAMS') {
            qualityScore = (s.hits3 * 10) + (s.hits4 * 100) + (s.hits5 * 1000) + (s.hits6 * 10000);
        }

        // Win Rate (Tier 3+):
        const totalWins = s.hits3 + s.hits4 + s.hits5 + s.hits6;
        const winRate = s.totalPreds > 0 ? (totalWins / s.totalPreds) * 100 : 0;

        // Avg Accuracy
        const avgAccuracy = s.totalPreds > 0 ? s.sumAccuracy / s.totalPreds : 0;

        return {
            systemName: s.name,
            description: s.description,
            accuracy: avgAccuracy,
            winRate: winRate,
            qualityScore: qualityScore,
            hits3: s.hits3,
            hits4: s.hits4,
            hits5: s.hits5,
            hits6: s.hits6,
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
        hits6: number,
        totalPreds: number,
        sumAccuracy: number
    }> = {};

    performances.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = {
                name: p.systemName,
                description: p.system?.description || '',
                hits3: 0, hits4: 0, hits5: 0, hits6: 0,
                totalPreds: 0, sumAccuracy: 0
            };
        }

        const s = stats[p.systemName];
        s.totalPreds++;
        s.sumAccuracy += p.accuracy;

        if (p.hits === 3) s.hits3++;
        if (p.hits === 4) s.hits4++;
        if (p.hits === 5) s.hits5++;
        if (p.hits === 6) s.hits6++;
    });

    // 3. Calculate Scores and Format
    const ranking = Object.values(stats).map(s => {
        // Scoring universal: 3hits=10pts, 4hits=100pts, 5hits=1000pts, 6hits=10000pts
        const qualityScore = (s.hits3 * 10) + (s.hits4 * 100) + (s.hits5 * 1000) + (s.hits6 * 10000);

        // Win Rate (3+):
        const totalWins = s.hits3 + s.hits4 + s.hits5 + s.hits6;
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
            hits6: s.hits6,
            totalPredictions: s.totalPreds
        };
    });

    // 4. Sort by Quality Score
    return ranking.sort((a, b) => b.qualityScore - a.qualityScore);
}


export async function getHotRankingMetrics(game: string = 'EUROMILLIONS') {
    noStore();
    // 1. Get exact last 20 drawing IDs (Source of Truth)
    const last20Draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' },
        take: 20,
        select: { id: true }
    });


    // Safety check
    if (last20Draws.length === 0) return [];

    const drawIds = last20Draws.map(d => d.id);

    // 2. Fetch Performance Data for these specific draws
    const performances = await prisma.systemPerformance.findMany({
        where: {
            drawId: { in: drawIds },
            game
        },
        select: {
            systemName: true,
            drawId: true, // Needed for dedupe
            hits: true,
            accuracy: true,
            system: { select: { description: true } }
        },
        orderBy: {
            id: 'desc' // Newest records first for deduplication preference
        }
    });

    // 3. Aggregate Stats with Deduplication
    const stats: Record<string, {
        name: string,
        description: string,
        hits3: number,
        hits4: number,
        hits5: number,
        hits6: number,
        totalPreds: number,
        sumAccuracy: number,
        highHitFrequency: number,
        seenDraws: Set<number> // Helper for dedupe
    }> = {};

    performances.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = {
                name: p.systemName,
                description: p.system?.description || '',
                hits3: 0, hits4: 0, hits5: 0, hits6: 0,
                totalPreds: 0, sumAccuracy: 0,
                highHitFrequency: 0,
                seenDraws: new Set()
            };
        }

        const s = stats[p.systemName];

        // DEDUPLICATION CHECK
        if (s.seenDraws.has(p.drawId)) return;
        s.seenDraws.add(p.drawId);

        s.totalPreds++;
        s.sumAccuracy += p.accuracy;

        if (p.hits === 3) s.hits3++;
        if (p.hits === 4) s.hits4++;
        if (p.hits === 5) s.hits5++;
        if (p.hits === 6) s.hits6++;

        // Count for Frequency (>4 hits)
        if (p.hits >= 4) {
            // We just count hits here, frequency is calculated later
        }
    });

    // 4. Calculate Scores and Format
    const ranking = Object.values(stats).map(s => {
        // Scoring universal: 3hits=10pts, 4hits=100pts, 5hits=1000pts, 6hits=10000pts
        let qualityScore = (s.hits3 * 10) + (s.hits4 * 100) + (s.hits5 * 1000);
        if (game === 'EURODREAMS') {
            qualityScore = (s.hits3 * 10) + (s.hits4 * 100) + (s.hits5 * 1000) + (s.hits6 * 10000);
        }

        const winRate = s.totalPreds > 0 ? ((s.hits3 + s.hits4 + s.hits5 + s.hits6) / s.totalPreds) * 100 : 0;
        const oldAccuracy = s.totalPreds > 0 ? s.sumAccuracy / s.totalPreds : 0;

        // High Hit Frequency: "1 in X draws"
        // Simply: Total Draws / (Hits>=4)
        const highHits = s.hits4 + s.hits5 + s.hits6;
        const frequencyValue = highHits > 0 ? s.totalPreds / highHits : 0;

        return {
            systemName: s.name,
            description: s.description,
            accuracy: oldAccuracy,
            winRate: winRate,
            qualityScore: qualityScore,
            hits3: s.hits3,
            hits4: s.hits4,
            hits5: s.hits5,
            hits6: s.hits6,
            totalPredictions: s.totalPreds,
            frequencyValue: frequencyValue, // Lower is better (if > 0)
            frequencyText: highHits > 0 ? `1 a cada ${frequencyValue.toFixed(1)}` : 'N/A'
        };
    });

    // 5. Intelligent Sorting for "Hot Trends"
    // Primary: Quality Score (Points System: 5*=100, 4*=10, 3*=1) - Rewards Jackpots heavily
    // Secondary: High Hits (Quantity) - Tie breaker
    return ranking.sort((a, b) => {
        if (b.qualityScore !== a.qualityScore) return b.qualityScore - a.qualityScore;

        const hitsA = a.hits4 + a.hits5 + a.hits6;
        const hitsB = b.hits4 + b.hits5 + b.hits6;
        return hitsB - hitsA;
    });
}

/**
 * HOT RANKING STARS: Metrics for the last 20 draws (Stars)
 * - Focused on Recent Form (Trends)
 * - Highlights Frequency of High Hits (2 Stars)
 */
export async function getHotStarRankingMetrics() {
    // 1. Get exact last 20 draw IDs by date
    // This ensures consistency even if IDs are not sequential
    const recentDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 20,
        select: { id: true }
    });

    if (recentDraws.length === 0) return [];

    const drawIds = recentDraws.map(d => d.id);

    // 2. Fetch Performance Data for these specific draws
    const performances = await prisma.starSystemPerformance.findMany({
        where: {
            drawId: { in: drawIds }
        },
        include: {
            draw: true // Include date if needed
        }
    });

    // 3. Aggregate Stats in Memory
    const stats = new Map<string, {
        hits1: number,
        hits2: number,
        total: number,
        sumAccuracy: number,
        seenDraws: Set<number>
    }>();

    for (const perf of performances) {
        if (!stats.has(perf.systemName)) {
            stats.set(perf.systemName, {
                hits1: 0,
                hits2: 0,
                total: 0,
                sumAccuracy: 0,
                seenDraws: new Set()
            });
        }

        const s = stats.get(perf.systemName)!;

        // Deduplication check: Ensure we haven't counted this draw for this system yet
        if (s.seenDraws.has(perf.drawId)) continue;
        s.seenDraws.add(perf.drawId);

        if (perf.hits === 1) s.hits1++;
        if (perf.hits === 2) s.hits2++;

        // Detect game context from performance
        const game = (perf as any).draw?.game || 'EUROMILLIONS';
        const maxStars = game === 'EUROMILLIONS' ? 2 : 1;

        // Star Accuracy: 100% if all stars hit
        const accuracy = (perf.hits / maxStars) * 100;

        s.total++;
        s.sumAccuracy += accuracy;
    }

    // 4. Transform to Ranking List
    const ranking = Array.from(stats.entries()).map(([name, s]) => {
        // Quality Score Logic
        // 2 Hits (Jackpot) = 100 pts
        // 1 Hit = 10 pts (consolation)
        const qualityScore = (s.hits2 * 100) + (s.hits1 * 10);

        const winRate = s.total > 0 ? (s.hits2 / s.total) * 100 : 0;
        const avgAccuracy = s.total > 0 ? s.sumAccuracy / s.total : 0;

        // High Hit Frequency (2 Hits)
        const jackpots = s.hits2;
        const frequencyValue = jackpots > 0 ? s.total / jackpots : 0;

        return {
            systemName: name,
            description: "Star System", // No description in StarSystemPerformance usually
            accuracy: avgAccuracy,
            winRate: winRate,
            qualityScore: qualityScore,
            hits1: s.hits1,
            hits2: s.hits2,
            totalPredictions: s.total,
            frequencyValue: frequencyValue, // Lower is better
            frequencyText: jackpots > 0 ? `1 a cada ${frequencyValue.toFixed(1)}` : 'N/A'
        };
    });

    // 5. Sort
    // Primary: Quality Score (Jackpot Kings)
    // Secondary: Frequency
    return ranking.sort((a, b) => {
        if (b.qualityScore !== a.qualityScore) return b.qualityScore - a.qualityScore;
        return b.accuracy - a.accuracy;
    });
}
