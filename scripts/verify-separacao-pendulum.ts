import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const draws = await prisma.draw.findMany({
    where: { game: "EUROMILLIONS" },
    orderBy: { date: "asc" }
  });

  const sepFile = path.join(process.cwd(), "data", "consolidated", "separacao_aguas_euromillions.json");
  if (!fs.existsSync(sepFile)) {
    console.log("File not found");
    return;
  }

  const content = JSON.parse(fs.readFileSync(sepFile, "utf-8"));

  const officialTargets = draws.map(d => {
    let nums: number[] = [];
    try {
      nums = typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers;
    } catch {
      nums = [];
    }
    return nums;
  });

  const hitsHistory: number[] = [];

  for (let i = 0; i < content.length; i++) {
    const item = content[i];
    if (item.num_hits_25 !== undefined && item.num_hits_25 !== null) {
      hitsHistory.push(item.num_hits_25);
    } else if (item.prediction && officialTargets[i]) {
      const pred = Array.isArray(item.prediction) ? item.prediction : [];
      const pool = new Set(pred.slice(0, 25));
      let h = 0;
      for (const n of officialTargets[i]) {
        if (pool.has(n)) h++;
      }
      hitsHistory.push(h);
    } else {
      hitsHistory.push(0);
    }
  }

  console.log(`Total sorteios processados para Separação das Águas: ${hitsHistory.length}`);
  
  // Count 5s and 0s
  const idx5: number[] = [];
  const idx0: number[] = [];
  hitsHistory.forEach((h, idx) => {
    if (h === 5) idx5.push(idx);
    if (h === 0) idx0.push(idx);
  });

  console.log(`Total de 5s (Jackpot Sistema): ${idx5.length}`);
  console.log(`Total de 0s (Jackpot Anti-Sistema): ${idx0.length}`);

  // Test the user's observation:
  // "Cada vez que há um 5 no sistema, nos 3 seguintes sorteios há um 0 - ou seja o anti-sistema tem um 5"
  let follow0In1 = 0;
  let follow0In2 = 0;
  let follow0In3 = 0;
  let follow0In5 = 0;

  let follow1Or0In3 = 0;

  idx5.forEach(i => {
    const w1 = hitsHistory[i + 1];
    const w2 = hitsHistory[i + 2];
    const w3 = hitsHistory[i + 3];
    const w4 = hitsHistory[i + 4];
    const w5 = hitsHistory[i + 5];

    if (w1 === 0) follow0In1++;
    if (w2 === 0) follow0In2++;
    if (w3 === 0) follow0In3++;

    const in3 = [w1, w2, w3];
    const in5 = [w1, w2, w3, w4, w5];

    if (in3.includes(0)) follow0In3++;
    if (in5.includes(0)) follow0In5++;
    if (in3.some(h => h === 0 || h === 1)) follow1Or0In3++;
  });

  console.log(`\n=== RESULTADO DO TESTE DE IMPACTO PÓS-5 (REBOTE / EFEITO PÊNDULO) ===`);
  console.log(`De ${idx5.length} vezes que ocorreu um 5 (Jackpot Sistema):`);
  console.log(`- Saiu um 0 exatamente no 1º sorteio seguinte: ${follow0In1} vezes (${((follow0In1/idx5.length)*100).toFixed(1)}%)`);
  console.log(`- Saiu um 0 nos 3 sorteios seguintes: ${follow0In3} vezes (${((follow0In3/idx5.length)*100).toFixed(1)}%)`);
  console.log(`- Saiu um 0 ou 1 (Alta Convergência do Anti-Sistema) nos 3 seguintes: ${follow1Or0In3} vezes (${((follow1Or0In3/idx5.length)*100).toFixed(1)}%)`);

  // E o inverso? Quando sai um 0, nos 3 seguintes sai um 5?
  let follow5From0In3 = 0;
  idx0.forEach(i => {
    const in3 = [hitsHistory[i + 1], hitsHistory[i + 2], hitsHistory[i + 3]];
    if (in3.includes(5)) follow5From0In3++;
  });
  console.log(`- E o inverso? Quando saiu um 0, saiu um 5 nos 3 seguintes: ${follow5From0In3} vezes (${((follow5From0In3/idx0.length)*100).toFixed(1)}%)`);

  // Let's print out the exact occurrences where 5 happened and what followed!
  console.log(`\nExemplos de sequências após 5 (Sorteio # -> [próximos 5 resultados]):`);
  idx5.slice(-10).forEach(i => {
    const nextSeq = hitsHistory.slice(i, i + 6);
    console.log(`  Sorteio #${i + 1}: ${nextSeq.map((h, k) => k === 0 ? `[★ 5]` : `${h}`).join(' -> ')}`);
  });
}

main().finally(() => prisma.$disconnect());
