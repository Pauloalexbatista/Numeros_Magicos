import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const gamesConfig = [
  { game: "EUROMILLIONS", file: "separacao_aguas_euromillions.json", pool: 25, maxHits: 5 },
  { game: "TOTOLOTO", file: "separacao_aguas_totoloto.json", pool: 25, maxHits: 5 },
  { game: "EURODREAMS", file: "separacao_aguas_eurodreams.json", pool: 20, maxHits: 6 },
  { game: "MEGASENA", file: "separacao_aguas_megasena.json", pool: 30, maxHits: 6 },
  { game: "LOTOFACIL", file: "separacao_aguas_lotofacil.json", pool: 20, maxHits: 15 }
];

async function analyzeGame(cfg: typeof gamesConfig[0]) {
  const draws = await prisma.draw.findMany({
    where: { game: cfg.game },
    orderBy: { date: "asc" }
  });

  const filePath = path.join(process.cwd(), "data", "consolidated", cfg.file);
  if (!fs.existsSync(filePath)) {
    console.log(`[${cfg.game}] Ficheiro ${cfg.file} não encontrado.`);
    return null;
  }

  const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const officialTargets = draws.map(d => {
    let nums: number[] = [];
    try {
      nums = typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers;
    } catch {
      nums = [];
    }
    return nums;
  });

  const hitColName = (cfg.game === "EURODREAMS" || cfg.game === "LOTOFACIL")
    ? "num_hits_20"
    : cfg.game === "MEGASENA"
    ? "num_hits_30"
    : "num_hits_25";

  const hitsHistory: number[] = [];
  for (let i = 0; i < content.length; i++) {
    const item = content[i];
    if (item[hitColName] !== undefined && item[hitColName] !== null) {
      hitsHistory.push(item[hitColName]);
    } else if (item.prediction && officialTargets[i]) {
      const pred = Array.isArray(item.prediction) ? item.prediction : [];
      const pool = new Set(pred.slice(0, cfg.pool));
      let h = 0;
      for (const n of officialTargets[i]) {
        if (pool.has(n)) h++;
      }
      hitsHistory.push(h);
    } else {
      hitsHistory.push(0);
    }
  }

  const maxH = cfg.maxHits;
  const idxMax: number[] = [];
  const idxZero: number[] = [];

  hitsHistory.forEach((h, idx) => {
    if (h === maxH) idxMax.push(idx);
    if (h === 0) idxZero.push(idx);
  });

  // A. Padrão: MaxHits -> Zero nos 3 seguintes
  let maxToZeroIn1 = 0;
  let maxToZeroIn3 = 0;
  let maxToZeroOrOneIn3 = 0;

  idxMax.forEach(i => {
    const w1 = hitsHistory[i + 1];
    const in3 = [hitsHistory[i + 1], hitsHistory[i + 2], hitsHistory[i + 3]];
    if (w1 === 0) maxToZeroIn1++;
    if (in3.includes(0)) maxToZeroIn3++;
    if (in3.some(h => h === 0 || h === 1)) maxToZeroOrOneIn3++;
  });

  // B. Padrão Inverso: Zero -> MaxHits nos 3 seguintes
  let zeroToMaxIn1 = 0;
  let zeroToMaxIn3 = 0;
  let zeroToMaxOrTraveIn3 = 0;

  idxZero.forEach(i => {
    const w1 = hitsHistory[i + 1];
    const in3 = [hitsHistory[i + 1], hitsHistory[i + 2], hitsHistory[i + 3]];
    if (w1 === maxH) zeroToMaxIn1++;
    if (in3.includes(maxH)) zeroToMaxIn3++;
    if (in3.some(h => h === maxH || h === maxH - 1)) zeroToMaxOrTraveIn3++;
  });

  return {
    game: cfg.game,
    totalDraws: hitsHistory.length,
    maxHits: maxH,
    totalMax: idxMax.length,
    totalZero: idxZero.length,
    maxToZeroIn1,
    maxToZeroIn3,
    maxToZeroOrOneIn3,
    zeroToMaxIn1,
    zeroToMaxIn3,
    zeroToMaxOrTraveIn3,
    idxMax,
    idxZero,
    hitsHistory
  };
}

