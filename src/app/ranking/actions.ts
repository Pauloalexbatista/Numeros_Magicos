
'use server';

import { prisma } from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import { fetchSystemPerformances } from '@/services/system-performance-adapter';
import { getRanking } from '@/services/ranking-evaluator';

export type YearlyStat = {
    systemName: string;
    year: string;
    jackpots: number;
    highPrizes: number;
    rank?: number;
};

// High-speed In-Memory Cache with TTL
const cacheStore = new Map<string, { data: any; expiry: number }>();

function getCached<T>(key: string): T | null {
    const item = cacheStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        cacheStore.delete(key);
        return null;
    }
    return item.data as T;
}

function setCached(key: string, data: any, ttlSeconds: number = 600) {
    cacheStore.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
}

export async function invalidateRankingCache(game?: string) {
    if (!game) {
        cacheStore.clear();
    } else {
        const prefix = game.toUpperCase();
        for (const key of cacheStore.keys()) {
            if (key.includes(prefix)) {
                cacheStore.delete(key);
            }
        }
    }
}

export async function getTopSystemsYearlyAnalysis(game: string = 'EUROMILLIONS') {
    const cacheKey = `yearly-analysis-${game}`;
    const cached = getCached<Record<string, YearlyStat[]>>(cacheKey);
    if (cached) return cached;

    // 1. Get Top Systems for this game from ranking metrics
    const rankingData = await getRankingMetrics(game, 'historical');
    const topRankings = rankingData.slice(0, 6);
    const systems = topRankings.map(r => r.systemName);

    // 1.1 Also include Jackpot Leaders
    const jackpotLeaders = await getJackpotLeaders(game);
    const leaderNames = jackpotLeaders.map(l => l.systemName);

    const allSystems = Array.from(new Set([...systems, ...leaderNames]));

    // 2. Fetch last 5 years directly from SystemPrediction
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 4;
    const startDate = new Date(minYear, 0, 1);

    const predCount = (game === 'EURODREAMS') ? 20 : (game === 'MEGASENA') ? 30 : 25;
    const hitKey = `num_hits_${predCount}`;

    const data = await prisma.systemPrediction.findMany({
        where: {
            systemName: { in: allSystems },
            game,
            domain: 'NUMBERS',
            draw: {
                date: { gte: startDate }
            }
        },
        select: {
            systemName: true,
            drawId: true,
            [hitKey]: true,
            draw: {
                select: { date: true }
            }
        }
    });

    const yearlyStats: Record<string, Record<string, { jackpots: number, highPrizes: number }>> = {};

    data.forEach(p => {
        const year = (p as any).draw.date.getFullYear().toString();
        const sys = p.systemName;

        if (!yearlyStats[year]) yearlyStats[year] = {};
        if (!yearlyStats[year][sys]) yearlyStats[year][sys] = { jackpots: 0, highPrizes: 0 };

        const hits = (p as any)[hitKey] ?? 0;
        if (game === 'EURODREAMS' || game === 'MEGASENA') {
            if (hits === 6) yearlyStats[year][sys].jackpots++;
            if (hits === 5) yearlyStats[year][sys].highPrizes++;
        } else {
            if (hits === 5) yearlyStats[year][sys].jackpots++;
            if (hits === 4) yearlyStats[year][sys].highPrizes++;
        }
    });

    // 3. Format for UI
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
    const result: Record<string, YearlyStat[]> = {};

    for (const year of years) {
        const stats = yearlyStats[year] || {};
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

        result[year] = yearData.sort((a, b) => (b.jackpots - a.jackpots) || (b.highPrizes - a.highPrizes));
    }

    setCached(cacheKey, result, 600);
    return result;
}

