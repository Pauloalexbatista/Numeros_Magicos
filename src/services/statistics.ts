export interface Draw {
    date: string | Date;
    numbers: number[];
    stars: number[];
    numbersDrawOrder?: number[];
    starsDrawOrder?: number[];
}

/**
 * Calculate the arithmetic mean of numbers and stars for a set of draws.
 *
 * @param draws Array of draw objects (must contain `numbers` and `stars`).
 * @param limit Optional limit to use only the most recent `limit` draws.
 * @returns Object with `meanNumbers` and `meanStars` (both as numbers with 2 decimal places).
 */
export function calculateMean(draws: Draw[], limit?: number) {
    const usedDraws = limit ? draws.slice(0, limit) : draws;
    const totalDraws = usedDraws.length;
    if (totalDraws === 0) return { meanNumbers: 0, meanStars: 0 };

    let sumNumbers = 0;
    let sumStars = 0;

    usedDraws.forEach(d => {
        sumNumbers += d.numbers.reduce((a, b) => a + b, 0);
        sumStars += d.stars.reduce((a, b) => a + b, 0);
    });

    const meanNumbers = parseFloat((sumNumbers / (totalDraws * 5)).toFixed(2)); // 5 numbers per draw
    const meanStars = parseFloat((sumStars / (totalDraws * 2)).toFixed(2)); // 2 stars per draw

    return { meanNumbers, meanStars };
}

/**
 * Calculate the amplitude (Max - Min) for each draw.
 */
export function calculateAmplitude(numbers: number[]): number {
    if (!numbers || numbers.length === 0) return 0;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);
    return max - min;
}

export function classifyAmplitude(amp: number): 'Concentrado' | 'Normal' | 'Disperso' {
    // Theoretical Max Amplitude: 50 - 1 = 49
    // Theoretical Min Amplitude: 5 - 1 = 4
    // Heuristic classification
    if (amp < 25) return 'Concentrado';
    if (amp > 40) return 'Disperso';
    return 'Normal';
}

/**
 * Calculate pyramid totals for a specific set of draws.
 * Row 0: col-1, col, col+1 (3 cells)
 * Row 1+: col-(n+1), col+(n+1) (2 cells, no center)
 */
function calculatePyramidTotalsForDraws(draws: Draw[]): number[] {
    const columns = Array.from({ length: 50 }, (_, i) => i + 1);

    return columns.map(col => {
        let sum = 0;
        draws.forEach((draw, rowIdx) => {
            if (rowIdx === 0) {
                // First row: count left, center, right (3 cells)
                const left = col - 1;
                const right = col + 1;

                if (left >= 1 && draw.numbers.includes(left)) sum += 1;
                if (draw.numbers.includes(col)) sum += 1;
                if (right <= 50 && draw.numbers.includes(right)) sum += 1;
            } else {
                // Other rows: only count left and right neighbors (2 cells)
                const spread = rowIdx + 1;
                const left = col - spread;
                const right = col + spread;

                if (left >= 1 && draw.numbers.includes(left)) sum += 1;
                if (right <= 50 && draw.numbers.includes(right)) sum += 1;
            }
        });
        return sum;
    });
}

export interface PyramidValidationResult {
    date: string;
    actualNumbers: number[];
    pyramidTotals: number[];
    topNumbers: number[]; // Top N numbers by pyramid total
    hits: number; // How many actual numbers were in topNumbers
    positions: number[]; // Position of each actual number in ranking (1-50)
    averagePosition: number;
}

/**
 * Calculate historical pyramid totals and validate against actual draws.
 * For each draw, calculate pyramid using only PREVIOUS draws, then compare with actual numbers.
 */
