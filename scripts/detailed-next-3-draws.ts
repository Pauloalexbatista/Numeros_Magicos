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
  const content = JSON.parse(fs.readFileSync(sepFile, "utf-8"));
  const targets = draws.map(d => {
    try {
      return typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers;
    } catch {
      return [];
    }
  });

  const hits: number[] = [];
  for (let i = 0; i < content.length; i++) {
    const item = content[i];
    if (item.num_hits_25 !== undefined && item.num_hits_25 !== null) {
      hits.push(item.num_hits_25);
    } else if (item.prediction && targets[i]) {
      const pool = new Set(item.prediction.slice(0, 25));
      let h = 0;
      for (const n of targets[i]) if (pool.has(n)) h++;
      hits.push(h);
    } else {
      hits.push(0);
    }
  }

  const idx5: number[] = [];
  hits.forEach((h, idx) => {
    if (h === 5) idx5.push(idx);
  });

  const n5 = idx5.length;

  console.log(`=== DETALHE SORTEIO A SORTEIO APÓS UM 5 (EUROMILHÕES - N=${n5} JACKPOTS) ===\n`);

  for (let step = 1; step <= 3; step++) {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
    idx5.forEach(i => {
      const val = hits[i + step];
      if (val !== undefined && val in counts) {
        (counts as any)[val]++;
      }
    });

    console.log(`--- SORTEIO t+${step} (${step === 1 ? '1º sorteio a seguir' : step === 2 ? '2º sorteio a seguir' : '3º sorteio a seguir'}):`);
    for (let k = 5; k >= 0; k--) {
      const c = (counts as any)[k];
      const p = ((c / n5) * 100).toFixed(1);
      console.log(`  Acertos ${k}: ${c} vezes (${p}%)`);
    }
    console.log(``);
  }

  // Cumulativo nos 3 sorteios
  let atLeastOne0 = 0;
  let atLeastOne1or0 = 0;
  let atLeastOne5 = 0;
  let atLeastOne4or5 = 0;

  idx5.forEach(i => {
    const w3 = [hits[i + 1], hits[i + 2], hits[i + 3]];
    if (w3.includes(0)) atLeastOne0++;
    if (w3.includes(0) || w3.includes(1)) atLeastOne1or0++;
    if (w3.includes(5)) atLeastOne5++;
    if (w3.includes(5) || w3.includes(4)) atLeastOne4or5++;
  });

  console.log(`--- CUMULATIVO NA JANELA DOS 3 SORTEIOS (W3):`);
  console.log(`  Pelo menos um 0 (Jackpot Anti-Sistema): ${atLeastOne0} vezes (${((atLeastOne0/n5)*100).toFixed(1)}%)`);
  console.log(`  Pelo menos um 0 ou 1 (Alta Convergência Anti-Sistema): ${atLeastOne1or0} vezes (${((atLeastOne1or0/n5)*100).toFixed(1)}%)`);
  console.log(`  Pelo menos um 5 (Repetição de Jackpot do Sistema): ${atLeastOne5} vezes (${((atLeastOne5/n5)*100).toFixed(1)}%)`);
  console.log(`  Pelo menos um 5 ou 4 (Alta Convergência do Sistema): ${atLeastOne4or5} vezes (${((atLeastOne4or5/n5)*100).toFixed(1)}%)`);
}

main().finally(() => prisma.$disconnect());
