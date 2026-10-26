import fs from "fs";
import path from "path";

const consolidatedDir = path.join(process.cwd(), "data", "consolidated");

interface DrawResult {
  drawId?: number;
  date?: string;
  num_hits_25?: number;
}

const systems = [
  "monte_carlo_euromillions.json",
  "diagonais_matriz_euromillions.json",
  "clustering_euromillions.json",
  "random_forest_euromillions.json",
  "piramide_intervalos_euromillions.json",
  "supersistema_neuronal_euromillions.json"
];

// Let's test a few intuitive score models:
// Model A: Linear: 4->4, 3->3, 2->2, 1->1, 0->0
// Model B: Geometric: 4->8, 3->4, 2->2, 1->1, 0->0
// Model C: Net Energy (convergência positiva vs dispersão negativa): 4->+10, 3->+3, 2->0, 1->-2, 0->-5
// Model D: Fibonacci: 4->8, 3->5, 2->2, 1->1, 0->0

interface CycleData {
  system: string;
  duration: number;
  c0: number;
  c1: number;
  c2: number;
  c3: number;
  c4: number;
}

const cycles: CycleData[] = [];

for (const file of systems) {
  const filePath = path.join(consolidatedDir, file);
  if (!fs.existsSync(filePath)) continue;

  const content: DrawResult[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const jackpotIndices: number[] = [];
  content.forEach((item, idx) => {
    if (item.num_hits_25 === 5) jackpotIndices.push(idx);
  });

  for (let j = 1; j < jackpotIndices.length; j++) {
    const draws = content.slice(jackpotIndices[j - 1] + 1, jackpotIndices[j]);
    if (draws.length === 0) continue;

    let c0 = 0, c1 = 0, c2 = 0, c3 = 0, c4 = 0;
    for (const d of draws) {
      const h = d.num_hits_25 ?? 0;
      if (h === 0) c0++;
      else if (h === 1) c1++;
      else if (h === 2) c2++;
      else if (h === 3) c3++;
      else if (h === 4) c4++;
    }

    cycles.push({
      system: file.replace("_euromillions.json", ""),
      duration: draws.length,
      c0, c1, c2, c3, c4
    });
  }
}

function stats(scores: number[]) {
  const n = scores.length;
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  const sorted = [...scores].sort((a, b) => a - b);
  const median = sorted[Math.floor(n / 2)];
  const p25 = sorted[Math.floor(n * 0.25)];
  const p75 = sorted[Math.floor(n * 0.75)];
  const variance = scores.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
  const std = Math.sqrt(variance);
  const cv = std / mean; // Coeficiente de variação (quanto menor, mais estável e previsível o limiar!)
  return { mean, median, p25, p75, std, cv };
}

const scoresLinear = cycles.map(c => c.c4 * 4 + c.c3 * 3 + c.c2 * 2 + c.c1 * 1);
const scoresGeometric = cycles.map(c => c.c4 * 8 + c.c3 * 4 + c.c2 * 2 + c.c1 * 1);
const scoresNetEnergy = cycles.map(c => c.c4 * 10 + c.c3 * 3 + c.c2 * 0 - c.c1 * 2 - c.c0 * 5);
const scoresTraveDominance = cycles.map(c => c.c4 * 15 + c.c3 * 2);

console.log(`=== COMPARACAO DE MODELOS DE PONTUACAO ACUMULADA (N=${cycles.length} ciclos) ===\n`);

console.log(`Modelo Linear (4x4 + 3x3 + 2x2 + 1x1):`);
const sLin = stats(scoresLinear);
console.log(`  Média: ${sLin.mean.toFixed(1)} pts | Mediana: ${sLin.median} pts | Intervalo 50%: [${sLin.p25} - ${sLin.p75}] pts | CV: ${sLin.cv.toFixed(2)}`);

console.log(`\nModelo Geométrico (4x8 + 3x4 + 2x2 + 1x1):`);
const sGeo = stats(scoresGeometric);
console.log(`  Média: ${sGeo.mean.toFixed(1)} pts | Mediana: ${sGeo.median} pts | Intervalo 50%: [${sGeo.p25} - ${sGeo.p75}] pts | CV: ${sGeo.cv.toFixed(2)}`);

console.log(`\nModelo Energia Líquida (4x10 + 3x3 - 1x2 - 0x5):`);
const sNet = stats(scoresNetEnergy);
console.log(`  Média: ${sNet.mean.toFixed(1)} pts | Mediana: ${sNet.median} pts | Intervalo 50%: [${sNet.p25} - ${sNet.p75}] pts | CV: ${sNet.cv.toFixed(2)}`);

console.log(`\nModelo Dominância de Traves (4x15 + 3x2):`);
const sDom = stats(scoresTraveDominance);
console.log(`  Média: ${sDom.mean.toFixed(1)} pts | Mediana: ${sDom.median} pts | Intervalo 50%: [${sDom.p25} - ${sDom.p75}] pts | CV: ${sDom.cv.toFixed(2)}`);

// O que se passa no ciclo atual dos principais sistemas?
console.log(`\n=== PONTUACAO ACUMULADA NO CICLO ATUAL (EM CURSO) ===`);
for (const file of ["monte_carlo_euromillions.json", "diagonais_matriz_euromillions.json", "clustering_euromillions.json"]) {
  const filePath = path.join(consolidatedDir, file);
  const content: DrawResult[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let lastJp = -1;
  content.forEach((item, idx) => {
    if (item.num_hits_25 === 5) lastJp = idx;
  });
  const currentDraws = content.slice(lastJp + 1);
  let c0 = 0, c1 = 0, c2 = 0, c3 = 0, c4 = 0;
  for (const d of currentDraws) {
    const h = d.num_hits_25 ?? 0;
    if (h === 0) c0++;
    else if (h === 1) c1++;
    else if (h === 2) c2++;
    else if (h === 3) c3++;
    else if (h === 4) c4++;
  }
  const lin = c4 * 4 + c3 * 3 + c2 * 2 + c1 * 1;
  const net = c4 * 10 + c3 * 3 - c1 * 2 - c0 * 5;
  console.log(`${file.replace("_euromillions.json", "")}:`);
  console.log(`  Sorteios sem Jackpot: ${currentDraws.length} | 4s: ${c4} | 3s: ${c3} | 2s: ${c2} | 1s: ${c1} | 0s: ${c0}`);
  console.log(`  Pontuação Linear: ${lin} pts (Média histórica ao rebentar: ${sLin.mean.toFixed(1)} pts)`);
  console.log(`  Energia Líquida: ${net} pts (Média histórica ao rebentar: ${sNet.mean.toFixed(1)} pts)`);
}
