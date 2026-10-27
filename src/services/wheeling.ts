
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
    strategy?: string;
    anatomy?: any;
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
export const MARS_ORDER = [13, 3, 8, 11, 12, 14, 15, 18, 23, 1, 2, 4, 5, 6, 7, 9, 10, 16, 17, 19, 20, 21, 22, 24, 25];

export const SUN_PATTERN = [
    [6, 32, 3, 34, 35, 1],
    [7, 11, 27, 28, 8, 30],
    [19, 14, 16, 15, 23, 24],
    [18, 20, 22, 21, 17, 13],
    [25, 29, 10, 9, 26, 12],
    [36, 5, 33, 4, 2, 31]
];
export const SUN_ORDER = [1, 6, 8, 11, 15, 16, 21, 22, 26, 29, 31, 36, 2, 3, 4, 5, 7, 9, 10, 12, 13, 14, 17, 18, 19, 20, 23, 24, 25, 27, 28, 30, 32, 33, 34, 35];

export function getMagicSquareData(size: number): any {
    if (size === 25) return { pattern: MARS_PATTERN, order: MARS_ORDER, name: 'Marte', sum: 65 };
    if (size === 36) return { pattern: SUN_PATTERN, order: SUN_ORDER, name: 'Sol', sum: 111 };
    return null;
}


export interface NumberSquareStat {
    number: number;
    rank: number; // 1-based index in the user's priority
    count: number; // how many times placed in the NxN grid
    keysCount: number; // in how many keys (out of 12 or 14) this number appears
}

export interface MagicSquareResult {
    keys: FullKey[];
    square: number[][];
    keyLabels: string[];
    numberStats?: NumberSquareStat[];
    gridSize?: number;
}

/**
 * Generates an adaptive magic square (5x5 or 6x6) that respects priority order.
 * Higher ranked numbers get placed in higher weight cells (center, diagonals)
 * and appear more often if pool size < n*n.
 * Zero collisions in rows, columns, and diagonals are strictly guaranteed.
 */
