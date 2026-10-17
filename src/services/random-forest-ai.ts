import { Draw } from "@prisma/client";
import type { IPredictiveSystem } from "./ranked-systems";
import type { StarSystem } from "./star-systems";
import { SeededRNG } from "../utils/seeded-rng";

function getMaxStarLocal(draws: Draw[]): number {
  if (draws.length > 0) {
    if (draws[0].game === "TOTOLOTO") return 13;
    if (draws[0].game === "EURODREAMS") return 5;
  }
  return 12; // Default to EuroMillions
}

function getPredictionCountLocal(draws: Draw[]): number {
  if (draws.length > 0) {
    const game = draws[0].game?.toUpperCase();
    if (game === "EURODREAMS") return 2;
    if (game === "TOTOLOTO") return 2;
    if (game === "EUROMILLIONS") return 4;
  }
  return 4;
}

function parseDrawArray(drawContent: string | number[] | null | undefined): number[] {
  if (typeof drawContent === "string") {
    try {
      return JSON.parse(drawContent);
    } catch {
      return [];
    }
  }
  if (Array.isArray(drawContent)) return drawContent;
  return [];
}

function getMaxNumber(game: string): number {
  const g = game?.toUpperCase();
  if (g === "TOTOLOTO") return 49;
  if (g === "EURODREAMS") return 40;
  if (g === "MEGASENA") return 60;
  return 50; // Default to EUROMILLIONS
}

// -------------------------------------------------------------
// ÁRVORE DE DECISÃO CART DETERMINÍSTICA (COM SeededRNG)
// -------------------------------------------------------------
interface DecisionTreeNode {
  isLeaf: boolean;
  prob: number;
  feat?: number;
  thresh?: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
}

