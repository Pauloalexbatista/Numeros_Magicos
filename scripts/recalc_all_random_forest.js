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

function trainDecisionTree(X, y, maxDepth = 4, minSamples = 10) {
  function gini(labels) {
    if (labels.length === 0) return 0;
    const p1 = labels.filter(l => l === 1).length / labels.length;
    return 1 - (p1 * p1 + (1 - p1) * (1 - p1));
  }

  function bestSplit(features, labels) {
    let bestGain = -1, bestFeat = -1, bestThresh = -1;
    const currentGini = gini(labels);
    const numFeats = features[0].length;

    for (let f = 0; f < numFeats; f++) {
      const vals = features.map(r => r[f]);
      const uniqueVals = Array.from(new Set(vals)).sort((a, b) => a - b);
      const step = Math.max(1, Math.floor(uniqueVals.length / 10));

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

function buildFeatureMatrix(draws, maxVal, targetField) {
  const features = [];
  const labels = [];
  if (draws.length < 55) return { features, labels };

  const parsed = draws.map(d => parseDrawArray(d[targetField]));
  const lastSeen = new Array(maxVal + 1).fill(-1);

  for (let i = 0; i < 50; i++) {
    for (const num of parsed[i]) {
      if (num <= maxVal) lastSeen[num] = i;
    }
  }

  for (let i = 50; i < draws.length - 1; i++) {
    for (const num of parsed[i]) {
      if (num <= maxVal) lastSeen[num] = i;
    }
    const nextArr = parsed[i + 1];
    const slice50 = parsed.slice(i - 49, i + 1);
    const slice10 = parsed.slice(i - 9, i + 1);

    for (let num = 1; num <= maxVal; num++) {
      const delay = lastSeen[num] === -1 ? i : (i - lastSeen[num]);
      let freq10 = 0;
      for (const d of slice10) { if (d.includes(num)) freq10++; }
      let freq50 = 0;
      for (const d of slice50) { if (d.includes(num)) freq50++; }
      const label = nextArr.includes(num) ? 1 : 0;

      features.push([delay, freq10, freq50]);
      labels.push(label);
    }
  }
  return { features, labels };
}

function buildCurrentFeatures(draws, maxVal, targetField) {
  const features = [];
  if (draws.length === 0) return features;
  const parsed = draws.map(d => parseDrawArray(d[targetField]));
  const lastSeen = new Array(maxVal + 1).fill(-1);

  for (let i = 0; i < draws.length; i++) {
    for (const num of parsed[i]) {
      if (num <= maxVal) lastSeen[num] = i;
    }
  }

  const currIdx = draws.length - 1;
  const slice50 = parsed.slice(Math.max(0, draws.length - 50));
  const slice10 = parsed.slice(Math.max(0, draws.length - 10));

  for (let num = 1; num <= maxVal; num++) {
    const delay = lastSeen[num] === -1 ? currIdx : (currIdx - lastSeen[num]);
    let freq10 = 0;
    for (const d of slice10) { if (d.includes(num)) freq10++; }
    let freq50 = 0;
    for (const d of slice50) { if (d.includes(num)) freq50++; }
    features.push({ num, sample: [delay, freq10, freq50], delay, freq10, freq50 });
  }
  return features;
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
  console.log('\n--- A RECALCULAR NUMEROS (POOL COMPLETO): ' + game + ' ---');
  const maxVal = getMaxNumber(game);

  const draws = await p.draw.findMany({
    where: { game },
    orderBy: { date: 'asc' }
  });
  console.log('Total sorteios carregados: ' + draws.length);

  let currentTree = null;
  const predictionsToUpsert = [];
  const cutoffs = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

  for (let i = 0; i < draws.length; i++) {
    const targetDraw = draws[i];
    const history = draws.slice(0, i);

    let pred = [];
    if (history.length < 55) {
      pred = Array.from({ length: maxVal }, (_, idx) => idx + 1);
    } else {
      if (!currentTree || (i % 10 === 0)) {
        const trainSlice = history.slice(Math.max(0, history.length - 200));
        const { features, labels } = buildFeatureMatrix(trainSlice, maxVal, 'numbers');
        if (features.length > 0) {
          currentTree = trainDecisionTree(features, labels, 4, 10);
        }
      }

      if (currentTree) {
        const currFeats = buildCurrentFeatures(history, maxVal, 'numbers');
        const scored = currFeats.map(item => {
          const prob = predictProb(currentTree, item.sample);
          return { num: item.num, prob, freq10: item.freq10, freq50: item.freq50 };
        });

        scored.sort((a, b) => {
          const pDiff = b.prob - a.prob;
          if (Math.abs(pDiff) > 0.0001) return pDiff;
          const f10Diff = b.freq10 - a.freq10;
          if (f10Diff !== 0) return f10Diff;
          const f50Diff = b.freq50 - a.freq50;
          if (f50Diff !== 0) return f50Diff;
          return a.num - b.num;
        });
        pred = scored.map(s => s.num);
      } else {
        pred = Array.from({ length: maxVal }, (_, idx) => idx + 1);
      }
    }

    const actualNums = parseDrawArray(targetDraw.numbers);
    const hitMap = evaluateHits(pred, actualNums, cutoffs);

    // GUARDAR POOL COMPLETO (sem truncar a 10!)
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

  console.log('Gravando ' + predictionsToUpsert.length + ' previsoes de NUMEROS (POOL ' + maxVal + ') para ' + game + '...');
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
    star_hits_2: null,
    star_hits_4: null
  }));
  const outPath = '/tmp/random_forest_' + game.toLowerCase() + '.json';
  fs.writeFileSync(outPath, JSON.stringify(exported, null, 2));
  console.log('Exportado cofre consolidado para: ' + outPath + ' (' + exported.length + ' registos)');
}

async function main() {
  const start = Date.now();
  console.log('=== ATUALIZACAO: RANDOM FOREST NUMEROS (POOL COMPLETO) ===');
  for (const game of GAMES) {
    await processGameNumbers(game);
  }
  console.log('\n>>> RECALCULO TOTAL CONCLUIDO EM ' + ((Date.now() - start) / 1000).toFixed(1) + 's! <<<');
}

main().finally(() => p.$disconnect());
