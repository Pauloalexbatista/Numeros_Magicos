import { Draw } from '@prisma/client';

/**
 * Vortex Pyramid System (Toroidal/Cylindrical)
 * 
 * Logic:
 * 1. Takes the numbers of the last draw.
 * 2. Builds a "Cylinder" of calculations instead of a triangle.
 * 3. In each row, the last number sums with the FIRST number of the same row (Wrap-around).
 * 4. This maintains the row length constant (preserving information).
 * 5. We calculate for a fixed depth (e.g., 50 rows) to simulate a full cycle.
 * 6. Collects digit frequencies to predict the next numbers.
 */

export class VortexPyramidSystem {
    name = "Vortex Pyramid";
    description = "Pirâmide Vortex (Cálculo Toroidal/Cilíndrico)";

    /**
     * Analyze resonance for all numbers (1-50)
     * Returns detailed scores for visualization
     */
    analyzeResonance(history: Draw[]): { num: number, score: number }[] {
        if (history.length === 0) return [];

        // Helper to parse numbers
        const parseNumbers = (draw: Draw): number[] => {
            if (typeof draw.numbers === 'string') return JSON.parse(draw.numbers);
            return draw.numbers as unknown as number[];
        };

        const candidates: { num: number, score: number }[] = [];

        for (let candidate = 1; candidate <= 50; candidate++) {
            let score = 0;

            // Trace Left Diagonal Backwards (Candidate -> Past)
            let currentNum = candidate;
            for (let i = history.length - 1; i >= 0; i--) {
                const draw = history[i];
                const drawnNumbers = parseNumbers(draw);

                // Move Left (Wrap-around)
                currentNum = currentNum - 1;
                if (currentNum < 1) currentNum = 50;

                if (drawnNumbers.includes(currentNum)) {
                    score++;
                }
            }

            // Trace Right Diagonal Backwards (Candidate -> Past)
            currentNum = candidate;
            for (let i = history.length - 1; i >= 0; i--) {
                const draw = history[i];
                const drawnNumbers = parseNumbers(draw);

                // Move Right (Wrap-around)
                currentNum = currentNum + 1;
                if (currentNum > 50) currentNum = 1;

                if (drawnNumbers.includes(currentNum)) {
                    score++;
                }
            }

            candidates.push({ num: candidate, score });
        }

        // Sort by score descending
        candidates.sort((a, b) => b.score - a.score);
        return candidates;
    }

    async generateTop10(history: Draw[]): Promise<number[]> {
        const candidates = this.analyzeResonance(history);

        // Return Top 25
        const result = candidates.slice(0, 25).map(c => c.num);

        // 5. Ensure exactly 25 numbers (Safety Check)
        if (result.length < 25) {
            // Helper to parse numbers locally since we are inside the method
            const parseNumbers = (draw: Draw): number[] => {
                if (typeof draw.numbers === 'string') return JSON.parse(draw.numbers);
                return draw.numbers as unknown as number[];
            };

            const frequency: Record<number, number> = {};
            history.forEach(draw => {
                const nums = parseNumbers(draw);
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