export function generateAdaptiveMagicSquare(numbers: number[], n: number): number[][] {
    const K = numbers.length;
    if (n === 5 && (K < 10 || K > 25)) return [];
    if (n === 6 && (K < 12 || K > 36)) return [];

    const isDiag1 = (r: number, c: number) => r === c;
    const isDiag2 = (r: number, c: number) => r + c === n - 1;

    function getWeight(r: number, c: number) {
        let w = 2;
        if (isDiag1(r, c)) w++;
        if (isDiag2(r, c)) w++;
        return w;
    }

    const cells: { r: number; c: number; weight: number }[] = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            cells.push({ r, c, weight: getWeight(r, c) });
        }
    }

    const center = (n - 1) / 2;
    cells.sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        const distA = Math.abs(a.r - center) + Math.abs(a.c - center);
        const distB = Math.abs(b.r - center) + Math.abs(b.c - center);
        return distA - distB;
    });

    const freq = new Array(K).fill(1);
    let remaining = n * n - K;
    let idx = 0;
    while (remaining > 0) {
        if (freq[idx] < n) {
            freq[idx]++;
            remaining--;
        }
        idx = (idx + 1) % K;
    }

    const grid = Array(n).fill(0).map(() => Array(n).fill(-1));
    const rowUsed = Array(n).fill(0).map(() => new Set<number>());
    const colUsed = Array(n).fill(0).map(() => new Set<number>());
    const diag1Used = new Set<number>();
    const diag2Used = new Set<number>();
    const counts = new Array(K).fill(0);

    const isRowComplete = (r: number) => {
        for (let c = 0; c < n; c++) if (grid[r][c] === -1) return false;
        return true;
    };

    const isColComplete = (c: number) => {
        for (let r = 0; r < n; r++) if (grid[r][c] === -1) return false;
        return true;
    };

    const areSetsEqual = (s1: Set<number>, s2: Set<number>) => {
        if (s1.size !== s2.size) return false;
        for (const val of s1) if (!s2.has(val)) return false;
        return true;
    };

    function backtrack(cellIdx: number): boolean {
        if (cellIdx === cells.length) {
            // Validação estrita: garantir que as 2n+2 chaves (linhas, colunas, 2 diagonais) são mutuamente exclusivas
            const sigs = new Set<string>();
            for (let r = 0; r < n; r++) sigs.add([...rowUsed[r]].sort((a, b) => a - b).join(','));
            for (let c = 0; c < n; c++) sigs.add([...colUsed[c]].sort((a, b) => a - b).join(','));
            sigs.add([...diag1Used].sort((a, b) => a - b).join(','));
            sigs.add([...diag2Used].sort((a, b) => a - b).join(','));
            return sigs.size === (2 * n + 2);
        }

        const { r, c } = cells[cellIdx];
        const onD1 = isDiag1(r, c);
        const onD2 = isDiag2(r, c);

        for (let numIdx = 0; numIdx < K; numIdx++) {
            if (counts[numIdx] >= freq[numIdx]) continue;
            if (rowUsed[r].has(numIdx)) continue;
            if (colUsed[c].has(numIdx)) continue;
            if (onD1 && diag1Used.has(numIdx)) continue;
            if (onD2 && diag2Used.has(numIdx)) continue;

            grid[r][c] = numIdx;
            counts[numIdx]++;
            rowUsed[r].add(numIdx);
            colUsed[c].add(numIdx);
            if (onD1) diag1Used.add(numIdx);
            if (onD2) diag2Used.add(numIdx);

            // Poda preventiva: evitar chaves duplicadas entre linhas, colunas e diagonais
            let prune = false;

            // 1. As 2 diagonais nunca podem ser conjuntos idênticos
            if (diag1Used.size === n && diag2Used.size === n) {
                if (areSetsEqual(diag1Used, diag2Used)) {
                    prune = true;
                }
            }

            // 2. Se a linha r ficou completa, não pode ser igual a outra linha já completa nem a uma coluna completa
            if (!prune && isRowComplete(r)) {
                for (let otherR = 0; otherR < n; otherR++) {
                    if (otherR !== r && isRowComplete(otherR) && areSetsEqual(rowUsed[r], rowUsed[otherR])) {
                        prune = true;
                        break;
                    }
                }
                if (!prune) {
                    for (let otherC = 0; otherC < n; otherC++) {
                        if (isColComplete(otherC) && areSetsEqual(rowUsed[r], colUsed[otherC])) {
                            prune = true;
                            break;
                        }
                    }
                }
            }

            // 3. Se a coluna c ficou completa, não pode ser igual a outra coluna já completa nem a uma linha completa
            if (!prune && isColComplete(c)) {
                for (let otherC = 0; otherC < n; otherC++) {
                    if (otherC !== c && isColComplete(otherC) && areSetsEqual(colUsed[c], colUsed[otherC])) {
                        prune = true;
                        break;
                    }
                }
                if (!prune) {
                    for (let otherR = 0; otherR < n; otherR++) {
                        if (isRowComplete(otherR) && areSetsEqual(colUsed[c], rowUsed[otherR])) {
                            prune = true;
                            break;
                        }
                    }
                }
            }

            if (!prune) {
                if (backtrack(cellIdx + 1)) return true;
            }

            grid[r][c] = -1;
            counts[numIdx]--;
            rowUsed[r].delete(numIdx);
            colUsed[c].delete(numIdx);
            if (onD1) diag1Used.delete(numIdx);
            if (onD2) diag2Used.delete(numIdx);
        }
        return false;
    }

    const ok = backtrack(0);
    if (!ok) return [];

    return grid.map(row => row.map(idx => numbers[idx]));
}

/**
 * Fallback to classical magic square if exact length matches 25 or 36
 */
function generateClassicalMagicSquare(numbers: number[], n: number): number[][] {
    if (numbers.length !== n * n) return [];

    const data = getMagicSquareData(n * n);
    if (!data) return [];

    const { pattern, order } = data;
    const square: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            const valueInPattern = pattern[row][col];
            const rank = order.indexOf(valueInPattern);
            square[row][col] = numbers[rank];
        }
    }

    return square;
}

/**
 * Generates an adaptive or classical magic square according to pool size.
 */
function generateMagicSquare(numbers: number[], n: number): number[][] {
    return generateAdaptiveMagicSquare(numbers, n);
}

/**
 * Magic Square Mode: Generates keys from a magic square
 * (n rows + n columns + 2 diagonals)
 */
export function generateMagicSquareKeys(
    numberPool: number[],
    starPool: number[] = [],
    forcedN?: number
): FullKey[] {
    const res = generateMagicSquareWithDetails(numberPool, starPool, forcedN);
    return res.keys;
}

