import { generateAdaptiveMagicSquare } from '../src/services/wheeling';

const pool14 = [24, 16, 7, 23, 25, 21, 42, 6, 26, 33, 39, 46, 17, 47];
const sq = generateAdaptiveMagicSquare(pool14, 5);

console.log('NOVO QUADRADO MÁGICO 5X5 (ZERO DUPLICADOS):');
sq.forEach((row, idx) => {
  console.log(`Linha ${idx + 1}: [ ${row.map(n => n.toString().padStart(2, '0')).join(', ')} ]`);
});

console.log('\nAS 12 CHAVES RESULTANTES:');
const keys: { name: string; nums: number[] }[] = [];
for (let r = 0; r < 5; r++) keys.push({ name: `Chave 0${r+1} (Linha ${r+1})`, nums: [...sq[r]].sort((a,b)=>a-b) });
for (let c = 0; c < 5; c++) {
  const col = [];
  for (let r = 0; r < 5; r++) col.push(sq[r][c]);
  keys.push({ name: `Chave 0${c+6} (Coluna ${c+1})`, nums: col.sort((a,b)=>a-b) });
}
keys.push({ name: 'Chave 11 (Diagonal 1)', nums: [sq[0][0], sq[1][1], sq[2][2], sq[3][3], sq[4][4]].sort((a,b)=>a-b) });
keys.push({ name: 'Chave 12 (Diagonal 2)', nums: [sq[0][4], sq[1][3], sq[2][2], sq[3][1], sq[4][0]].sort((a,b)=>a-b) });

keys.forEach(k => {
  console.log(`* **${k.name}:** \`[ ${k.nums.map(n => n.toString().padStart(2, '0')).join(', ')} ]\``);
});
