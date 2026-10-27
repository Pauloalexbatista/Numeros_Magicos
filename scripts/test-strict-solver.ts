// Test improved solver with uniqueness of all 12 keys
const pool14 = [24, 16, 7, 23, 25, 21, 42, 6, 26, 33, 39, 46, 17, 47];

function generateAdaptiveMagicSquareStrict(numbers: number[], n: number): number[][] {
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

    function areAllKeysUnique(): boolean {
        const keySignatures = new Set<string>();
        // Rows
        for (let r = 0; r < n; r++) {
            const sig = [...grid[r]].sort((a, b) => a - b).join(',');
            if (keySignatures.has(sig)) return false;
            keySignatures.add(sig);
        }
        // Cols
        for (let c = 0; c < n; c++) {
            const col: number[] = [];
            for (let r = 0; r < n; r++) col.push(grid[r][c]);
            const sig = col.sort((a, b) => a - b).join(',');
            if (keySignatures.has(sig)) return false;
            keySignatures.add(sig);
        }
        // Diag 1
        const d1: number[] = [];
        for (let i = 0; i < n; i++) d1.push(grid[i][i]);
        const sig1 = d1.sort((a, b) => a - b).join(',');
        if (keySignatures.has(sig1)) return false;
        keySignatures.add(sig1);

        // Diag 2
        const d2: number[] = [];
        for (let i = 0; i < n; i++) d2.push(grid[i][n - 1 - i]);
        const sig2 = d2.sort((a, b) => a - b).join(',');
        if (keySignatures.has(sig2)) return false;
        keySignatures.add(sig2);

        return true;
    }

    let iterations = 0;
    const maxIterations = 50000;

    function backtrack(cellIdx: number): boolean {
        iterations++;
        if (iterations > maxIterations) return false;

        if (cellIdx === cells.length) {
            // Check uniqueness of all keys!
            return areAllKeysUnique();
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

            if (backtrack(cellIdx + 1)) return true;

            grid[r][c] = -1;
            counts[numIdx]--;
            rowUsed[r].delete(numIdx);
            colUsed[c].delete(numIdx);
            if (onD1) diag1Used.delete(numIdx);
            if (onD2) diag2Used.delete(numIdx);
        }
        return false;
    }

    const start = Date.now();
    const ok = backtrack(0);
    const elapsed = Date.now() - start;
    console.log(`Backtrack finished in ${elapsed}ms (${iterations} iterations), ok: ${ok}`);
    if (!ok) return [];

    return grid.map(row => row.map(idx => numbers[idx]));
}

const strictSq = generateAdaptiveMagicSquareStrict(pool14, 5);
console.log('Strict Sq:');
strictSq.forEach(r => console.log(r));

// Verify uniqueness of all 12 keys:
const keys: string[] = [];
for (let r = 0; r < 5; r++) keys.push([...strictSq[r]].sort((a,b)=>a-b).join(','));
for (let c = 0; c < 5; c++) {
  const col = [];
  for (let r = 0; r < 5; r++) col.push(strictSq[r][c]);
  keys.push(col.sort((a,b)=>a-b).join(','));
}
keys.push([strictSq[0][0], strictSq[1][1], strictSq[2][2], strictSq[3][3], strictSq[4][4]].sort((a,b)=>a-b).join(','));
keys.push([strictSq[0][4], strictSq[1][3], strictSq[2][2], strictSq[3][1], strictSq[4][0]].sort((a,b)=>a-b).join(','));

console.log('Total keys:', keys.length, 'Unique keys:', new Set(keys).size);
