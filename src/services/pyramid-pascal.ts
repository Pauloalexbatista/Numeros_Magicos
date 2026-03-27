import { Draw } from '@prisma/client';
import { getGameConfig } from './game-config';

/**
 * Pyramid Pascal System
 * 
 * Logic:
 * 1. Takes the numbers of the last draw.
 * 2. Builds a Pascal Pyramid (sum of adjacent pairs, mod 10) up to the apex.
 * 3. Collects all digits generated in the pyramid.
 * 4. Calculates the frequency of each digit (0-9).
 * 5. Generates candidate numbers (1-50) that are composed of these "hot digits".
 * 6. Ranks candidates by their frequency in the pyramid + historical frequency.
 */

interface DigitFrequency {
    [digit: number]: number;
}

// Helper: Calculate Mod 10 sum of two numbers
const sumMod10 = (a: number, b: number) => (a + b) % 10;

// Helper: Decompose a number into digits (e.g., 45 -> [4, 5])
const getDigits = (n: number): number[] => {
    if (n < 10) return [n];
    return [Math.floor(n / 10), n % 10];
};

// Helper: Check if a number (1-50) is composed ONLY of specific digits
// OR weighted by how many of its digits are "hot"
const scoreNumberByDigits = (num: number, digitWeights: DigitFrequency): number => {
    const digits = getDigits(num);
    return digits.reduce((sum, d) => sum + (digitWeights[d] || 0), 0);
};

export class PyramidPascalSystem {
    name = "PyramidPascal";
    description = "Pirâmide de Pascal (Soma Mod 10)";

    async generateTop10(history: Draw[]): Promise<number[]> {
        if (history.length === 0) return [];

        // Determine prediction count based on game
        const { predCount, maxNum } = getGameConfig(history);

        // 1. Get last draw
        const lastDraw = history[0];

        // Parse numbers
        let numbers: number[] = [];
        if (typeof lastDraw.numbers === 'string') {
            numbers = (typeof lastDraw.numbers === "string" ? (typeof lastDraw.numbers === "string" ? JSON.parse(lastDraw.numbers) : lastDraw.numbers) : lastDraw.numbers);
        } else {
            numbers = lastDraw.numbers as unknown as number[];
        }

        // 2. Build Pyramid
        let currentRow = numbers.flatMap(n => getDigits(n));
        const pyramidDigits: number[] = [...currentRow];

        while (currentRow.length > 1) {
            const nextRow: number[] = [];
            for (let i = 0; i < currentRow.length - 1; i++) {
                const sum = sumMod10(currentRow[i], currentRow[i + 1]);
                nextRow.push(sum);
                pyramidDigits.push(sum);
            }
            currentRow = nextRow;
        }

        // 3. Calculate Digit Frequencies
        const digitCounts: DigitFrequency = {};
        pyramidDigits.forEach(d => {
            digitCounts[d] = (digitCounts[d] || 0) + 1;
        });

        // 4. Score all possible numbers
        const candidates: { num: number, score: number }[] = [];
        for (let i = 1; i <= maxNum; i++) {
            let score = scoreNumberByDigits(i, digitCounts);
            candidates.push({ num: i, score });
        }

        // 5. Sort by score desc
        candidates.sort((a, b) => b.score - a.score);

        // Return Top N (15 or 18)
        const result = candidates.slice(0, predCount).map(c => c.num);

        // Ensure exactly N numbers
        if (result.length < predCount) {
            const frequency: Record<number, number> = {};
            history.forEach(draw => {
                const nums = typeof draw.numbers === 'string' ? (typeof draw.numbers === "string" ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers) : draw.numbers) : draw.numbers as number[];
                nums.forEach((n: number) => frequency[n] = (frequency[n] || 0) + 1);
            });

            const sortedByFreq = Object.entries(frequency)
                .sort(([, a], [, b]) => b - a)
                .map(([num]) => parseInt(num));

            for (const num of sortedByFreq) {
                if (result.length >= predCount) break;
                if (!result.includes(num)) result.push(num);
            }

            // Fallback
            if (result.length < predCount) {
                for (let i = 1; i <= maxNum; i++) {
                    if (result.length >= predCount) break;
                    if (!result.includes(i)) result.push(i);
                }
            }
        }

        return result;
    }
}
