
import { IPredictiveSystem } from '../ranked-systems';
import { Draw } from '@prisma/client';

// Ideal Averages (Statistical Baseline)
const IDEAL = {
    EVEN: 2.5, // 50%
    PRIME: 1.56,
    M3: 1.88,
    M5: 1.04,
    M7: 0.76
};

// Properties Helpers
const isPrime = (n: number) => [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47].includes(n);
const isM3 = (n: number) => n % 3 === 0;
const isM5 = (n: number) => n % 5 === 0;
const isM7 = (n: number) => n % 7 === 0;

export class SistMediaCamadas implements IPredictiveSystem {
    name = "Sistema Média Camadas";
    description = "Média + 3 com Camadas de Equilíbrio Estatístico (55% Acc)";

    async generateTop10(draws: Draw[]): Promise<number[]> {
        if (draws.length < 10) {
            return Array.from({ length: 25 }, (_, i) => i + 1);
        }

        // --- STEP 1: GENERATE RAW CANDIDATES (Mean + 3) ---
        const recentDraws = draws.slice(0, 10).map(d => {
            if (typeof d.numbers === 'string') return JSON.parse(d.numbers) as number[];
            return d.numbers as unknown as number[];
        });

        const candidates: Record<number, number> = {}; // num -> Tier (0-3)

        for (let pos = 0; pos < 5; pos++) {
            const valuesAtPos = recentDraws.map(d => d[pos]).filter(n => !isNaN(n));
            if (valuesAtPos.length < 3) continue;

            // Trimmed Mean
            valuesAtPos.sort((a, b) => a - b);
            const trimmedValues = valuesAtPos.slice(1, -1);
            if (trimmedValues.length === 0) continue;

            const sum = trimmedValues.reduce((a, b) => a + b, 0);
            const mean = Math.round(sum / trimmedValues.length);

            for (let offset = -3; offset <= 3; offset++) {
                const num = mean + offset;
                if (num < 1 || num > 50) continue;
                const tier = Math.abs(offset);
                if (candidates[num] === undefined || tier < candidates[num]) {
                    candidates[num] = tier;
                }
            }
        }

        // --- STEP 2: ANALYZE RECENT TRENDS (The "Layers") ---
        let sumEven = 0, sumPrime = 0, sumM3 = 0, sumM5 = 0, sumM7 = 0;

        recentDraws.forEach(nums => {
            sumEven += nums.filter(n => n % 2 === 0).length;
            sumPrime += nums.filter(isPrime).length;
            sumM3 += nums.filter(isM3).length;
            sumM5 += nums.filter(isM5).length;
            sumM7 += nums.filter(isM7).length;
        });

        const avgEven = sumEven / 10;
        const avgPrime = sumPrime / 10;
        const avgM3 = sumM3 / 10;
        const avgM5 = sumM5 / 10;
        const avgM7 = sumM7 / 10;

        // Calculate Boosts (Regression to Mean)
        // If recent average < Ideal, we BOOST that property.
        const boostEven = avgEven < IDEAL.EVEN ? 1.2 : 1.0;
        const boostOdd = avgEven > IDEAL.EVEN ? 1.2 : 1.0; // If too many evens, boost odds

        const boostPrime = avgPrime < IDEAL.PRIME ? 1.2 : 1.0;
        const boostM3 = avgM3 < IDEAL.M3 ? 1.2 : 1.0;
        const boostM5 = avgM5 < IDEAL.M5 ? 1.2 : 1.0;
        const boostM7 = avgM7 < IDEAL.M7 ? 1.2 : 1.0;

        // --- STEP 3: SCORE CANDIDATES ---
        const scoredCandidates = Object.entries(candidates).map(([nStr, tier]) => {
            const n = parseInt(nStr);

            // Base Score from Tier (Lower tier is better)
            // Tier 0 = 100 pts, Tier 1 = 90, Tier 2 = 80, Tier 3 = 70
            let score = 100 - (tier * 10);

            // Apply Boosts
            if (n % 2 === 0) score *= boostEven;
            else score *= boostOdd;

            if (isPrime(n)) score *= boostPrime;
            if (isM3(n)) score *= boostM3;
            if (isM5(n)) score *= boostM5;
            if (isM7(n)) score *= boostM7;

            return { n, score };
        });

        // --- STEP 4: SELECT TOP 25 ---
        scoredCandidates.sort((a, b) => b.score - a.score);
        let finalPrediction = scoredCandidates.slice(0, 25).map(x => x.n);

        // Fill if needed (rare)
        if (finalPrediction.length < 25) {
            const all = Array.from({ length: 50 }, (_, i) => i + 1);
            for (const k of all) {
                if (finalPrediction.length >= 25) break;
                if (!finalPrediction.includes(k)) finalPrediction.push(k);
            }
        }

        return finalPrediction;
    }
}