async function run() {
  console.log("=== COMPARAÇÃO MULTI-JOGO: O EFEITO PÊNDULO NO SEPARAÇÃO DAS ÁGUAS ===\n");

  for (const cfg of gamesConfig) {
    const res = await analyzeGame(cfg);
    if (!res) continue;

    console.log(`-------------------------------------------------------------------`);
    console.log(`JOGO: ${res.game} (Total Sorteios: ${res.totalDraws}, Magnitude Máxima: ${res.maxHits})`);
    console.log(`  Jackpots do Sistema (${res.maxHits} acertos): ${res.totalMax}`);
    console.log(`  Jackpots do Anti-Sistema (0 acertos): ${res.totalZero}`);

    if (res.totalMax > 0) {
      console.log(`\n  [PADRÃO: SISTEMA ${res.maxHits} -> ANTI-SISTEMA 0]`);
      console.log(`  - Saiu 0 logo no 1º sorteio seguinte: ${res.maxToZeroIn1} vezes (${((res.maxToZeroIn1 / res.totalMax) * 100).toFixed(1)}%)`);
      console.log(`  - Saiu 0 nos 3 sorteios seguintes: ${res.maxToZeroIn3} vezes (${((res.maxToZeroIn3 / res.totalMax) * 100).toFixed(1)}%)`);
      console.log(`  - Saiu 0 ou 1 nos 3 sorteios seguintes: ${res.maxToZeroOrOneIn3} vezes (${((res.maxToZeroOrOneIn3 / res.totalMax) * 100).toFixed(1)}%)`);
    } else {
      console.log(`  Sem jackpots de ${res.maxHits} no histórico para analisar.`);
    }

    if (res.totalZero > 0) {
      console.log(`\n  [PADRÃO INVERSO: ANTI-SISTEMA 0 -> SISTEMA ${res.maxHits}]`);
      console.log(`  - Saiu ${res.maxHits} logo no 1º sorteio seguinte: ${res.zeroToMaxIn1} vezes (${((res.zeroToMaxIn1 / res.totalZero) * 100).toFixed(1)}%)`);
      console.log(`  - Saiu ${res.maxHits} nos 3 sorteios seguintes: ${res.zeroToMaxIn3} vezes (${((res.zeroToMaxIn3 / res.totalZero) * 100).toFixed(1)}%)`);
      console.log(`  - Saiu ${res.maxHits} ou ${res.maxHits - 1} nos 3 seguintes: ${res.zeroToMaxOrTraveIn3} vezes (${((res.zeroToMaxOrTraveIn3 / res.totalZero) * 100).toFixed(1)}%)`);
    }

    // Exemplos concretos
    if (res.game === "TOTOLOTO") {
      console.log(`\n  DETALHES CONCRETOS DO TOTOLOTO:`);
      res.idxMax.forEach(i => {
        const next3 = [res.hitsHistory[i+1], res.hitsHistory[i+2], res.hitsHistory[i+3]];
        console.log(`    Sorteio #${i+1}: deu [5] -> próximos 3: [${next3.join(', ')}] ${next3.includes(0) ? '🎯 (DEU 0!)' : ''}`);
      });
      console.log(`\n  Quando deu 0 no TOTOLOTO -> próximos 3:`);
      res.idxZero.forEach(i => {
        const next3 = [res.hitsHistory[i+1], res.hitsHistory[i+2], res.hitsHistory[i+3]];
        if (next3.includes(res.maxHits) || next3.includes(res.maxHits - 1)) {
          console.log(`    Sorteio #${i+1}: deu [0] -> próximos 3: [${next3.join(', ')}] ${next3.includes(res.maxHits) ? '🏆 (DEU 5!)' : '⚡ (DEU 4!)'}`);
        }
      });
    }

    console.log(`\n`);
  }
}

run().finally(() => prisma.$disconnect());
