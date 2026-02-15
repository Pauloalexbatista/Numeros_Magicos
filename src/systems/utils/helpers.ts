
import { Draw } from '@prisma/client';

export function parseNumbers(draw: Draw): number[] {
    if (typeof draw.numbers === 'string') {
        return JSON.parse(draw.numbers);
    }
    return draw.numbers as unknown as number[];
}

/**
 * Helper to determine how many numbers to predict based on game type
 * Formula: numbers_drawn × 3
 * - EUROMILLIONS: 5 × 3 = 15
 * - TOTOLOTO: 5 × 3 = 15
 * - EURODREAMS: 6 × 3 = 18
 */
function getNumberPredictionCount(draws: Draw[]): number {
    if (draws.length > 0) {
        if (draws[0].game === 'EURODREAMS') return 18; // 6 × 3
    }
    return 15; // EUROMILLIONS and TOTOLOTO: 5 × 3
}

/**
 * Helper to determine max number based on game type
 */
function getMaxNumber(draws: Draw[]): number {
    if (draws.length > 0) {
        if (draws[0].game === 'TOTOLOTO') return 49;
        if (draws[0].game === 'EURODREAMS') return 40;
    }
    return 50; // Default to EuroMillions
}

/**
 * Ensure exactly N numbers are returned (15 for EM/TL, 18 for ED)
 * Fills with Hot Numbers if short, Trims if long
 * 
 * @deprecated Use ensureN from ranked-systems.ts instead
 * This function is kept for backward compatibility with old systems
 */
export function ensure25(numbers: number[], draws: Draw[]): number[] {
    let result = [...new Set(numbers)]; // Deduplicate
    const maxNum = getMaxNumber(draws);
    const predCount = getNumberPredictionCount(draws);

    // Case 1: Too many (> N) -> Trim
    if (result.length > predCount) {
        return result.slice(0, predCount);
    }

    // Case 2: Too few (< N) -> Fill
    if (result.length < predCount) {
        // Generate frequency map for filling
        const frequency: Record<number, number> = {};
        draws.forEach(draw => {
            const nums = parseNumbers(draw);
            nums.forEach(num => frequency[num] = (frequency[num] || 0) + 1);
        });

        const sortedByFreq = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        for (const num of sortedByFreq) {
            if (result.length >= predCount) break;
            if (!result.includes(num)) {
                result.push(num);
            }
        }

        // If still < N (empty history?), fill with 1..maxNum
        if (result.length < predCount) {
            for (let i = 1; i <= maxNum; i++) {
                if (result.length >= predCount) break;
                if (!result.includes(i)) result.push(i);
            }
        }
    }

    return result;
}
