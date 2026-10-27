import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const games = ["EUROMILLIONS", "TOTOLOTO"];

  for (const game of games) {
    const draws = await prisma.draw.findMany({
      where: { game },
      orderBy: { date: "asc" }
    });

    const file = game === "EUROMILLIONS" ? "separacao_aguas_euromillions.json" : "separacao_aguas_totoloto.json";
    const filePath = path.join(process.cwd(), "data", "consolidated", file);
    if (!fs.existsSync(filePath)) continue;

    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
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

    const t1Counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const in3Counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let n5 = 0;

    for (let i = 0; i < hits.length - 3; i++) {
      if (hits[i] === 5) {
        n5++;
        const next1 = hits[i + 1];
        (t1Counts as any)[next1]++;

        const next3 = [hits[i + 1], hits[i + 2], hits[i + 3]];
        for (let k = 0; k <= 5; k++) {
          if (next3.includes(k)) (in3Counts as any)[k]++;
        }
      }
    }

    console.log(`=== JOGO: ${game} (N=${n5} Jackpots analisados) ===`);
    console.log(`Distribuição NO SORTEIO IMEDIATAMENTE A SEGUIR (t+1):`);
    for (let k = 5; k >= 0; k--) {
      const cnt = (t1Counts as any)[k];
      const pct = ((cnt / n5) * 100).toFixed(1);
      console.log(`  Acertos ${k}: ${cnt} vezes (${pct}%)`);
    }

    console.log(`\nDistribuição de presença NOS 3 SORTEIOS SEGUINTES (janela t+1 a t+3):`);
    for (let k = 5; k >= 0; k--) {
      const cnt = (in3Counts as any)[k];
      const pct = ((cnt / n5) * 100).toFixed(1);
      console.log(`  Pelo menos um acerto de ${k}: ${cnt} vezes (${pct}%)`);
    }
    console.log(`\n`);
  }
}

main().finally(() => prisma.$disconnect());