export function calculateHistoricalPyramidValidation(
    draws: Draw[],
    topN: number = 10
): PyramidValidationResult[] {
    const results: PyramidValidationResult[] = [];

    // Start from draw index 1 (need at least 1 previous draw)
    for (let i = 1; i < draws.length; i++) {
        const previousDraws = draws.slice(i); // All draws BEFORE this one
        const currentDraw = draws[i];

        // Calculate pyramid totals using only previous draws
        const pyramidTotals = calculatePyramidTotalsForDraws(previousDraws);

        // Create ranking: array of {number, total} sorted by total descending
        const ranking = pyramidTotals
            .map((total, idx) => ({ number: idx + 1, total }))
            .sort((a, b) => b.total - a.total);

        // Get top N numbers
        const topNumbers = ranking.slice(0, topN).map(r => r.number);

        // Calculate hits
        const hits = currentDraw.numbers.filter(n => topNumbers.includes(n)).length;

        // Calculate positions of actual numbers in ranking
        const positions = currentDraw.numbers.map(num => {
            const pos = ranking.findIndex(r => r.number === num);
            return pos + 1; // 1-indexed
        });

        const averagePosition = positions.reduce((a, b) => a + b, 0) / positions.length;

        results.push({
            date: typeof currentDraw.date === 'string' ? currentDraw.date : currentDraw.date.toISOString(),
            actualNumbers: currentDraw.numbers,
            pyramidTotals,
            topNumbers,
            hits,
            positions,
            averagePosition
        });
    }

    return results;
}

export interface PyramidAccuracyStats {
    totalDraws: number;
    analyzedDraws: number; // After applying minSampleSize filter
    minSampleSize: number; // Minimum previous draws required
    topNSizes: number[];
    hitRates: { [key: number]: number };
    averageHits: { [key: number]: number };
    hitDistribution: { [key: number]: { [hits: number]: number } }; // topN -> { 0: count, 1: count, ... 5: count }
    theoreticalProbabilities: { [key: number]: number[] }; // topN -> [P(0 hits), P(1 hit), ... P(5 hits)]
    averagePosition: number;
    bestTopN: number;
}

/**
 * Calculate theoretical probability of getting exactly k hits when choosing topN from 50.
 * Uses hypergeometric distribution: P(X=k) = C(topN,k) * C(50-topN, 5-k) / C(50,5)
 */
function calculateTheoreticalProbability(topN: number, k: number): number {
    const combination = (n: number, r: number): number => {
        if (r > n) return 0;
        if (r === 0 || r === n) return 1;
        let result = 1;
        for (let i = 0; i < r; i++) {
            result *= (n - i) / (i + 1);
        }
        return result;
    };

    const totalWays = combination(50, 5);
    const waysToGetK = combination(topN, k) * combination(50 - topN, 5 - k);
    return waysToGetK / totalWays;
}

/**
 * Analyze pyramid accuracy across all historical validations.
 * @param draws All draws in chronological order (most recent first)
 * @param minSampleSize Minimum number of previous draws required (default: 100)
 */
