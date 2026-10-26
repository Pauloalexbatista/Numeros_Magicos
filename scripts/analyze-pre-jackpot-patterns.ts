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

let totalJackpots = 0;
let last5HitsDistribution = { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
let last10HitsDistribution = { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
let normalHitsDistribution = { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
let totalLast5Draws = 0;
let totalLast10Draws = 0;
let totalNormalDraws = 0;

let jackpotsWithTraveInLast5 = 0;
let jackpotsWithTraveInLast10 = 0;
let jackpotsWithTwoPlusTravesInLast10 = 0;

// Energy score analysis at trigger time
const triggerEnergyScores: number[] = [];

for (const file of systems) {
  const filePath = path.join(consolidatedDir, file);
  if (!fs.existsSync(filePath)) continue;

  const content: DrawResult[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const jackpotIndices: number[] = [];
  content.forEach((item, idx) => {
    if (item.num_hits_25 === 5) {
      jackpotIndices.push(idx);
    }
  });

  for (let j = 1; j < jackpotIndices.length; j++) {
    const jpIdx = jackpotIndices[j];
    const prevJpIdx = jackpotIndices[j - 1];
    const cycle = content.slice(prevJpIdx + 1, jpIdx);
    if (cycle.length < 5) continue;

    totalJackpots++;

    // Window of last 5 draws before Jackpot
    const last5 = content.slice(Math.max(prevJpIdx + 1, jpIdx - 5), jpIdx);
    const last10 = content.slice(Math.max(prevJpIdx + 1, jpIdx - 10), jpIdx);
    const normal = content.slice(prevJpIdx + 1, Math.max(prevJpIdx + 1, jpIdx - 10));

    let c4_last5 = 0;
    for (const d of last5) {
      const h = d.num_hits_25 ?? 0;
      if (h in last5HitsDistribution) (last5HitsDistribution as any)[h]++;
      if (h === 4) c4_last5++;
      totalLast5Draws++;
    }
    if (c4_last5 > 0) jackpotsWithTraveInLast5++;

    let c4_last10 = 0;
    for (const d of last10) {
      const h = d.num_hits_25 ?? 0;
      if (h in last10HitsDistribution) (last10HitsDistribution as any)[h]++;
      if (h === 4) c4_last10++;
      totalLast10Draws++;
    }
    if (c4_last10 > 0) jackpotsWithTraveInLast10++;
    if (c4_last10 >= 2) jackpotsWithTwoPlusTravesInLast10++;

    for (const d of normal) {
      const h = d.num_hits_25 ?? 0;
      if (h in normalHitsDistribution) (normalHitsDistribution as any)[h]++;
      totalNormalDraws++;
    }

    // Cumulative weighted energy before Jackpot:
    // 4=10pts, 3=3pts, 2=1pt, 1=0, 0=-2
    let energy = 0;
    for (const d of cycle) {
      const h = d.num_hits_25 ?? 0;
      if (h === 4) energy += 10;
      else if (h === 3) energy += 3;
      else if (h === 2) energy += 1;
      else if (h === 0) energy -= 2;
    }
    triggerEnergyScores.push(energy);
  }
}

console.log(`=== ANALISE FORENSE DA JANELA IMEDIATA ANTES DO JACKPOT (N=${totalJackpots} Jackpots) ===\n`);

console.log(`1. PRESENCA DE TRAVES (4/5) ANTES DO JACKPOT:`);
console.log(`   - Em ${((jackpotsWithTraveInLast5 / totalJackpots) * 100).toFixed(1)}% dos Jackpots houve pelo menos um 4/5 nos ÚLTIMOS 5 SORTEIOS!`);
console.log(`   - Em ${((jackpotsWithTraveInLast10 / totalJackpots) * 100).toFixed(1)}% dos Jackpots houve pelo menos um 4/5 nos ÚLTIMOS 10 SORTEIOS!`);
console.log(`   - Em ${((jackpotsWithTwoPlusTravesInLast10 / totalJackpots) * 100).toFixed(1)}% dos Jackpots houve DOIS OU MAIS 4/5 nos últimos 10 sorteios (Saturação Crítica)!\n`);

console.log(`2. FREQUENCIA COMPARADA: JANELA FINAL (5 Sorteios) vs FASE NORMAL DO CICLO:`);
console.log(`   - Acertos 4/5 nos ultimos 5 sorteios: ${((last5HitsDistribution[4] / totalLast5Draws) * 100).toFixed(1)}% (vs ${((normalHitsDistribution[4] / totalNormalDraws) * 100).toFixed(1)}% em fase normal) -> SALTO DE ${(((last5HitsDistribution[4] / totalLast5Draws) / (normalHitsDistribution[4] / totalNormalDraws) - 1) * 100).toFixed(1)}%!`);
console.log(`   - Acertos 3/5 nos ultimos 5 sorteios: ${((last5HitsDistribution[3] / totalLast5Draws) * 100).toFixed(1)}% (vs ${((normalHitsDistribution[3] / totalNormalDraws) * 100).toFixed(1)}% em fase normal)`);
console.log(`   - Acertos 2/5 nos ultimos 5 sorteios: ${((last5HitsDistribution[2] / totalLast5Draws) * 100).toFixed(1)}% (vs ${((normalHitsDistribution[2] / totalNormalDraws) * 100).toFixed(1)}% em fase normal)`);
console.log(`   - Acertos 0/5 nos ultimos 5 sorteios: ${((last5HitsDistribution[0] / totalLast5Draws) * 100).toFixed(1)}% (vs ${((normalHitsDistribution[0] / totalNormalDraws) * 100).toFixed(1)}% em fase normal)\n`);

// Estatísticas de Energia Acumulada
triggerEnergyScores.sort((a, b) => a - b);
const medianEnergy = triggerEnergyScores[Math.floor(triggerEnergyScores.length / 2)];
const meanEnergy = triggerEnergyScores.reduce((a, b) => a + b, 0) / triggerEnergyScores.length;
const p25 = triggerEnergyScores[Math.floor(triggerEnergyScores.length * 0.25)];
const p75 = triggerEnergyScores[Math.floor(triggerEnergyScores.length * 0.75)];

console.log(`3. PONTUACAO DE ENERGIA ACUMULADA NO CICLO ATE AO JACKPOT:`);
console.log(`   Fórmula: (4s * 10pts) + (3s * 3pts) + (2s * 1pt) - (0s * 2pts)`);
console.log(`   - Media de Energia para rebentar: ${meanEnergy.toFixed(1)} pts`);
console.log(`   - Mediana de Energia: ${medianEnergy} pts`);
console.log(`   - Intervalo Interquartil (50% dos casos): de ${p25} pts a ${p75} pts\n`);
