import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { SEPARACAO_AGUAS_V2_CONFIG } from '../src/services/separacao-aguas-v2';
import { getLiveNextPrediction } from '../src/services/live-prediction-service';

const prisma = new PrismaClient();
const consolidatedDir = path.join(process.cwd(), 'data', 'consolidated');

const ENSEMBLE_CONFIG = [
  { slug: 'clustering', dbName: 'Agrupamento de Padrões (Clustering)', polarity: 'ESPELHO' },
  { slug: 'ultimos_a_sair', dbName: 'Últimos a Sair', polarity: 'DIRETO' },
  { slug: 'mais_quentes', dbName: 'Mais Quentes', polarity: 'DIRETO' },
  { slug: 'piramide_pascal', dbName: 'Pirâmide de Pascal', polarity: 'ESPELHO' },
  { slug: 'tiro_certeiro', dbName: 'Tiro Certeiro', polarity: 'DIRETO' }
];

const GAMES = [
  { game: 'EUROMILLIONS', slug: 'euromillions', totalBalls: 50, pickCount: 25, winningBalls: 5 },
  { game: 'TOTOLOTO', slug: 'totoloto', totalBalls: 49, pickCount: 25, winningBalls: 5 },
  { game: 'EURODREAMS', slug: 'eurodreams', totalBalls: 40, pickCount: 20, winningBalls: 6 },
  { game: 'MEGASENA', slug: 'megasena', totalBalls: 60, pickCount: 30, winningBalls: 6 }
];

