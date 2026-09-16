'use server';

import { getLiveNextStarPrediction } from '@/services/live-prediction-service';
import { prisma } from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import { starSystems } from '@/services/star-systems';
import { totolotoStarSystems } from '@/services/totoloto-systems';
import { euroDreamsStarSystems } from '@/services/ranking';

export type YearlyStarStat = {
    systemName: string;
    year: string;
    hits2: number; // 2 Stars (Jackpot level)
    hits1: number; // 1 Star
    rank?: number;
};

export async function getStarSystemsYearlyAnalysis(game: string = 'EUROMILLIONS') {
    // 1. Get All Star Systems
    const systemsRecs = await prisma.rankedSystem.findMany({
        where: { game, domain: 'STARS' },
        select: { name: true }
    });

    const systems = systemsRecs.map(r => r.name);

    // 2. Get Performance Data
    const data = await prisma.systemPrediction.findMany({
        where: {
            game,
            domain: 'STARS'
        },
        include: { draw: { select: { date: true } } }
    });

    const yearlyStats: Record<string, Record<string, { hits2: number, hits1: number }>> = {};

    data.forEach(p => {
        if (!p.draw?.date) return;
        const year = new Date(p.draw.date).getFullYear().toString();
        const sys = p.systemName;

        if (!yearlyStats[year]) yearlyStats[year] = {};
        if (!yearlyStats[year][sys]) yearlyStats[year][sys] = { hits2: 0, hits1: 0 };

        const hits = (game === 'EUROMILLIONS') ? (p.star_hits_4 ?? p.star_hits_2 ?? 0) : (p.star_hits_2 ?? 0);
        if (hits >= 2) yearlyStats[year][sys].hits2++;
        else if (hits === 1) yearlyStats[year][sys].hits1++;
    });

    // 3. Format for UI (Last 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
    const result: Record<string, YearlyStarStat[]> = {};

    for (const year of years) {
        const stats = yearlyStats[year] || {};
        const yearData: YearlyStarStat[] = [];

        for (const sys of systems) {
            const s = stats[sys] || { hits2: 0, hits1: 0 };
            yearData.push({
                systemName: sys,
                year,
                hits2: s.hits2,
                hits1: s.hits1,
                rank: 1
            });
        }

        // Sort by 2 Hits (Jackpot) desc
        result[year] = yearData.sort((a, b) => (b.hits2 - a.hits2) || (b.hits1 - a.hits1));
    }

    return result;
}

export async function getStarFrequency(game: string = 'EUROMILLIONS') {
    const draws = await prisma.draw.findMany({
        where: { game },
        select: { stars: true },
        orderBy: { date: 'desc' },
        take: 100
    });

    const maxStar = game === 'TOTOLOTO' ? 13 : game === 'EURODREAMS' ? 5 : 12;
    const frequency: Record<number, number> = {};
    for (let i = 1; i <= maxStar; i++) frequency[i] = 0;

    draws.forEach(d => {
        let stars: number[] = [];
        try {
            stars = typeof d.stars === 'string' ? JSON.parse(d.stars) : (d.stars as unknown as number[]);
        } catch {
            stars = [];
        }
        stars.forEach(s => {
            if (s >= 1 && s <= maxStar) {
                frequency[s] = (frequency[s] || 0) + 1;
            }
        });
    });

    return { frequency, totalDraws: draws.length };
}

export async function getStarDelays(game: string = 'EUROMILLIONS') {
    const draws = await prisma.draw.findMany({
        where: { game },
        select: { stars: true },
        orderBy: { date: 'desc' },
        take: 200
    });

    const maxStar = game === 'TOTOLOTO' ? 13 : game === 'EURODREAMS' ? 5 : 12;
    const delays: Record<number, number> = {};
    for (let i = 1; i <= maxStar; i++) delays[i] = -1;

    draws.forEach((draw, index) => {
        let stars: number[] = [];
        try {
            stars = typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars;
        } catch (e) {
            stars = [];
        }

        if (Array.isArray(stars)) {
            stars.forEach(star => {
                if (delays[star] === -1 && star >= 1 && star <= maxStar) {
                    delays[star] = index;
                }
            });
        }
    });

    for (let i = 1; i <= maxStar; i++) {
        if (delays[i] === -1) delays[i] = draws.length;
    }

    return Object.entries(delays).map(([star, delay]) => ({
        star: parseInt(star),
        delay
    })).sort((a, b) => b.delay - a.delay);
}

