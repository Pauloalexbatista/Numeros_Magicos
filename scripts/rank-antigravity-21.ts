import fs from 'fs';
import path from 'path';

const consolidatedDir = path.join(process.cwd(), 'data', 'consolidated');

function inspectNextFullPrediction(file: string): number[] {
  const filePath = path.join(consolidatedDir, file);
  if (!fs.existsSync(filePath)) return [];
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const last = content[content.length - 1];
  if (!last || !last.prediction) return [];
  let pred = last.prediction;
  if (typeof pred === 'string') {
    try { pred = JSON.parse(pred); } catch { pred = []; }
  }
  return Array.isArray(pred) ? pred : [];
}

const sep = inspectNextFullPrediction('separacao_aguas_totoloto.json');
const tiro = inspectNextFullPrediction('tiro_certeiro_totoloto.json');
const med3 = inspectNextFullPrediction('media_3_otimizado_totoloto.json');
const maisSort = inspectNextFullPrediction('mais_sorteadas_sempre_totoloto.json');
const diag2d = inspectNextFullPrediction('diagonais_matriz_totoloto.json');

const systems = [
  { name: 'Separação das Águas', pred: sep, w: 1.25 },
  { name: 'Tiro Certeiro', pred: tiro, w: 1.25 },
  { name: 'Média 3 Otimizado', pred: med3, w: 1.0 },
  { name: 'Mais Sorteadas', pred: maisSort, w: 1.0 },
  { name: 'Diagonais 2D', pred: diag2d, w: 0.8 }
];

const totalScore: Record<number, number> = {};
for (let b = 1; b <= 49; b++) totalScore[b] = 0;

systems.forEach(s => {
  s.pred.forEach((n, idx) => {
    const rankScore = (49 - idx);
    totalScore[n] += rankScore * s.w;
  });
});

const antigravitySet = [4, 6, 7, 10, 13, 16, 17, 18, 21, 22, 23, 24, 25, 26, 29, 32, 33, 39, 42, 46, 47];

const ranked = antigravitySet.map(n => {
  const votes = systems.filter(s => s.pred.slice(0, 25).includes(n)).length;
  return {
    num: n,
    score: Math.round(totalScore[n] * 10) / 10,
    votesTop25: votes
  };
}).sort((a, b) => b.score - a.score);

console.log('RANKING OFICIAL ANTIGRAVITY (1 a 21):');
ranked.forEach((item, index) => {
  console.log(`#${(index + 1).toString().padStart(2, ' ')}: Bola ${item.num.toString().padStart(2, '0')} | Borda Score: ${item.score.toFixed(1)} | Votos Top 25: ${item.votesTop25}/5`);
});