export async function getJackpotLeaders(game: string = 'EUROMILLIONS') {
    const cacheKey = `jackpot-leaders-${game}`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) return cached;

    const activeSystems = await prisma.rankedSystem.findMany({
        where: {
            isActive: true,
            game: game,
            domain: 'NUMBERS'
        },
        select: { name: true }
    });

    const activeSet = new Set(activeSystems.map(s => s.name));
    const targetJackpotHits = (game === 'EURODREAMS' || game === 'MEGASENA') ? 6 : 5;
    const predCount = (game === 'EURODREAMS') ? 20 : (game === 'MEGASENA') ? 30 : 25;
    const hitCol = `num_hits_${predCount}`;

    const jackpotRecords = await prisma.systemPrediction.findMany({
        where: {
            game,
            domain: 'NUMBERS',
            [hitCol]: targetJackpotHits
        },
        select: {
            systemName: true,
            drawId: true
        }
    });

    const countMap = new Map<string, number>();
    const seenDraws = new Set<string>();

    for (const r of jackpotRecords) {
        if (!activeSet.has(r.systemName)) continue;
        const key = `${r.systemName}-${r.drawId}`;
        if (seenDraws.has(key)) continue;
        seenDraws.add(key);

        countMap.set(r.systemName, (countMap.get(r.systemName) || 0) + 1);
    }

    const leaders = activeSystems
        .map(s => ({
            systemName: s.name,
            jackpots: countMap.get(s.name) || 0
        }))
        .sort((a, b) => b.jackpots - a.jackpots)
        .slice(0, 3);

    setCached(cacheKey, leaders, 600);
    return leaders;
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
    const performances = await fetchSystemPerformances({
        where: {
            drawId: lastDraw.id,
            system: {
                domain: 'NUMBERS'
            }
        }
    });
    performances.sort((a, b) => b.hits - a.hits);

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
        const latestPred = await prisma.systemPrediction.findFirst({
            where: { systemName, game, domain: 'NUMBERS' },
            orderBy: { drawId: 'desc' }
        });

        if (latestPred && latestPred.prediction) {
            const prediction = typeof latestPred.prediction === 'string' ? JSON.parse(latestPred.prediction) : latestPred.prediction;
            const predCount = game === 'MEGASENA' ? 30 : 25;
            return Array.isArray(prediction) ? prediction.slice(0, predCount) : [];
        }

        return [];
    } catch (error) {
        console.error(`Error getting prediction for ${systemName}:`, error);
        return [];
    }
}


