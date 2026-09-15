import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
import fs from 'fs';

const SYSTEM_NAME_NUMBERS = 'Random Forest AI';
const GAMES = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO', 'MEGASENA'];

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

// -------------------------------------------------------------
// ARVORE DE DECISAO CART COM SUBSAMPLING ALEATORIO DE FEATURES
// -------------------------------------------------------------
function trainDecisionTree(X, y, maxDepth = 4, minSamples = 10, featureSubsample = 4) {
  function gini(labels) {
    if (labels.length === 0) return 0;
    const p1 = labels.filter(l => l === 1).length / labels.length;
    return 1 - (p1 * p1 + (1 - p1) * (1 - p1));
  }

  function bestSplit(features, labels) {
    let bestGain = -1, bestFeat = -1, bestThresh = -1;
    const currentGini = gini(labels);
    const numFeats = features[0].length;

    // Subsampling aleatorio de features (Random Forest)
    const featIndices = [];
    while (featIndices.length < Math.min(featureSubsample, numFeats)) {
      const idx = Math.floor(Math.random() * numFeats);
      if (!featIndices.includes(idx)) featIndices.push(idx);
    }

    for (const f of featIndices) {
      const vals = features.map(r => r[f]);
      const uniqueVals = Array.from(new Set(vals)).sort((a, b) => a - b);
      const step = Math.max(1, Math.floor(uniqueVals.length / 8));

      for (let i = 0; i < uniqueVals.length - 1; i += step) {
        const thresh = (uniqueVals[i] + uniqueVals[i+1]) / 2;
        let leftCount = 0, leftOnes = 0;
        let rightCount = 0, rightOnes = 0;

        for (let j = 0; j < features.length; j++) {
          if (features[j][f] <= thresh) {
            leftCount++;
            if (labels[j] === 1) leftOnes++;
          } else {
            rightCount++;
            if (labels[j] === 1) rightOnes++;
          }
        }

        if (leftCount < minSamples || rightCount < minSamples) continue;

        const pL = leftOnes / leftCount;
        const giniL = 1 - (pL * pL + (1 - pL) * (1 - pL));
        const pR = rightOnes / rightCount;
        const giniR = 1 - (pR * pR + (1 - pR) * (1 - pR));
        const gain = currentGini - ((leftCount / labels.length) * giniL + (rightCount / labels.length) * giniR);

        if (gain > bestGain) {
          bestGain = gain;
          bestFeat = f;
          bestThresh = thresh;
        }
      }
    }
    return { feat: bestFeat, thresh: bestThresh, gain: bestGain };
  }

  function buildTree(features, labels, depth) {
    const numOnes = labels.filter(l => l === 1).length;
    const prob = labels.length > 0 ? numOnes / labels.length : 0;

    if (depth >= maxDepth || labels.length < minSamples * 2 || numOnes === 0 || numOnes === labels.length) {
      return { isLeaf: true, prob };
    }

    const split = bestSplit(features, labels);
    if (split.gain <= 0 || split.feat === -1) {
      return { isLeaf: true, prob };
    }

    const leftFeats = [], leftLabels = [], rightFeats = [], rightLabels = [];
    for (let i = 0; i < features.length; i++) {
      if (features[i][split.feat] <= split.thresh) {
        leftFeats.push(features[i]);
        leftLabels.push(labels[i]);
      } else {
        rightFeats.push(features[i]);
        rightLabels.push(labels[i]);
      }
    }

    return {
      isLeaf: false,
      feat: split.feat,
      thresh: split.thresh,
      left: buildTree(leftFeats, leftLabels, depth + 1),
      right: buildTree(rightFeats, rightLabels, depth + 1)
    };
  }

  return buildTree(X, y, 0);
}

function predictProb(tree, sample) {
  if (tree.isLeaf) return tree.prob;
  if (sample[tree.feat] <= tree.thresh) return predictProb(tree.left, sample);
  return predictProb(tree.right, sample);
}

// -------------------------------------------------------------
// ENSEMBLE RANDOM FOREST (FLORESTA DE BAGGING COM 8 ARVORES)
// -------------------------------------------------------------
function trainRandomForest(X, y, numTrees = 8, maxDepth = 4, minSamples = 10) {
  const forest = [];
  const n = X.length;
  if (n === 0) return forest;

  for (let b = 0; b < numTrees; b++) {
    // Bootstrap sampling (amostra aleatoria com 80% do tamanho)
    const bX = [];
    const by = [];
    for (let i = 0; i < Math.floor(n * 0.8); i++) {
      const idx = Math.floor(Math.random() * n);
      bX.push(X[idx]);
      by.push(y[idx]);
    }
    forest.push(trainDecisionTree(bX, by, maxDepth, minSamples, 4));
  }
  return forest;
}

