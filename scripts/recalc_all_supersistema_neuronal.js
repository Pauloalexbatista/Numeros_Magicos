import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
import fs from 'fs';

const SYSTEM_NAME = 'SuperSistema Neuronal';
const GAMES = ['EUROMILLIONS', 'TOTOLOTO', 'MEGASENA', 'EURODREAMS'];

const SPECIALISTS = {
  EUROMILLIONS: [
    'Diagonais da Matriz',
    'Sistema Oscilação Universal V2',
    'Mais Sorteadas de Sempre',
    'Transições de Markov',
    'Random Forest AI'
  ],
  TOTOLOTO: [
    'Agrupamento de Padrões (Clustering)',
    'Diagonais da Matriz',
    'Mais Sorteadas de Sempre',
    'Mais Quentes',
    'Transições de Markov'
  ],
  MEGASENA: [
    'Random Forest AI',
    'Sistema Média +3 Otimizado',
    'Diagonais da Matriz',
    'Transições de Markov',
    'Mais Sorteadas de Sempre'
  ],
  EURODREAMS: [
    'Mais Quentes',
    'Diagonais da Matriz 3D',
    'Últimos a Sair',
    'Random Forest AI',
    'Pirâmide de Intervalos'
  ]
};

function getMaxNumber(game) {
  if (game === 'EUROMILLIONS') return 50;
  if (game === 'TOTOLOTO') return 49;
  if (game === 'EURODREAMS') return 40;
  if (game === 'MEGASENA') return 60;
  return 50;
}

function parseDrawArray(drawContent) {
  if (typeof drawContent === 'string') {
    try { return JSON.parse(drawContent); } catch (e) { return []; }
  }
  if (Array.isArray(drawContent)) return drawContent;
  return [];
}

function combineSpecialists(specialistPredictions, maxNum) {
  if (!specialistPredictions || specialistPredictions.length === 0) {
    return Array.from({ length: maxNum }, (_, idx) => idx + 1);
  }

  const numSpecialists = specialistPredictions.length;
  const scores = [];

  for (let num = 1; num <= maxNum; num++) {
    let totalWeightedPercentile = 0;
    let consensusCount = 0;
    const percentiles = [];

    specialistPredictions.forEach(pred => {
      const rankIdx = pred.indexOf(num);
      const rank = rankIdx !== -1 ? rankIdx + 1 : maxNum;
      const percentile = (maxNum - rank + 1) / maxNum;
      percentiles.push(percentile);
      totalWeightedPercentile += percentile;

      if (rank <= 10) {
        consensusCount++;
      }
    });

    const avgPercentile = totalWeightedPercentile / numSpecialists;
    let variance = 0;
    percentiles.forEach(p => {
      variance += Math.pow(p - avgPercentile, 2);
    });
    variance = Math.sqrt(variance / numSpecialists);

    // Score = Percentil Médio + Bónus de Consenso no Top 10 (20%) - Penalização por Divergência (5%)
    const score = avgPercentile + (0.20 * (consensusCount / numSpecialists)) - (0.05 * variance);
    scores.push({ num, score, consensusCount });
  }

  scores.sort((a, b) => {
    const diff = b.score - a.score;
    if (Math.abs(diff) > 0.00001) return diff;
    const cDiff = b.consensusCount - a.consensusCount;
    if (cDiff !== 0) return cDiff;
    return a.num - b.num;
  });

  return scores.map(s => s.num);
}

function evaluateHits(pred, actualArr, cutoffs) {
  const actualSet = new Set(actualArr);
  const res = {};
  for (const c of cutoffs) {
    const slice = pred.slice(0, c);
    res[c] = slice.filter(n => actualSet.has(n)).length;
  }
  return res;
}