function trainDecisionTree(
  X: number[][],
  y: number[],
  rng: SeededRNG,
  maxDepth = 4,
  minSamples = 10,
  featureSubsample = 4
): DecisionTreeNode {
  function gini(labels: number[]) {
    if (labels.length === 0) return 0;
    const p1 = labels.filter(l => l === 1).length / labels.length;
    return 1 - (p1 * p1 + (1 - p1) * (1 - p1));
  }

  function bestSplit(features: number[][], labels: number[]) {
    let bestGain = -1;
    let bestFeat = -1;
    let bestThresh = -1;
    const currentGini = gini(labels);
    const numFeats = features[0]?.length || 0;
    if (numFeats === 0) return { feat: -1, thresh: -1, gain: -1 };

    // Subsampling aleatório determinístico de features
    const featIndices: number[] = [];
    let attempts = 0;
    while (featIndices.length < Math.min(featureSubsample, numFeats) && attempts < 50) {
      attempts++;
      const idx = rng.nextInt(0, numFeats - 1);
      if (!featIndices.includes(idx)) featIndices.push(idx);
    }
    if (featIndices.length === 0) {
      for (let f = 0; f < numFeats; f++) featIndices.push(f);
    }

    for (const f of featIndices) {
      const vals = features.map(r => r[f]);
      const uniqueVals = Array.from(new Set(vals)).sort((a, b) => a - b);
      const step = Math.max(1, Math.floor(uniqueVals.length / 8));

      for (let i = 0; i < uniqueVals.length - 1; i += step) {
        const thresh = (uniqueVals[i] + uniqueVals[i + 1]) / 2;
        let leftCount = 0;
        let leftOnes = 0;
        let rightCount = 0;
        let rightOnes = 0;

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

  function buildTree(features: number[][], labels: number[], depth: number): DecisionTreeNode {
    const numOnes = labels.filter(l => l === 1).length;
    const prob = labels.length > 0 ? numOnes / labels.length : 0;

    if (depth >= maxDepth || labels.length < minSamples * 2 || numOnes === 0 || numOnes === labels.length) {
      return { isLeaf: true, prob };
    }

    const split = bestSplit(features, labels);
    if (split.gain <= 0 || split.feat === -1) {
      return { isLeaf: true, prob };
    }

    const leftFeats: number[][] = [];
    const leftLabels: number[] = [];
    const rightFeats: number[][] = [];
    const rightLabels: number[] = [];

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
      prob,
      feat: split.feat,
      thresh: split.thresh,
      left: buildTree(leftFeats, leftLabels, depth + 1),
      right: buildTree(rightFeats, rightLabels, depth + 1)
    };
  }

  return buildTree(X, y, 0);
}

function predictProb(tree: DecisionTreeNode, sample: number[]): number {
  if (tree.isLeaf || tree.feat === undefined || tree.thresh === undefined || !tree.left || !tree.right) {
    return tree.prob;
  }
  if (sample[tree.feat] <= tree.thresh) return predictProb(tree.left, sample);
  return predictProb(tree.right, sample);
}

function trainRandomForest(
  X: number[][],
  y: number[],
  rng: SeededRNG,
  numTrees = 8,
  maxDepth = 4,
  minSamples = 10
): DecisionTreeNode[] {
  const forest: DecisionTreeNode[] = [];
  const n = X.length;
  if (n === 0) return forest;

  for (let b = 0; b < numTrees; b++) {
    const bX: number[][] = [];
    const by: number[] = [];
    const sampleSize = Math.floor(n * 0.8);
    for (let i = 0; i < sampleSize; i++) {
      const idx = rng.nextInt(0, n - 1);
      bX.push(X[idx]);
      by.push(y[idx]);
    }
    forest.push(trainDecisionTree(bX, by, rng, maxDepth, minSamples, 4));
  }
  return forest;
}

function predictForestProb(forest: DecisionTreeNode[], sample: number[]): number {
  if (!forest || forest.length === 0) return 0;
  let total = 0;
  for (const tree of forest) {
    total += predictProb(tree, sample);
  }
  return total / forest.length;
}

// -------------------------------------------------------------
// EXTRAÇÃO DE FEATURES PARA NÚMEROS
// -------------------------------------------------------------
interface NumberFeatureItem {
  num: number;
  sample: number[];
  delay: number;
  freq10: number;
  freq50: number;
  momentum: number;
  diagScore: number;
  markovScore: number;
}

function extractNumberFeatures(historyDraws: Draw[], maxVal: number): NumberFeatureItem[] {
  const nDraws = historyDraws.length;
  if (nDraws === 0) return [];

  const parsed = historyDraws.map(d => parseDrawArray(d.numbers));
  const lastSeen = new Array(maxVal + 1).fill(-1);

  const drawHasNum: Uint8Array[] = [];
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

  const features: NumberFeatureItem[] = [];

  for (let num = 1; num <= maxVal; num++) {
    const delay = lastSeen[num] === -1 ? currIdx : (currIdx - lastSeen[num]);

    let freq10 = 0;
    for (const has of slice10) { if (has[num]) freq10++; }

    let freq50 = 0;
    for (const has of slice50) { if (has[num]) freq50++; }

    const momentum = freq10 - (freq50 / 5);

    let diagScore = 0;
    const maxSteps = Math.min(50, nDraws);
    for (let step = 0; step < maxSteps; step++) {
      const rowIdx = currIdx - step;
      if (rowIdx < 0) break;
      const weight = step === 0 ? 2 : 1;
      
      const leftCol = num - step;
      if (leftCol >= 1 && leftCol <= maxVal && drawHasNum[rowIdx][leftCol]) {
        diagScore += weight;
      }
      const rightCol = num + step;
      if (rightCol >= 1 && rightCol <= maxVal && drawHasNum[rowIdx][rightCol]) {
        diagScore += weight;
      }
    }

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

function buildNumberTrainingDataset(draws: Draw[], maxVal: number) {
  const X: number[][] = [];
  const y: number[] = [];
  if (draws.length < 55) return { X, y };

  const startIdx = Math.max(50, draws.length - 200);
  for (let i = startIdx; i < draws.length - 1; i++) {
    const historySlice = draws.slice(0, i + 1);
    const feats = extractNumberFeatures(historySlice, maxVal);
    const nextNumbers = parseDrawArray(draws[i + 1].numbers);
    const nextSet = new Set(nextNumbers);

    for (const f of feats) {
      X.push(f.sample);
      y.push(nextSet.has(f.num) ? 1 : 0);
    }
  }

  return { X, y };
}

// -------------------------------------------------------------
// CLASSE: RANDOM FOREST AI (NÚMEROS)
// -------------------------------------------------------------
export class RandomForestAISystem implements IPredictiveSystem {
  name = "Random Forest AI";
  description = "Random Forest Multidimensional com 8 árvores CART e consenso de 7 features preditivas";
  type: "neural" = "neural";
  domain: "numbers" = "numbers";

  async generateTop10(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    if (!draws || draws.length === 0) return [];

    // Garantir ordem cronológica ascendente (mais antigo -> mais recente)
    let history = [...draws];
    if (history.length > 1 && new Date(history[0].date).getTime() > new Date(history[history.length - 1].date).getTime()) {
      history.reverse();
    }

    const game = history[0]?.game || "EUROMILLIONS";
    const maxVal = getMaxNumber(game);

    if (history.length < 55) {
      const full = Array.from({ length: maxVal }, (_, i) => i + 1);
      return returnFullPool ? full : full.slice(0, 10);
    }

    const seedStr = `${history.length}-${history[history.length - 1].id}-${maxVal}`;
    const rng = new SeededRNG(seedStr);

    const { X, y } = buildNumberTrainingDataset(history, maxVal);
    let forest: DecisionTreeNode[] = [];
    if (X.length > 0) {
      forest = trainRandomForest(X, y, rng, 8, 4, 10);
    }

    if (forest.length === 0) {
      const full = Array.from({ length: maxVal }, (_, i) => i + 1);
      return returnFullPool ? full : full.slice(0, 10);
    }

    const currFeats = extractNumberFeatures(history, maxVal);
    const scored = currFeats.map(item => {
      const prob = predictForestProb(forest, item.sample);
      return {
        num: item.num,
        prob,
        diagScore: item.diagScore,
        momentum: item.momentum,
        markovScore: item.markovScore
      };
    });

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

    const sortedNums = scored.map(s => s.num);
    return returnFullPool ? sortedNums : sortedNums.slice(0, 10);
  }
}

// -------------------------------------------------------------
// EXTRAÇÃO DE FEATURES PARA ESTRELAS
// -------------------------------------------------------------
interface StarFeatureItem {
  star: number;
  sample: number[];
  delay: number;
  freq10: number;
  freq50: number;
  momentum: number;
  markovScore: number;
}

function extractStarFeatures(historyDraws: Draw[], maxStar: number): StarFeatureItem[] {
  const nDraws = historyDraws.length;
  if (nDraws === 0) return [];

  const parsed = historyDraws.map(d => parseDrawArray(d.stars));
  const lastSeen = new Array(maxStar + 1).fill(-1);

  const drawHasStar: Uint8Array[] = [];
  for (let i = 0; i < nDraws; i++) {
    const has = new Uint8Array(maxStar + 1);
    for (const s of parsed[i]) {
      if (s <= maxStar) {
        has[s] = 1;
        lastSeen[s] = i;
      }
    }
    drawHasStar.push(has);
  }

  const markovCount = Array.from({ length: maxStar + 1 }, () => new Float32Array(maxStar + 1));
  const markovTotal = new Float32Array(maxStar + 1);
  for (let i = 0; i < nDraws - 1; i++) {
    const curr = parsed[i];
    const nxt = parsed[i + 1];
    for (const u of curr) {
      if (u <= maxStar) {
        markovTotal[u] += nxt.length;
        for (const v of nxt) {
          if (v <= maxStar) markovCount[u][v]++;
        }
      }
    }
  }

  const currIdx = nDraws - 1;
  const lastStars = parsed[currIdx] || [];
  const slice10 = drawHasStar.slice(Math.max(0, nDraws - 10));
  const slice50 = drawHasStar.slice(Math.max(0, nDraws - 50));
  const expectedDelay = maxStar / (lastStars.length || 2);

  const features: StarFeatureItem[] = [];

  for (let star = 1; star <= maxStar; star++) {
    const delay = lastSeen[star] === -1 ? currIdx : (currIdx - lastSeen[star]);

    let freq10 = 0;
    for (const has of slice10) { if (has[star]) freq10++; }

    let freq50 = 0;
    for (const has of slice50) { if (has[star]) freq50++; }

    const momentum = freq10 - (freq50 / 5);

    let markovScore = 0;
    for (const u of lastStars) {
      if (u <= maxStar && markovTotal[u] > 0) {
        markovScore += (markovCount[u][star] / markovTotal[u]);
      }
    }

    const delayZScore = (delay - expectedDelay) / (expectedDelay + 0.1);

    const sample = [delay, freq10, freq50, momentum, markovScore, delayZScore];
    features.push({ star, sample, delay, freq10, freq50, momentum, markovScore });
  }

  return features;
}

function buildStarTrainingDataset(draws: Draw[], maxStar: number) {
  const X: number[][] = [];
  const y: number[] = [];
  if (draws.length < 30) return { X, y };

  const startIdx = Math.max(20, draws.length - 150);
  for (let i = startIdx; i < draws.length - 1; i++) {
    const historySlice = draws.slice(0, i + 1);
    const feats = extractStarFeatures(historySlice, maxStar);
    const nextStars = parseDrawArray(draws[i + 1].stars);
    const nextSet = new Set(nextStars);

    for (const f of feats) {
      X.push(f.sample);
      y.push(nextSet.has(f.star) ? 1 : 0);
    }
  }

  return { X, y };
}

// -------------------------------------------------------------
// CLASSE: RANDOM FOREST ESTRELAS
// -------------------------------------------------------------
export class RandomForestAIStarSystem implements StarSystem {
  name = "Random Forest Estrelas";
  description = "Classificador Random Forest para estrelas e número da sorte";
  type: "base" = "base";
  domain: "stars" = "stars";

  generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
    if (!history || history.length === 0) return [];

    let draws = [...history];
    if (draws.length > 1 && new Date(draws[0].date).getTime() > new Date(draws[draws.length - 1].date).getTime()) {
      draws.reverse();
    }

    const maxStar = getMaxStarLocal(draws);
    const predCount = returnFullPool ? maxStar : getPredictionCountLocal(draws);

    if (draws.length < 30) {
      const fallback = Array.from({ length: maxStar }, (_, i) => i + 1);
      return fallback.slice(0, predCount);
    }

    const seedStr = `stars-${draws.length}-${draws[draws.length - 1].id}-${maxStar}`;
    const rng = new SeededRNG(seedStr);

    const { X, y } = buildStarTrainingDataset(draws, maxStar);
    let forest: DecisionTreeNode[] = [];
    if (X.length > 0) {
      forest = trainRandomForest(X, y, rng, 6, 3, 5);
    }

    if (forest.length === 0) {
      const fallback = Array.from({ length: maxStar }, (_, i) => i + 1);
      return fallback.slice(0, predCount);
    }

    const currFeats = extractStarFeatures(draws, maxStar);
    const scored = currFeats.map(item => {
      const prob = predictForestProb(forest, item.sample);
      return {
        star: item.star,
        prob,
        momentum: item.momentum,
        markovScore: item.markovScore
      };
    });

    scored.sort((a, b) => {
      const pDiff = b.prob - a.prob;
      if (Math.abs(pDiff) > 0.0001) return pDiff;
      const mDiff = b.markovScore - a.markovScore;
      if (Math.abs(mDiff) > 0.001) return mDiff;
      const momDiff = b.momentum - a.momentum;
      if (momDiff !== 0) return momDiff;
      return a.star - b.star;
    });

    return scored.slice(0, predCount).map(s => s.star);
  }
}
