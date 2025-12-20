
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
    const sortedGolden = Object.entries(historicalPairs).sort((a, b) => b[1] - a[1]);
    const goldenPair = sortedGolden.length > 0 ? sortedGolden[0] : ['N/A', 0];

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
    const sortedHot = Object.entries(recentPairs).sort((a, b) => b[1] - a[1]);
    const hotPair = sortedHot.length > 0 ? sortedHot[0] : ['N/A', 0];

    // 4. Rational Pick (Top 6 Individual Stars in Last 100)
    const starFreq: Record<number, number> = {};
    recentDraws.forEach(d => {
        const stars = JSON.parse(d.stars) as number[];
        stars.forEach(s => {
            starFreq[s] = (starFreq[s] || 0) + 1;
        });
    });
    const topStars = Object.entries(starFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6) // Top 6 stars for prediction
        .map(entry => parseInt(entry[0]))
        .sort((a, b) => a - b);

    const rationalSelection = topStars.join(', ');

    return {
        golden: { pair: goldenPair[0], count: goldenPair[1], total: allDraws.length },
        hot: { pair: hotPair[0], count: hotPair[1], total: 100 },
        rational: { selection: rationalSelection, stars: topStars }
    };
}

// NEW: Get Full Star System Ranking with Quality Metrics
export async function getStarRankingMetrics() {
    // 1. Determine Draw Range (Last 100)
    const lastDraw = await prisma.draw.findFirst({ orderBy: { id: 'desc' } });
    if (!lastDraw) return [];

    const startDrawId = Math.max(1, lastDraw.id - 100);

    // 2. Fetch Performance Data
    const performances = await prisma.starSystemPerformance.findMany({
        where: { drawId: { gte: startDrawId } },
        select: {
            systemName: true,
            hits: true,
            draw: { select: { id: true } }
        }
    });

    // 3. Aggregate Stats
    const stats: Record<string, {
        hits1: number,
        hits2: number,
        totalPreds: number
    }> = {};

    performances.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = { hits1: 0, hits2: 0, totalPreds: 0 };
        }
        const s = stats[p.systemName];
        s.totalPreds++;
        if (p.hits === 1) s.hits1++;
        if (p.hits === 2) s.hits2++;
    });

    // 4. Calculate Scores
    const systemDescriptions: Record<string, string> = {
        'Hot Stars': 'Baseado na frequência das estrelas',
        'Late Stars': 'Baseado no atraso (estrelas frias)',
        'Markov Stars': 'Probabilidade de transição',
        'Star Platinum': 'Ensemble (combinação inteligente)',
        'Anti-Hot Stars': 'Estratégia contrária às frequentes',
        'Anti-Late Stars': 'Estratégia contrária aos atrasos',
        'Golden Pair': 'Pares históricos mais frequentes',
        'Star LSTM': 'Rede Neuronal Profunda'
    };

    const ranking = Object.values(stats).map(s => {
        const name = (Object.keys(stats).find(key => stats[key] === s)) || '';
        // Stars Score: hits1=10, hits2=100
        const qualityScore = (s.hits1 * 10) + (s.hits2 * 100);
        // Win Rate (1+ stars)
        const winRate = s.totalPreds > 0 ? ((s.hits1 + s.hits2) / s.totalPreds) * 100 : 0;

        return {
            systemName: name,
            description: systemDescriptions[name] || 'Sistema de previsão de estrelas',
            winRate,
            qualityScore,
            hits1: s.hits1,
            hits2: s.hits2,
            totalPredictions: s.totalPreds
        };
    });

    return ranking.sort((a, b) => b.qualityScore - a.qualityScore);
}

export async function getAllTimeStarRankingMetrics() {
    // 1. Fetch ALL Performance Data
    const performances = await prisma.starSystemPerformance.findMany({
        select: {
            systemName: true,
            hits: true
        }
    });

    // 2. Aggregate
    const stats: Record<string, { hits1: number, hits2: number, totalPreds: number }> = {};

    performances.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = { hits1: 0, hits2: 0, totalPreds: 0 };
        }
        const s = stats[p.systemName];
        s.totalPreds++;
        if (p.hits === 1) s.hits1++;
        if (p.hits === 2) s.hits2++;
    });

    // 3. Format
    const systemDescriptions: Record<string, string> = {
        'Hot Stars': 'Baseado na frequência das estrelas',
        'Late Stars': 'Baseado no atraso (estrelas frias)',
        'Markov Stars': 'Probabilidade de transição',
        'Star Platinum': 'Ensemble (combinação inteligente)',
        'Anti-Hot Stars': 'Estratégia contrária às frequentes',
        'Anti-Late Stars': 'Estratégia contrária aos atrasos',
        'Golden Pair': 'Pares históricos mais frequentes',
        'Star LSTM': 'Rede Neuronal Profunda'
    };

    return Object.keys(stats).map(name => {
        const s = stats[name];
        const qualityScore = (s.hits1 * 10) + (s.hits2 * 100);
        const winRate = s.totalPreds > 0 ? ((s.hits1 + s.hits2) / s.totalPreds) * 100 : 0;

        return {
            systemName: name,
            description: systemDescriptions[name] || 'Sistema de previsão de estrelas',
            winRate,
            qualityScore,
            hits1: s.hits1,
            hits2: s.hits2,
            totalPredictions: s.totalPreds
        };
    }).sort((a, b) => b.qualityScore - a.qualityScore);
}

