
import { Draw } from '@prisma/client';

export function parseNumbers(draw: Draw): number[] {
    if (typeof draw.numbers === 'string') {
        return JSON.parse(draw.numbers);
    }
    return draw.numbers as unknown as number[];
}

export function ensure25(numbers: number[], draws: Draw[]): number[] {
    let result = [...new Set(numbers)]; // Deduplicate

    // Case 1: Too many (> 25) -> Trim
    if (result.length > 25) {
        return result.slice(0, 25);
    }

    // Case 2: Too few (< 25) -> Fill
    if (result.length < 25) {
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
            if (result.length >= 25) break;
            if (!result.includes(num)) {
                result.push(num);
            }
        }

        // If still < 25 (empty history?), fill with 1..50
        if (result.length < 25) {
            for (let i = 1; i <= 50; i++) {
                if (result.length >= 25) break;
                if (!result.includes(i)) result.push(i);
            }
        }
    }

    return result;
}
