import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const consolidatedDir = path.join(process.cwd(), 'data', 'consolidated');

const ENSEMBLE_CONFIG = [
  { slug: 'clustering', dbName: 'Agrupamento de Padrões (Clustering)', polarity: 'ESPELHO' },
  { slug: 'ultimos_a_sair', dbName: 'Últimos a Sair', polarity: 'DIRETO' },
  { slug: 'mais_quentes', dbName: 'Mais Quentes', polarity: 'DIRETO' },
  { slug: 'piramide_pascal', dbName: 'Pirâmide de Pascal', polarity: 'ESPELHO' },
  { slug: 'tiro_certeiro', dbName: 'Tiro Certeiro', polarity: 'DIRETO' }
];

async function rebuildFullGame(game: string, slug: string, totalBalls: number, pickCount: number, winningBalls: number) {
  console.log(`\n======================================================`);
  console.log(`Reconstrução Completa 100% de Separação das Águas 2.0: ${game}`);
  console.log(`======================================================`);

  // 1. Obter todos os sorteios de Prisma DB
  const allDbDraws = await prisma.draw.findMany({
    where: { game },
    orderBy: { date: 'asc' },
    select: { id: true, date: true, numbers: true }
  });

  console.log(`Total de sorteios em Prisma DB: ${allDbDraws.length}`);

  // 2. Carregar ficheiros consolidados dos 5 sistemas
  const fileData: Record<string, Map<number, number[]>> = {};
  for (const c of ENSEMBLE_CONFIG) {
    const f = path.join(consolidatedDir, `${c.slug}_${slug}.json`);
    const map = new Map<number, number[]>();
    if (fs.existsSync(f)) {
      const arr = JSON.parse(fs.readFileSync(f, 'utf-8'));
      arr.forEach((r: any) => {
        let pred = r.prediction;
        if (typeof pred === 'string') {
          try { pred = JSON.parse(pred); } catch { pred = []; }
        }
        if (Array.isArray(pred) && pred.length >= totalBalls) {
          map.set(r.drawId, pred);
        }
      });
    }
    fileData[c.slug] = map;
    console.log(`  ${c.slug}: ${map.size} predições em ficheiro.`);
  }

  // 3. Obter todas as predições delta de Prisma DB para os sorteios que faltam
  const allDbPreds = await prisma.systemPrediction.findMany({
    where: {
      game,
      domain: 'NUMBERS',
      systemName: { in: ENSEMBLE_CONFIG.map(c => c.dbName) }
    },
    select: { drawId: true, systemName: true, prediction: true }
  });

  const dbPredMap = new Map<string, number[]>();
  allDbPreds.forEach(p => {
    let pred: number[] = [];
    if (typeof p.prediction === 'string') {
      try { pred = JSON.parse(p.prediction); } catch { pred = []; }
    } else if (Array.isArray(p.prediction)) {
      pred = p.prediction as unknown as number[];
    }
    if (pred.length >= totalBalls) {
      dbPredMap.set(`${p.drawId}_${p.systemName}`, pred);
    }
  });
  console.log(`Total de predições recuperadas da BD: ${allDbPreds.length}`);

  const consolidatedRecords: any[] = [];
  const scores = new Float32Array(totalBalls + 1);

  let missingDraws = 0;

  for (let i = 0; i < allDbDraws.length; i++) {
    const d = allDbDraws[i];
    let winning: number[] = [];
    if (typeof d.numbers === 'string') {
      try { winning = JSON.parse(d.numbers); } catch { winning = []; }
    } else if (Array.isArray(d.numbers)) {
      winning = d.numbers as unknown as number[];
    }

    if (winning.length !== winningBalls) continue;

    // Obter a predição de cada um dos 5 sistemas
    const currentPreds: Record<string, number[]> = {};
    let allFound = true;

    for (const c of ENSEMBLE_CONFIG) {
      let p = fileData[c.slug].get(d.id);
      if (!p) {
        // Tentar da BD
        p = dbPredMap.get(`${d.id}_${c.dbName}`);
      }
      if (!p || p.length < totalBalls) {
        allFound = false;
        break;
      }
      currentPreds[c.slug] = p;
    }

    if (!allFound) {
      missingDraws++;
      continue;
    }

    // Calcular ensemble Borda
    scores.fill(0);
    for (const c of ENSEMBLE_CONFIG) {
      const pred = currentPreds[c.slug];
      const isDirect = c.polarity === 'DIRETO';
      if (isDirect) {
        for (let rank = 0; rank < totalBalls; rank++) {
          scores[pred[rank]] += (totalBalls - rank);
        }
      } else {
        for (let rank = 0; rank < totalBalls; rank++) {
          scores[pred[rank]] += (rank + 1);
        }
      }
    }

    const rankedBalls: number[] = [];
    for (let b = 1; b <= totalBalls; b++) rankedBalls.push(b);
    rankedBalls.sort((a, b) => scores[b] - scores[a]);

    const hitsAt = (cutoff: number) => {
      const topSlice = new Set(rankedBalls.slice(0, cutoff));
      return winning.filter(n => topSlice.has(n)).length;
    };

    consolidatedRecords.push({
      drawId: d.id,
      prediction: JSON.stringify(rankedBalls),
      cutoff: totalBalls,
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
        date: d.date.toISOString(),
        numbers: JSON.stringify(winning)
      }
    });
  }

  const outFile = path.join(consolidatedDir, `separacao_aguas_v2_${slug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(consolidatedRecords, null, 2), 'utf-8');
  console.log(`✅ Ficheiro final gravado: ${outFile}`);
  console.log(`   Total de sorteios consolidados: ${consolidatedRecords.length} (ignorados/sem dados: ${missingDraws})`);

  console.log('\nÚltimos 15 sorteios reais do ficheiro:');
  consolidatedRecords.slice(-15).forEach(r => {
    console.log(`  Sorteio #${r.drawId} (${r.draw.date.slice(0, 10)}): ${r.num_hits_25}/${winningBalls} acertos`);
  });
}

async function main() {
  await rebuildFullGame('EUROMILLIONS', 'euromillions', 50, 25, 5);
  await rebuildFullGame('TOTOLOTO', 'totoloto', 49, 25, 5);
}

main().catch(console.error).finally(() => prisma.$disconnect());