export async function getStarYearlyHistory() {
    const performances = await prisma.starSystemPerformance.findMany({
        include: { draw: { select: { date: true } } }
    });

    const yearlyStats: Record<string, Record<string, { hits2: number, hits1: number }>> = {};

    performances.forEach(p => {
        const year = p.draw.date.getFullYear().toString();
        if (!yearlyStats[year]) yearlyStats[year] = {};
        if (!yearlyStats[year][p.systemName]) yearlyStats[year][p.systemName] = { hits2: 0, hits1: 0 };

        if (p.hits === 2) yearlyStats[year][p.systemName].hits2++;
        if (p.hits === 1) yearlyStats[year][p.systemName].hits1++;
    });

    // Last 5 years
    const years = Object.keys(yearlyStats).sort().reverse().slice(0, 5);
    const result: Record<string, any[]> = {};

    years.forEach(year => {
        const yearData = Object.entries(yearlyStats[year]).map(([name, s]) => ({
            systemName: name,
            hits1: s.hits1,
            hits2: s.hits2,
            year
        })).sort((a, b) => b.hits2 - a.hits2 || b.hits1 - a.hits1);

        result[year] = yearData;
    });

    return result;
}

// Fixed version of getStarJackpotLeaders
export async function getStarJackpotLeaders() {
    const performances = await prisma.starSystemPerformance.findMany({
        where: { hits: 2 },
        select: { systemName: true }
    });

    const counts: Record<string, number> = {};
    performances.forEach(p => {
        counts[p.systemName] = (counts[p.systemName] || 0) + 1;
    });

    return Object.entries(counts)
        .map(([systemName, jackpots]) => ({ systemName, jackpots }))
        .sort((a, b) => b.jackpots - a.jackpots)
        .slice(0, 3);
}

// Get results for the last draw (for LastDrawStarSystems widget)
export async function getLastDrawStarResults() {
    // Get the most recent draw
    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' },
        select: { id: true, date: true, stars: true }
    });

    if (!lastDraw) return { results: [], lastDrawDate: '', actualStars: [] };

    // Get all system performances for this draw
    const performances = await prisma.starSystemPerformance.findMany({
        where: { drawId: lastDraw.id },
        select: {
            systemName: true,
            hits: true,
            predictedStars: true
        },
        orderBy: { hits: 'desc' }
    });

    const actualStars = JSON.parse(lastDraw.stars) as number[];

    return {
        results: performances.map(p => ({
            systemName: p.systemName,
            hits: p.hits,
            stars: JSON.parse(p.predictedStars) as number[]
        })),
        lastDrawDate: lastDraw.date.toLocaleDateString('pt-PT'),
        actualStars
    };
}


// Get basic Star System Ranking (for widgets)
export async function getStarSystemRanking() {
    return await prisma.starSystemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' }
    });
}

// Get Star System Details with History (for detail pages)
export async function getStarSystemDetails(systemName: string) {
    const system = await prisma.starSystemRanking.findUnique({
        where: { systemName }
    });

    if (!system) return null;

    const history = await prisma.starSystemPerformance.findMany({
        where: { systemName },
        orderBy: { draw: { date: 'desc' } },
        take: 500,
        include: { draw: true }
    });

    return {
        system,
        history
    };
}

export async function getStarPrediction(systemName: string) {
    const system = starSystems.find(s => s.name === systemName);
    if (!system) return [];

    const cached = await prisma.cachedPrediction.findUnique({
        where: { systemName }
    });

    if (cached && cached.numbers) {
        return JSON.parse(cached.numbers);
    }

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    const prediction = await system.generatePrediction(draws);
    const sortedPrediction = prediction.sort((a, b) => a - b);

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

export async function getStarConsensus() {
    const systems = ['Hot Stars', 'Late Stars', 'Markov Stars', 'Star Platinum', 'Anti-Hot Stars', 'Anti-Late Stars', 'Golden Pair', 'Star LSTM'];
    const votes: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) votes[i] = 0;

    const predictions = await prisma.cachedPrediction.findMany({
        where: { systemName: { in: systems } }
    });

    predictions.forEach(p => {
        const numbers = JSON.parse(p.numbers) as number[];
        numbers.forEach(n => {
            if (n >= 1 && n <= 12) {
                votes[n] = (votes[n] || 0) + 1;
            }
        });
    });

    return Object.entries(votes)
        .map(([star, count]) => ({ star: parseInt(star), count }))
        .sort((a, b) => b.count - a.count);
}

export async function getStarSystemStatsForRange(systemName: string, range: number) {
    'use server';

    const performances = await prisma.starSystemPerformance.findMany({
        where: { systemName },
        include: { draw: true },
        orderBy: { draw: { date: 'desc' } },
        take: range === 10000 ? undefined : range
    });

    // Deduplicate by drawId
    const seenDrawIds = new Set<number>();
    const uniquePerformances = performances.filter(p => {
        if (seenDrawIds.has(p.drawId)) return false;
        seenDrawIds.add(p.drawId);
        return true;
    });

    // Calculate distribution [0 hits, 1 hit, 2 hits]
    const distribution = [0, 0, 0];
    let totalHits = 0;

    uniquePerformances.forEach(p => {
        const hits = Math.min(2, Math.max(0, p.hits));
        distribution[hits]++;
        totalHits += hits;
    });

    const accuracy = uniquePerformances.length > 0
        ? ((totalHits / uniquePerformances.length) / 2) * 100
        : 0;

    return {
        accuracy,
        total: uniquePerformances.length,
        distribution
    };
}