/**
 * Enhanced Magic Square Mode: Returns keys, square structure, and labels
 * Numbers should be pre-sorted by strength (strongest first)
 */
export function generateMagicSquareWithDetails(
    numberPool: number[],
    starPool: number[] = [],
    forcedN?: number
): MagicSquareResult {
    let n = forcedN;
    if (!n) {
        n = numberPool.length > 25 ? 6 : 5;
    }

    if (n === 5 && (numberPool.length < 10 || numberPool.length > 25)) {
        return { keys: [], square: [], keyLabels: [], numberStats: [], gridSize: 5 };
    }
    if (n === 6 && (numberPool.length < 12 || numberPool.length > 36)) {
        return { keys: [], square: [], keyLabels: [], numberStats: [], gridSize: 6 };
    }

    const square = generateAdaptiveMagicSquare(numberPool, n);
    if (square.length === 0) return { keys: [], square: [], keyLabels: [], numberStats: [], gridSize: n };

    const numberKeys: number[][] = [];
    const keyLabels: string[] = [];

    // Extract n rows
    for (let i = 0; i < n; i++) {
        numberKeys.push([...square[i]].sort((a, b) => a - b));
        keyLabels.push(`Linha ${i + 1}`);
    }

    // Extract n columns
    for (let col = 0; col < n; col++) {
        const column: number[] = [];
        for (let row = 0; row < n; row++) {
            column.push(square[row][col]);
        }
        numberKeys.push(column.sort((a, b) => a - b));
        keyLabels.push(`Coluna ${col + 1}`);
    }

    // Extract main diagonal
    const diagonal1: number[] = [];
    for (let i = 0; i < n; i++) {
        diagonal1.push(square[i][i]);
    }
    numberKeys.push(diagonal1.sort((a, b) => a - b));
    keyLabels.push('Diagonal Principal');

    // Extract anti-diagonal
    const diagonal2: number[] = [];
    for (let i = 0; i < n; i++) {
        diagonal2.push(square[i][n - 1 - i]);
    }
    numberKeys.push(diagonal2.sort((a, b) => a - b));
    keyLabels.push('Diagonal Secundária');

    // Stats
    const keyPresences: Record<number, number> = {};
    for (const k of numberKeys) {
        for (const num of k) {
            keyPresences[num] = (keyPresences[num] || 0) + 1;
        }
    }

    const gridPresences: Record<number, number> = {};
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const num = square[r][c];
            gridPresences[num] = (gridPresences[num] || 0) + 1;
        }
    }

    const numberStats: NumberSquareStat[] = numberPool.map((num, idx) => ({
        number: num,
        rank: idx + 1,
        count: gridPresences[num] || 0,
        keysCount: keyPresences[num] || 0
    }));

    const starPairs: number[][] = [];
    if (starPool.length >= 2) {
        for (let i = 0; i < starPool.length - 1; i++) {
            for (let j = i + 1; j < starPool.length; j++) {
                starPairs.push([starPool[i], starPool[j]]);
            }
        }
    }
    const fullKeys: FullKey[] = [];

    for (let i = 0; i < numberKeys.length; i++) {
        const stars = starPairs.length > 0 ? starPairs[i % starPairs.length] : [];
        fullKeys.push({
            numbers: numberKeys[i],
            stars: stars
        });
    }

    return { keys: fullKeys, square, keyLabels, numberStats, gridSize: n };
}

// =========================================================================
// MODO CHAVE TIPO: FILTROS ANATÓMICOS E CONSTITUIÇÃO TIPO POR JOGO
// =========================================================================

export interface KeyAnatomyBadge {
    text: string;
    ok: boolean;
    title: string;
}

export interface ChaveTipoAnalysis {
    oddCount: number;
    evenCount: number;
    lowCount: number;
    highCount: number;
    sum: number;
    frameMolduraCount?: number;
    centerMioloCount?: number;
    repeatsCount?: number;
    distinctDecades?: number;
    label: string;
    badges: KeyAnatomyBadge[];
}


function getLowThreshold(game: string): number {
    switch (game.toLowerCase()) {
        case 'lotofacil': return 13;
        case 'euromilhoes': return 25;
        case 'totoloto': return 24;
        case 'eurodreams': return 20;
        case 'megasena': return 30;
        default: return 25;
    }
}

