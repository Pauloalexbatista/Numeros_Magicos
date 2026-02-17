

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

export async function getStarSystemsYearlyAnalysis(game: string = 'EUROMILLIONS') {
    // 1. Get All Star Systems
    const rankings = await prisma.starSystemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' }
    });

    const systems = rankings.map(r => r.systemName);

    // 2. Get Performance Data
    // First, let's also include Current Year Winners (Anyone who got a Jackpot this year)
    // EM/TL: 2 hits. ED: 1 hit.
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const minHits = game === 'EURODREAMS' ? 1 : 2;

    const recentWinners = await prisma.starSystemPerformance.findMany({
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

    // Merge systems
    const allSystems = Array.from(new Set([...systems, ...winnerNames]));

    const data = await prisma.starSystemPerformance.findMany({
        where: {
            systemName: { in: allSystems },
            draw: { game } // Filter by game
        },
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

export async function getStarFrequency(game: string = 'EUROMILLIONS') {
    const draws = await prisma.draw.findMany({
        where: { game },
        select: { stars: true },
        orderBy: { date: 'desc' },
        take: 100 // Last 100 draws for frequency
    });

    const maxStar = game === 'TOTOLOTO' ? 13 : game === 'EURODREAMS' ? 5 : 12;
    const frequency: Record<number, number> = {};
    for (let i = 1; i <= maxStar; i++) frequency[i] = 0;

    draws.forEach(d => {
        const stars = JSON.parse(d.stars) as number[];
        stars.forEach(s => {
            frequency[s] = (frequency[s] || 0) + 1;
        });
    });

    return { frequency, totalDraws: draws.length };
}

export async function getStarPairs(game: string = 'EUROMILLIONS') {
    const draws = await prisma.draw.findMany({
        where: { game },
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

export async function getStarProperties(game: string = 'EUROMILLIONS') {
    const draws = await prisma.draw.findMany({
        where: { game },
        select: { stars: true },
        orderBy: { date: 'desc' },
        take: 100 // Last 100 draws
    });

    const stats = {
        parity: { '2P': 0, '2I': 0, '1P1I': 0, '1P': 0, '1I': 0 },
        highLow: { '2H': 0, '2L': 0, '1H1L': 0, '1H': 0, '1L': 0 },
        primes: { count0: 0, count1: 0, count2: 0 },
        consecutive: { yes: 0, no: 0 },
        sum: { total: 0, min: Infinity, max: -Infinity },
        totalDraws: draws.length
    };

    const maxStar = game === 'TOTOLOTO' ? 13 : game === 'EURODREAMS' ? 5 : 12;
    const highThreshold = game === 'EURODREAMS' ? 3 : 7;
    const primes = [2, 3, 5, 7, 11, 13];

    draws.forEach(d => {
        const stars = JSON.parse(d.stars) as number[];

        // Parity
        const evens = stars.filter(s => s % 2 === 0).length;
        const odds = stars.length - evens;

        if (stars.length === 2) {
            if (evens === 2) stats.parity['2P']++;
            else if (evens === 0) stats.parity['2I']++;
            else stats.parity['1P1I']++;
        } else if (stars.length === 1) {
            if (evens === 1) stats.parity['1P']++;
            else stats.parity['1I']++;
        }

        // High/Low
        const highs = stars.filter(s => s >= highThreshold).length;
        const lows = stars.length - highs;

        if (stars.length === 2) {
            if (highs === 2) stats.highLow['2H']++;
            else if (highs === 0) stats.highLow['2L']++;
            else stats.highLow['1H1L']++;
        } else if (stars.length === 1) {
            if (highs === 1) stats.highLow['1H']++;
            else stats.highLow['1L']++;
        }

        // Primes
        const primeCount = stars.filter(s => primes.includes(s)).length;
        if (primeCount === 2) stats.primes.count2++;
        else if (primeCount === 1) stats.primes.count1++;
        else stats.primes.count0++;

        // Consecutive
        const sorted = [...stars].sort((a, b) => a - b);
        if (stars.length >= 2 && sorted[1] - sorted[0] === 1) stats.consecutive.yes++;
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

export async function getStarSuggestions(game: string = 'EUROMILLIONS') {
    // 1. Fetch Data
    const allDraws = await prisma.draw.findMany({
        where: { game },
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
        } else if (stars.length === 1) {
            const key = String(stars[0]);
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
        } else if (stars.length === 1) {
            const key = String(stars[0]);
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
export async function getStarRankingMetrics(game: string = 'EUROMILLIONS', timeframe: 'historical' | 'last100' | 'last20' = 'last100') {
    // 1. Determine Draw Range
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
            orderBy: { date: 'desc' }, // Correct Date Ordering
            take: drawCount,
            select: { id: true }
        });
    }

    if (draws.length === 0) return [];

    const drawIds = draws.map(d => d.id);

    // 2. Fetch Performance Data
    const performances = await prisma.starSystemPerformance.findMany({
        where: {
            drawId: { in: drawIds }, // Correct IN operator
            draw: { game }
        },
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
        const maxStars = game === 'EUROMILLIONS' ? 2 : 1;

        // Stars Score: hits1=10, hits2=100 (if EM), or hits1=100 (if TL/ED)
        const qualityScore = maxStars === 2
            ? (s.hits1 * 10) + (s.hits2 * 100)
            : (s.hits1 * 100);

        // Win Rate (Any hit)
        const totalHits = s.hits1 + s.hits2;
        const winRate = s.totalPreds > 0 ? (totalHits / s.totalPreds) * 100 : 0;

        return {
            systemName: name,
            description: systemDescriptions[name] || 'Sistema de previsão de estrelas',
            winRate,
            qualityScore,
            hits1: s.hits1,
            hits2: s.hits2,
            totalPredictions: s.totalPreds,
            maxStars
        };
    });

    return ranking.sort((a, b) => b.qualityScore - a.qualityScore);
}

export async function getAllTimeStarRankingMetrics(game: string = 'EUROMILLIONS') {
    // 1. Fetch ALL Performance Data
    const performances = await prisma.starSystemPerformance.findMany({
        where: { draw: { game } },
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
        const maxStars = game === 'EUROMILLIONS' ? 2 : 1;

        const qualityScore = maxStars === 2
            ? (s.hits1 * 10) + (s.hits2 * 100)
            : (s.hits1 * 100);

        const totalHits = s.hits1 + s.hits2;
        const winRate = s.totalPreds > 0 ? (totalHits / s.totalPreds) * 100 : 0;

        return {
            systemName: name,
            description: systemDescriptions[name] || 'Sistema de previsão de estrelas',
            winRate,
            qualityScore,
            hits1: s.hits1,
            hits2: s.hits2,
            totalPredictions: s.totalPreds,
            maxStars
        };
    }).sort((a, b) => b.qualityScore - a.qualityScore);
}

export async function getStarYearlyHistory(game: string = 'EUROMILLIONS') {
    const performances = await prisma.starSystemPerformance.findMany({
        where: { draw: { game } },
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
export async function getStarJackpotLeaders(game: string = 'EUROMILLIONS') {
    const maxStars = game === 'EUROMILLIONS' ? 2 : 1;
    const performances = await prisma.starSystemPerformance.findMany({
        where: {
            hits: maxStars,
            draw: { game }
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

// Get results for the last draw (for LastDrawStarSystems widget)
export async function getLastDrawStarResults(game: string = 'EUROMILLIONS') {
    // Get the most recent draw
    const lastDraw = await prisma.draw.findFirst({
        where: { game },
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
    // Determine Game and Base Name based on System Name Suffix
    let game = 'EUROMILLIONS';
    let baseName = systemName;

    if (systemName.endsWith('_TOTOLOTO')) {
        game = 'TOTOLOTO';
        baseName = systemName.replace('_TOTOLOTO', '');
    } else if (systemName.endsWith(' (EuroDreams)')) {
        game = 'EURODREAMS';
        baseName = systemName.replace(' (EuroDreams)', '');
    }

    const system = starSystems.find(s => s.name === baseName); // Use Base Name for lookup
    if (!system) return [];

    const cached = await prisma.cachedPrediction.findUnique({
        where: { systemName }
    });

    if (cached && cached.numbers) {
        return JSON.parse(cached.numbers);
    }

    const draws = await prisma.draw.findMany({
        where: { game }, // Filter draws by game
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

export async function getStarConsensus(game: string = 'EUROMILLIONS') {
    const systems = ['Hot Stars', 'Late Stars', 'Markov Stars', 'Star Platinum', 'Anti-Hot Stars', 'Anti-Late Stars', 'Golden Pair', 'Star LSTM'];
    const maxStar = game === 'TOTOLOTO' ? 13 : game === 'EURODREAMS' ? 5 : 12;
    const votes: Record<number, number> = {};
    for (let i = 1; i <= maxStar; i++) votes[i] = 0;

    const predictions = await prisma.cachedPrediction.findMany({
        where: { systemName: { in: systems } }
    });

    predictions.forEach(p => {
        const numbers = JSON.parse(p.numbers) as number[];
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

    // Detect Game and Max Stars
    const firstPerf = uniquePerformances[0];
    const game = (firstPerf as any).draw?.game || 'EUROMILLIONS';
    const maxStars = game === 'EUROMILLIONS' ? 2 : 1;

    // Calculate distribution [0 hits, 1 hit, 2 hits]
    const distribution = Array(maxStars + 1).fill(0);
    let totalHits = 0;

    uniquePerformances.forEach(p => {
        const hits = Math.min(maxStars, Math.max(0, p.hits));
        distribution[hits]++;
        totalHits += p.hits; // Use actual hits for accuracy
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

