import fs from "fs";
import path from "path";

const consolidatedDir = path.join(process.cwd(), "data", "consolidated");

interface DrawResult {
  drawId?: number;
  date?: string;
  num_hits_25?: number;
}

interface CycleStats {
  system: string;
  cycleIndex: number;
  duration: number; // draws between jackpots
  c0: number; // count of 0s
  c1: number; // count of 1s
  c2: number; // count of 2s
  c3: number; // count of 3s
  c4: number; // count of 4s
  energyScore: number; // e.g. 4*c4 + 3*c3 + 2*c2 + 1*c1
  pct4: number;
  pct3: number;
  pct2: number;
  pct1: number;
  pct0: number;
}

const systems = [
  "monte_carlo_euromillions.json",
  "diagonais_matriz_euromillions.json",
  "clustering_euromillions.json",
  "random_forest_euromillions.json",
  "piramide_intervalos_euromillions.json",
  "supersistema_neuronal_euromillions.json"
];

const allCycles: CycleStats[] = [];

for (const file of systems) {
  const filePath = path.join(consolidatedDir, file);
  if (!fs.existsSync(filePath)) continue;

  const content: DrawResult[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const systemName = file.replace("_euromillions.json", "");

  const jackpotIndices: number[] = [];
  content.forEach((item, idx) => {
    if (item.num_hits_25 === 5) {
      jackpotIndices.push(idx);
    }
  });

  // Analyze cycles between jackpots
  for (let j = 1; j < jackpotIndices.length; j++) {
    const startIdx = jackpotIndices[j - 1] + 1;
    const endIdx = jackpotIndices[j]; // jackpot hits at endIdx
    const drawsInCycle = content.slice(startIdx, endIdx); // strictly between jackpots

    let c0 = 0, c1 = 0, c2 = 0, c3 = 0, c4 = 0;
    for (const d of drawsInCycle) {
      const h = d.num_hits_25 ?? 0;
      if (h === 0) c0++;
      else if (h === 1) c1++;
      else if (h === 2) c2++;
      else if (h === 3) c3++;
      else if (h === 4) c4++;
    }

    const duration = drawsInCycle.length;
    if (duration === 0) continue;

    // Energy score: weighted points
    // 4 is worth 10, 3 is worth 4, 2 is worth 1, 1 is 0, 0 is -2
    const energyScore = (c4 * 10) + (c3 * 4) + (c2 * 1) - (c0 * 2);

    allCycles.push({
      system: systemName,
      cycleIndex: j,
      duration,
      c0, c1, c2, c3, c4,
      energyScore,
      pct4: Math.round((c4 / duration) * 1000) / 10,
      pct3: Math.round((c3 / duration) * 1000) / 10,
      pct2: Math.round((c2 / duration) * 1000) / 10,
      pct1: Math.round((c1 / duration) * 1000) / 10,
      pct0: Math.round((c0 / duration) * 1000) / 10,
    });
  }
}

console.log(`=== ANALISE DE ${allCycles.length} CICLOS DE JACKPOT (EUROMILHOES) ===\n`);

// 1. Médias globais por ciclo
const avgDur = allCycles.reduce((a, b) => a + b.duration, 0) / allCycles.length;
const avgC4 = allCycles.reduce((a, b) => a + b.c4, 0) / allCycles.length;
const avgC3 = allCycles.reduce((a, b) => a + b.c3, 0) / allCycles.length;
const avgC2 = allCycles.reduce((a, b) => a + b.c2, 0) / allCycles.length;
const avgC1 = allCycles.reduce((a, b) => a + b.c1, 0) / allCycles.length;
const avgC0 = allCycles.reduce((a, b) => a + b.c0, 0) / allCycles.length;
const avgEnergy = allCycles.reduce((a, b) => a + b.energyScore, 0) / allCycles.length;

console.log(`Duracao media de um ciclo entre Jackpots: ${avgDur.toFixed(1)} sorteios`);
console.log(`Distribuicao MEDIA de acertos por ciclo:`);
console.log(`  Acertos 4/5: ${avgC4.toFixed(1)} sorteios (${((avgC4/avgDur)*100).toFixed(1)}%)`);
console.log(`  Acertos 3/5: ${avgC3.toFixed(1)} sorteios (${((avgC3/avgDur)*100).toFixed(1)}%)`);
console.log(`  Acertos 2/5: ${avgC2.toFixed(1)} sorteios (${((avgC2/avgDur)*100).toFixed(1)}%)`);
console.log(`  Acertos 1/5: ${avgC1.toFixed(1)} sorteios (${((avgC1/avgDur)*100).toFixed(1)}%)`);
console.log(`  Acertos 0/5: ${avgC0.toFixed(1)} sorteios (${((avgC0/avgDur)*100).toFixed(1)}%)`);
console.log(`  Pontuacao Media de Energia Acumulada: ${avgEnergy.toFixed(1)} pts\n`);

// 2. Correlacao entre a densidade de cada acerto e a duracao do ciclo
function correlation(x: number[], y: number[]): number {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  return num / Math.sqrt(denX * denY);
}

const durations = allCycles.map(c => c.duration);
const corrC4Pct = correlation(allCycles.map(c => c.pct4), durations);
const corrC3Pct = correlation(allCycles.map(c => c.pct3), durations);
const corrC2Pct = correlation(allCycles.map(c => c.pct2), durations);
const corrC1Pct = correlation(allCycles.map(c => c.pct1), durations);
const corrC0Pct = correlation(allCycles.map(c => c.pct0), durations);

console.log(`=== CORRELACAO: DENSIDADE DE ACERTOS VS RAPIDEZ DO JACKPOT ===`);
console.log(`Densidade de 4s (% no ciclo) vs Duracao: r = ${corrC4Pct.toFixed(3)} ${corrC4Pct < 0 ? '(QUANTO MAIS 4s, MAIS RAPIDO REBENTA O JACKPOT!)' : ''}`);
console.log(`Densidade de 3s (% no ciclo) vs Duracao: r = ${corrC3Pct.toFixed(3)}`);
console.log(`Densidade de 2s (% no ciclo) vs Duracao: r = ${corrC2Pct.toFixed(3)} ${corrC2Pct > 0 ? '(QUANTO MAIS 2s, MAIS O CICLO ARRASTA / DEMORA!)' : ''}`);
console.log(`Densidade de 1s (% no ciclo) vs Duracao: r = ${corrC1Pct.toFixed(3)} ${corrC1Pct > 0 ? '(MUITOS 1s INDICAM DISPERSAO E ATRASO NO JACKPOT)' : ''}`);
console.log(`Densidade de 0s (% no ciclo) vs Duracao: r = ${corrC0Pct.toFixed(3)}\n`);

// 3. Comparacao de Ciclos Curtos (Rapidos <= 25 sorteios) vs Ciclos Medios vs Ciclos Longos (> 50 sorteios)
const fastCycles = allCycles.filter(c => c.duration <= 25);
const normalCycles = allCycles.filter(c => c.duration > 25 && c.duration <= 50);
const slowCycles = allCycles.filter(c => c.duration > 50);

console.log(`=== COMPARACAO POR VELOCIDADE DE CICLO ===`);
console.log(`CICLOS RAPIDOS (<= 25 sorteios, N=${fastCycles.length}):`);
console.log(`  Media de 4s: ${(fastCycles.reduce((a,b)=>a+b.c4,0)/fastCycles.length).toFixed(1)} (${(fastCycles.reduce((a,b)=>a+b.pct4,0)/fastCycles.length).toFixed(1)}% dos sorteios)`);
console.log(`  Media de 3s: ${(fastCycles.reduce((a,b)=>a+b.c3,0)/fastCycles.length).toFixed(1)} (${(fastCycles.reduce((a,b)=>a+b.pct3,0)/fastCycles.length).toFixed(1)}%)`);
console.log(`  Media de 2s: ${(fastCycles.reduce((a,b)=>a+b.c2,0)/fastCycles.length).toFixed(1)} (${(fastCycles.reduce((a,b)=>a+b.pct2,0)/fastCycles.length).toFixed(1)}%)`);

console.log(`\nCICLOS MEDIOS (26 a 50 sorteios, N=${normalCycles.length}):`);
console.log(`  Media de 4s: ${(normalCycles.reduce((a,b)=>a+b.c4,0)/normalCycles.length).toFixed(1)} (${(normalCycles.reduce((a,b)=>a+b.pct4,0)/normalCycles.length).toFixed(1)}% dos sorteios)`);
console.log(`  Media de 3s: ${(normalCycles.reduce((a,b)=>a+b.c3,0)/normalCycles.length).toFixed(1)} (${(normalCycles.reduce((a,b)=>a+b.pct3,0)/normalCycles.length).toFixed(1)}%)`);
console.log(`  Media de 2s: ${(normalCycles.reduce((a,b)=>a+b.c2,0)/normalCycles.length).toFixed(1)} (${(normalCycles.reduce((a,b)=>a+b.pct2,0)/normalCycles.length).toFixed(1)}%)`);

console.log(`\nCICLOS LENTOS / ARRASTADOS (> 50 sorteios, N=${slowCycles.length}):`);
console.log(`  Media de 4s: ${(slowCycles.reduce((a,b)=>a+b.c4,0)/slowCycles.length).toFixed(1)} (${(slowCycles.reduce((a,b)=>a+b.pct4,0)/slowCycles.length).toFixed(1)}% dos sorteios)`);
console.log(`  Media de 3s: ${(slowCycles.reduce((a,b)=>a+b.c3,0)/slowCycles.length).toFixed(1)} (${(slowCycles.reduce((a,b)=>a+b.pct3,0)/slowCycles.length).toFixed(1)}%)`);
console.log(`  Media de 2s: ${(slowCycles.reduce((a,b)=>a+b.c2,0)/slowCycles.length).toFixed(1)} (${(slowCycles.reduce((a,b)=>a+b.pct2,0)/slowCycles.length).toFixed(1)}%)`);
