import { PrismaClient, Draw } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { SistemaAntigravityHarmonia } from '../src/services/custom/SistemaAntigravityHarmonia';

const prisma = new PrismaClient();
const system = new SistemaAntigravityHarmonia();

const GAMES = [
  { game: 'TOTOLOTO', slug: 'totoloto', maxNum: 49, winningCount: 5 },
  { game: 'EUROMILLIONS', slug: 'euromillions', maxNum: 50, winningCount: 5 },
  { game: 'EURODREAMS', slug: 'eurodreams', maxNum: 40, winningCount: 6 },
  { game: 'MEGASENA', slug: 'megasena', maxNum: 60, winningCount: 6 }
];

async function generateConsolidatedForGame(g: typeof GAMES[0]) {
  console.log(`\n⏳ A processar ${g.game} para ${system.name}...`);
  const rawDraws = await prisma.draw.findMany({
    where: { game: g.game },
    orderBy: { date: 'asc' }
  });

  console.log(`Encontrados ${rawDraws.length} sorteios.`);
  if (rawDraws.length === 0) return;

  const outDir = path.join(process.cwd(), 'data', 'consolidated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const consolidatedRecords: any[] = [];

  for (let i = 0; i < rawDraws.length; i++) {
    const currentDraw = rawDraws[i];
    // Sorteios estritamente anteriores (do mais recente i-1 até 0)
    const history = rawDraws.slice(0, i).reverse();

    let actualNums: number[] = [];
    if (typeof currentDraw.numbers === 'string') {
      try { actualNums = JSON.parse(currentDraw.numbers); } catch { actualNums = []; }
    } else if (Array.isArray(currentDraw.numbers)) {
      actualNums = currentDraw.numbers as unknown as number[];
    }

    // Gerar pool completo (returnFullPool = true)
    const fullPrediction = await system.generateTop10(history, true);

    const hitsAt = (cutoff: number) => {
      const topSlice = new Set(fullPrediction.slice(0, cutoff));
      return actualNums.filter(n => topSlice.has(n)).length;
    };

    consolidatedRecords.push({
      drawId: currentDraw.id,
      prediction: JSON.stringify(fullPrediction),
      cutoff: g.maxNum,
      num_hits_5: hitsAt(5),
      num_hits_10: hitsAt(10),
      num_hits_15: hitsAt(15),
      num_hits_20: hitsAt(20),
      num_hits_25: hitsAt(25),
      num_hits_30: hitsAt(30),
      num_hits_35: hitsAt(35),
      num_hits_40: hitsAt(40),
      num_hits_45: hitsAt(45),
      num_hits_50: hitsAt(50),
      num_hits_55: hitsAt(55),
      num_hits_60: hitsAt(60),
      draw: {
        date: currentDraw.date.toISOString(),
        numbers: JSON.stringify(actualNums)
      }
    });

    if ((i + 1) % 300 === 0 || i === rawDraws.length - 1) {
      process.stdout.write(`\r  Processados ${i + 1}/${rawDraws.length} sorteios...`);
    }
  }

  const outFile = path.join(outDir, `harmonia_antigravity_${g.slug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(consolidatedRecords, null, 2), 'utf-8');
  console.log(`\n✅ Gravado com sucesso: ${outFile} (${consolidatedRecords.length} registos)`);
}

async function main() {
  for (const g of GAMES) {
    await generateConsolidatedForGame(g);
  }
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
});
