import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const draws = await prisma.draw.findMany({ where: { game: "TOTOLOTO" }, orderBy: { date: "asc" } });
  const file = path.join(process.cwd(), "data", "consolidated", "separacao_aguas_totoloto.json");
  const content = JSON.parse(fs.readFileSync(file, "utf-8"));

  const hits: { idx: number; date: string; hits: number }[] = [];
  for (let i = 0; i < content.length; i++) {
    const item = content[i];
    let h = 0;
    if (item.num_hits_25 !== undefined && item.num_hits_25 !== null) {
      h = item.num_hits_25;
    } else if (item.prediction && draws[i]) {
      let targets: number[] = [];
      try { targets = typeof draws[i].numbers === "string" ? JSON.parse(draws[i].numbers) : draws[i].numbers; } catch { targets = []; }
      const pool = new Set(item.prediction.slice(0, 25));
      for (const n of targets) if (pool.has(n)) h++;
    }
    const d = draws[i]?.date ? draws[i].date.toISOString().slice(0, 10) : "n/a";
    hits.push({ idx: i + 1, date: d, hits: h });
  }

  const zeros = hits.filter(x => x.hits === 0);
  const fives = hits.filter(x => x.hits === 5);
  const traves = hits.filter(x => x.hits === 4);

  console.log("Últimos 3 ZEROS no Totoloto para Separação das Águas:");
  zeros.slice(-3).forEach(z => console.log(`  Sorteio #${z.idx} | Data: ${z.date} | Hits: ${z.hits}`));

  console.log("\nÚltimos 3 JACKPOTS (5/5) no Totoloto para Separação das Águas:");
  fives.slice(-3).forEach(f => console.log(`  Sorteio #${f.idx} | Data: ${f.date} | Hits: ${f.hits}`));

  console.log(`\nSorteios totais: ${hits.length}`);
  console.log(`Atraso atual de ZERO (Anti-Jackpot): ${hits.length - zeros[zeros.length - 1].idx} sorteios (desde ${zeros[zeros.length - 1].date})`);
  console.log(`Atraso atual de JACKPOT (5/5): ${hits.length - fives[fives.length - 1].idx} sorteios (desde ${fives[fives.length - 1].date})`);

  console.log("\nÚltimas 6 traves (4/5) recentes no ciclo atual:");
  traves.slice(-6).forEach(t => console.log(`  Sorteio #${t.idx} | Data: ${t.date} | Hits: ${t.hits}`));
}

main().finally(() => prisma.$disconnect());