export async function getStarPairs(game: string = 'EUROMILLIONS') {
    const draws = await prisma.draw.findMany({
        where: { game },
        select: { stars: true },
        orderBy: { date: 'desc' }
    });

    const pairCounts: Record<string, { count: number, lastSeenIndex: number }> = {};

    draws.forEach((d, index) => {
        let stars: number[] = [];
        try {
            stars = typeof d.stars === 'string' ? JSON.parse(d.stars) : (d.stars as unknown as number[]);
        } catch {
            stars = [];
        }
        if (stars.length >= 2) {
            const sorted = [...stars].sort((a, b) => a - b);
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

export async function getStarRankings(game: string = 'EUROMILLIONS') {
    const rawData = await prisma.systemPrediction.findMany({
        where: { game, domain: 'STARS' },
        select: { systemName: true, star_hits_2: true, star_hits_4: true }
    });

    const stats: Record<string, { hits1: number, hits2: number, totalPreds: number }> = {};
    rawData.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = { hits1: 0, hits2: 0, totalPreds: 0 };
        }
        const s = stats[p.systemName];
        s.totalPreds++;
        const hits = p.star_hits_2 || 0;
        if (hits >= 2) s.hits2++;
        else if (hits === 1) s.hits1++;
    });

    const maxStars = game === 'EUROMILLIONS' ? 2 : 1;

    return Object.entries(stats).map(([name, s]) => {
        const qualityScore = maxStars === 2
            ? (s.hits1 * 10) + (s.hits2 * 100)
            : (s.hits1 * 100);

        const totalHits = s.hits1 + s.hits2;
        const winRate = s.totalPreds > 0 ? (totalHits / s.totalPreds) * 100 : 0;

        return {
            systemName: name,
            description: 'Sistema estatístico para estrelas',
            winRate,
            qualityScore,
            hits1: s.hits1,
            hits2: s.hits2,
            totalPredictions: s.totalPreds,
            maxStars
        };
    }).sort((a, b) => b.qualityScore - a.qualityScore);
}

export async function getStarRankingsForRange(game: string = 'EUROMILLIONS', range: number = 20) {
    const performances = await prisma.systemPrediction.findMany({
        where: { game, domain: 'STARS' },
        include: { draw: true },
        orderBy: { draw: { date: 'desc' } }
    });

    const systemMap: Record<string, any[]> = {};
    performances.forEach(p => {
        if (!systemMap[p.systemName]) systemMap[p.systemName] = [];
        if (range === 10000 || systemMap[p.systemName].length < range) {
            systemMap[p.systemName].push(p);
        }
    });

    const maxStars = game === 'EUROMILLIONS' ? 2 : 1;

    const ranking = Object.keys(systemMap).map(systemName => {
        const perfs = systemMap[systemName];
        let hits1 = 0;
        let hits2 = 0;

        perfs.forEach(p => {
            const hits = (game === 'EUROMILLIONS') ? (p.star_hits_4 ?? p.star_hits_2 ?? 0) : (p.star_hits_2 ?? 0);
            if (hits >= 2) hits2++;
            else if (hits === 1) hits1++;
        });

        const qualityScore = maxStars === 2
            ? (hits1 * 10) + (hits2 * 100)
            : (hits1 * 100);

        const totalHits = hits1 + hits2;
        const winRate = perfs.length > 0 ? (totalHits / perfs.length) * 100 : 0;

        return {
            systemName,
            description: 'Sistema estatístico para estrelas',
            winRate,
            qualityScore,
            hits1,
            hits2,
            totalPredictions: perfs.length,
            maxStars
        };
    });

    return ranking.sort((a, b) => b.qualityScore - a.qualityScore);
}

export async function getAllTimeStarRankingMetrics(game: string = 'EUROMILLIONS') {
    const performances = await prisma.systemPrediction.findMany({
        where: { game, domain: 'STARS' },
        select: {
            systemName: true,
            star_hits_2: true,
            star_hits_4: true
        }
    });

    const stats: Record<string, { hits1: number, hits2: number, totalPreds: number }> = {};

    performances.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = { hits1: 0, hits2: 0, totalPreds: 0 };
        }
        const s = stats[p.systemName];
        s.totalPreds++;
        const hits = (game === 'EUROMILLIONS') ? (p.star_hits_4 ?? p.star_hits_2 ?? 0) : (p.star_hits_2 ?? 0);
        if (hits >= 2) s.hits2++;
        else if (hits === 1) s.hits1++;
    });

    const maxStars = game === 'EUROMILLIONS' ? 2 : 1;

    return Object.keys(stats).map(name => {
        const s = stats[name];
        const qualityScore = maxStars === 2
            ? (s.hits1 * 10) + (s.hits2 * 100)
            : (s.hits1 * 100);
        const winRate = s.totalPreds > 0 ? ((s.hits1 + s.hits2) / s.totalPreds) * 100 : 0;
        return {
            systemName: name,
            description: 'Sistema estatístico para estrelas',
            qualityScore,
            winRate,
            hits1: s.hits1,
            hits2: s.hits2,
            totalPredictions: s.totalPreds,
            maxStars
        };
    }).sort((a, b) => b.qualityScore - a.qualityScore);
}

