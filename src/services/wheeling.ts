
export interface GuaranteeOption {
    id: string;
    label: string;
    match: number; // The guarantee (e.g., 3)
    ifMatch: number; // The condition (e.g., if 5 numbers are drawn)
}

export const GUARANTEE_OPTIONS: GuaranteeOption[] = [
    { id: '5if5', label: '5 se 5 (100% - Total)', match: 5, ifMatch: 5 },
    { id: '4if5', label: '4 se 5', match: 4, ifMatch: 5 },
    { id: '3if5', label: '3 se 5', match: 3, ifMatch: 5 },
    { id: '3if4', label: '3 se 4', match: 3, ifMatch: 4 },
    { id: '3if3', label: '3 se 3', match: 3, ifMatch: 3 },
    { id: '2if5', label: '2 se 5', match: 2, ifMatch: 5 },
    { id: '2if4', label: '2 se 4', match: 2, ifMatch: 4 },
    { id: '2if3', label: '2 se 3', match: 2, ifMatch: 3 },
    { id: '2if2', label: '2 se 2', match: 2, ifMatch: 2 },
];

/**
 * Generates combinations of k elements from the set array.
 */
function getCombinations(set: number[], k: number): number[][] {
    if (k > set.length || k <= 0) return [];
    if (k === set.length) return [set];
    if (k === 1) return set.map(n => [n]);

    const combs: number[][] = [];
    let head, tailcombs;

    for (let i = 0; i <= set.length - k; i++) {
        head = set.slice(i, i + 1);
        tailcombs = getCombinations(set.slice(i + 1), k - 1);
        for (let j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
        }
    }
    return combs;
}

/**
 * Converts an array of numbers to a BigInt bitmask.
 * Assumes numbers are 1-based (1..50).
 */
function toMask(numbers: number[]): bigint {
    let mask = 0n;
    for (const n of numbers) {
        mask |= 1n << BigInt(n);
    }
    return mask;
}

/**
 * Counts set bits in a BigInt (Hamming Weight).
 */
function popcnt(n: bigint): number {
    // Brian Kernighan's algorithm is fast for sparse bits, but for 50 bits,
    // a simple loop or string conversion is fine. 
    // For max speed in JS without intrinsics:
    let count = 0;
    while (n > 0n) {
        n &= (n - 1n);
        count++;
    }
    return count;
}

/**
 * Greedy algorithm to find a covering design (Optimized with Bitmasks).
 * @param pool The pool of numbers selected by the user.
 * @param guarantee The guarantee condition (match M if N drawn).
 * @param numbersPerKey Standard numbers per key (5 for EuroMillions).
 */
export function generateWheelingSystem(
    pool: number[],
    guarantee: GuaranteeOption,
    numbersPerKey: number = 5
): number[][] {
    // 1. Validation
    if (pool.length < numbersPerKey) return [];
    if (guarantee.match > numbersPerKey) return [];
    if (guarantee.ifMatch > pool.length) return [];

    // If pool size equals numbersPerKey, return just one key
    if (pool.length === numbersPerKey) return [pool];

    // 2. Generate all possible valid keys (Candidates)
    const candidates = getCombinations(pool, numbersPerKey);
    const candidateMasks = candidates.map(toMask);

    // If guarantee is "5 if 5" (Total), we need all combinations
    if (guarantee.match === numbersPerKey && guarantee.ifMatch === numbersPerKey) {
        return candidates;
    }

    // 3. Generate all possible winning scenarios (Test Set)
    const scenarios = getCombinations(pool, guarantee.ifMatch);
    // Use BigInt for scenarios too
    // We need to track which scenarios are covered.
    // A scenario S is covered by candidate C if popcnt(S & C) >= guarantee.match

    // Optimization: Store scenarios as BigInts in a Set-like structure or array
    // Since we need to remove them, a Set of BigInts is good, or just an array of BigInts and we filter/swap.
    // Array is faster for iteration.
    let uncoveredScenarios = scenarios.map(toMask);

    const finalKeys: number[][] = [];
    const finalKeyIndices: number[] = [];

    // 4. Greedy Loop
    while (uncoveredScenarios.length > 0) {
        let bestCandidateIndex = -1;
        let maxCovered = -1;
        let coveredIndices: number[] = [];

        // Find the candidate that covers the most UNCOVERED scenarios
        for (let i = 0; i < candidateMasks.length; i++) {
            // Skip if already picked (optional, but good for clarity)
            if (finalKeyIndices.includes(i)) continue;

            const candMask = candidateMasks[i];
            let currentCoveredCount = 0;

            // Check against all uncovered scenarios
            // This inner loop is the bottleneck. Bitwise AND is fast.
            for (const scenMask of uncoveredScenarios) {
                const intersection = candMask & scenMask;
                // We need popcnt(intersection) >= guarantee.match
                // Since guarantee.match is small (2,3,4), we can optimize popcnt?
                // Actually popcnt is fast enough for 50 bits.
                if (popcnt(intersection) >= guarantee.match) {
                    currentCoveredCount++;
                }
            }

            if (currentCoveredCount > maxCovered) {
                maxCovered = currentCoveredCount;
                bestCandidateIndex = i;
                // We don't store coveredIndices here to save memory/time, we re-calculate only for the best
            }
        }

        if (bestCandidateIndex !== -1 && maxCovered > 0) {
            finalKeys.push(candidates[bestCandidateIndex]);
            finalKeyIndices.push(bestCandidateIndex);

            // Remove covered scenarios
            const bestMask = candidateMasks[bestCandidateIndex];
            uncoveredScenarios = uncoveredScenarios.filter(scenMask => {
                const intersection = bestMask & scenMask;
                return popcnt(intersection) < guarantee.match; // Keep if NOT covered
            });

            // Optimization: Remove used candidate from search space?
            // We check finalKeyIndices, so effectively yes.
        } else {
            // Should not happen if parameters are valid
            break;
        }
    }

    return finalKeys;
}

export const STAR_GUARANTEE_OPTIONS: GuaranteeOption[] = [
    { id: '2if2', label: '2 se 2 (100% - Total)', match: 2, ifMatch: 2 },
    { id: '1if2', label: '1 se 2', match: 1, ifMatch: 2 },
];

export interface FullKey {
    numbers: number[];
    stars: number[];
}

/**
 * Generates full keys by combining number wheel and star wheel.
 */
export function generateFullSystem(
    numberPool: number[],
    starPool: number[],
    numberGuarantee: GuaranteeOption,
    starGuarantee: GuaranteeOption
): FullKey[] {
    const numberKeys = generateWheelingSystem(numberPool, numberGuarantee, 5);
    const starKeys = generateWheelingSystem(starPool, starGuarantee, 2);

    const fullKeys: FullKey[] = [];

    // Cartesian Product: Combine every number key with every star key
    for (const nKey of numberKeys) {
        for (const sKey of starKeys) {
            fullKeys.push({
                numbers: nKey,
                stars: sKey
            });
        }
    }

    return fullKeys;
}