export async function getSystemStatsForRange(systemName: string, range: number, game: string = 'EUROMILLIONS') {
    try {
        const maxNumbers = (game === 'EURODREAMS' || game === 'MEGASENA') ? 6 : 5;

        // 1. Get the last N predictions
        const predictions = await fetchSystemPerformances({
            where: { systemName, game },
            orderBy: { draw: { date: 'desc' } },
            take: range
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
    const cacheKey = `ranking-metrics-${game}-${timeframe}`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) return cached;

    // 1. Determine the Draw Range based on timeframe
    let draws;
    if (timeframe === 'historical') {
        draws = await prisma.draw.findMany({
            where: { game },
            select: { id: true }
        });
    } else {
        const drawCount = timeframe === 'last20' ? 20 : 100;
        draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'desc' },
            take: drawCount,
            select: { id: true }
        });
    }

    if (draws.length === 0) return [];
    const drawIds = draws.map(d => d.id);

    const predCount = (game === 'EURODREAMS') ? 20 : (game === 'MEGASENA') ? 30 : 25;
    const hitKey = `num_hits_${predCount}`;

    // 2. Fetch Performance Data efficiently
    const records = await prisma.systemPrediction.findMany({
        where: {
            drawId: { in: drawIds },
            game,
            domain: 'NUMBERS'
        },
        select: {
            drawId: true,
            systemName: true,
            [hitKey]: true,
            system: {
                select: {
                    description: true
                }
            }
        }
    });

    // Deduplication by systemName + drawId
    const seenPerf = new Set<string>();
    const stats: Record<string, {
        name: string,
        description: string,
        hits2: number,
        hits3: number,
        hits4: number,
        hits5: number,
        hits6: number,
        totalPreds: number,
        sumAccuracy: number
    }> = {};

    records.forEach(p => {
        const key = `${p.systemName}-${p.drawId}`;
        if (seenPerf.has(key)) return;
        seenPerf.add(key);

        if (!stats[p.systemName]) {
            stats[p.systemName] = {
                name: p.systemName,
                description: (p as any).system?.description || '',
                hits2: 0,
                hits3: 0, hits4: 0, hits5: 0, hits6: 0,
                totalPreds: 0, sumAccuracy: 0
            };
        }

        const s = stats[p.systemName];
        s.totalPreds++;
        const hits = (p as any)[hitKey] ?? 0;
        const accuracy = predCount > 0 ? (hits / predCount) * 100 : 0;
        s.sumAccuracy += accuracy;

        if (hits === 2) s.hits2++;
        if (hits === 3) s.hits3++;
        if (hits === 4) s.hits4++;
        if (hits === 5) s.hits5++;
        if (hits === 6 && (game === 'EURODREAMS' || game === 'MEGASENA')) s.hits6++;
    });

    // 3. Calculate Scores and Format
    const ranking = Object.values(stats).map(s => {
        let qualityScore = (s.hits3 * 10) + (s.hits4 * 100) + (s.hits5 * 1000);
        if (game === 'EURODREAMS' || game === 'MEGASENA') {
            qualityScore = (s.hits3 * 10) + (s.hits4 * 100) + (s.hits5 * 1000) + (s.hits6 * 10000);
        }

        const isSixBall = game === 'EURODREAMS' || game === 'MEGASENA';
        const topWins = isSixBall ? (s.hits4 + s.hits5 + s.hits6) : (s.hits3 + s.hits4 + s.hits5);
        const winRate = s.totalPreds > 0 ? (topWins / s.totalPreds) * 100 : 0;

        const allPrizeWins = isSixBall ? (s.hits3 + s.hits4 + s.hits5 + s.hits6) : (s.hits2 + s.hits3 + s.hits4 + s.hits5);
        const prizeRate = s.totalPreds > 0 ? (allPrizeWins / s.totalPreds) * 100 : 0;

        const expectedPrizeRate = game === 'TOTOLOTO' ? 83.84 : game === 'EUROMILLIONS' ? 82.57 : game === 'EURODREAMS' ? 66.93 : 66.46;
        const expectedTopWinRate = game === 'TOTOLOTO' ? 52.00 : game === 'EUROMILLIONS' ? 50.00 : game === 'EURODREAMS' ? 33.07 : 33.54;

        const avgAccuracy = s.totalPreds > 0 ? s.sumAccuracy / s.totalPreds : 0;

        return {
            systemName: s.name,
            description: s.description,
            accuracy: avgAccuracy,
            winRate: winRate,
            prizeRate: prizeRate,
            expectedPrizeRate: expectedPrizeRate,
            expectedTopWinRate: expectedTopWinRate,
            prizeAdvantage: Number((prizeRate - expectedPrizeRate).toFixed(1)),
            topAdvantage: Number((winRate - expectedTopWinRate).toFixed(1)),
            qualityScore: qualityScore,
            hits3: s.hits3,
            hits4: s.hits4,
            hits5: s.hits5,
            hits6: s.hits6,
            totalPredictions: s.totalPreds
        };
    });

    const sorted = ranking.sort((a, b) => b.qualityScore - a.qualityScore);
    setCached(cacheKey, sorted, 600);
    return sorted;
}


export async function getAllTimeRankingMetrics() {
    // 1. Fetch Performance Data for ALL history
    const performances = await fetchSystemPerformances({
        where: {
            system: { domain: 'NUMBERS' }
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
    const performances = await fetchSystemPerformances({
        where: {
            drawId: { in: drawIds },
            game
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
        if (game === 'EURODREAMS' || game === 'MEGASENA') {
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
    const performances = await prisma.systemPrediction.findMany({
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

        const game = (perf as any).draw?.game || (perf as any).game || "EUROMILLIONS";
        const hits = (game === "EUROMILLIONS") ? ((perf as any).star_hits_4 ?? (perf as any).star_hits_2 ?? 0) : ((perf as any).star_hits_2 ?? 0);

        if (hits === 1) s.hits1++;
        if (hits >= 2) s.hits2++;

        const maxStars = game === "EUROMILLIONS" ? 2 : 1;
        const accuracy = (hits / maxStars) * 100;

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
