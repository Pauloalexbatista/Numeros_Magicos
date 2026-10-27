import { generateAdaptiveMagicSquare } from '../src/services/wheeling';

const pool = [4, 6, 7, 10, 13, 16, 17, 18, 21, 22, 23, 24, 25, 26, 29, 32, 33, 39, 42, 46, 47];
const square = generateAdaptiveMagicSquare(pool, 5);

function extractKeys(sq: number[][]) {
  const n = sq.length;
  const keys: { name: string; nums: number[] }[] = [];
  for (let r = 0; r < n; r++) keys.push({ name: 'L' + (r+1), nums: [...sq[r]].sort((a,b)=>a-b) });
  for (let c = 0; c < n; c++) {
    const col: number[] = [];
    for (let r = 0; r < n; r++) col.push(sq[r][c]);
    keys.push({ name: 'C' + (c+1), nums: col.sort((a,b)=>a-b) });
  }
  const d1: number[] = [];
  const d2: number[] = [];
  for (let i = 0; i < n; i++) {
    d1.push(sq[i][i]);
    d2.push(sq[i][n-1-i]);
  }
  keys.push({ name: 'D1', nums: d1.sort((a,b)=>a-b) });
  keys.push({ name: 'D2', nums: d2.sort((a,b)=>a-b) });
  return keys;
}

const keys = extractKeys(square);
const keyStrings = keys.map(k => k.nums.join(','));
const unique = new Set(keyStrings);
console.log('Total keys:', keys.length, 'Unique keys:', unique.size);

keys.forEach((k, idx) => {
  const dup = keys.find((other, oIdx) => oIdx !== idx && other.nums.join(',') === k.nums.join(','));
  if (dup) {
    console.log('DUPLICATE:', k.name, 'is same as', dup.name, '=>', k.nums);
  }
});
