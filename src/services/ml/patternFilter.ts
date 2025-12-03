import { calculateAmplitude, classifyAmplitude } from '../statistics';

export interface FilterResult {
    isValid: boolean;
    reasons: string[];
}

/**
 * Validates a combination of 5 numbers against historical patterns.
 */
export function validateCombination(numbers: number[]): FilterResult {
    const reasons: string[] = [];

    // 1. Sum Range (100 - 150)
    // Expanded slightly to 90-160 to be less restrictive
    const sum = numbers.reduce((a, b) => a + b, 0);
    if (sum < 90 || sum > 160) {
        reasons.push(`Soma ${sum} fora do intervalo (90-160)`);
    }

    // 2. Even/Odd Ratio (Best: 2:3 or 3:2)
    // Accept 1:4 or 4:1 but penalize? For now, reject 0:5 or 5:0
    const evens = numbers.filter(n => n % 2 === 0).length;
    const odds = numbers.length - evens;
    if (evens === 0 || odds === 0) {
        reasons.push(`Rácio Par/Ímpar extremo (${evens}:${odds})`);
    }

    // 3. Consecutive Numbers (Max 2 consecutive)
    // e.g., 1,2,3 is bad. 1,2,5,6 is okay (two pairs).
    // Sort first
    const sorted = [...numbers].sort((a, b) => a - b);
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i - 1] + 1) {
            currentConsecutive++;
        } else {
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
            currentConsecutive = 1;
        }
    }
    maxConsecutive = Math.max(maxConsecutive, currentConsecutive);

    if (maxConsecutive > 2) {
        reasons.push(`Muitos números consecutivos (${maxConsecutive})`);
    }

    // 4. Decade Distribution (Max 3 from same decade)
    const decades = [0, 0, 0, 0, 0]; // 1-10, 11-20, ...
    numbers.forEach(n => {
        const d = Math.ceil(n / 10) - 1;
        if (d >= 0 && d < 5) decades[d]++;
    });
    if (decades.some(d => d > 3)) {
        reasons.push('Muitos números na mesma dezena');
    }

    // 5. Amplitude
    // Prefer "Normal" (25-45), accept others but maybe warn?
    // For strict filtering, let's require > 15 and < 48
    const amp = calculateAmplitude(numbers);
    if (amp < 15) {
        reasons.push(`Amplitude muito baixa (${amp})`);
    }

    return {
        isValid: reasons.length === 0,
        reasons
    };
}

/**
 * Generates all combinations of k elements from the input array.
 */
export function generateCombinations(arr: number[], k: number): number[][] {
    if (k === 0) return [[]];
    if (arr.length === 0) return [];

    const first = arr[0];
    const rest = arr.slice(1);

    const combsWithFirst = generateCombinations(rest, k - 1).map(c => [first, ...c]);
    const combsWithoutFirst = generateCombinations(rest, k);

    return [...combsWithFirst, ...combsWithoutFirst];
}

/**
 * Finds the best valid combination from a list of candidate numbers.
 * @param candidates List of numbers sorted by probability (descending)
 * @param size Size of combination (default 5)
 */
export function findBestCombination(candidates: number[], size: number = 5): { numbers: number[], reasoning: string } {
    // We take top 12 candidates to generate combinations
    // C(12, 5) = 792 combinations - very fast
    const pool = candidates.slice(0, 12);

    const combinations = generateCombinations(pool, size);

    // Sort combinations by "probability score" (sum of indices in original candidate list?)
    // Actually, since 'pool' is already sorted by probability, combinations generated 
    // in order usually prioritize earlier numbers.
    // But let's score them: sum of probabilities (or sum of ranks).
    // Lower rank sum is better.

    const scored = combinations.map(combo => {
        const rankSum = combo.reduce((sum, n) => sum + candidates.indexOf(n), 0);
        return { combo, rankSum };
    });

    // Sort by best rank sum (most probable numbers)
    scored.sort((a, b) => a.rankSum - b.rankSum);

    // Find first valid
    for (const { combo } of scored) {
        const validation = validateCombination(combo);
        if (validation.isValid) {
            return {
                numbers: combo.sort((a, b) => a - b),
                reasoning: 'Combinação válida mais provável (passou em todos os filtros)'
            };
        }
    }

    // Fallback: If no valid combination found, return the top 5 anyway
    return {
        numbers: candidates.slice(0, size).sort((a, b) => a - b),
        reasoning: 'Nenhuma combinação perfeita encontrada. A mostrar Top 5 por probabilidade (Fallback).'
    };
}
