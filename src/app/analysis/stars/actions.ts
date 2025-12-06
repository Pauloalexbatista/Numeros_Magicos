
'use server';

import { prisma } from '@/lib/prisma';
import { starSystems } from '@/services/star-systems';

export type YearlyStarStat = {
    systemName: string;
    year: string;
    hits2: number; // 2 Stars (Jackpot level)
    hits1: number; // 1 Star
    rank?: number;
};

export async function getStarSystemsYearlyAnalysis() {
    // 1. Get All Star Systems
    const rankings = await prisma.starSystemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' }
    });

    const systems = rankings.map(r => r.systemName);

    // 2. Get Performance Data
    const data = await prisma.starSystemPerformance.findMany({
        where: { systemName: { in: systems } },
        include: { draw: { select: { date: true } } }
    });

    const yearlyStats: Record<string, Record<string, { hits2: number, hits1: number }>> = {};

    data.forEach(p => {
        const year = p.draw.date.getFullYear().toString();
        const sys = p.systemName;

        if (!yearlyStats[year]) yearlyStats[year] = {};
        if (!yearlyStats[year][sys]) yearlyStats[year][sys] = { hits2: 0, hits1: 0 };

        if (p.hits === 2) yearlyStats[year][sys].hits2++;
        if (p.hits === 1) yearlyStats[year][sys].hits1++;
    });

    // 3. Format for UI (Last 5 years)
    const years = Object.keys(yearlyStats).sort().reverse().slice(0, 5);
    const result: Record<string, YearlyStarStat[]> = {};

    for (const year of years) {
        const stats = yearlyStats[year];
        const yearData: YearlyStarStat[] = [];

        for (const sys of systems) {
            const s = stats[sys] || { hits2: 0, hits1: 0 };
            yearData.push({
                systemName: sys,
                year,
                hits2: s.hits2,
                hits1: s.hits1,
                rank: rankings.findIndex(r => r.systemName === sys) + 1
            });
        }

        // Sort by 2 Hits (Jackpot) desc
        result[year] = yearData.sort((a, b) => (b.hits2 - a.hits2) || (b.hits1 - a.hits1));
    }

    return result;
}

export async function getStarFrequency() {
    const draws = await prisma.draw.findMany({
        select: { stars: true },
        orderBy: { date: 'desc' },
        take: 100 // Last 100 draws for frequency
    });

    const frequency: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) frequency[i] = 0;

    draws.forEach(d => {
        const stars = JSON.parse(d.stars) as number[];
        stars.forEach(s => {
            frequency[s] = (frequency[s] || 0) + 1;
        });
    });

    return { frequency, totalDraws: draws.length };
}

export async function getStarPairs() {
    const draws = await prisma.draw.findMany({
        select: { stars: true },
        orderBy: { date: 'desc' }
        // All history for pairs
    });

    const pairCounts: Record<string, { count: number, lastSeenIndex: number }> = {};

    draws.forEach((d, index) => {
        const stars = JSON.parse(d.stars) as number[];
        if (stars.length === 2) {
            const sorted = stars.sort((a, b) => a - b);
            const pairKey = `${sorted[0]}-${sorted[1]}`;

            if (!pairCounts[pairKey]) {
                pairCounts[pairKey] = { count: 0, lastSeenIndex: index };
            }
            pairCounts[pairKey].count++;
        }
    });

    return Object.entries(pairCounts)
        .map(([pair, data]) => ({
            pair,
            count: data.count,
            lastSeen: data.lastSeenIndex
        }))
        .sort((a, b) => b.count - a.count);
}

export async function getStarProperties() {
    const draws = await prisma.draw.findMany({
        select: { stars: true },
        orderBy: { date: 'desc' },
        take: 100 // Last 100 draws
    });

    const stats = {
        parity: { '2P': 0, '2I': 0, '1P1I': 0 },
        highLow: { '2H': 0, '2L': 0, '1H1L': 0 }, // High: 7-12, Low: 1-6
        primes: { count0: 0, count1: 0, count2: 0 },
        consecutive: { yes: 0, no: 0 },
        sum: { total: 0, min: Infinity, max: -Infinity },
        totalDraws: draws.length
    };

    const primes = [2, 3, 5, 7, 11];

    draws.forEach(d => {
        const stars = JSON.parse(d.stars) as number[];

        // Parity
        const evens = stars.filter(s => s % 2 === 0).length;
        if (evens === 2) stats.parity['2P']++;
        else if (evens === 0) stats.parity['2I']++;
        else stats.parity['1P1I']++;

        // High/Low
        const highs = stars.filter(s => s >= 7).length;
        if (highs === 2) stats.highLow['2H']++;
        else if (highs === 0) stats.highLow['2L']++;
        else stats.highLow['1H1L']++;

        // Primes
        const primeCount = stars.filter(s => primes.includes(s)).length;
        if (primeCount === 2) stats.primes.count2++;
        else if (primeCount === 1) stats.primes.count1++;
        else stats.primes.count0++;

        // Consecutive
        const sorted = [...stars].sort((a, b) => a - b);
        if (sorted[1] - sorted[0] === 1) stats.consecutive.yes++;
        else stats.consecutive.no++;

        // Sum
        const sum = stars.reduce((a, b) => a + b, 0);
        stats.sum.total += sum;
        if (sum < stats.sum.min) stats.sum.min = sum;
        if (sum > stats.sum.max) stats.sum.max = sum;
    });

    return {
        ...stats,
        sum: {
            avg: Number((stats.sum.total / draws.length).toFixed(1)),
            min: stats.sum.min,
            max: stats.sum.max
        }
    };
}

