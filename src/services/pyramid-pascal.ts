import { Draw } from '@prisma/client';

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

        // 1. Get last draw
        const lastDraw = history[0]; // Assuming history[0] is the most recent

        // Parse numbers if they are strings (Prisma handling)
        let numbers: number[] = [];
        if (typeof lastDraw.numbers === 'string') {
            numbers = JSON.parse(lastDraw.numbers);
        } else {
            numbers = lastDraw.numbers as unknown as number[];
        }

        // 2. Build Pyramid
        // Row 0: [n1, n2, n3, n4, n5] (reduced to single digits first? Usually yes for pure Pascal)
        // Let's reduce input numbers to mod 10 first? 
        // Variation: Use full numbers for first row, then mod 10 for sums.
        // Let's stick to standard: Reduce inputs to single digits first.

        let currentRow = numbers.flatMap(n => getDigits(n)); // Flatten all digits of input numbers
        const pyramidDigits: number[] = [...currentRow];

        // Build layers
        while (currentRow.length > 1) {
            const nextRow: number[] = [];
            for (let i = 0; i < currentRow.length - 1; i++) {
                const sum = sumMod10(currentRow[i], currentRow[i + 1]);
                nextRow.push(sum);
                pyramidDigits.push(sum);
            }
            currentRow = nextRow;
        }

        // 3. Calculate Digit Frequencies in the Pyramid
        const digitCounts: DigitFrequency = {};
        pyramidDigits.forEach(d => {
            digitCounts[d] = (digitCounts[d] || 0) + 1;
        });

        // Normalize weights (optional, but count is fine)

        // 4. Score all possible numbers (1-50) based on these digits
        const candidates: { num: number, score: number }[] = [];

        for (let i = 1; i <= 50; i++) {
            // Base score: How "compatible" is this number with the pyramid digits?
            let score = scoreNumberByDigits(i, digitCounts);

            // Boost: Add a small weight from overall frequency (Hot Numbers) to break ties
            // Simple implementation: Just use pyramid score for now to be "pure" to the system.
            // But to avoid bias towards numbers with more digits (e.g. 10 vs 1), we might average?
            // No, having 2 hot digits is better than 1.

            candidates.push({ num: i, score });
        }

        // 5. Sort by score desc
        candidates.sort((a, b) => b.score - a.score);

        // Return Top 25
        const result = candidates.slice(0, 25).map(c => c.num);

        // Ensure exactly 25 numbers
        if (result.length < 25) {
            const frequency: Record<number, number> = {};
            history.forEach(draw => {
                const nums = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers as number[];
                nums.forEach((n: number) => frequency[n] = (frequency[n] || 0) + 1);
            });

            const sortedByFreq = Object.entries(frequency)
                .sort(([, a], [, b]) => b - a)
                .map(([num]) => parseInt(num));

            for (const num of sortedByFreq) {
                if (result.length >= 25) break;
                if (!result.includes(num)) result.push(num);
            }

            // Fallback
            if (result.length < 25) {
                for (let i = 1; i <= 50; i++) {
                    if (result.length >= 25) break;
                    if (!result.includes(i)) result.push(i);
                }
            }
        }

        return result;
    }
}
