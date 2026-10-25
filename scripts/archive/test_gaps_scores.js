const maxNum = 49;
const draw = [4, 10, 18, 23, 27];

// Nivel 2 (Gaps ordem 1)
const g1 = [10-4, 18-10, 23-18, 27-23]; // [6, 8, 5, 4]
// Nivel 3 (Gaps ordem 2)
const g2 = [Math.abs(8-6), Math.abs(5-8), Math.abs(4-5)]; // [2, 3, 1]
// Nivel 4 (Gaps ordem 3)
const g3 = [Math.abs(3-2), Math.abs(1-3)]; // [1, 2]
// Nivel 5 (Vertice)
const g4 = [Math.abs(2-1)]; // [1]

const weights = {
  vertice: 5.0,
  ordem3: 3.5,
  ordem2: 2.5,
  ordem1: 1.5
};

const scores = {};
for (let i = 1; i <= maxNum; i++) scores[i] = 0;

const wrap = (k) => (((k - 1) % maxNum) + maxNum) % maxNum + 1;

// Aplicar intervalos a cada bola do sorteio
draw.forEach(b => {
  g4.forEach(gap => { scores[wrap(b + gap)] += weights.vertice; scores[wrap(b - gap)] += weights.vertice; });
  g3.forEach(gap => { scores[wrap(b + gap)] += weights.ordem3; scores[wrap(b - gap)] += weights.ordem3; });
  g2.forEach(gap => { scores[wrap(b + gap)] += weights.ordem2; scores[wrap(b - gap)] += weights.ordem2; });
  g1.forEach(gap => { scores[wrap(b + gap)] += weights.ordem1; scores[wrap(b - gap)] += weights.ordem1; });
});

const sorted = Object.entries(scores)
  .map(([num, score]) => ({ num: parseInt(num), score }))
  .sort((a, b) => b.score - a.score || a.num - b.num);

console.log("Ranking de Importância Simulado:");
sorted.slice(0, 20).forEach((s, idx) => {
  console.log(`Pos ${idx + 1}: Número ${s.num.toString().padStart(2, '0')} -> Pontos: ${s.score.toFixed(1)}`);
});
console.log("...");
sorted.slice(35, 49).forEach((s, idx) => {
  console.log(`Pos ${35 + idx + 1}: Número ${s.num.toString().padStart(2, '0')} -> Pontos: ${s.score.toFixed(1)}`);
});
