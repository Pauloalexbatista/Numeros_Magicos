const pool14 = [24, 16, 7, 23, 25, 21, 42, 6, 26, 33, 39, 46, 17, 47];
const pool21 = [24, 16, 7, 23, 25, 21, 42, 6, 26, 33, 39, 46, 17, 47, 4, 32, 13, 10, 22, 18, 29];

function generateAdaptiveMagicSquareNoDups(numbers: number[], n: number): number[][] {
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

    // Track completed lines to prevent identical sets
    function isRowComplete(r: number) {
        for (let c = 0; c < n; c++) if (grid[r][c] === -1) return false;
        return true;
    }

    function isColComplete(c: number) {
        for (let r = 0; r < n; r++) if (grid[r][c] === -1) return false;
        return true;
    }

    function areSetsEqual(s1: Set<number>, s2: Set<number>) {
        if (s1.size !== s2.size) return false;
        for (const val of s1) if (!s2.has(val)) return false;
        return true;
    }

    let iterations = 0;

    function backtrack(cellIdx: number): boolean {
        iterations++;

        if (cellIdx === cells.length) {
            // Check final uniqueness of all 2n+2 lines
            const sigs = new Set<string>();
            for (let r = 0; r < n; r++) sigs.add([...rowUsed[r]].sort((a,b)=>a-b).join(','));
            for (let c = 0; c < n; c++) sigs.add([...colUsed[c]].sort((a,b)=>a-b).join(','));
            sigs.add([...diag1Used].sort((a,b)=>a-b).join(','));
            sigs.add([...diag2Used].sort((a,b)=>a-b).join(','));
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

            // PRUNING RULES:
            let prune = false;

            // 1. If Diag 1 and Diag 2 are both complete, they must NOT be equal!
            if (diag1Used.size === n && diag2Used.size === n) {
                if (areSetsEqual(diag1Used, diag2Used)) {
                    prune = true;
                }
            }

            // 2. If row r completed, ensure it doesn't match any already completed row
            if (!prune && isRowComplete(r)) {
                for (let otherR = 0; otherR < n; otherR++) {
                    if (otherR !== r && isRowComplete(otherR)) {
                        if (areSetsEqual(rowUsed[r], rowUsed[otherR])) {
                            prune = true;
                            break;
                        }
                    }
                }
            }

            // 3. If row r and col c are both complete, ensure row r != col c
            if (!prune && isRowComplete(r) && isColComplete(c)) {
                if (areSetsEqual(rowUsed[r], colUsed[c])) {
                    prune = true;
                }
            }

            // 4. If col c completed, check against all completed cols
            if (!prune && isColComplete(c)) {
                for (let otherC = 0; otherC < n; otherC++) {
                    if (otherC !== c && isColComplete(otherC)) {
                        if (areSetsEqual(colUsed[c], colUsed[otherC])) {
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
    console.log(`Pool size ${K}: backtrack iterations = ${iterations}, ok = ${ok}`);
    if (!ok) return [];

    return grid.map(row => row.map(idx => numbers[idx]));
}

console.log('--- Testing with 14 numbers ---');
const sq14 = generateAdaptiveMagicSquareNoDups(pool14, 5);
console.log('Result for 14 numbers:');
sq14.forEach(r => console.log(r));

console.log('\n--- Testing with 21 numbers ---');
const sq21 = generateAdaptiveMagicSquareNoDups(pool21, 5);
console.log('Result for 21 numbers:');
sq21.forEach(r => console.log(r));
