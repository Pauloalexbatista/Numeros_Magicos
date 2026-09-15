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

function getQuinaPoints(rank, halfPoint) {
  const quinaIdx = Math.floor(rank / 5);
  const maxQuina = halfPoint / 5;
  if (quinaIdx >= maxQuina) return 0; // Muralha de Corte dos 25: Fora pontua ZERO!

  switch (quinaIdx) {
    case 0: return 100; // 1-5 (Diamante)
    case 1: return 75;  // 6-10 (Ouro)
    case 2: return 50;  // 11-15 (Prata)
    case 3: return 30;  // 16-20 (Bronze)
    case 4: return 15;  // 21-25 (Limiar)
    case 5: return 8;   // 26-30 (Mega-Sena)
    default: return 0;
  }
}

function combineSpecialistsByQuintetos(specialistPredictions, maxNum, halfPoint) {
  if (!specialistPredictions || specialistPredictions.length === 0) {
    return Array.from({ length: maxNum }, (_, idx) => idx + 1);
  }

  const points = new Float32Array(maxNum + 1);
  const consensusCount = new Uint8Array(maxNum + 1);

  for (const predArr of specialistPredictions) {
    for (let rank = 0; rank < predArr.length; rank++) {
      const num = predArr[rank];
      if (num >= 1 && num <= maxNum) {
        const pts = getQuinaPoints(rank, halfPoint);
        points[num] += pts;
        if (rank < halfPoint) {
          consensusCount[num]++;
        }
      }
    }
  }

  const scores = [];
  for (let num = 1; num <= maxNum; num++) {
    scores.push({
      num,
      pts: points[num],
      consensus: consensusCount[num]
    });
  }

  scores.sort((a, b) => {
    const diff = b.pts - a.pts;
    if (Math.abs(diff) > 0.0001) return diff;
    const cDiff = b.consensus - a.consensus;
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
  console.log(`--- A PROCESSAR SUPERSISTEMA NEURONAL (QUINTETOS DE OURO): ${game} ---`);
  console.log('===============================================================');

  const maxVal = getMaxNumber(game);
  const halfPoint = game === 'EURODREAMS' ? 20 : (game === 'MEGASENA' ? 30 : 25);
  const maxPrize = (game === 'EURODREAMS' || game === 'MEGASENA') ? 6 : 5;
  const gameSpecialists = SPECIALISTS[game];
  console.log(`Especialistas de Elite (${gameSpecialists.length}):`, gameSpecialists.join(', '));

  // 1. Assegurar RankedSystem
  await p.rankedSystem.upsert({
    where: {
      name_game: {
        name: SYSTEM_NAME,
        game: game
      }
    },
    update: {
      description: 'Meta-Inteligência Artificial que orquestra os 5 sistemas de topo por Quintetos de Ouro e Muralha de Corte.',
      concept: 'Fusão de Quintetos de Elite por Consenso de Especialistas.',
      logic: 'Avalia as quinas de topo dos 5 especialistas com pesos escalonados (100, 75, 50, 30, 15) e muralha zero fora dos 25.',
      domain: 'NUMBERS'
    },
    create: {
      name: SYSTEM_NAME,
      game: game,
      description: 'Meta-Inteligência Artificial que orquestra os 5 sistemas de topo por Quintetos de Ouro e Muralha de Corte.',
      concept: 'Fusão de Quintetos de Elite por Consenso de Especialistas.',
      logic: 'Avalia as quinas de topo dos 5 especialistas com pesos escalonados (100, 75, 50, 30, 15) e muralha zero fora dos 25.',
      domain: 'NUMBERS'
    }
  });

  // 2. Carregar todos os sorteios ordenados por data
  const draws = await p.draw.findMany({
    where: { game },
    orderBy: { date: 'asc' }
  });
  console.log(`Total de sorteios carregados para ${game}:`, draws.length);

  // 3. Carregar previsões dos especialistas
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

  const cutoffs = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
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
      pred = combineSpecialistsByQuintetos(expertPredictionsForDraw, maxVal, halfPoint);
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
  console.log(`🏆 [${game}] Jackpots (${maxPrize}): ${jackpotHits} | 2º Prémio (${maxPrize - 1}): ${secondPrizeHits} | Total Nobre: ${jackpotHits + secondPrizeHits} | Precisão Média (Top ${halfPoint}): ${avgAccuracy.toFixed(2)}%`);

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
  console.log('#########################################################################');
  console.log('### SUPERSISTEMA NEURONAL: DEFINITIVO (QUINTETOS DE OURO + MURALHA)  ###');
  console.log('#########################################################################');

  for (const game of GAMES) {
    await processGame(game);
  }

  console.log('\n>>> SUPERSISTEMA NEURONAL FINALIZADO EM ' + ((Date.now() - t0) / 1000).toFixed(1) + 's! <<<');
}

main().finally(() => p.$disconnect());
