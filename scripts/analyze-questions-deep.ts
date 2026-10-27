import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const consolidatedDir = path.join(process.cwd(), "data", "consolidated");

async function main() {
  console.log("=== PERGUNTA 1: EFEITO PÊNDULO NO TOTOLOTO (SEPARAÇÃO DAS ÁGUAS) ===");
  // Totoloto analysis
  const totolotoDraws = await prisma.draw.findMany({
    where: { game: "TOTOLOTO" },
    orderBy: { date: "asc" }
  });
  const totolotoTargets = totolotoDraws.map(d => {
    try { return typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers; } catch { return []; }
  });

  const sepTotolotoFile = path.join(consolidatedDir, "separacao_aguas_totoloto.json");
  const sepTotolotoContent = JSON.parse(fs.readFileSync(sepTotolotoFile, "utf-8"));

  const totolotoHits: number[] = [];
  for (let i = 0; i < sepTotolotoContent.length; i++) {
    const item = sepTotolotoContent[i];
    if (item.num_hits_25 !== undefined && item.num_hits_25 !== null) {
      totolotoHits.push(item.num_hits_25);
    } else if (item.prediction && totolotoTargets[i]) {
      const pool = new Set(item.prediction.slice(0, 25));
      let h = 0;
      for (const n of totolotoTargets[i]) if (pool.has(n)) h++;
      totolotoHits.push(h);
    } else {
      totolotoHits.push(0);
    }
  }

  const idx5_totoloto: number[] = [];
  const idx0_totoloto: number[] = [];
  totolotoHits.forEach((h, idx) => {
    if (h === 5) idx5_totoloto.push(idx);
    if (h === 0) idx0_totoloto.push(idx);
  });

  // What happens in Totoloto after a 5?
  let totoloto_5_to_0_in_3 = 0;
  let totoloto_5_to_0or1_in_3 = 0;
  let totoloto_5_to_5_in_3 = 0;
  let totoloto_5_to_4or5_in_3 = 0;

  idx5_totoloto.forEach(i => {
    const w3 = [totolotoHits[i + 1], totolotoHits[i + 2], totolotoHits[i + 3]];
    if (w3.includes(0)) totoloto_5_to_0_in_3++;
    if (w3.some(h => h === 0 || h === 1)) totoloto_5_to_0or1_in_3++;
    if (w3.includes(5)) totoloto_5_to_5_in_3++;
    if (w3.some(h => h === 4 || h === 5)) totoloto_5_to_4or5_in_3++;
  });

  console.log(`Totoloto Jackpots (5 acertos): ${idx5_totoloto.length}`);
  console.log(`Após um 5 no Totoloto:`);
  console.log(`  - Saiu 0 nos 3 seguintes: ${totoloto_5_to_0_in_3} vezes (${((totoloto_5_to_0_in_3/idx5_totoloto.length)*100).toFixed(1)}%) [Normal pura: 8.1%]`);
  console.log(`  - Saiu 0 ou 1 (Anti-Sistema forte) nos 3 seguintes: ${totoloto_5_to_0or1_in_3} vezes (${((totoloto_5_to_0or1_in_3/idx5_totoloto.length)*100).toFixed(1)}%)`);
  console.log(`  - Repetiu 5 nos 3 seguintes: ${totoloto_5_to_5_in_3} vezes (${((totoloto_5_to_5_in_3/idx5_totoloto.length)*100).toFixed(1)}%)`);
  console.log(`  - Saiu 4 ou 5 (Sistema forte) nos 3 seguintes: ${totoloto_5_to_4or5_in_3} vezes (${((totoloto_5_to_4or5_in_3/idx5_totoloto.length)*100).toFixed(1)}%)`);

  // What happens in Totoloto after a 0?
  let totoloto_0_to_5_in_3 = 0;
  let totoloto_0_to_4or5_in_3 = 0;
  idx0_totoloto.forEach(i => {
    const w3 = [totolotoHits[i + 1], totolotoHits[i + 2], totolotoHits[i + 3]];
    if (w3.includes(5)) totoloto_0_to_5_in_3++;
    if (w3.some(h => h === 4 || h === 5)) totoloto_0_to_4or5_in_3++;
  });

  console.log(`\nE o Inverso após um 0 no Totoloto (N=${idx0_totoloto.length}):`);
  console.log(`  - Saiu 5 nos 3 seguintes: ${totoloto_0_to_5_in_3} vezes (${((totoloto_0_to_5_in_3/idx0_totoloto.length)*100).toFixed(1)}%) [Normal pura: 8.1%]`);
  console.log(`  - Saiu 4 ou 5 (Sistema forte) nos 3 seguintes: ${totoloto_0_to_4or5_in_3} vezes (${((totoloto_0_to_4or5_in_3/idx0_totoloto.length)*100).toFixed(1)}%)!`);


  console.log("\n=========================================================================");
  console.log("=== PERGUNTA 2: EVOLUÇÃO TEMPORAL DO SISTEMA TIRO CERTEIRO ===");
  console.log("=========================================================================");

  // Tiro Certeiro analysis in Euromillions and Totoloto over time
  for (const game of ["EUROMILLIONS", "TOTOLOTO"]) {
    const draws = await prisma.draw.findMany({
      where: { game },
      orderBy: { date: "asc" }
    });
    const targets = draws.map(d => {
      try { return typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers; } catch { return []; }
    });

    const file = game === "EUROMILLIONS" ? "tiro_certeiro_euromillions.json" : "tiro_certeiro_totoloto.json";
    const filePath = path.join(consolidatedDir, file);
    if (!fs.existsSync(filePath)) continue;

    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const hits: { drawIndex: number; date: string; hits: number }[] = [];

    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      let h = 0;
      if (item.num_hits_25 !== undefined && item.num_hits_25 !== null) {
        h = item.num_hits_25;
      } else if (item.prediction && targets[i]) {
        const pool = new Set(item.prediction.slice(0, 25));
        for (const n of targets[i]) if (pool.has(n)) h++;
      }
      const dDate = draws[i]?.date ? draws[i].date.toISOString().slice(0, 10) : `draw-${i+1}`;
      hits.push({ drawIndex: i + 1, date: dDate, hits: h });
    }

    console.log(`\n--- ANÁLISE TEMPORAL DO TIRO CERTEIRO EM ${game} (Total: ${hits.length} sorteios) ---`);
    
    // Split into 4 chronological eras of equal draws
    const chunkSize = Math.floor(hits.length / 4);
    for (let era = 0; era < 4; era++) {
      const start = era * chunkSize;
      const end = (era === 3) ? hits.length : (era + 1) * chunkSize;
      const eraSlice = hits.slice(start, end);

      const jps = eraSlice.filter(x => x.hits === 5).length;
      const traves = eraSlice.filter(x => x.hits === 4).length;
      const threes = eraSlice.filter(x => x.hits === 3).length;
      const zeros = eraSlice.filter(x => x.hits === 0).length;

      const startDate = eraSlice[0].date;
      const endDate = eraSlice[eraSlice.length - 1].date;
      const duration = eraSlice.length;
      const rateJp = (duration / (jps || 1)).toFixed(1);

      console.log(`Era ${era + 1} [Sorteios #${start + 1} a #${end} | ${startDate} a ${endDate}]:`);
      console.log(`  Jackpots (5): ${jps} (1 a cada ${rateJp} sorteios) | Traves (4): ${traves} (${((traves/duration)*100).toFixed(1)}%) | 3s: ${threes} | 0s: ${zeros}`);
    }

    // Let's also check the most recent 100 and 200 draws!
    const last100 = hits.slice(-100);
    const last200 = hits.slice(-200);

    const jpLast100 = last100.filter(x => x.hits === 5).length;
    const traveLast100 = last100.filter(x => x.hits === 4).length;

    const jpLast200 = last200.filter(x => x.hits === 5).length;
    const traveLast200 = last200.filter(x => x.hits === 4).length;

    console.log(`\n  Fase Mais Recente (Últimos 200 sorteios): ${jpLast200} Jackpots (1 a cada ${(200/(jpLast200||1)).toFixed(1)} sorteios), ${traveLast200} Traves`);
    console.log(`  Fase Hiper-Recente (Últimos 100 sorteios): ${jpLast100} Jackpots (1 a cada ${(100/(jpLast100||1)).toFixed(1)} sorteios), ${traveLast100} Traves`);
  }
}

main().finally(() => prisma.$disconnect());