function getMegaSenaQuadrants(numbers: number[]): number {
    const quadrants = new Set<number>();
    for (const n of numbers) {
        const row = Math.floor((n - 1) / 10); // 0 to 5
        const col = (n - 1) % 10; // 0 to 9
        if (row < 3 && col < 5) quadrants.add(1);
        else if (row < 3 && col >= 5) quadrants.add(2);
        else if (row >= 3 && col < 5) quadrants.add(3);
        else quadrants.add(4);
    }
    return quadrants.size;
}

const LOTOFACIL_MOLDURA = new Set([1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 22, 23, 24, 25]);
const LOTOFACIL_MIOLO = new Set([7, 8, 9, 12, 13, 14, 17, 18, 19]);

export function analyzeKeyAnatomy(numbers: number[], game: string = 'euromilhoes', previousDraw?: number[]): ChaveTipoAnalysis {
    const oddCount = numbers.filter(n => n % 2 !== 0).length;
    const evenCount = numbers.length - oddCount;
    const sum = numbers.reduce((a, b) => a + b, 0);

    const lowThreshold = getLowThreshold(game);
    const lowCount = numbers.filter(n => n <= lowThreshold).length;
    const highCount = numbers.length - lowCount;

    const isLoto = game.toLowerCase() === 'lotofacil';
    const frameMolduraCount = isLoto ? numbers.filter(n => LOTOFACIL_MOLDURA.has(n)).length : undefined;
    const centerMioloCount = isLoto ? numbers.filter(n => LOTOFACIL_MIOLO.has(n)).length : undefined;

    let repeatsCount: number | undefined;
    if (previousDraw && previousDraw.length > 0) {
        const prevSet = new Set(previousDraw);
        repeatsCount = numbers.filter(n => prevSet.has(n)).length;
    }

    const decades = new Set(numbers.map(n => Math.floor((n - 1) / 10)));
    const distinctDecades = decades.size;

    let label = `${oddCount}I / ${evenCount}P • Soma ${sum}`;
    if (isLoto) {
        label = `${oddCount}I / ${evenCount}P • Soma ${sum} • Moldura ${frameMolduraCount}/16`;
        if (repeatsCount !== undefined) {
            label += ` • Rep ${repeatsCount}`;
        }
    } else {
        label += ` • ${distinctDecades} Dezenas`;
        if (repeatsCount !== undefined) {
            label += ` • Rep ${repeatsCount}`;
        }
    }

    const badges: KeyAnatomyBadge[] = [];

    if (isLoto) {
        // Paridade
        const oddOk = oddCount >= 7 && oddCount <= 9;
        badges.push({
            text: `${oddOk ? '✓' : '⚠️'} ${oddCount}I / ${evenCount}P`,
            ok: oddOk,
            title: `Paridade: ${oddCount} Ímpares e ${evenCount} Pares (Janela Ideal: 7-8 Ímpares)`
        });

        // Altos / Baixos (1-13 vs 14-25)
        const lowOk = lowCount >= 6 && lowCount <= 9;
        badges.push({
            text: `${lowOk ? '✓' : '⚠️'} ${lowCount}B / ${highCount}A`,
            ok: lowOk,
            title: `Magnitude: ${lowCount} Baixos (1-13) e ${highCount} Altos (14-25) (Padrão: 7B/8A ou 8B/7A)`
        });

        // Moldura vs Miolo
        if (frameMolduraCount !== undefined && centerMioloCount !== undefined) {
            const molduraOk = frameMolduraCount >= 8 && frameMolduraCount <= 11;
            badges.push({
                text: `${molduraOk ? '✓' : '⚠️'} ${frameMolduraCount} Moldura`,
                ok: molduraOk,
                title: `Moldura: ${frameMolduraCount} bolas / Miolo: ${centerMioloCount} bolas (Ideal: 9-11 Moldura)`
            });
        }

        // Soma Gaussiana
        const sumOk = sum >= 175 && sum <= 225;
        badges.push({
            text: `${sumOk ? '✓' : '⚠️'} Soma ${sum}`,
            ok: sumOk,
            title: `Soma Total: ${sum} (Janela de Gauss: 180-220)`
        });

        // Repetentes T-1
        if (repeatsCount !== undefined) {
            const repOk = repeatsCount >= 8 && repeatsCount <= 10;
            badges.push({
                text: `${repOk ? '✓' : '⚠️'} ${repeatsCount} Rep`,
                ok: repOk,
                title: `Repetentes do concurso anterior: ${repeatsCount} bolas (Padrão: 8-10)`
            });
        }
    } else if (game.toLowerCase() === 'megasena') {
        // MEGA-SENA ESPECÍFICA (60 Bolas, 6 Números)
        const oddOk = oddCount >= 2 && oddCount <= 4;
        badges.push({
            text: `${oddOk ? '✓' : '⚠️'} ${oddCount}I / ${evenCount}P`,
            ok: oddOk,
            title: `Paridade Mega-Sena: ${oddCount} Ímpares e ${evenCount} Pares (81% dos concursos)`
        });

        const lowOk = lowCount >= 2 && lowCount <= 4;
        badges.push({
            text: `${lowOk ? '✓' : '⚠️'} ${lowCount}B / ${highCount}A`,
            ok: lowOk,
            title: `Magnitude Mega-Sena: ${lowCount} Baixos (1-30) e ${highCount} Altos (31-60) (Padrão: 2 a 4 Baixos)`
        });

        const quads = getMegaSenaQuadrants(numbers);
        const quadsOk = quads >= 3;
        badges.push({
            text: `${quadsOk ? '✓' : '⚠️'} ${quads} Quadrantes`,
            ok: quadsOk,
            title: `Distribuição Mega-Sena: ${quads} quadrantes do volante (Padrão: 3 a 4 quadrantes)`
        });

        if (repeatsCount !== undefined) {
            badges.push({
                text: `${repeatsCount <= 1 ? '✓' : '⚠️'} ${repeatsCount} Rep`,
                ok: repeatsCount <= 1,
                title: `Repetentes Mega-Sena T-1: ${repeatsCount} (Ideal: 0 a 1 bola)`
            });
        }
    } else {
        // EUROMILHÕES, TOTOLOTO E EURODREAMS
        const isEuroDreams = game.toLowerCase() === 'eurodreams';
        const oddOk = isEuroDreams ? (oddCount >= 2 && oddCount <= 4) : (oddCount >= 2 && oddCount <= 3);
        badges.push({
            text: `${oddOk ? '✓' : '⚠️'} ${oddCount}I / ${evenCount}P`,
            ok: oddOk,
            title: `Paridade: ${oddCount} Ímpares e ${evenCount} Pares`
        });

        const lowOk = isEuroDreams ? (lowCount >= 2 && lowCount <= 4) : (lowCount >= 2 && lowCount <= 3);
        const maxRange = isEuroDreams ? 40 : (game.toLowerCase() === 'totoloto' ? 49 : 50);
        badges.push({
            text: `${lowOk ? '✓' : '⚠️'} ${lowCount}B / ${highCount}A`,
            ok: lowOk,
            title: `Magnitude: ${lowCount} Baixos (1-${lowThreshold}) e ${highCount} Altos (${lowThreshold + 1}-${maxRange})`
        });

        badges.push({
            text: `✓ ${distinctDecades} Dezenas`,
            ok: distinctDecades >= 3,
            title: `Dispersão: ${distinctDecades} dezenas distintas`
        });

        if (repeatsCount !== undefined) {
            const maxRep = isEuroDreams ? 2 : 1;
            badges.push({
                text: `${repeatsCount <= maxRep ? '✓' : '⚠️'} ${repeatsCount} Rep`,
                ok: repeatsCount <= maxRep,
                title: `Repetentes Concurso T-1: ${repeatsCount}`
            });
        }
    }

    return {
        oddCount,
        evenCount,
        lowCount,
        highCount,
        sum,
        frameMolduraCount,
        centerMioloCount,
        repeatsCount,
        distinctDecades,
        label,
        badges
    };
}