async function updateGame(g: typeof GAMES[0]) {
  console.log(`\n======================================================`);
  console.log(`🚀 Atualização Integral: Separação das Águas 2.0 -> ${g.game}`);
  console.log(`======================================================`);

  // 1. Obter todos os sorteios de Prisma DB
  const allDbDraws = await prisma.draw.findMany({
    where: { game: g.game },
    orderBy: { date: 'asc' },
    select: { id: true, date: true, numbers: true }
  });

  console.log(`Total de sorteios em Prisma DB: ${allDbDraws.length}`);

  // 2. Carregar ficheiros consolidados dos 5 sistemas
  const fileData: Record<string, Map<number, number[]>> = {};
  for (const c of ENSEMBLE_CONFIG) {
    const f = path.join(consolidatedDir, `${c.slug}_${g.slug}.json`);
    const map = new Map<number, number[]>();
    if (fs.existsSync(f)) {
      try {
        const arr = JSON.parse(fs.readFileSync(f, 'utf-8'));
        arr.forEach((r: any) => {
          let pred = r.prediction;
          if (typeof pred === 'string') {
            try { pred = JSON.parse(pred); } catch { pred = []; }
          }
          if (Array.isArray(pred) && pred.length >= g.totalBalls) {
            map.set(r.drawId, pred);
          }
        });
      } catch (err) {
        console.warn(`Erro ao ler ${f}:`, err);
      }
    }
    fileData[c.slug] = map;
    console.log(`  ${c.slug}: ${map.size} predições em ficheiro consolidado.`);
  }

  // 3. Obter todas as predições de Prisma DB para os especialistas
  const allDbPreds = await prisma.systemPrediction.findMany({
    where: {
      game: g.game,
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
    if (pred.length >= g.totalBalls) {
      dbPredMap.set(`${p.drawId}_${p.systemName}`, pred);
    }
  });
  console.log(`Total de predições recuperadas da BD: ${allDbPreds.length}`);

  const consolidatedRecords: any[] = [];
  const recordsToInsertInDb: any[] = [];
  const scores = new Float32Array(g.totalBalls + 1);

  let missingDraws = 0;

  for (let i = 0; i < allDbDraws.length; i++) {
    const d = allDbDraws[i];
    let winning: number[] = [];
    if (typeof d.numbers === 'string') {
      try { winning = JSON.parse(d.numbers); } catch { winning = []; }
    } else if (Array.isArray(d.numbers)) {
      winning = d.numbers as unknown as number[];
    }

    if (winning.length !== g.winningBalls) continue;

    // Obter a predição de cada um dos 5 sistemas
    const currentPreds: Record<string, number[]> = {};
    let allFound = true;

    for (const c of ENSEMBLE_CONFIG) {
      let p = fileData[c.slug].get(d.id);
      if (!p) {
        p = dbPredMap.get(`${d.id}_${c.dbName}`);
      }
      if (!p || p.length < g.totalBalls) {
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
        for (let rank = 0; rank < g.totalBalls; rank++) {
          scores[pred[rank]] += (g.totalBalls - rank);
        }
      } else {
        for (let rank = 0; rank < g.totalBalls; rank++) {
          scores[pred[rank]] += (rank + 1);
        }
      }
    }

    const rankedBalls: number[] = [];
    for (let b = 1; b <= g.totalBalls; b++) rankedBalls.push(b);
    rankedBalls.sort((a, b) => scores[b] - scores[a]);

    const hitsAt = (cutoff: number) => {
      const topSlice = new Set(rankedBalls.slice(0, cutoff));
      return winning.filter(n => topSlice.has(n)).length;
    };

    const hitsObj: Record<string, number> = {};
    for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
      hitsObj['num_hits_' + cut] = hitsAt(cut);
    }

    consolidatedRecords.push({
      drawId: d.id,
      prediction: JSON.stringify(rankedBalls),
      cutoff: g.totalBalls,
      ...hitsObj,
      draw: {
        date: d.date.toISOString(),
        numbers: JSON.stringify(winning)
      }
    });

    recordsToInsertInDb.push({
      drawId: d.id,
      game: g.game,
      domain: 'NUMBERS',
      systemName: 'Separação das Águas 2.0',
      prediction: JSON.stringify(rankedBalls),
      cutoff: g.totalBalls,
      ...hitsObj,
      calculatedAt: new Date()
    });
  }

  // 4. Salvar ficheiro consolidado
  const outFile = path.join(consolidatedDir, `separacao_aguas_v2_${g.slug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(consolidatedRecords, null, 2), 'utf-8');
  console.log(`✅ Ficheiro final gravado: ${outFile}`);
  console.log(`   Total de sorteios consolidados: ${consolidatedRecords.length} (ignorados/sem dados: ${missingDraws})`);

  // 5. Garantir RankedSystem
  await prisma.rankedSystem.upsert({
    where: {
      name_game: {
        name: 'Separação das Águas 2.0',
        game: g.game
      }
    },
    update: {
      description: 'Ensemble de 5 Especialistas com Inversão Cirúrgica de Polaridade para Máxima Assimetria',
      domain: 'NUMBERS',
      systemType: 'ENSEMBLE',
      isActive: true
    },
    create: {
      name: 'Separação das Águas 2.0',
      game: g.game,
      description: 'Ensemble de 5 Especialistas com Inversão Cirúrgica de Polaridade para Máxima Assimetria',
      domain: 'NUMBERS',
      systemType: 'ENSEMBLE',
      isActive: true
    }
  });

  // 6. Atualizar base de dados Prisma (SystemPrediction)
  console.log(`Limpando e sincronizando ${recordsToInsertInDb.length} registos na tabela SystemPrediction...`);
  await prisma.systemPrediction.deleteMany({
    where: {
      game: g.game,
      systemName: 'Separação das Águas 2.0',
      domain: 'NUMBERS'
    }
  });

  const chunkSize = 250;
  for (let b = 0; b < recordsToInsertInDb.length; b += chunkSize) {
    const chunk = recordsToInsertInDb.slice(b, b + chunkSize);
    await prisma.systemPrediction.createMany({
      data: chunk
    });
  }
  console.log(`✅ Previsões inseridas com sucesso na BD local.`);

  // 7. Atualizar CachedPrediction (próximo sorteio ao vivo)
  try {
    const nextPred = await getLiveNextPrediction('Separação das Águas 2.0', g.game, undefined, true);
    console.log(`🔮 Previsão para o próximo concurso (${g.game}): [${nextPred.slice(0, g.pickCount).join(', ')}]`);
  } catch (err) {
    console.warn(`Aviso ao gerar previsão ao vivo:`, err);
  }

  // 8. Exibir os últimos 5 sorteios
  console.log(`\nÚltimos 5 sorteios reais sincronizados para ${g.game}:`);
  recordsToInsertInDb.slice(-5).forEach(r => {
    const hitKey = `num_hits_${g.pickCount}`;
    console.log(`  Sorteio #${r.drawId}: ${r[hitKey]}/${g.winningBalls} acertos no Top ${g.pickCount}`);
  });
}

async function main() {
  for (const g of GAMES) {
    await updateGame(g);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
