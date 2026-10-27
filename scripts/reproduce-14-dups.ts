import { generateAdaptiveMagicSquare } from '../src/services/wheeling';

// Let's test with the 14 numbers from Paulo's screenshot:
const pool14 = [24, 16, 7, 23, 25, 21, 42, 6, 26, 33, 39, 46, 17, 47];

console.log('Testing pool of 14 numbers with current algorithm:');
const currentSq = generateAdaptiveMagicSquare(pool14, 5);
console.log('Current Sq:', currentSq);

// Check duplicates in currentSq:
function getDupKeys(sq: number[][]) {
  const n = sq.length;
  const keys: { name: string; keyStr: string; nums: number[] }[] = [];
  for (let r = 0; r < n; r++) {
    const row = [...sq[r]].sort((a,b)=>a-b);
    keys.push({ name: `L${r+1}`, keyStr: row.join(','), nums: row });
  }
  for (let c = 0; c < n; c++) {
    const col: number[] = [];
    for (let r = 0; r < n; r++) col.push(sq[r][c]);
    col.sort((a,b)=>a-b);
    keys.push({ name: `C${c+1}`, keyStr: col.join(','), nums: col });
  }
  const d1 = [sq[0][0], sq[1][1], sq[2][2], sq[3][3], sq[4][4]].sort((a,b)=>a-b);
  const d2 = [sq[0][4], sq[1][3], sq[2][2], sq[3][1], sq[4][0]].sort((a,b)=>a-b);
  keys.push({ name: 'D1', keyStr: d1.join(','), nums: d1 });
  keys.push({ name: 'D2', keyStr: d2.join(','), nums: d2 });

  const dups: string[] = [];
  keys.forEach((k, idx) => {
    const match = keys.find((other, oIdx) => oIdx !== idx && other.keyStr === k.keyStr);
    if (match && idx < keys.indexOf(match)) {
      dups.push(`${k.name} e ${match.name} são idênticas: [${k.nums.join(', ')}]`);
    }
  });
  return dups;
}

console.log('Duplicates in currentSq:', getDupKeys(currentSq));