function predictForestProb(forest, sample) {
  if (!forest || forest.length === 0) return 0;
  let total = 0;
  for (const tree of forest) {
    total += predictProb(tree, sample);
  }
  return total / forest.length;
}

// -------------------------------------------------------------
// EXTRATOR DE FEATURES MULTIDIMENSIONAIS ULTRA-RAPIDO
// 1. delay: atraso desde a ultima saida
// 2. freq10: frequencia nos ultimos 10 sorteios
// 3. freq50: frequencia nos ultimos 50 sorteios
// 4. momentum: aceleracao freq10 - (freq50 / 5)
// 5. diagScore: score geometrico de Diagonais da Matriz
// 6. markovScore: probabilidade condicional de transicao apos sorteio T-1
// 7. delayZScore: anomalia do ciclo de atraso
// -------------------------------------------------------------
function extractFeatures(historyDraws, maxVal) {
  const nDraws = historyDraws.length;
  if (nDraws === 0) return [];

  const parsed = historyDraws.map(d => parseDrawArray(d.numbers));
  const lastSeen = new Array(maxVal + 1).fill(-1);

  // Pre-computar existencia rapida num Set/Array por sorteio
  const drawHasNum = [];
  for (let i = 0; i < nDraws; i++) {
    const has = new Uint8Array(maxVal + 1);
    for (const num of parsed[i]) {
      if (num <= maxVal) {
        has[num] = 1;
        lastSeen[num] = i;
      }
    }
    drawHasNum.push(has);
  }

  // Matriz de Markov acumulada
  const markovCount = Array.from({ length: maxVal + 1 }, () => new Float32Array(maxVal + 1));
  const markovTotal = new Float32Array(maxVal + 1);
  for (let i = 0; i < nDraws - 1; i++) {
    const curr = parsed[i];
    const nxt = parsed[i + 1];
    for (const u of curr) {
      if (u <= maxVal) {
        markovTotal[u] += nxt.length;
        for (const v of nxt) {
          if (v <= maxVal) markovCount[u][v]++;
        }
      }
    }
  }

  const currIdx = nDraws - 1;
  const lastDraw = parsed[currIdx] || [];
  const slice10 = drawHasNum.slice(Math.max(0, nDraws - 10));
  const slice50 = drawHasNum.slice(Math.max(0, nDraws - 50));
  const expectedDelay = maxVal / (lastDraw.length || 5);

  const features = [];

  for (let num = 1; num <= maxVal; num++) {
    const delay = lastSeen[num] === -1 ? currIdx : (currIdx - lastSeen[num]);

    let freq10 = 0;
    for (const has of slice10) { if (has[num]) freq10++; }

    let freq50 = 0;
    for (const has of slice50) { if (has[num]) freq50++; }

    const momentum = freq10 - (freq50 / 5);

    // Diagonais da Matriz (passo geometrico ate 50 sorteios)
    let diagScore = 0;
    // Diagonal esquerda: (currIdx - step, num - step)
    // Diagonal direita: (currIdx - step, num + step)
    const maxSteps = Math.min(50, nDraws);
    for (let step = 0; step < maxSteps; step++) {
      const rowIdx = currIdx - step;
      if (rowIdx < 0) break;
      const weight = step === 0 ? 2 : 1; // Duplo peso no sorteio imediatamente anterior T-1
      
      const leftCol = num - step;
      if (leftCol >= 1 && leftCol <= maxVal && drawHasNum[rowIdx][leftCol]) {
        diagScore += weight;
      }
      const rightCol = num + step;
      if (rightCol >= 1 && rightCol <= maxVal && drawHasNum[rowIdx][rightCol]) {
        diagScore += weight;
      }
    }

    // Markov Score: soma das probabilidades condicionais P(num | u) para cada u sorteado no sorteio T-1
    let markovScore = 0;
    for (const u of lastDraw) {
      if (u <= maxVal && markovTotal[u] > 0) {
        markovScore += (markovCount[u][num] / markovTotal[u]);
      }
    }

    const delayZScore = (delay - expectedDelay) / (expectedDelay + 0.1);

    const sample = [delay, freq10, freq50, momentum, diagScore, markovScore, delayZScore];
    features.push({ num, sample, delay, freq10, freq50, momentum, diagScore, markovScore });
  }

  return features;
}

