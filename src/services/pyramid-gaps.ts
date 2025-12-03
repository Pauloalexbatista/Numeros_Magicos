import { Draw } from '@prisma/client';

/**
 * Pyramid Gaps System (Pirâmide de Dados/Intervalos)
 * 
 * Logic:
 * 1. Analyzes the "Gaps" (intervals) between sorted numbers in historical draws.
 *    e.g., Draw [2, 5, 10, 15, 40] -> Gaps: [3, 5, 5, 25] (Differences between adjacent numbers)
 * 2. Calculates the most frequent gap for each position (Gap 1: n2-n1, Gap 2: n3-n2, etc.).
 * 3. Calculates the most frequent starting number (n1).
 * 4. Reconstructs the prediction by chaining the most frequent n1 + most frequent Gap 1 + most frequent Gap 2...
 * 5. Also considers "Gap Patterns" if possible, but per-position frequency is a good start.
 */

export class PyramidGapsSystem {
    name = "PyramidGaps";
    description = "Pirâmide de Dados (Análise de Intervalos)";

    async generateTop10(history: Draw[]): Promise<number[]> {
        if (history.length === 0) return [];

        // 1. Analyze History
        const startingNumFreq: Record<number, number> = {};
        const gap1Freq: Record<number, number> = {};
        const gap2Freq: Record<number, number> = {};
        const gap3Freq: Record<number, number> = {};
        const gap4Freq: Record<number, number> = {};

        history.forEach(draw => {
            let numbers: number[] = [];
            if (typeof draw.numbers === 'string') {
                numbers = JSON.parse(draw.numbers);
            } else {
                numbers = draw.numbers as unknown as number[];
            }

            // Ensure sorted
            numbers.sort((a, b) => a - b);

            if (numbers.length >= 5) {
                // Starting number
                startingNumFreq[numbers[0]] = (startingNumFreq[numbers[0]] || 0) + 1;

                // Gaps
                const g1 = numbers[1] - numbers[0];
                const g2 = numbers[2] - numbers[1];
                const g3 = numbers[3] - numbers[2];
                const g4 = numbers[4] - numbers[3];

                gap1Freq[g1] = (gap1Freq[g1] || 0) + 1;
                gap2Freq[g2] = (gap2Freq[g2] || 0) + 1;
                gap3Freq[g3] = (gap3Freq[g3] || 0) + 1;
                gap4Freq[g4] = (gap4Freq[g4] || 0) + 1;
            }
        });

        // 2. Find Top Candidates
        // We want to generate 10 combinations.
        // Strategy: 
        // - Pick top 2 starting numbers.
        // - Pick top 2 gaps for each position.
        // - Generate combinations and see which ones are valid (<= 50, unique).

        const getTopK = (freq: Record<number, number>, k: number) =>
            Object.entries(freq).sort(([, a], [, b]) => b - a).slice(0, k).map(([n]) => parseInt(n));

        const topStarts = getTopK(startingNumFreq, 5);
        const topG1 = getTopK(gap1Freq, 5);
        const topG2 = getTopK(gap2Freq, 5);
        const topG3 = getTopK(gap3Freq, 5);
        const topG4 = getTopK(gap4Freq, 5);

        const candidates = new Set<number>();

        // Generate combinations
        for (const start of topStarts) {
            for (const g1 of topG1) {
                for (const g2 of topG2) {
                    for (const g3 of topG3) {
                        for (const g4 of topG4) {
                            const n1 = start;
                            const n2 = n1 + g1;
                            const n3 = n2 + g2;
                            const n4 = n3 + g3;
                            const n5 = n4 + g4;

                            // Validate
                            if (n5 <= 50) {
                                candidates.add(n1);
                                candidates.add(n2);
                                candidates.add(n3);
                                candidates.add(n4);
                                candidates.add(n5);
                            }
                        }
                    }
                }
            }
        }

        // If we have too many, we need to rank them.
        // For now, let's return the ones that appear in the most valid combinations.
        // Simplified: Just return the unique numbers found in valid high-probability gap chains.
        // Limit to 25.

        const result = Array.from(candidates).slice(0, 25);

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