export function generateChaveTipoKeys(
    pool: number[],
    game: string = 'euromilhoes',
    targetKeys: number = 8,
    previousDraw?: number[]
): { keys: FullKey[]; keyLabels: string[] } {
    const isLoto = game.toLowerCase() === 'lotofacil';
    const isSixBall = game.toLowerCase() === 'eurodreams' || game.toLowerCase() === 'megasena';
    const pickSize = isLoto ? 15 : isSixBall ? 6 : 5;

    const minImpares = isLoto ? 7 : isSixBall ? 2 : 2;
    const maxImpares = isLoto ? 9 : isSixBall ? 4 : 3;
    const minBaixos = isLoto ? 6 : isSixBall ? 2 : 2;
    const maxBaixos = isLoto ? 9 : isSixBall ? 4 : 3;
    const minSoma = isLoto ? 175 : isSixBall ? (game.toLowerCase() === 'megasena' ? 135 : 95) : 90;
    const maxSoma = isLoto ? 225 : isSixBall ? (game.toLowerCase() === 'megasena' ? 225 : 155) : 165;
    const minMoldura = isLoto ? 8 : undefined;
    const maxMoldura = isLoto ? 11 : undefined;
    const minRep = isLoto ? 8 : 0;
    const maxRep = isLoto ? 10 : 2;

    const validKeys: number[][] = [];
    const labels: string[] = [];

    if (pool.length <= pickSize) {
        const k = [...pool].slice(0, pickSize).sort((a, b) => a - b);
        const a = analyzeKeyAnatomy(k, game, previousDraw);
        return {
            keys: [{ numbers: k, stars: [], strategy: a.label, anatomy: a }],
            keyLabels: [a.label]
        };
    }

    const seen = new Set<string>();
    const anchorCount = isLoto ? 8 : (isSixBall ? 2 : 2);
    const anchors = pool.slice(0, anchorCount);
    const rest = pool.slice(anchorCount);

    function passesFilters(comb: number[]): boolean {
        const a = analyzeKeyAnatomy(comb, game, previousDraw);
        if (a.oddCount < minImpares || a.oddCount > maxImpares) return false;
        if (a.lowCount < minBaixos || a.lowCount > maxBaixos) return false;
        if (a.sum < minSoma || a.sum > maxSoma) return false;
        if (minMoldura !== undefined && a.frameMolduraCount !== undefined) {
            if (a.frameMolduraCount < minMoldura || a.frameMolduraCount > (maxMoldura || 12)) return false;
        }
        if (previousDraw && previousDraw.length > 0 && a.repeatsCount !== undefined) {
            if (a.repeatsCount < minRep || a.repeatsCount > maxRep) return false;
        }
        return true;
    }

    const neededFromRest = pickSize - anchorCount;
    const restCombs = getCombinations(rest, neededFromRest);

    for (const rComb of restCombs) {
        const candidate = [...anchors, ...rComb].sort((a, b) => a - b);
        const keyStr = candidate.join(',');
        if (seen.has(keyStr)) continue;

        if (passesFilters(candidate)) {
            seen.add(keyStr);
            validKeys.push(candidate);
            const a = analyzeKeyAnatomy(candidate, game, previousDraw);
            labels.push(a.label);
            if (validKeys.length >= targetKeys) break;
        }
    }

    if (validKeys.length < targetKeys) {
        const candidatePool = pool.slice(0, Math.min(pool.length, pickSize + 7));
        const allCombs = getCombinations(candidatePool, pickSize);

        // Relaxed tier: Must satisfy Parity and Altos/Baixos
        for (const c of allCombs) {
            const sorted = c.sort((a, b) => a - b);
            const keyStr = sorted.join(',');
            if (seen.has(keyStr)) continue;

            const a = analyzeKeyAnatomy(sorted, game, previousDraw);
            const parityOk = a.oddCount >= minImpares && a.oddCount <= maxImpares;
            const baixosOk = a.lowCount >= minBaixos && a.lowCount <= maxBaixos;

            if (parityOk && baixosOk) {
                seen.add(keyStr);
                validKeys.push(sorted);
                labels.push(a.label);
                if (validKeys.length >= targetKeys) break;
            }
        }

        // Final safety fallback if pool is too restricted
        if (validKeys.length < targetKeys) {
            for (const c of allCombs) {
                const sorted = c.sort((a, b) => a - b);
                const keyStr = sorted.join(',');
                if (seen.has(keyStr)) continue;

                seen.add(keyStr);
                validKeys.push(sorted);
                const a = analyzeKeyAnatomy(sorted, game, previousDraw);
                labels.push(a.label);
                if (validKeys.length >= targetKeys) break;
            }
        }
    }

    const fullKeys: FullKey[] = validKeys.map((nums, idx) => {
        const a = analyzeKeyAnatomy(nums, game, previousDraw);
        return {
            numbers: nums,
            stars: [],
            strategy: labels[idx],
            anatomy: a
        };
    });

    return { keys: fullKeys, keyLabels: labels };
}