function buildTrainingDataset(draws, maxVal) {
  const X = [];
  const y = [];
  if (draws.length < 55) return { X, y };

  // Usar os ultimos 200 sorteios de treino para manter adaptabilidade
  const startIdx = Math.max(50, draws.length - 200);
  for (let i = startIdx; i < draws.length - 1; i++) {
    const historySlice = draws.slice(0, i + 1);
    const feats = extractFeatures(historySlice, maxVal);
    const nextNumbers = parseDrawArray(draws[i + 1].numbers);
    const nextSet = new Set(nextNumbers);

    for (const f of feats) {
      X.push(f.sample);
      y.push(nextSet.has(f.num) ? 1 : 0);
    }
  }

  return { X, y };
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

async function processGameNumbers(game) {
  console.log('\n======================================================');
  console.log('--- A RECALCULAR RANDOM FOREST MULTIDIMENSIONAL: ' + game + ' ---');
  console.log('======================================================');
  const maxVal = getMaxNumber(game);

  const draws = await p.draw.findMany({
    where: { game },
    orderBy: { date: 'asc' }
  });
  console.log('Total sorteios carregados: ' + draws.length);

  let currentForest = null;
  const predictionsToUpsert = [];
  const cutoffs = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

  const tStart = Date.now();

  for (let i = 0; i < draws.length; i++) {
    const targetDraw = draws[i];
    const history = draws.slice(0, i);

    let pred = [];
    if (history.length < 55) {
      pred = Array.from({ length: maxVal }, (_, idx) => idx + 1);
    } else {
      // Retreinar o Random Forest a cada 15 sorteios para máxima velocidade e estabilidade
      if (!currentForest || (i % 15 === 0)) {
        const { X, y } = buildTrainingDataset(history, maxVal);
        if (X.length > 0) {
          currentForest = trainRandomForest(X, y, 8, 4, 10);
        }
      }

      if (currentForest) {
        const currFeats = extractFeatures(history, maxVal);
        const scored = currFeats.map(item => {
          const prob = predictForestProb(currentForest, item.sample);
          return {
            num: item.num,
            prob,
            diagScore: item.diagScore,
            momentum: item.momentum,
            markovScore: item.markovScore
          };
        });

        // Ordenacao inteligente com consenso de IA + Geometria + Transicao
        scored.sort((a, b) => {
          const pDiff = b.prob - a.prob;
          if (Math.abs(pDiff) > 0.0001) return pDiff;
          const dDiff = b.diagScore - a.diagScore;
          if (dDiff !== 0) return dDiff;
          const mDiff = b.markovScore - a.markovScore;
          if (Math.abs(mDiff) > 0.001) return mDiff;
          const momDiff = b.momentum - a.momentum;
          if (momDiff !== 0) return momDiff;
          return a.num - b.num;
        });
        pred = scored.map(s => s.num);
      } else {
        pred = Array.from({ length: maxVal }, (_, idx) => idx + 1);
      }
    }

    const actualNums = parseDrawArray(targetDraw.numbers);
    const hitMap = evaluateHits(pred, actualNums, cutoffs);

    predictionsToUpsert.push({
      drawId: targetDraw.id,
      game: game,
      systemName: SYSTEM_NAME_NUMBERS,
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

  const elapsed = ((Date.now() - tStart) / 1000).toFixed(1);
  console.log('Calculo concluido em ' + elapsed + 's. Gravando ' + predictionsToUpsert.length + ' previsoes para ' + game + '...');

  await p.systemPrediction.deleteMany({
    where: { game, systemName: SYSTEM_NAME_NUMBERS, domain: 'NUMBERS' }
  });

  const CHUNK_SIZE = 500;
  for (let c = 0; c < predictionsToUpsert.length; c += CHUNK_SIZE) {
    await p.systemPrediction.createMany({ data: predictionsToUpsert.slice(c, c + CHUNK_SIZE) });
  }
  console.log('NUMEROS concluidos com sucesso para ' + game + '!');

  // Exportar vault JSON consolidado para /tmp/
  const exported = predictionsToUpsert.map((x, idx) => ({
    date: draws[idx].date.toISOString().slice(0, 10),
    prediction: JSON.parse(x.prediction),
    num_hits_5: x.num_hits_5,
    num_hits_10: x.num_hits_10,
    num_hits_20: x.num_hits_20,
    num_hits_25: x.num_hits_25,
    num_hits_30: x.num_hits_30,
    star_hits_2: null,
    star_hits_4: null
  }));
  const outPath = '/tmp/random_forest_' + game.toLowerCase() + '.json';
  fs.writeFileSync(outPath, JSON.stringify(exported, null, 2));
  console.log('Exportado cofre consolidado para: ' + outPath + ' (' + exported.length + ' registos)');
}

async function main() {
  const start = Date.now();
  console.log('=== ATUALIZACAO: RANDOM FOREST MULTIDIMENSIONAL (8 ARVORES + 7 FEATURES) ===');
  for (const game of GAMES) {
    await processGameNumbers(game);
  }
  console.log('\n>>> RECALCULO TOTAL CONCLUIDO EM ' + ((Date.now() - start) / 1000).toFixed(1) + 's! <<<');
}

main().finally(() => p.$disconnect());
