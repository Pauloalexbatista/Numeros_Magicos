import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function checkTransitions() {
  const draws = await prisma.draw.findMany({
    where: { game: "EUROMILLIONS" },
    orderBy: { date: "asc" }
  });
  const file = path.join(process.cwd(), "data", "consolidated", "separacao_aguas_euromillions.json");
  const content = JSON.parse(fs.readFileSync(file, "utf-8"));
  const targets = draws.map(d => {
    try { return typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers; } catch { return []; }
  });

  const hits: number[] = [];
  for (let i = 0; i < content.length; i++) {
    const item = content[i];
    if (item.num_hits_25 !== undefined && item.num_hits_25 !== null) hits.push(item.num_hits_25);
    else if (item.prediction && targets[i]) {
      const pool = new Set(item.prediction.slice(0, 25));
      let h = 0;
      for (const n of targets[i]) if (pool.has(n)) h++;
      hits.push(h);
    } else hits.push(0);
  }

  console.log("=== ANÁLISE DE TRANSIÇÃO DE TODOS OS ESTADOS NO SEPARAÇÃO DAS ÁGUAS ===");
  for (let state = 5; state >= 0; state--) {
    const occurrences: number[] = [];
    hits.forEach((h, idx) => { if (h === state && idx < hits.length - 3) occurrences.push(idx); });

    let count0In3 = 0;
    let count1In3 = 0;
    let count4In3 = 0;
    let count5In3 = 0;

    occurrences.forEach(idx => {
      const w3 = [hits[idx + 1], hits[idx + 2], hits[idx + 3]];
      if (w3.includes(0)) count0In3++;
      if (w3.includes(1)) count1In3++;
      if (w3.includes(4)) count4In3++;
      if (w3.includes(5)) count5In3++;
    });

    console.log(`Quando sai [${state}] (N=${occurrences.length}):`);
    console.log(`  -> Dá 0 nos 3 seguintes: ${count0In3} (${((count0In3 / occurrences.length) * 100).toFixed(1)}%)`);
    console.log(`  -> Dá 0 ou 1 (Anti-Sistema forte) nos 3 seguintes: ${occurrences.filter(i => [hits[i+1], hits[i+2], hits[i+3]].some(h => h === 0 || h === 1)).length} (${((occurrences.filter(i => [hits[i+1], hits[i+2], hits[i+3]].some(h => h === 0 || h === 1)).length / occurrences.length) * 100).toFixed(1)}%)`);
    console.log(`  -> Dá 5 nos 3 seguintes: ${count5In3} (${((count5In3 / occurrences.length) * 100).toFixed(1)}%)`);
    console.log(`  -> Dá 4 ou 5 (Sistema forte) nos 3 seguintes: ${occurrences.filter(i => [hits[i+1], hits[i+2], hits[i+3]].some(h => h === 4 || h === 5)).length} (${((occurrences.filter(i => [hits[i+1], hits[i+2], hits[i+3]].some(h => h === 4 || h === 5)).length / occurrences.length) * 100).toFixed(1)}%)`);
    console.log("");
  }
}

checkTransitions().finally(() => prisma.$disconnect());