async function processGame(game) {
  console.log('\n===============================================================');
  console.log(`--- A PROCESSAR SUPERSISTEMA NEURONAL: ${game} ---`);
  console.log('===============================================================');

  const maxVal = getMaxNumber(game);
  const gameSpecialists = SPECIALISTS[game];
  console.log(`Especialistas de Elite selecionados (${gameSpecialists.length}):`, gameSpecialists.join(', '));

  // 1. Assegurar primeiro que RankedSystem existe para evitar Foreign Key Violation
  await p.rankedSystem.upsert({
    where: {
      name_game: {
        name: SYSTEM_NAME,
        game: game
      }
    },
    update: {
      description: 'Meta-Inteligência Artificial que orquestra e funde os 5 sistemas com melhor histórico de acertos.',
      concept: 'Fusão de Inteligências por Meta-Ensemble Stacking.',
      logic: 'Combina os 5 especialistas comprovados do jogo e gera o consenso de elite com bónus de concordância.',
      domain: 'NUMBERS'
    },
    create: {
      name: SYSTEM_NAME,
      game: game,
      description: 'Meta-Inteligência Artificial que orquestra e funde os 5 sistemas com melhor histórico de acertos.',
      concept: 'Fusão de Inteligências por Meta-Ensemble Stacking.',
      logic: 'Combina os 5 especialistas comprovados do jogo e gera o consenso de elite com bónus de concordância.',
      domain: 'NUMBERS'
    }
  });

  // 2. Carregar todos os sorteios ordenados por data
  const draws = await p.draw.findMany({
    where: { game },
    orderBy: { date: 'asc' }
  });
  console.log(`Total de sorteios carregados para ${game}:`, draws.length);

  // 3. Carregar todas as previsões dos especialistas para este jogo em memória
  console.log(`A carregar previsões históricas dos especialistas...`);
  const allExpertPreds = await p.systemPrediction.findMany({
    where: {
      game,
      domain: 'NUMBERS',
      systemName: { in: gameSpecialists }
    },
    select: {
      drawId: true,
      systemName: true,
      prediction: true
    }
  });

  // Mapear por drawId: drawMap[drawId] = Map(systemName -> number[])
  const drawExpertMap = new Map();
  for (const ep of allExpertPreds) {
    if (!drawExpertMap.has(ep.drawId)) {
      drawExpertMap.set(ep.drawId, new Map());
    }
    try {
      const parsed = JSON.parse(ep.prediction);
      drawExpertMap.get(ep.drawId).set(ep.systemName, parsed);
    } catch(e) {}
  }
  console.log(`Previsões indexadas para ${drawExpertMap.size} sorteios.`);

  const cutoffs = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  const halfPoint = game === 'EURODREAMS' ? 20 : (game === 'MEGASENA' ? 30 : 25);
  const maxPrize = (game === 'EURODREAMS' || game === 'MEGASENA') ? 6 : 5;

  let totalHitsHalf = 0;
  let jackpotHits = 0;
  let secondPrizeHits = 0;
  const predictionsToUpsert = [];

  for (let i = 0; i < draws.length; i++) {
    const targetDraw = draws[i];
    const expertPredictionsForDraw = [];

    const expertMap = drawExpertMap.get(targetDraw.id);
    if (expertMap) {
      for (const specName of gameSpecialists) {
        if (expertMap.has(specName)) {
          expertPredictionsForDraw.push(expertMap.get(specName));
        }
      }
    }

    let pred = [];
    if (expertPredictionsForDraw.length >= 2) {
      pred = combineSpecialists(expertPredictionsForDraw, maxVal);
    } else {
      pred = Array.from({ length: maxVal }, (_, idx) => idx + 1);
    }

    const actualNums = parseDrawArray(targetDraw.numbers);
    const hitMap = evaluateHits(pred, actualNums, cutoffs);
    const hitsInHalf = hitMap[halfPoint] || 0;

    totalHitsHalf += hitsInHalf;
    if (hitsInHalf === maxPrize) jackpotHits++;
    if (hitsInHalf === maxPrize - 1) secondPrizeHits++;

    predictionsToUpsert.push({
      drawId: targetDraw.id,
      game: game,
      systemName: SYSTEM_NAME,
      domain: 'NUMBERS',
      prediction: JSON.stringify(pred),
      cutoff: maxVal,
      num_hits_5: hitMap[5] || 0,
      num_hits_10: hitMap[10] || 0,
      num_hits_15: hitMap[15] || 0,
      num_hits_20: hitMap[20] || 0,
      num_hits_25: hitMap[25] || 0,
      num_hits_30: hitMap[30] || 0,
      num_hits_35: hitMap[35] || 0,
      num_hits_40: hitMap[40] || 0,
      num_hits_45: hitMap[45] || 0,
      num_hits_50: hitMap[50] || 0,
      num_hits_55: hitMap[55] || 0,
      num_hits_60: hitMap[60] || 0,
      calculatedAt: new Date()
    });
  }

  // 4. Gravar na base de dados
  console.log(`A gravar ${predictionsToUpsert.length} previsões de ${SYSTEM_NAME} para ${game}...`);
  await p.systemPrediction.deleteMany({
    where: { game, systemName: SYSTEM_NAME, domain: 'NUMBERS' }
  });

  const CHUNK_SIZE = 500;
  for (let c = 0; c < predictionsToUpsert.length; c += CHUNK_SIZE) {
    await p.systemPrediction.createMany({ data: predictionsToUpsert.slice(c, c + CHUNK_SIZE) });
  }

  // 5. Atualizar SystemRanking
  const avgAccuracy = ((totalHitsHalf / draws.length) / maxPrize) * 100;
  console.log(`📊 [${game}] Precisão Média (Top ${halfPoint}): ${avgAccuracy.toFixed(2)}% | Prémios Máximos (${maxPrize}): ${jackpotHits} | 2º Prémio (${maxPrize - 1}): ${secondPrizeHits}`);

  await p.systemRanking.upsert({
    where: {
      systemName_game: {
        systemName: SYSTEM_NAME,
        game: game
      }
    },
    update: {
      avgAccuracy,
      totalPredictions: draws.length,
      lastUpdated: new Date()
    },
    create: {
      systemName: SYSTEM_NAME,
      game: game,
      avgAccuracy,
      totalPredictions: draws.length
    }
  });

  // 6. Exportar cofre consolidado para /tmp/
  const exported = predictionsToUpsert.map((x, idx) => ({
    drawId: x.drawId,
    prediction: x.prediction,
    cutoff: x.cutoff,
    num_hits_5: x.num_hits_5,
    num_hits_10: x.num_hits_10,
    num_hits_15: x.num_hits_15,
    num_hits_20: x.num_hits_20,
    num_hits_25: x.num_hits_25,
    num_hits_30: x.num_hits_30,
    num_hits_35: x.num_hits_35,
    num_hits_40: x.num_hits_40,
    num_hits_45: x.num_hits_45,
    num_hits_50: x.num_hits_50,
    num_hits_55: x.num_hits_55,
    num_hits_60: x.num_hits_60,
    draw: {
      date: draws[idx].date.toISOString(),
      numbers: draws[idx].numbers
    }
  }));

  const outPath = `/tmp/supersistema_neuronal_${game.toLowerCase()}.json`;
  fs.writeFileSync(outPath, JSON.stringify(exported, null, 2));
  console.log(`📦 Cofre consolidado exportado para ${outPath} (${exported.length} registos)`);
}

async function main() {
  const t0 = Date.now();
  console.log('###############################################################');
  console.log('### INICIALIZANDO: SUPERSISTEMA NEURONAL (META-ENSEMBLE AI) ###');
  console.log('###############################################################');

  for (const game of GAMES) {
    await processGame(game);
  }

  console.log('\n>>> SUPERSISTEMA NEURONAL CONCLUIDO COM SUCESSO EM ' + ((Date.now() - t0) / 1000).toFixed(1) + 's! <<<');
}

main().finally(() => p.$disconnect());