export async function getStarSuggestions() {
    // 1. Fetch Data
    const allDraws = await prisma.draw.findMany({
        select: { stars: true },
        orderBy: { date: 'desc' }
    });

    const recentDraws = allDraws.slice(0, 100);

    // 2. Golden Pair (Historical Best)
    const historicalPairs: Record<string, number> = {};
    allDraws.forEach(d => {
        const stars = JSON.parse(d.stars) as number[];
        if (stars.length === 2) {
            const sorted = stars.sort((a, b) => a - b);
            const key = `${sorted[0]}-${sorted[1]}`;
            historicalPairs[key] = (historicalPairs[key] || 0) + 1;
        }
    });
    const goldenPair = Object.entries(historicalPairs).sort((a, b) => b[1] - a[1])[0];

    // 3. Hot Pair (Recent Best - Last 100)
    const recentPairs: Record<string, number> = {};
    recentDraws.forEach(d => {
        const stars = JSON.parse(d.stars) as number[];
        if (stars.length === 2) {
            const sorted = stars.sort((a, b) => a - b);
            const key = `${sorted[0]}-${sorted[1]}`;
            recentPairs[key] = (recentPairs[key] || 0) + 1;
        }
    });
    const hotPair = Object.entries(recentPairs).sort((a, b) => b[1] - a[1])[0];

    // 4. Rational Pick (Top 2 Individual Stars in Last 100)
    const starFreq: Record<number, number> = {};
    recentDraws.forEach(d => {
        const stars = JSON.parse(d.stars) as number[];
        stars.forEach(s => {
            starFreq[s] = (starFreq[s] || 0) + 1;
        });
    });
    const topStars = Object.entries(starFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(entry => parseInt(entry[0]))
        .sort((a, b) => a - b);

    const rationalPair = `${topStars[0]}-${topStars[1]}`;

    return {
        golden: { pair: goldenPair[0], count: goldenPair[1], total: allDraws.length },
        hot: { pair: hotPair[0], count: hotPair[1], total: 100 },
        rational: { pair: rationalPair, stars: topStars }
    };
}

// NEW: Get Full Star System Ranking
export async function getStarSystemRanking() {
    return await prisma.starSystemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' }
    });
}

// NEW: Get Star System Details with History
export async function getStarSystemDetails(systemName: string) {
    const system = await prisma.starSystemRanking.findUnique({
        where: { systemName }
    });

    if (!system) return null;

    const history = await prisma.starSystemPerformance.findMany({
        where: { systemName },
        orderBy: { draw: { date: 'desc' } },
        take: 500, // Show last 500 draws
        include: { draw: true }
    });

    return {
        system,
        history
    };
}

export async function getStarJackpotLeaders() {
    const systems = await prisma.starSystemRanking.findMany({
        select: { systemName: true }
    });

    const leaders = [];

    for (const sys of systems) {
        const jackpots = await prisma.starSystemPerformance.count({
            where: {
                systemName: sys.systemName,
                hits: 2
            }
        });

        if (jackpots > 0) {
            leaders.push({ systemName: sys.systemName, jackpots });
        }
    }

    return leaders.sort((a, b) => b.jackpots - a.jackpots).slice(0, 3);
}

export async function getStarPrediction(systemName: string) {
    const system = starSystems.find(s => s.name === systemName);
    if (!system) return [];

    // 1. Try to get from Cache first (Zero CPU)
    const cached = await prisma.cachedPrediction.findUnique({
        where: { systemName }
    });

    if (cached && cached.numbers) {
        // console.log(`⚡ Star Cache Hit for ${systemName}`);
        return JSON.parse(cached.numbers);
    }

    // 2. If not in cache, calculate (High CPU)
    console.warn(`⚠️ Star Cache Miss for ${systemName}. Calculating...`);

    // Fetch history (newest first for the algorithm)
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    // The algorithms expect history[0] to be the LATEST draw
    // Await the result as it might be a Promise (Neural Net)
    const prediction = await system.generatePrediction(draws);
    const sortedPrediction = prediction.sort((a, b) => a - b);

    // 3. Save to Cache for next time
    // For stars, we don't really have "worst numbers" concept as strongly, but we can fill it.
    // Stars are 1-12.
    const allStars = Array.from({ length: 12 }, (_, i) => i + 1);
    const worstStars = allStars.filter(s => !sortedPrediction.includes(s));

    await prisma.cachedPrediction.upsert({
        where: { systemName },
        update: {
            numbers: JSON.stringify(sortedPrediction),
            worstNumbers: JSON.stringify(worstStars),
            updatedAt: new Date()
        },
        create: {
            systemName,
            numbers: JSON.stringify(sortedPrediction),
            worstNumbers: JSON.stringify(worstStars)
        }
    });

    return sortedPrediction;
}
