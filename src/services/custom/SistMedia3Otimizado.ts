
import { IPredictiveSystem } from '../ranked-systems';
import { Draw } from '@prisma/client';

export class SistMedia3Otimizado implements IPredictiveSystem {
    name = "Sist Média + 3 Otimizado";
    description = "Média Aparada (Last 10) + 3 Vizinhos com Prioridade à Proximidade";

    async generateTop10(draws: Draw[]): Promise<number[]> {
        // Need at least 10 draws
        if (draws.length < 10) {
            return Array.from({ length: 25 }, (_, i) => i + 1);
        }

        // 1. Parse last 10 draws
        // Note: draws are usually passed in descending order (newest first). 
        // We need the last 10 chronological draws? 
        // Actually, for "Trend" analysis, we usually look at the immediate past.
        // So draws[0] is newest. We take draws.slice(0, 10).
        const recentDraws = draws.slice(0, 10).map(d => {
            if (typeof d.numbers === 'string') return JSON.parse(d.numbers) as number[];
            return d.numbers as unknown as number[];
        });

        const candidateTiers: Record<number, number> = {}; // num -> min tier (0 is best)

        // 2. Process each of the 5 positions
        for (let pos = 0; pos < 5; pos++) {
            const valuesAtPos = recentDraws.map(d => d[pos]).filter(n => !isNaN(n));
            if (valuesAtPos.length < 3) continue;

            // Trimmed Mean (Remove min and max to avoid outliers)
            valuesAtPos.sort((a, b) => a - b);
            const trimmedValues = valuesAtPos.slice(1, -1);
            if (trimmedValues.length === 0) continue;

            const sum = trimmedValues.reduce((a, b) => a + b, 0);
            const mean = Math.round(sum / trimmedValues.length);

            // 3. Select Mean + 3 Neighbors (+/- 1, 2, 3)
            for (let offset = -3; offset <= 3; offset++) {
                const num = mean + offset;
                if (num < 1 || num > 50) continue;

                const tier = Math.abs(offset); // 0=Mean (Best), 3=Far (Worst)

                // Keep the BEST tier for this number (if it appears in multiple positions)
                if (candidateTiers[num] === undefined || tier < candidateTiers[num]) {
                    candidateTiers[num] = tier;
                }
            }
        }

        let sortedResult = Object.keys(candidateTiers).map(n => parseInt(n));

        // 4. Sort by Tier (ascending), then by Frequency as tie-breaker
        const frequency: Record<number, number> = {};
        recentDraws.flat().forEach(n => frequency[n] = (frequency[n] || 0) + 1);

        sortedResult.sort((a, b) => {
            const tierA = candidateTiers[a];
            const tierB = candidateTiers[b];

            // Primary Sort: Tier (Lower is better)
            if (tierA !== tierB) return tierA - tierB;

            // Secondary Sort: Frequency (Higher is better)
            const freqA = frequency[a] || 0;
            const freqB = frequency[b] || 0;
            return freqB - freqA;
        });

        // 5. Ensure exactly 25 numbers
        let finalPrediction = sortedResult.slice(0, 25);

        // Fill if < 25 (rare, but possible)
        if (finalPrediction.length < 25) {
            const hotNumbers = Object.entries(frequency)
                .sort(([, a], [, b]) => b - a)
                .map(([n]) => parseInt(n));

            for (const num of hotNumbers) {
                if (finalPrediction.length >= 25) break;
                if (!finalPrediction.includes(num)) finalPrediction.push(num);
            }

            // Fallback 1-50
            for (let k = 1; k <= 50; k++) {
                if (finalPrediction.length >= 25) break;
                if (!finalPrediction.includes(k)) finalPrediction.push(k);
            }
        }

        return finalPrediction;
    }
}
