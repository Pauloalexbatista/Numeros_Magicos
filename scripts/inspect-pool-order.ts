import { generateAdaptiveMagicSquare } from '../src/services/wheeling';

// Let's test the ordered ranking of Antigravity:
const pool1 = [24, 16, 7, 23, 25, 21, 42, 6, 26, 33, 39, 46, 17, 47, 4, 32, 13, 10, 22, 18, 29];
const square1 = generateAdaptiveMagicSquare(pool1, 5);

console.log('Square with pool1 (Ranked order):');
square1.forEach(row => console.log(row));

function analyzeSquare(sq: number[][]) {
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

  const unique = new Set(keys.map(k => k.nums.join(',')));
  console.log(`Total: ${keys.length}, Unique: ${unique.size}`);
  keys.forEach((k, idx) => {
    const dup = keys.find((other, oIdx) => oIdx !== idx && other.nums.join(',') === k.nums.join(','));
    if (dup) {
      console.log(`  DUPLICATE: ${k.name} == ${dup.name}: [${k.nums.join(', ')}]`);
    }
  });
}

analyzeSquare(square1);