export async function getStarYearlyHistory(game: string = 'EUROMILLIONS') {
    const performances = await prisma.systemPrediction.findMany({
        where: { game, domain: 'STARS' },
        include: { draw: { select: { date: true } } }
    });

    const yearlyStats: Record<string, Record<string, { hits2: number, hits1: number }>> = {};

    performances.forEach(p => {
        if (!p.draw?.date) return;
        const year = new Date(p.draw.date).getFullYear().toString();
        if (!yearlyStats[year]) yearlyStats[year] = {};
        if (!yearlyStats[year][p.systemName]) yearlyStats[year][p.systemName] = { hits2: 0, hits1: 0 };

        const hits = p.star_hits_2 || 0;
        if (hits >= 2) yearlyStats[year][p.systemName].hits2++;
        else if (hits === 1) yearlyStats[year][p.systemName].hits1++;
    });

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

export async function getStarJackpotLeaders(game: string = 'EUROMILLIONS') {
    const maxStars = game === 'EUROMILLIONS' ? 2 : 1;
    const performances = await prisma.systemPrediction.findMany({
        where: {
            domain: 'STARS',
            ...(game === 'EUROMILLIONS' ? { star_hits_4: { gte: maxStars } } : { star_hits_2: { gte: maxStars } }),
            game
        },
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

export async function getLastDrawStarResults(game: string = 'EUROMILLIONS') {
    noStore();
    const lastDraw = await prisma.draw.findFirst({
        where: { game },
        orderBy: { date: 'desc' },
        select: { id: true, date: true, stars: true }
    });

    if (!lastDraw) return { results: [], lastDrawDate: '', actualStars: [] };

    const performances = await prisma.systemPrediction.findMany({
        where: { drawId: lastDraw.id, game, domain: 'STARS' },
        select: {
            systemName: true,
            star_hits_2: true,
            star_hits_4: true,
            prediction: true
        },
        orderBy: { star_hits_2: 'desc' }
    });

    const uniqueResults = new Map();
    performances.forEach(p => {
        if (!uniqueResults.has(p.systemName)) {
            uniqueResults.set(p.systemName, {
                systemName: p.systemName,
                hits: p.star_hits_2 || 0,
                stars: (typeof p.prediction === 'string' ? JSON.parse(p.prediction) : p.prediction) as number[]
            });
        }
    });

    const actualStars = (typeof lastDraw.stars === 'string' ? JSON.parse(lastDraw.stars) : lastDraw.stars) as number[];

    return {
        results: Array.from(uniqueResults.values()),
        lastDrawDate: new Date(lastDraw.date).toLocaleDateString('pt-PT'),
        actualStars
    };
}

export async function getStarSystemRanking(game: string = 'EUROMILLIONS') {
    const systems = await prisma.rankedSystem.findMany({ where: { game, domain: 'STARS' } });
    const result: any[] = [];
    for (const sys of systems) {
        const perfs = await prisma.systemPrediction.findMany({ where: { game, domain: 'STARS', systemName: sys.name }});
        if (perfs.length === 0) continue;
        const totalHits = perfs.reduce((sum, p) => sum + ((game === 'EUROMILLIONS') ? (p.star_hits_4 ?? p.star_hits_2 ?? 0) : (p.star_hits_2 ?? 0)), 0);
        const totalStars = game === 'EUROMILLIONS' ? 2 : 1;
        const avgAccuracy = (totalHits / (perfs.length * totalStars)) * 100;
        result.push({
            systemName: sys.name,
            game: sys.game,
            avgAccuracy,
            totalPredictions: perfs.length
        });
    }
    return result.sort((a, b) => b.avgAccuracy - a.avgAccuracy);
}

export async function getStarSystemDetails(systemName: string, game: string = 'EUROMILLIONS') {
    try {
        const history = await prisma.systemPrediction.findMany({
            where: { systemName, game, domain: 'STARS' },
            orderBy: { draw: { date: 'desc' } },
            take: 10000,
            include: { draw: true }
        });

        if (history.length === 0) return null;

        const maxStars = (game === 'EUROMILLIONS') ? 2 : 1;
        const totalHits = history.reduce((sum, p) => {
            const hits = (game === 'EUROMILLIONS') ? (p.star_hits_4 ?? p.star_hits_2 ?? 0) : (p.star_hits_2 ?? 0);
            return sum + hits;
        }, 0);

        const avgAccuracy = (totalHits / (history.length * maxStars)) * 100;

        return {
            system: {
                systemName,
                game,
                avgAccuracy,
                totalPredictions: history.length
            },
            history
        };
    } catch (e) {
        console.error("Error in getStarSystemDetails:", e);
        return null;
    }
}

export async function getStarPrediction(systemName: string, gameOverride?: string) {
    let game = gameOverride || 'EUROMILLIONS';
    return await getLiveNextStarPrediction(systemName, game);
}

export async function getStarConsensus(game: string = 'EUROMILLIONS') {
    const maxStar = game === 'TOTOLOTO' ? 13 : game === 'EURODREAMS' ? 5 : 12;
    const votes: Record<number, number> = {};
    for (let i = 1; i <= maxStar; i++) votes[i] = 0;

    const predictions = await prisma.systemPrediction.findMany({
        where: {
            game,
            domain: 'STARS'
        },
        orderBy: { drawId: 'desc' },
        distinct: ['systemName']
    });

    predictions.forEach(p => {
        let numbers: number[] = [];
        try {
            numbers = typeof p.prediction === 'string' ? JSON.parse(p.prediction) : p.prediction;
        } catch (e) {
            numbers = [];
        }
        numbers.forEach(n => {
            if (n >= 1 && n <= maxStar) {
                votes[n] = (votes[n] || 0) + 1;
            }
        });
    });

    return Object.entries(votes)
        .map(([star, count]) => ({ star: parseInt(star), count }))
        .sort((a, b) => b.count - a.count);
}

export async function getStarSystemStatsForRange(systemName: string, game: string, range: number) {
    const performances = await prisma.systemPrediction.findMany({
        where: { systemName, game, domain: 'STARS' },
        include: { draw: true },
        orderBy: { draw: { date: 'desc' } },
        take: range === 10000 ? undefined : range
    });

    const seenDrawIds = new Set<number>();
    const uniquePerformances = performances.filter(p => {
        if (seenDrawIds.has(p.drawId)) return false;
        seenDrawIds.add(p.drawId);
        return true;
    });

    const maxStars = game === 'EUROMILLIONS' ? 2 : 1;
    const distribution = Array(maxStars + 1).fill(0);
    let totalHits = 0;

    uniquePerformances.forEach(p => {
        const actualHits = (game === 'EUROMILLIONS') ? (p.star_hits_4 ?? p.star_hits_2 ?? 0) : (p.star_hits_2 ?? 0);
        const hits = Math.min(maxStars, Math.max(0, actualHits));
        distribution[hits]++;
        totalHits += actualHits;
    });

    const accuracy = uniquePerformances.length > 0
        ? ((totalHits / uniquePerformances.length) / maxStars) * 100
        : 0;

    return {
        accuracy,
        total: uniquePerformances.length,
        distribution,
        maxStars
    };
}


export async function getStarRankingMetrics(game: string = 'EUROMILLIONS', timeframe: 'historical' | 'last100' | 'last20' = 'historical') {
    const range = timeframe === 'last20' ? 20 : timeframe === 'last100' ? 100 : 10000;
    return getStarRankingsForRange(game, range);
}

export async function getStarSuggestions(game: string = 'EUROMILLIONS') {
    const allDraws = await prisma.draw.findMany({
        where: { game },
        select: { stars: true },
        orderBy: { date: 'desc' }
    });

    const recentDraws = allDraws.slice(0, 100);

    // 1. Calculate historical frequencies
    const historicalPairs: Record<string, number> = {};
    const historicalFreq: Record<number, number> = {};

    allDraws.forEach(d => {
        try {
            const stars = (typeof d.stars === 'string' ? JSON.parse(d.stars) : d.stars) as number[];
            if (Array.isArray(stars)) {
                stars.forEach(s => { historicalFreq[s] = (historicalFreq[s] || 0) + 1; });
                if (stars.length >= 2) {
                    const sorted = [...stars].sort((a, b) => a - b);
                    const key = `${sorted[0]}-${sorted[1]}`;
                    historicalPairs[key] = (historicalPairs[key] || 0) + 1;
                }
            }
        } catch (e) {}
    });

    // 2. Recent frequencies (Last 100)
    const recentPairs: Record<string, number> = {};
    const recentFreq: Record<number, number> = {};

    recentDraws.forEach(d => {
        try {
            const stars = (typeof d.stars === 'string' ? JSON.parse(d.stars) : d.stars) as number[];
            if (Array.isArray(stars)) {
                stars.forEach(s => { recentFreq[s] = (recentFreq[s] || 0) + 1; });
                if (stars.length >= 2) {
                    const sorted = [...stars].sort((a, b) => a - b);
                    const key = `${sorted[0]}-${sorted[1]}`;
                    recentPairs[key] = (recentPairs[key] || 0) + 1;
                }
            }
        } catch (e) {}
    });

    // For single-star games (TOTOLOTO, EURODREAMS) create synthetic top pair
    const topHistoricalSingles = Object.entries(historicalFreq).sort((a, b) => b[1] - a[1]).map(e => Number(e[0]));
    const topRecentSingles = Object.entries(recentFreq).sort((a, b) => b[1] - a[1]).map(e => Number(e[0]));

    const sortedGoldenPairs = Object.entries(historicalPairs).sort((a, b) => b[1] - a[1]);
    const goldenPairStr = sortedGoldenPairs.length > 0 
        ? sortedGoldenPairs[0][0] 
        : (topHistoricalSingles.length >= 2 ? `${topHistoricalSingles[0]}-${topHistoricalSingles[1]}` : '1-2');
    const goldenCount = sortedGoldenPairs.length > 0 ? sortedGoldenPairs[0][1] : 0;

    const sortedHotPairs = Object.entries(recentPairs).sort((a, b) => b[1] - a[1]);
    const hotPairStr = sortedHotPairs.length > 0
        ? sortedHotPairs[0][0]
        : (topRecentSingles.length >= 2 ? `${topRecentSingles[0]}-${topRecentSingles[1]}` : goldenPairStr);
    const hotCount = sortedHotPairs.length > 0 ? sortedHotPairs[0][1] : 0;

    const rationalStars = (topRecentSingles.length >= 2 ? topRecentSingles.slice(0, 2) : [1, 2]).sort((a, b) => a - b);
    const rationalPair = `${rationalStars[0]}-${rationalStars[1]}`;

    return {
        golden: { pair: goldenPairStr, count: goldenCount, total: allDraws.length },
        hot: { pair: hotPairStr, count: hotCount, total: recentDraws.length },
        rational: { pair: rationalPair, stars: rationalStars }
    };
}


export async function getStarProperties(game: string = 'EUROMILLIONS') {
    const draws = await prisma.draw.findMany({
        where: { game },
        select: { stars: true },
        orderBy: { date: 'desc' },
        take: 100
    });

    const stats = {
        parity: { '2P': 0, '2I': 0, '1P1I': 0, '1P': 0, '1I': 0 },
        highLow: { '2H': 0, '2L': 0, '1H1L': 0, '1H': 0, '1L': 0 },
        primes: { count0: 0, count1: 0, count2: 0 },
        consecutive: { yes: 0, no: 0 },
        sum: { total: 0, min: Infinity, max: -Infinity },
        totalDraws: draws.length
    };

    const primes = [2, 3, 5, 7, 11];
    const isSingleStar = game === 'TOTOLOTO' || game === 'EURODREAMS';
    const highThreshold = game === 'EURODREAMS' ? 3 : 7;

    draws.forEach(d => {
        let stars: number[] = [];
        try {
            stars = typeof d.stars === 'string' ? JSON.parse(d.stars) : (d.stars as unknown as number[]);
        } catch {
            stars = [];
        }

        if (isSingleStar && stars.length >= 1) {
            const s = stars[0];
            if (s % 2 === 0) stats.parity['1P'] = (stats.parity['1P'] || 0) + 1;
            else stats.parity['1I'] = (stats.parity['1I'] || 0) + 1;

            if (s >= highThreshold) stats.highLow['1H'] = (stats.highLow['1H'] || 0) + 1;
            else stats.highLow['1L'] = (stats.highLow['1L'] || 0) + 1;

            if (primes.includes(s)) stats.primes.count1++;
            else stats.primes.count0++;

            stats.sum.total += s;
            if (s < stats.sum.min) stats.sum.min = s;
            if (s > stats.sum.max) stats.sum.max = s;
        } else if (stars.length >= 2) {
            const evens = stars.filter(s => s % 2 === 0).length;
            if (evens === 2) stats.parity['2P']++;
            else if (evens === 0) stats.parity['2I']++;
            else stats.parity['1P1I']++;

            const highs = stars.filter(s => s >= 7).length;
            if (highs === 2) stats.highLow['2H']++;
            else if (highs === 0) stats.highLow['2L']++;
            else stats.highLow['1H1L']++;

            const primeCount = stars.filter(s => primes.includes(s)).length;
            if (primeCount === 2) stats.primes.count2++;
            else if (primeCount === 1) stats.primes.count1++;
            else stats.primes.count0++;

            const sorted = [...stars].sort((a, b) => a - b);
            if (sorted[1] - sorted[0] === 1) stats.consecutive.yes++;
            else stats.consecutive.no++;

            const sum = stars.reduce((a, b) => a + b, 0);
            stats.sum.total += sum;
            if (sum < stats.sum.min) stats.sum.min = sum;
            if (sum > stats.sum.max) stats.sum.max = sum;
        }
    });

    return {
        ...stats,
        sum: {
            avg: draws.length > 0 ? Number((stats.sum.total / draws.length).toFixed(1)) : 0,
            min: stats.sum.min === Infinity ? 0 : stats.sum.min,
            max: stats.sum.max === -Infinity ? 0 : stats.sum.max
        }
    };
}
