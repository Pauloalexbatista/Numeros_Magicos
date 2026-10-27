import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const consolidatedDir = path.join(process.cwd(), "data", "consolidated");

const games = [
  { id: "EUROMILLIONS", name: "Euromilhões", pool: 25, maxHits: 5 },
  { id: "TOTOLOTO", name: "Totoloto", pool: 25, maxHits: 5 },
  { id: "EURODREAMS", name: "EuroDreams", pool: 20, maxHits: 6 },
  { id: "MEGASENA", name: "Mega-Sena", pool: 30, maxHits: 6 }
];

interface SystemExtremeStats {
  systemSlug: string;
  systemName: string;
  totalDraws: number;
  jackpots: number; // maxHits
  zeros: number; // 0 hits
  totalPolar: number; // jackpots + zeros
  pctPolar: number;
  traves: number; // maxHits - 1
  travesAnti: number; // 1 hit
}

async function run() {
  for (const g of games) {
    console.log(`\n========================================================================`);
    console.log(`=== JOGO: ${g.name} (${g.id}) | Pool: ${g.pool} | Max Hits: ${g.maxHits} ===`);
    console.log(`========================================================================`);

    const draws = await prisma.draw.findMany({
      where: { game: g.id },
      orderBy: { date: "asc" }
    });

    const targets = draws.map(d => {
      try {
        return typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers;
      } catch {
        return [];
      }
    });

    const gameSlug = g.id.toLowerCase();
    const files = fs.readdirSync(consolidatedDir).filter(f =>
      f.endsWith(`_${gameSlug}.json`) && !f.includes("_stars_")
    );

    const hitColName = (g.id === "EURODREAMS" || g.id === "LOTOFACIL")
      ? "num_hits_20"
      : g.id === "MEGASENA"
      ? "num_hits_30"
      : "num_hits_25";

    const results: SystemExtremeStats[] = [];

    for (const file of files) {
      const slug = file.replace(`_${gameSlug}.json`, "");
      const filePath = path.join(consolidatedDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      let jackpots = 0;
      let zeros = 0;
      let traves = 0;
      let travesAnti = 0;
      let totalCount = 0;

      for (let i = 0; i < content.length; i++) {
        const item = content[i];
        let h = 0;
        if (item[hitColName] !== undefined && item[hitColName] !== null) {
          h = item[hitColName];
        } else if (item.prediction && targets[i]) {
          const pool = new Set(item.prediction.slice(0, g.pool));
          for (const n of targets[i]) if (pool.has(n)) h++;
        }
        totalCount++;

        if (h === g.maxHits) jackpots++;
        else if (h === 0) zeros++;
        else if (h === g.maxHits - 1) traves++;
        else if (h === 1) travesAnti++;
      }

      if (totalCount === 0) continue;

      const totalPolar = jackpots + zeros;
      const pctPolar = Math.round((totalPolar / totalCount) * 1000) / 10;

      results.push({
        systemSlug: slug,
        systemName: slug,
        totalDraws: totalCount,
        jackpots,
        zeros,
        totalPolar,
        pctPolar,
        traves,
        travesAnti
      });
    }

    // 1. Ordenar por Extremos Totais (Jackpots + Zeros)
    results.sort((a, b) => b.totalPolar - a.totalPolar);

    console.log(`\n--- RANKING POR EXTREMOS TOTAIS (JACKPOTS + ZEROS) ---`);
    results.slice(0, 10).forEach((r, idx) => {
      console.log(
        `#${String(idx + 1).padStart(2)} ${r.systemSlug.padEnd(25)} | Polar (Jackpots + 0s): ${String(r.totalPolar).padStart(3)} (${r.pctPolar}%) | Jackpots: ${String(r.jackpots).padStart(2)} | Zeros: ${String(r.zeros).padStart(2)} | Traves: ${String(r.traves).padStart(3)}`
      );
    });

    // 2. Quem tem mais Jackpots isolados?
    const mostJackpots = [...results].sort((a, b) => b.jackpots - a.jackpots)[0];
    // 3. Quem tem mais Zeros isolados?
    const mostZeros = [...results].sort((a, b) => b.zeros - a.zeros)[0];

    console.log(`\nDESTAQUES DE ${g.name}:`);
    console.log(`  🏆 Mais Jackpots: ${mostJackpots?.systemSlug} (${mostJackpots?.jackpots} jackpots)`);
    console.log(`  🔮 Mais Zeros (Anti-Jackpot): ${mostZeros?.systemSlug} (${mostZeros?.zeros} zeros)`);
    console.log(`  ⚡ Mais Polarizado Global (Jacks + 0s): ${results[0]?.systemSlug} (${results[0]?.totalPolar} eventos extremos, ${results[0]?.pctPolar}% dos sorteios)`);
  }
}

run().finally(() => prisma.$disconnect());
