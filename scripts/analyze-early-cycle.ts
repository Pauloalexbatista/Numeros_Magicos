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

interface EarlyCycleSample {
  system: string;
  cycleLength: number;
  early4: number; // 4s in first 15 draws
  early3: number;
  early2: number;
  early1: number;
  early0: number;
  earlyRatioHighLow: number; // (4s + 3s) / (2s + 1s + 0s)
}

const samples: EarlyCycleSample[] = [];

for (const file of systems) {
  const filePath = path.join(consolidatedDir, file);
  if (!fs.existsSync(filePath)) continue;

  const content: DrawResult[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const jackpotIndices: number[] = [];
  content.forEach((item, idx) => {
    if (item.num_hits_25 === 5) jackpotIndices.push(idx);
  });

  for (let j = 1; j < jackpotIndices.length; j++) {
    const prevJp = jackpotIndices[j - 1];
    const currJp = jackpotIndices[j];
    const cycleLength = currJp - prevJp;
    if (cycleLength < 15) continue; // only analyze cycles of at least 15 draws

    const first15 = content.slice(prevJp + 1, prevJp + 1 + 15);
    let e4 = 0, e3 = 0, e2 = 0, e1 = 0, e0 = 0;
    for (const d of first15) {
      const h = d.num_hits_25 ?? 0;
      if (h === 4) e4++;
      else if (h === 3) e3++;
      else if (h === 2) e2++;
      else if (h === 1) e1++;
      else if (h === 0) e0++;
    }

    const earlyRatioHighLow = (e4 * 2 + e3) / (e2 + e1 + e0 || 1);

    samples.push({
      system: file.replace("_euromillions.json", ""),
      cycleLength,
      early4: e4,
      early3: e3,
      early2: e2,
      early1: e1,
      early0: e0,
      earlyRatioHighLow
    });
  }
}

console.log(`=== ANALISE DE COMPORTAMENTO INICIAL (PRIMEIROS 15 SORTEIOS DO CICLO) - N=${samples.length} ===\n`);

// Grupo A: Com pelo menos 3 traves (4/5) nos primeiros 15 sorteios
const high4 = samples.filter(s => s.early4 >= 3);
// Grupo B: Com 1 ou 2 traves nos primeiros 15
const med4 = samples.filter(s => s.early4 === 1 || s.early4 === 2);
// Grupo C: Zero traves nos primeiros 15 (apenas 2s, 3s, etc.)
const zero4 = samples.filter(s => s.early4 === 0);

console.log(`1. IMPACTO DA ENTRADA FORTE DE 4s (TRAVES):`);
console.log(`- Ciclos com 3+ traves (4/5) nos primeiros 15 sorteios (N=${high4.length}):`);
console.log(`  Duração média do ciclo até Jackpot: ${(high4.reduce((a,b)=>a+b.cycleLength,0)/high4.length).toFixed(1)} sorteios`);
console.log(`- Ciclos com 1-2 traves nos primeiros 15 sorteios (N=${med4.length}):`);
console.log(`  Duração média do ciclo até Jackpot: ${(med4.reduce((a,b)=>a+b.cycleLength,0)/med4.length).toFixed(1)} sorteios`);
console.log(`- Ciclos com ZERO traves nos primeiros 15 sorteios (só 2s e 3s) (N=${zero4.length}):`);
console.log(`  Duração média do ciclo até Jackpot: ${(zero4.reduce((a,b)=>a+b.cycleLength,0)/zero4.length).toFixed(1)} sorteios`);

console.log(`\n2. DISPERSAO (EXCESSO DE 2s e 1s vs CONVERGENCIA):`);
const highDispersion = samples.filter(s => (s.early2 + s.early1) >= 10); // 10 ou mais dos 15 sorteios foram 1s ou 2s
const lowDispersion = samples.filter(s => (s.early2 + s.early1) <= 6); // Poucos 1s e 2s, muitos 3s e 4s

console.log(`- Ciclos com ALTA DISPERSAO inicial (10+ sorteios com 1 ou 2 acertos, N=${highDispersion.length}):`);
console.log(`  Duração média até Jackpot: ${(highDispersion.reduce((a,b)=>a+b.cycleLength,0)/highDispersion.length).toFixed(1)} sorteios`);
console.log(`- Ciclos com BAIXA DISPERSAO inicial (muitos 3s e 4s, N=${lowDispersion.length}):`);
console.log(`  Duração média até Jackpot: ${(lowDispersion.reduce((a,b)=>a+b.cycleLength,0)/lowDispersion.length).toFixed(1)} sorteios`);