export function analyzePyramidAccuracy(draws: Draw[], minSampleSize: number = 100): PyramidAccuracyStats {
    const topNSizes = [10, 15, 20, 25, 30];
    const hitRates: { [key: number]: number } = {};
    const averageHits: { [key: number]: number } = {};
    const hitDistribution: { [key: number]: { [hits: number]: number } } = {};
    const theoreticalProbabilities: { [key: number]: number[] } = {};

    let totalAvgPosition = 0;
    let bestTopN = 10;
    let bestHitRate = 0;

    topNSizes.forEach(topN => {
        // Calculate all validations
        const allValidations = calculateHistoricalPyramidValidation(draws, topN);

        // Filter to only include validations with enough previous draws
        // Since draws are ordered most recent first, validation index i has (draws.length - i - 1) previous draws
        const validations = allValidations.filter((_, idx) => {
            const previousDrawsCount = draws.length - idx - 1;
            return previousDrawsCount >= minSampleSize;
        });

        // Calculate hit distribution
        const distribution: { [hits: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        validations.forEach(v => {
            distribution[v.hits]++;
        });
        hitDistribution[topN] = distribution;

        // Calculate theoretical probabilities
        const theoretical: number[] = [];
        for (let k = 0; k <= 5; k++) {
            theoretical.push(calculateTheoreticalProbability(topN, k));
        }
        theoreticalProbabilities[topN] = theoretical;

        // Calculate hit rates
        const totalHits = validations.reduce((sum, v) => sum + v.hits, 0);
        const hitRate = validations.length > 0 ? totalHits / (validations.length * 5) : 0;
        const avgHits = validations.length > 0 ? totalHits / validations.length : 0;

        hitRates[topN] = parseFloat(hitRate.toFixed(4));
        averageHits[topN] = parseFloat(avgHits.toFixed(2));

        if (hitRate > bestHitRate) {
            bestHitRate = hitRate;
            bestTopN = topN;
        }

        if (topN === 10 && validations.length > 0) {
            totalAvgPosition = validations.reduce((sum, v) => sum + v.averagePosition, 0) / validations.length;
        }
    });

    // Count analyzed draws (those with >= minSampleSize previous draws)
    const analyzedDraws = draws.length - minSampleSize - 1;

    return {
        totalDraws: draws.length,
        analyzedDraws,
        minSampleSize,
        topNSizes,
        hitRates,
        averageHits,
        hitDistribution,
        theoreticalProbabilities,
        averagePosition: parseFloat(totalAvgPosition.toFixed(2)),
        bestTopN
    };
}

export interface PyramidRecommendation {
    number: number;
    total: number;
    rank: number;
    confidence: 'high' | 'medium' | 'low';
}

/**
 * Get recommendations for the next draw based on current pyramid totals.
 */
export function getPyramidRecommendations(
    draws: Draw[],
    topN: number = 15
): PyramidRecommendation[] {
    const pyramidTotals = calculatePyramidTotalsForDraws(draws);

    // Create ranking
    const ranking = pyramidTotals
        .map((total, idx) => ({ number: idx + 1, total }))
        .sort((a, b) => b.total - a.total);

    // Get top N recommendations
    const maxTotal = ranking[0].total;

    return ranking.slice(0, topN).map((r, idx) => {
        const rank = idx + 1;
        let confidence: 'high' | 'medium' | 'low' = 'low';

        // Confidence based on total relative to max
        const relativeStrength = r.total / maxTotal;
        if (relativeStrength > 0.8) confidence = 'high';
        else if (relativeStrength > 0.6) confidence = 'medium';

        return {
            number: r.number,
            total: r.total,
            rank,
            confidence
        };
    });
}


export interface StarPatternStats {
    totalDraws: number;
    evenOdd: {
        '2-0': number; // 2 Even, 0 Odd
        '1-1': number; // 1 Even, 1 Odd
        '0-2': number; // 0 Even, 2 Odd
    };
    highLow: {
        '2-0': number; // 2 High, 0 Low (High = 7-12)
        '1-1': number; // 1 High, 1 Low
        '0-2': number; // 0 High, 2 Low (Low = 1-6)
    };
    mostFrequentParity: string;
    mostFrequentZone: string;
}

/**
 * Analyze patterns for Stars (Even/Odd and High/Low).
 * High is defined as 7-12, Low as 1-6.
 */
import { getRulesForDate } from './rules';

/**
 * Analyze patterns for Stars (Even/Odd and High/Low).
 * High/Low threshold is dynamic based on historical rules.
 */
export function analyzeStarPatterns(draws: Draw[]): StarPatternStats {
    const stats: StarPatternStats = {
        totalDraws: draws.length,
        evenOdd: { '2-0': 0, '1-1': 0, '0-2': 0 },
        highLow: { '2-0': 0, '1-1': 0, '0-2': 0 },
        mostFrequentParity: '',
        mostFrequentZone: ''
    };

    draws.forEach(draw => {
        const evens = draw.stars.filter(s => s % 2 === 0).length;

        if (evens === 2) stats.evenOdd['2-0']++;
        else if (evens === 1) stats.evenOdd['1-1']++;
        else stats.evenOdd['0-2']++;

        // Dynamic High/Low Threshold
        const rules = getRulesForDate(draw.date instanceof Date ? draw.date : new Date(draw.date));
        const threshold = Math.ceil(rules.maxStars / 2); // e.g., 9->5, 11->6, 12->6
        // Wait, if max is 12, half is 6. Low 1-6, High 7-12. So > 6 is High.
        // If max is 9, half is 4.5 -> 5. Low 1-5, High 6-9. So > 5 is High.
        // If max is 11, half is 5.5 -> 6. Low 1-6, High 7-11. So > 6 is High.

        // Let's refine:
        // 12 Stars: Low 1-6, High 7-12. (High > 6)
        // 11 Stars: Low 1-5, High 6-11? Or 1-6, 7-11? 11/2 = 5.5. 
        // Usually split is roughly equal. 1-5 (5), 6-11 (6). Or 1-6 (6), 7-11 (5).
        // Let's assume High starts at ceil(max/2) + 1?
        // 12: 6+1=7. Correct.
        // 11: 5.5->6. High starts at 6? (1-5, 6-11). Yes.
        // 9: 4.5->5. High starts at 5? (1-4, 5-9). Yes.

        // So High >= Math.ceil(maxStars / 2) + (maxStars % 2 === 0 ? 1 : 0)?
        // 12: 6 + 1 = 7. High >= 7.
        // 11: 6 + 0 = 6. High >= 6.
        // 9: 5 + 0 = 5. High >= 5.

        // Simpler: High Threshold is simply > maxStars / 2.
        // 12/2 = 6. >6 is 7+. Correct.
        // 11/2 = 5.5. >5.5 is 6+. Correct.
        // 9/2 = 4.5. >4.5 is 5+. Correct.

        const highs = draw.stars.filter(s => s > (rules.maxStars / 2)).length;

        if (highs === 2) stats.highLow['2-0']++;
        else if (highs === 1) stats.highLow['1-1']++;
        else stats.highLow['0-2']++;
    });

    // Determine most frequent patterns
    stats.mostFrequentParity = Object.entries(stats.evenOdd).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    stats.mostFrequentZone = Object.entries(stats.highLow).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return stats;
}

export interface PrimeNumberStats {
    totalDraws: number;
    primeCounts: { [count: number]: number }; // How many draws had X primes (0 to 5)
    mostFrequentCount: number;
    primeFrequency: { [number: number]: number }; // Frequency of each individual prime number
}

const PRIMES_UP_TO_50 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

/**
 * Analyze the occurrence of prime numbers in the draws.
 */
export function analyzePrimeNumbers(draws: Draw[]): PrimeNumberStats {
    const stats: PrimeNumberStats = {
        totalDraws: draws.length,
        primeCounts: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        mostFrequentCount: 0,
        primeFrequency: {}
    };

    // Initialize prime frequencies
    PRIMES_UP_TO_50.forEach(p => stats.primeFrequency[p] = 0);

    draws.forEach(draw => {
        let primesInDraw = 0;
        draw.numbers.forEach(num => {
            if (PRIMES_UP_TO_50.includes(num)) {
                primesInDraw++;
                stats.primeFrequency[num]++;
            }
        });

        if (stats.primeCounts[primesInDraw] !== undefined) {
            stats.primeCounts[primesInDraw]++;
        }
    });

    // Determine most frequent count of primes per draw
    stats.mostFrequentCount = parseInt(Object.entries(stats.primeCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]);

    return stats;
}

/**
 * PHASE 3 STATISTICS
 */

export interface DecadesDistribution {
    d0: number;   // 0-9 (only relevant for numbers, not typical in EuroMillions)
    d10: number;  // 10-19
    d20: number;  // 20-29
    d30: number;  // 30-39
    d40: number;  // 40-50
}

/**
 * Calculate distribution of numbers across decades.
 * Decades: [1-9], [10-19], [20-29], [30-39], [40-50]
 */
export function calculateDecades(numbers: number[]): DecadesDistribution {
    const distribution: DecadesDistribution = {
        d0: 0,
        d10: 0,
        d20: 0,
        d30: 0,
        d40: 0
    };

    numbers.forEach(num => {
        if (num >= 1 && num <= 9) distribution.d0++;
        else if (num >= 10 && num <= 19) distribution.d10++;
        else if (num >= 20 && num <= 29) distribution.d20++;
        else if (num >= 30 && num <= 39) distribution.d30++;
        else if (num >= 40 && num <= 50) distribution.d40++;
    });

    return distribution;
}

export interface QuadrantsDistribution {
    q1: number;  // 1-12
    q2: number;  // 13-25
    q3: number;  // 26-37
    q4: number;  // 38-50
}

/**
 * Calculate distribution of numbers across 4 quadrants.
 * Q1: 1-12, Q2: 13-25, Q3: 26-37, Q4: 38-50
 */
export function calculateQuadrants(numbers: number[]): QuadrantsDistribution {
    const distribution: QuadrantsDistribution = {
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0
    };

    numbers.forEach(num => {
        if (num >= 1 && num <= 12) distribution.q1++;
        else if (num >= 13 && num <= 25) distribution.q2++;
        else if (num >= 26 && num <= 37) distribution.q3++;
        else if (num >= 38 && num <= 50) distribution.q4++;
    });

    return distribution;
}

export interface MultiplesCount {
    m3: number;  // Multiples of 3
    m4: number;  // Multiples of 4
    m5: number;  // Multiples of 5
    m7: number;  // Multiples of 7
}

/**
 * Count how many numbers are multiples of 3, 4, 5, and 7.
 */
export function calculateMultiples(numbers: number[]): MultiplesCount {
    const multiples: MultiplesCount = {
        m3: 0,
        m4: 0,
        m5: 0,
        m7: 0
    };

    numbers.forEach(num => {
        if (num % 3 === 0) multiples.m3++;
        if (num % 4 === 0) multiples.m4++;
        if (num % 5 === 0) multiples.m5++;
        if (num % 7 === 0) multiples.m7++;
    });

    return multiples;
}

/**
 * Comprehensive number properties analysis
 */
export interface NumberProperties {
    number: number;
    isEven: boolean;
    isPrime: boolean;
    isM3: boolean;
    isM4: boolean;
    isM5: boolean;
    isM7: boolean;
    frequency: number;
    lastAppearance?: string;
}

export interface NumberPropertiesAnalysis {
    numbers: NumberProperties[];
    totalDraws: number;
    evenOddStats: {
        totalEven: number;
        totalOdd: number;
        avgEvenPerDraw: number;
        avgOddPerDraw: number;
    };
    primeStats: {
        totalPrimes: number;
        avgPrimesPerDraw: number;
    };
    multiplesStats: {
        avgM3: number;
        avgM4: number;
        avgM5: number;
        avgM7: number;
    };
}

/**
 * Analyze all mathematical properties of numbers across draws
 */
export function analyzeNumberProperties(draws: Draw[]): NumberPropertiesAnalysis {
    const numberData: Map<number, { frequency: number; lastAppearance?: Date }> = new Map();

    // Initialize all numbers 1-50
    for (let i = 1; i <= 50; i++) {
        numberData.set(i, { frequency: 0 });
    }

    // Count frequencies and track last appearances
    draws.forEach(draw => {
        const drawDate = typeof draw.date === 'string' ? new Date(draw.date) : draw.date;
        draw.numbers.forEach(num => {
            const data = numberData.get(num)!;
            data.frequency++;
            if (!data.lastAppearance || drawDate > data.lastAppearance) {
                data.lastAppearance = drawDate;
            }
        });
    });

    // Build number properties array
    const numbers: NumberProperties[] = [];
    for (let num = 1; num <= 50; num++) {
        const data = numberData.get(num)!;
        numbers.push({
            number: num,
            isEven: num % 2 === 0,
            isPrime: PRIMES_UP_TO_50.includes(num),
            isM3: num % 3 === 0,
            isM4: num % 4 === 0,
            isM5: num % 5 === 0,
            isM7: num % 7 === 0,
            frequency: data.frequency,
            lastAppearance: data.lastAppearance?.toISOString()
        });
    }

    // Calculate aggregate stats
    let totalEven = 0;
    let totalOdd = 0;
    let totalPrimes = 0;
    let totalM3 = 0;
    let totalM4 = 0;
    let totalM5 = 0;
    let totalM7 = 0;

    draws.forEach(draw => {
        draw.numbers.forEach(num => {
            if (num % 2 === 0) totalEven++;
            else totalOdd++;

            if (PRIMES_UP_TO_50.includes(num)) totalPrimes++;

            if (num % 3 === 0) totalM3++;
            if (num % 4 === 0) totalM4++;
            if (num % 5 === 0) totalM5++;
            if (num % 7 === 0) totalM7++;
        });
    });

    const totalDraws = draws.length;

    return {
        numbers,
        totalDraws,
        evenOddStats: {
            totalEven,
            totalOdd,
            avgEvenPerDraw: totalEven / totalDraws,
            avgOddPerDraw: totalOdd / totalDraws
        },
        primeStats: {
            totalPrimes,
            avgPrimesPerDraw: totalPrimes / totalDraws
        },
        multiplesStats: {
            avgM3: totalM3 / totalDraws,
            avgM4: totalM4 / totalDraws,
            avgM5: totalM5 / totalDraws,
            avgM7: totalM7 / totalDraws
        }
    };
}
