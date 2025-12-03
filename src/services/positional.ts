
import { Draw } from '@/models/types';

export interface PositionStats {
    position: number; // 1 to 5
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    mode: number[];
    distribution: { [number: number]: number }; // Frequency of each number in this position
    suggestedRange: { min: number; max: number }; // Mean +/- 1 SD
}

export function analyzePositions(history: Draw[], windowSize: number): PositionStats[] {
    // 1. Slice history
    // If windowSize is greater than history, use all history.
    // If windowSize is 0 or negative, default to all history (or handle as error, but user said "free choice")
    // Let's assume windowSize >= 1.
    const recentDraws = windowSize > 0 ? history.slice(-windowSize) : history;

    const stats: PositionStats[] = [];

    // 2. Iterate through positions 1 to 5
    for (let posIndex = 0; posIndex < 5; posIndex++) {
        const position = posIndex + 1;
        const values: number[] = [];
        const distribution: { [number: number]: number } = {};

        // Extract values for this position
        recentDraws.forEach(draw => {
            // Ensure numbers are sorted (they usually are, but safety first)
            const sortedNumbers = [...draw.numbers].sort((a, b) => a - b);
            if (sortedNumbers[posIndex] !== undefined) {
                const val = sortedNumbers[posIndex];
                values.push(val);
                distribution[val] = (distribution[val] || 0) + 1;
            }
        });

        if (values.length === 0) continue;

        // Calculate Mean
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;

        // Calculate StdDev
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(avgSquareDiff);

        // Calculate Mode
        let maxFreq = 0;
        let modes: number[] = [];
        for (const [numStr, freq] of Object.entries(distribution)) {
            const num = parseInt(numStr);
            if (freq > maxFreq) {
                maxFreq = freq;
                modes = [num];
            } else if (freq === maxFreq) {
                modes.push(num);
            }
        }

        // Calculate Min/Max
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Suggested Range (Mean +/- 1 SD)
        // Rounded to nearest integer
        const suggestedMin = Math.max(1, Math.round(mean - stdDev));
        const suggestedMax = Math.min(50, Math.round(mean + stdDev));

        stats.push({
            position,
            mean,
            stdDev,
            min,
            max,
            mode: modes.sort((a, b) => a - b),
            distribution,
            suggestedRange: { min: suggestedMin, max: suggestedMax }
        });
    }

    return stats;
}

/**
 * Generates a pool of numbers based on the suggested ranges (Mean +/- 1 SD) for all positions.
 * This effectively selects numbers that are statistically "normal" for their positions.
 */
export function generatePositionalPool(stats: PositionStats[]): number[] {
    const pool = new Set<number>();

    stats.forEach(stat => {
        // Add all numbers in the suggested range [Mean-SD, Mean+SD]
        // But also consider the "neighbors" logic the user mentioned.
        // User said: "Mean + neighbors... 3 numbers".
        // Actually, Mean +/- SD covers about 68% of occurrences.
        // Let's strictly follow the range: [round(Mean-SD), round(Mean+SD)]

        for (let n = stat.suggestedRange.min; n <= stat.suggestedRange.max; n++) {
            pool.add(n);
        }
    });

    return Array.from(pool).sort((a, b) => a - b);
}
