import fs from "fs";
import path from "path";

const consolidatedDir = path.join(process.cwd(), "data", "consolidated");

interface DrawResult {
  drawId?: number;
  date?: string;
  num_hits_25?: number;
}

// 1. ANÁLISE ESPECÍFICA DO SISTEMA SEPARAÇÃO DAS ÁGUAS
const sepFile = path.join(consolidatedDir, "separacao_aguas_euromillions.json");

if (fs.existsSync(sepFile)) {
  const content: DrawResult[] = JSON.parse(fs.readFileSync(sepFile, "utf-8"));
  console.log(`=== ANÁLISE DO SISTEMA: SEPARAÇÃO DAS ÁGUAS (EUROMILHÕES - ${content.length} SORTEIOS) ===\n`);

  // Identificar todos os índices onde houve 5 (Jackpot Sistema) e onde houve 0 (Jackpot Anti-Sistema)
  const indices5: number[] = [];
  const indices0: number[] = [];
  const indices4: number[] = [];
  const indices1: number[] = [];

  content.forEach((item, idx) => {
    const h = item.num_hits_25 ?? 0;
    if (h === 5) indices5.push(idx);
    else if (h === 0) indices0.push(idx);
    else if (h === 4) indices4.push(idx);
    else if (h === 1) indices1.push(idx);
  });

  console.log(`Total de Jackpots do Sistema (5 acertos): ${indices5.length}`);
  console.log(`Total de Jackpots do Anti-Sistema (0 acertos): ${indices0.length}`);
  console.log(`Total de Traves do Sistema (4 acertos): ${indices4.length}`);
  console.log(`Total de Traves do Anti-Sistema (1 acerto): ${indices1.length}\n`);

  // Padrão 1: Após um 5, o que acontece nos 1, 2, 3 sorteios seguintes?
  let hits0_in_1 = 0;
  let hits0_in_2 = 0;
  let hits0_in_3 = 0;
  let hits0_in_5 = 0;

  let hits1or0_in_3 = 0;

  for (const idx of indices5) {
    // Sorteios seguintes
    const next1 = content[idx + 1]?.num_hits_25;
    const next2 = content[idx + 2]?.num_hits_25;
    const next3 = content[idx + 3]?.num_hits_25;
    const next4 = content[idx + 4]?.num_hits_25;
    const next5 = content[idx + 5]?.num_hits_25;

    const next3Arr = [next1, next2, next3].filter(x => x !== undefined);
    const next5Arr = [next1, next2, next3, next4, next5].filter(x => x !== undefined);

    if (next1 === 0) hits0_in_1++;
    if (next2 === 0) hits0_in_2++;
    if (next3 === 0) hits0_in_3++;
    if (next3Arr.includes(0)) hits0_in_3++; // pelo menos um 0 nos 3 seguintes
    if (next5Arr.includes(0)) hits0_in_5++;
    if (next3Arr.some(h => h === 0 || h === 1)) hits1or0_in_3++;
  }

  console.log(`--- TESTE DA HIPÓTESE: QUANDO SAI 5, SAI 0 NOS 3 SEGUINTES? ---`);
  let countAtLeastOne0In3 = 0;
  let countAtLeastOne0In5 = 0;
  let countAtLeastOne1Or0In3 = 0;

  indices5.forEach(idx => {
    const window3 = [content[idx + 1]?.num_hits_25, content[idx + 2]?.num_hits_25, content[idx + 3]?.num_hits_25];
    const window5 = [content[idx + 1]?.num_hits_25, content[idx + 2]?.num_hits_25, content[idx + 3]?.num_hits_25, content[idx + 4]?.num_hits_25, content[idx + 5]?.num_hits_25];

    if (window3.includes(0)) countAtLeastOne0In3++;
    if (window5.includes(0)) countAtLeastOne0In5++;
    if (window3.includes(0) || window3.includes(1)) countAtLeastOne1Or0In3++;
  });

  const pct0In3 = ((countAtLeastOne0In3 / indices5.length) * 100).toFixed(1);
  const pct0In5 = ((countAtLeastOne0In5 / indices5.length) * 100).toFixed(1);
  const pct1Or0In3 = ((countAtLeastOne1Or0In3 / indices5.length) * 100).toFixed(1);

  console.log(`Jackpots do Sistema analisados: ${indices5.length}`);
  console.log(`- Houve pelo menos um 0 (Jackpot Anti-Sistema) nos 3 sorteios seguintes: ${countAtLeastOne0In3} vezes (${pct0In3}%)`);
  console.log(`- Houve pelo menos um 0 (Jackpot Anti-Sistema) nos 5 sorteios seguintes: ${countAtLeastOne0In5} vezes (${pct0In5}%)`);
  console.log(`- Houve um 0 ou 1 (Alta Convergência Anti-Sistema) nos 3 sorteios seguintes: ${countAtLeastOne1Or0In3} vezes (${pct1Or0In3}%)\n`);

  // Média natural esperada de um 0 em 3 sorteios qualquer:
  // P(0) = 0.025. P(pelo menos um 0 em 3 sorteios aleatórios) = 1 - (1 - 0.025)^3 = 1 - 0.9268 = 7.3%
  console.log(`RÉGUA COMPARATIVA:`);
  console.log(`A probabilidade normal de sair um 0 em 3 sorteios quaisquer é de apenas ~7.3%.`);
  console.log(`Após um 5 no Separação das Águas, a probabilidade sobe para ${pct0In3}%!`);
}

// 2. ANÁLISE MULTI-SISTEMA: PREVISORES DE JACKPOT PERTO OU LONGE
console.log(`\n===============================================================`);
console.log(`=== 2. VALORES E INDICADORES DE "JACKPOT PERTO OU LONGE" ===`);
console.log(`===============================================================\n`);

const allSystems = [
  "monte_carlo_euromillions.json",
  "diagonais_matriz_euromillions.json",
  "clustering_euromillions.json",
  "random_forest_euromillions.json",
  "separacao_aguas_euromillions.json"
];

for (const file of allSystems) {
  const filePath = path.join(consolidatedDir, file);
  if (!fs.existsSync(filePath)) continue;

  const content: DrawResult[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const name = file.replace("_euromillions.json", "");

  const jpIdx: number[] = [];
  content.forEach((item, idx) => {
    if (item.num_hits_25 === 5) jpIdx.push(idx);
  });

  const intervals: number[] = [];
  for (let i = 1; i < jpIdx.length; i++) {
    intervals.push(jpIdx[i] - jpIdx[i - 1]);
  }

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const sorted = [...intervals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];

  // Atraso Atual
  const currentDelay = content.length - (jpIdx[jpIdx.length - 1] ?? 0);

  console.log(`Sistema: ${name}`);
  console.log(`  Total Jackpots: ${jpIdx.length} | Intervalo Médio: ${mean.toFixed(1)} sorteios | Mediana: ${median}`);
  console.log(`  Janela Sweet Spot (50% dos Jackpots): entre o sorteio #${q1} e o #${q3} do ciclo`);
  console.log(`  Atraso Atual: ${currentDelay} sorteios sem Jackpot`);
  if (currentDelay >= q1 && currentDelay <= q3) {
    console.log(`  STATUS: >>> NA JANELA SWEET SPOT DE DISPARO <<<`);
  } else if (currentDelay > q3) {
    console.log(`  STATUS: >>> SOBRECARGA / CICLO PROLONGADO (HIPER-MADURO) <<<`);
  } else {
    console.log(`  STATUS: >>> FASE INICIAL / AQUECIMENTO <<<`);
  }
  console.log(``);
}
