
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
 * Efficient combinations generator that uses a callback to avoid large array allocations.
 */
function forEachCombination(set: number[], k: number, callback: (comb: number[]) => void) {
    const n = set.length;
    const data = new Array(k);

    function run(start: number, depth: number) {
        if (depth === k) {
            callback([...data]);
            return;
        }
        for (let i = start; i <= n - k + depth; i++) {
            data[depth] = set[i];
            run(i + 1, depth + 1);
        }
    }
    run(0, 0);
}

/**
 * Optimized bit count for 32-bit integers.
 */
function popcnt32(n: number): number {
    n = n - ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return (((n + (n >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

/**
 * Greedy algorithm to find a covering design with LAZY GREEDY optimization.
 */
export function generateWheelingSystem(
    pool: number[],
    guarantee: GuaranteeOption,
    numbersPerKey: number = 5
): number[][] {
    if (pool.length < numbersPerKey) return [];
    if (guarantee.match > numbersPerKey) return [];

    // 1. Generate Candidates and Scenarios as bitmasks
    const candidateMasks: bigint[] = [];
    const candidates: number[][] = [];
    forEachCombination(pool, numbersPerKey, (comb) => {
        candidates.push(comb);
        candidateMasks.push(toMask(comb));
    });

    if (guarantee.match === numbersPerKey && guarantee.ifMatch === numbersPerKey) {
        return candidates;
    }

    const scenarioMasks: bigint[] = [];
    forEachCombination(pool, guarantee.ifMatch, (comb) => {
        scenarioMasks.push(toMask(comb));
    });

    // 2. Track uncovered scenarios using a boolean array for speed
    const isUncovered = new Uint8Array(scenarioMasks.length).fill(1);
    let uncoveredCount = scenarioMasks.length;

    // 3. LAZY GREEDY: Store candidate coverage in a "cache"
    // Instead of re-scanning everything, we scan only when needed.
    const coverageCache = new Int32Array(candidateMasks.length).fill(-1);
    const finalKeys: number[][] = [];
    const usedCandidates = new Uint8Array(candidateMasks.length);

    while (uncoveredCount > 0) {
        let bestCandidateIdx = -1;
        let maxCovered = -1;

        // In each step, we look for the best candidate.
        // We use the last known coverage as a heuristic.
        const candidatesSortedByPotential: number[] = [];
        for (let i = 0; i < candidateMasks.length; i++) {
            if (!usedCandidates[i]) {
                candidatesSortedByPotential.push(i);
            }
        }

        // Sort by last known coverage (descending)
        candidatesSortedByPotential.sort((a, b) => coverageCache[b] - coverageCache[a]);

        for (const i of candidatesSortedByPotential) {
            // Lazy check: if current candidate's BEST POSSIBLE coverage is less than what we already found, stop.
            // Since candidates are sorted by their last known (optimistic) coverage, 
            // once coverageCache[i] <= maxCovered, no remaining candidate can beat maxCovered.
            if (coverageCache[i] !== -1 && coverageCache[i] <= maxCovered) break;

            // Re-calculate coverage for this candidate against CURRENT uncovered scenarios
            let currentCoverage = 0;
            const cMask = candidateMasks[i];

            // Performance trick: Split BigInt into two 32-bit integers if possible
            // But since numbers are 1-50, we just use BigInt operations which are well-optimized in V8
            for (let sIdx = 0; sIdx < scenarioMasks.length; sIdx++) {
                if (isUncovered[sIdx]) {
                    const intersection = cMask & scenarioMasks[sIdx];
                    // Manual popcnt for BigInt for speed (avoiding loop if 0)
                    if (intersection !== 0n) {
                        if (popcnt(intersection) >= guarantee.match) {
                            currentCoverage++;
                        }
                    }
                }
            }

            coverageCache[i] = currentCoverage;

            if (currentCoverage > maxCovered) {
                maxCovered = currentCoverage;
                bestCandidateIdx = i;
            }
        }

        if (bestCandidateIdx !== -1 && maxCovered > 0) {
            finalKeys.push(candidates[bestCandidateIdx]);
            usedCandidates[bestCandidateIdx] = 1;

            // Remove newly covered scenarios
            const bestMask = candidateMasks[bestCandidateIdx];
            for (let sIdx = 0; sIdx < scenarioMasks.length; sIdx++) {
                if (isUncovered[sIdx]) {
                    const intersection = bestMask & scenarioMasks[sIdx];
                    if (popcnt(intersection) >= guarantee.match) {
                        isUncovered[sIdx] = 0;
                        uncoveredCount--;
                    }
                }
            }
        } else {
            break;
        }

        // Safety break to prevent infinite loops in edge cases
        if (finalKeys.length > 5000) break;
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
    strategy?: string; // Optional strategy label for Smart 5-Key
}

/**
 * Strategy names for Smart 5-Key mode
 */
export const SMART_5_KEY_STRATEGIES = [
    { name: 'Balanceada', description: 'Mix equilibrado (1 de cada década)' },
    { name: 'Altos + Pares', description: 'Favorece números altos e pares' },
    { name: 'Baixos + Ímpares', description: 'Favorece números baixos e ímpares' },
    { name: 'Pares Distribuídos', description: 'Pares bem distribuídos' },
    { name: 'Extremos', description: 'Muito baixos + muito altos' }
];

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

    // If no stars are selected, return keys with empty stars array
    if (starPool.length < 2) {
        return numberKeys.map(nKey => ({
            numbers: nKey,
            stars: []
        }));
    }

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

/**
 * Generates number and star keys independently.
 */
export function generateSplitSystem(
    numberPool: number[],
    starPool: number[],
    numberGuarantee: GuaranteeOption,
    starGuarantee: GuaranteeOption
): { numberKeys: number[][]; starKeys: number[][] } {
    const numberKeys = generateWheelingSystem(numberPool, numberGuarantee, 5);
    const starKeys = starPool.length >= 2
        ? generateWheelingSystem(starPool, starGuarantee, 2)
        : [];

    return { numberKeys, starKeys };
}

// ============================================================================
// SMART 5-KEY INTELLIGENT ALGORITHM
// ============================================================================

interface NumberAnalysis {
    number: number;
    isHigh: boolean;      // > 25
    isEven: boolean;      // % 2 === 0
    decade: number;       // 0-4 (1-10, 11-20, 21-30, 31-40, 41-50)
}

/**
 * Analyzes a pool of numbers based on statistical criteria
 */
function analyzeNumberPool(numbers: number[]): NumberAnalysis[] {
    return numbers.map(num => ({
        number: num,
        isHigh: num > 25,
        isEven: num % 2 === 0,
        decade: Math.floor((num - 1) / 10)
    }));
}

/**
 * Strategy 1: Balanced - Mix equilibrado de todos os critérios
 */
function selectBalancedKey(pool: NumberAnalysis[]): number[] {
    const selected: number[] = [];

    // Tentar 1 de cada década (5 décadas = 5 números)
    const decades = [0, 1, 2, 3, 4];
    const usedNumbers = new Set<number>();

    for (const decade of decades) {
        const candidates = pool.filter(n =>
            n.decade === decade && !usedNumbers.has(n.number)
        );

        if (candidates.length > 0) {
            // Escolher o do meio (mais balanceado)
            const midIndex = Math.floor(candidates.length / 2);
            selected.push(candidates[midIndex].number);
            usedNumbers.add(candidates[midIndex].number);
        }
    }

    // Se não temos 5, completar com números balanceados
    while (selected.length < 5 && pool.length > selected.length) {
        const remaining = pool.filter(n => !usedNumbers.has(n.number));
        if (remaining.length > 0) {
            const midIndex = Math.floor(remaining.length / 2);
            selected.push(remaining[midIndex].number);
            usedNumbers.add(remaining[midIndex].number);
        } else {
            break;
        }
    }

    return selected.sort((a, b) => a - b);
}

/**
 * Strategy 2: Altos + Pares - Favorece números altos e pares
 */
function selectHighEvenKey(pool: NumberAnalysis[]): number[] {
    const selected: number[] = [];
    const usedNumbers = new Set<number>();

    // Priorizar altos E pares
    const highEven = pool.filter(n => n.isHigh && n.isEven).map(n => n.number);
    for (let i = 0; i < Math.min(3, highEven.length); i++) {
        selected.push(highEven[i]);
        usedNumbers.add(highEven[i]);
    }

    // Adicionar mais altos (pares ou ímpares)
    const moreHigh = pool.filter(n => n.isHigh && !usedNumbers.has(n.number)).map(n => n.number);
    for (let i = 0; i < Math.min(2, moreHigh.length) && selected.length < 5; i++) {
        selected.push(moreHigh[i]);
        usedNumbers.add(moreHigh[i]);
    }

    // Completar se necessário
    while (selected.length < 5) {
        const remaining = pool.filter(n => !usedNumbers.has(n.number));
        if (remaining.length > 0) {
            selected.push(remaining[0].number);
            usedNumbers.add(remaining[0].number);
        } else {
            break;
        }
    }

    return selected.sort((a, b) => a - b);
}

/**
 * Strategy 3: Baixos + Ímpares - Favorece números baixos e ímpares
 */
function selectLowOddKey(pool: NumberAnalysis[]): number[] {
    const selected: number[] = [];
    const usedNumbers = new Set<number>();

    // Priorizar baixos E ímpares
    const lowOdd = pool.filter(n => !n.isHigh && !n.isEven).map(n => n.number);
    for (let i = 0; i < Math.min(3, lowOdd.length); i++) {
        selected.push(lowOdd[i]);
        usedNumbers.add(lowOdd[i]);
    }

    // Adicionar mais baixos
    const moreLow = pool.filter(n => !n.isHigh && !usedNumbers.has(n.number)).map(n => n.number);
    for (let i = 0; i < Math.min(2, moreLow.length) && selected.length < 5; i++) {
        selected.push(moreLow[i]);
        usedNumbers.add(moreLow[i]);
    }

    // Completar se necessário
    while (selected.length < 5) {
        const remaining = pool.filter(n => !usedNumbers.has(n.number));
        if (remaining.length > 0) {
            selected.push(remaining[0].number);
            usedNumbers.add(remaining[0].number);
        } else {
            break;
        }
    }

    return selected.sort((a, b) => a - b);
}

/**
 * Strategy 4: Pares Distribuídos - Favorece pares com boa distribuição
 */
function selectEvenDistributedKey(pool: NumberAnalysis[]): number[] {
    const selected: number[] = [];
    const usedNumbers = new Set<number>();

    // Tentar 1 par de cada década
    const decades = [0, 1, 2, 3, 4];
    for (const decade of decades) {
        const candidates = pool.filter(n =>
            n.decade === decade && n.isEven && !usedNumbers.has(n.number)
        );

        if (candidates.length > 0) {
            selected.push(candidates[0].number);
            usedNumbers.add(candidates[0].number);
        }
    }

    // Se não temos 5, adicionar mais pares
    const morePairs = pool.filter(n => n.isEven && !usedNumbers.has(n.number)).map(n => n.number);
    for (let i = 0; i < morePairs.length && selected.length < 5; i++) {
        selected.push(morePairs[i]);
        usedNumbers.add(morePairs[i]);
    }

    // Completar se necessário
    while (selected.length < 5) {
        const remaining = pool.filter(n => !usedNumbers.has(n.number));
        if (remaining.length > 0) {
            selected.push(remaining[0].number);
            usedNumbers.add(remaining[0].number);
        } else {
            break;
        }
    }

    return selected.sort((a, b) => a - b);
}

/**
 * Strategy 5: Extremos - Favorece números nos extremos (muito baixos + muito altos)
 */
function selectExtremesKey(pool: NumberAnalysis[]): number[] {
    const selected: number[] = [];
    const usedNumbers = new Set<number>();

    // Pegar números da década 0 (1-10)
    const veryLow = pool.filter(n => n.decade === 0).map(n => n.number);
    for (let i = 0; i < Math.min(2, veryLow.length); i++) {
        selected.push(veryLow[i]);
        usedNumbers.add(veryLow[i]);
    }

    // Pegar números da década 4 (41-50)
    const veryHigh = pool.filter(n => n.decade === 4).map(n => n.number);
    for (let i = 0; i < Math.min(2, veryHigh.length) && selected.length < 5; i++) {
        selected.push(veryHigh[i]);
        usedNumbers.add(veryHigh[i]);
    }

    // Adicionar 1 do meio para balancear
    const middle = pool.filter(n => n.decade === 2 && !usedNumbers.has(n.number)).map(n => n.number);
    if (middle.length > 0 && selected.length < 5) {
        selected.push(middle[0]);
        usedNumbers.add(middle[0]);
    }

    // Completar se necessário
    while (selected.length < 5) {
        const remaining = pool.filter(n => !usedNumbers.has(n.number));
        if (remaining.length > 0) {
            selected.push(remaining[0].number);
            usedNumbers.add(remaining[0].number);
        } else {
            break;
        }
    }

    return selected.sort((a, b) => a - b);
}

/**
 * Smart 5-Key Mode: Generates exactly 5 optimized keys from a pool
 * Uses intelligent distribution based on statistical criteria.
 * 
 * When 25 numbers are selected, generates 5 keys with different strategies:
 * 1. Balanced (mix of all criteria)
 * 2. High + Even (favors high and even numbers)
 * 3. Low + Odd (favors low and odd numbers)
 * 4. Even Distributed (even numbers across decades)
 * 5. Extremes (very low + very high numbers)
 */
export function generateSmart5Keys(
    numberPool: number[],
    starPool: number[]
): FullKey[] {
    if (numberPool.length < 5) return [];

    const keys: FullKey[] = [];

    // If we have exactly 25 numbers, use intelligent strategies
    if (numberPool.length === 25) {
        const analysis = analyzeNumberPool(numberPool);

        // Generate 5 keys with different strategies
        const strategies = [
            selectBalancedKey,
            selectHighEvenKey,
            selectLowOddKey,
            selectEvenDistributedKey,
            selectExtremesKey
        ];

        for (let i = 0; i < 5; i++) {
            const numbers = strategies[i](analysis);
            const stars = selectStarsForKey(starPool, i);

            if (numbers.length === 5) {
                keys.push({
                    numbers: numbers.sort((a, b) => a - b),
                    stars: stars.sort((a, b) => a - b),
                    strategy: SMART_5_KEY_STRATEGIES[i].name
                });
            }
        }
    } else {
        // Fallback to simple range-based distribution for other pool sizes
        const rangeSize = Math.ceil(numberPool.length / 5);
        const ranges: number[][] = [];
        for (let i = 0; i < 5; i++) {
            const start = i * rangeSize;
            const end = Math.min(start + rangeSize, numberPool.length);
            ranges.push(numberPool.slice(start, end));
        }

        for (let keyIndex = 0; keyIndex < 5; keyIndex++) {
            const numbers: number[] = [];

            for (let rangeIndex = 0; rangeIndex < 5; rangeIndex++) {
                const range = ranges[rangeIndex];
                if (range.length > 0) {
                    const pickIndex = (keyIndex + rangeIndex) % range.length;
                    numbers.push(range[pickIndex]);
                }
            }

            while (numbers.length < 5) {
                const remaining = numberPool.filter(n => !numbers.includes(n));
                if (remaining.length > 0) {
                    numbers.push(remaining[keyIndex % remaining.length]);
                } else {
                    break;
                }
            }

            const stars = selectStarsForKey(starPool, keyIndex);

            if (numbers.length === 5) {
                keys.push({
                    numbers: numbers.sort((a, b) => a - b),
                    stars: stars.sort((a, b) => a - b)
                });
            }
        }
    }

    return keys;
}

/**
 * Helper function to select stars for a key
 */
function selectStarsForKey(starPool: number[], keyIndex: number): number[] {
    const stars: number[] = [];

    if (starPool.length >= 2) {
        const starIndex1 = (keyIndex * 2) % starPool.length;
        const starIndex2 = (keyIndex * 2 + 1) % starPool.length;
        stars.push(starPool[starIndex1]);
        if (starIndex2 !== starIndex1) {
            stars.push(starPool[starIndex2]);
        } else if (starPool.length > 1) {
            stars.push(starPool[(starIndex2 + 1) % starPool.length]);
        }
    }

    return stars;
}

/**
 * Generates a 5x5 Magic Square using the De la Loubère method
 * Returns a 2D array where each row/column/diagonal sums to 65
 */
// Historical Square of Mars Pattern (indices 1-25)
export const MARS_PATTERN = [
    [11, 24, 7, 20, 3],
    [4, 12, 25, 8, 16],
    [17, 5, 13, 21, 9],
    [10, 18, 1, 14, 22],
    [23, 6, 19, 2, 15]
];

function generateMagicSquare5x5(numbers: number[]): number[][] {
    if (numbers.length !== 25) return [];

    // Create 5x5 grid and map numbers based on pattern
    const square: number[][] = Array(5).fill(0).map(() => Array(5).fill(0));

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const index = MARS_PATTERN[row][col] - 1; // 0-based index
            square[row][col] = numbers[index];
        }
    }

    return square;
}

/**
 * Magic Square Mode: Generates 12 keys from a 5x5 magic square
 * (5 rows + 5 columns + 2 diagonals)
 */
export function generateMagicSquareKeys(
    numberPool: number[],
    starPool: number[]
): FullKey[] {
    if (numberPool.length !== 25) return [];
    if (starPool.length < 2) return [];

    const square = generateMagicSquare5x5(numberPool);
    if (square.length === 0) return [];

    const numberKeys: number[][] = [];

    // Extract 5 rows
    for (let i = 0; i < 5; i++) {
        numberKeys.push([...square[i]].sort((a, b) => a - b));
    }

    // Extract 5 columns
    for (let col = 0; col < 5; col++) {
        const column: number[] = [];
        for (let row = 0; row < 5; row++) {
            column.push(square[row][col]);
        }
        numberKeys.push(column.sort((a, b) => a - b));
    }

    // Extract main diagonal (top-left to bottom-right)
    const diagonal1: number[] = [];
    for (let i = 0; i < 5; i++) {
        diagonal1.push(square[i][i]);
    }
    numberKeys.push(diagonal1.sort((a, b) => a - b));

    // Extract anti-diagonal (top-right to bottom-left)
    const diagonal2: number[] = [];
    for (let i = 0; i < 5; i++) {
        diagonal2.push(square[i][4 - i]);
    }
    numberKeys.push(diagonal2.sort((a, b) => a - b));

    // Combine with star pairs
    const fullKeys: FullKey[] = [];

    // Use different star combinations for variety
    const starPairs: number[][] = [];
    for (let i = 0; i < starPool.length - 1; i++) {
        for (let j = i + 1; j < starPool.length; j++) {
            starPairs.push([starPool[i], starPool[j]]);
        }
    }

    // Assign star pairs to number keys
    for (let i = 0; i < numberKeys.length; i++) {
        const starPairIndex = i % starPairs.length;
        fullKeys.push({
            numbers: numberKeys[i],
            stars: starPairs[starPairIndex]
        });
    }

    return fullKeys;
}

export interface MagicSquareResult {
    keys: FullKey[];
    square: number[][];
    keyLabels: string[];
}

/**
 * Enhanced Magic Square Mode: Returns keys, square structure, and labels
 * Numbers should be pre-sorted by strength (strongest first)
 */
export function generateMagicSquareWithDetails(
    numberPool: number[],
    starPool: number[]
): MagicSquareResult {
    if (numberPool.length !== 25) return { keys: [], square: [], keyLabels: [] };

    const square = generateMagicSquare5x5(numberPool);
    if (square.length === 0) return { keys: [], square: [], keyLabels: [] };

    const numberKeys: number[][] = [];
    const keyLabels: string[] = [];

    // Extract 5 rows
    for (let i = 0; i < 5; i++) {
        numberKeys.push([...square[i]].sort((a, b) => a - b));
        keyLabels.push(`Linha ${i + 1}`);
    }

    // Extract 5 columns
    for (let col = 0; col < 5; col++) {
        const column: number[] = [];
        for (let row = 0; row < 5; row++) {
            column.push(square[row][col]);
        }
        numberKeys.push(column.sort((a, b) => a - b));
        keyLabels.push(`Coluna ${col + 1}`);
    }

    // Extract main diagonal
    const diagonal1: number[] = [];
    for (let i = 0; i < 5; i++) {
        diagonal1.push(square[i][i]);
    }
    numberKeys.push(diagonal1.sort((a, b) => a - b));
    keyLabels.push('Diagonal Principal');

    // Extract anti-diagonal
    const diagonal2: number[] = [];
    for (let i = 0; i < 5; i++) {
        diagonal2.push(square[i][4 - i]);
    }
    numberKeys.push(diagonal2.sort((a, b) => a - b));
    keyLabels.push('Diagonal Secundária');

    // Combine with star pairs
    const fullKeys: FullKey[] = [];
    const starPairs: number[][] = [];
    for (let i = 0; i < starPool.length - 1; i++) {
        for (let j = i + 1; j < starPool.length; j++) {
            starPairs.push([starPool[i], starPool[j]]);
        }
    }

    for (let i = 0; i < numberKeys.length; i++) {
        const starPair = starPairs.length > 0 ? starPairs[i % starPairs.length] : [];
        fullKeys.push({
            numbers: numberKeys[i],
            stars: starPair
        });
    }

    return { keys: fullKeys, square, keyLabels };
}

