import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GameConfig {
  game: string;
  maxNum: number;
  pickCount: number; // e.g. 25
  winningBalls: number; // e.g. 5
}

const GAME_CONFIGS: Record<string, GameConfig> = {
  TOTOLOTO: { game: 'TOTOLOTO', maxNum: 49, pickCount: 25, winningBalls: 5 },
  EUROMILLIONS: { game: 'EUROMILLIONS', maxNum: 50, pickCount: 25, winningBalls: 5 },
  MEGASENA: { game: 'MEGASENA', maxNum: 60, pickCount: 30, winningBalls: 6 },
  EURODREAMS: { game: 'EURODREAMS', maxNum: 40, pickCount: 20, winningBalls: 6 }
};

/**
 * SISTEMA ANTIGRAVITY: HARMONIA DIMENSIONAL (Algoritmo Determinístico Walk-Forward)
 * 
 * Regras estritas:
 * 1. ZERO Lookahead Bias: Para prever o sorteio t, apenas sorteios < t são processados.
 * 2. Vetor 1: Gravidade Cinética Hiperbólica (Decaimento temporal 1/sqrt(k)).
 * 3. Vetor 2: Tensão Elástica de Retorno (Atraso atual vs Cadência média teórica).
 * 4. Vetor 3: Regularização Harmónica por Quotas Dimensionais (Evita vazios em qualquer década).
 */
export function predictAntigravityHarmonic(history: { numbers: number[] }[], maxNum: number, returnCount: number): number[] {
  if (history.length < 20) {
    return Array.from({ length: returnCount }, (_, i) => i + 1);
  }

  // history[0] é o mais recente (T-1)
  const totalBalls = maxNum;
  const numDecades = Math.ceil(totalBalls / 10);

  // 1. Calcular Cadência e Atraso Atual de cada bola
  const lastSeenDelay: number[] = new Array(totalBalls + 1).fill(history.length);
  const totalAppearances: number[] = new Array(totalBalls + 1).fill(0);
  const kineticScore: number[] = new Array(totalBalls + 1).fill(0);

  // Janela de momentum: 60 sorteios anteriores
  const windowSize = Math.min(60, history.length);
  for (let t = 0; t < windowSize; t++) {
    const drawNums = history[t].numbers;
    const decayWeight = 1.0 / Math.sqrt(t + 1); // decaimento hiperbólico

    for (const num of drawNums) {
      if (num >= 1 && num <= totalBalls) {
        kineticScore[num] += decayWeight;
      }
    }
  }

  // Calcular atraso desde a última aparição
  for (let b = 1; b <= totalBalls; b++) {
    for (let t = 0; t < history.length; t++) {
      if (history[t].numbers.includes(b)) {
        lastSeenDelay[b] = t;
        break;
      }
    }
  }

  // 2. Pontuação Base Bruta: Combinação de Momentum (70%) + Tensão de Atraso (30%)
  // Atraso ideal: entre 4 e 15 sorteios (região de retorno elástico)
  const rawScore: { num: number; score: number; decade: number }[] = [];

  for (let b = 1; b <= totalBalls; b++) {
    const delay = lastSeenDelay[b];
    // Função de ressonância de atraso (curva de campânula centrada na cadência média esperada)
    const expectedCadence = totalBalls / 5.0; // ex: 49/5 = 9.8
    const delayTension = Math.exp(-Math.pow(delay - expectedCadence, 2) / (2 * Math.pow(expectedCadence * 0.8, 2)));

    const score = (kineticScore[b] * 0.65) + (delayTension * 1.5);
    const decade = Math.min(numDecades, Math.floor((b - 1) / 10) + 1);
    rawScore.push({ num: b, score, decade });
  }

  // 3. Alocação por Quotas Dimensionais (Garante que nenhuma década fica a zeros!)
  // Vagas por década proporcionais: para Totoloto (49 bolas), são 5 décadas.
  // Em 25 bolas, cada década recebe entre 4 e 6 bolas.
  const quotaPerDecade = Math.floor(returnCount / numDecades); // ex: 25 / 5 = 5
  const selected: number[] = [];
  const selectedSet = new Set<number>();

  // Agrupar por década ordenado por score desc
  for (let d = 1; d <= numDecades; d++) {
    const decadeCandidates = rawScore.filter(item => item.decade === d).sort((a, b) => b.score - a.score);
    const take = Math.min(quotaPerDecade, decadeCandidates.length);
    for (let i = 0; i < take; i++) {
      selected.push(decadeCandidates[i].num);
      selectedSet.add(decadeCandidates[i].num);
    }
  }

  // Preencher as vagas restantes com as melhores bolas globais não selecionadas
  const remainingCandidates = rawScore.filter(item => !selectedSet.has(item.num)).sort((a, b) => b.score - a.score);
  for (const item of remainingCandidates) {
    if (selected.length >= returnCount) break;
    selected.push(item.num);
    selectedSet.add(item.num);
  }

  return selected;
}

async function runSimulation(gameKey: string) {
  const cfg = GAME_CONFIGS[gameKey];
  if (!cfg) return;

  const rawDraws = await prisma.draw.findMany({
    where: { game: cfg.game },
    orderBy: { date: 'asc' },
    select: { id: true, date: true, numbers: true }
  });

  const parsedDraws = rawDraws.map(d => {
    let nums: number[] = [];
    if (typeof d.numbers === 'string') {
      try { nums = JSON.parse(d.numbers); } catch { nums = []; }
    } else if (Array.isArray(d.numbers)) {
      nums = d.numbers as unknown as number[];
    }
    return { id: d.id, date: d.date, numbers: nums };
  }).filter(d => d.numbers.length === cfg.winningBalls);

  console.log(`\n======================================================`);
  console.log(`SIMULAÇÃO HISTÓRICA DO SISTEMA ANTIGRAVITY: ${cfg.game}`);
  console.log(`Total de Sorteios Válidos: ${parsedDraws.length}`);
  console.log(`Pool Predito: ${cfg.pickCount} bolas | Bolas Sorteadas: ${cfg.winningBalls}`);
  console.log(`======================================================`);

  if (parsedDraws.length < 50) {
    console.log('Sorteios insuficientes para teste.');
    return;
  }

  const distribution: Record<number, number> = {};
  for (let h = 0; h <= cfg.winningBalls; h++) distribution[h] = 0;

  let totalTested = 0;
  // Começamos após os primeiros 50 sorteios (período de aquecimento)
  for (let i = 50; i < parsedDraws.length; i++) {
    // RIGOR WALK-FORWARD: apenas sorteios anteriores (do mais recente i-1 até 0)
    const history = parsedDraws.slice(0, i).reverse();
    const actual = parsedDraws[i].numbers;

    const prediction = predictAntigravityHarmonic(history, cfg.maxNum, cfg.pickCount);

    const predSet = new Set(prediction);
    let hits = 0;
    for (const w of actual) {
      if (predSet.has(w)) hits++;
    }

    distribution[hits]++;
    totalTested++;
  }

  console.log(`\nResultados Walk-Forward (em ${totalTested} sorteios):`);
  let jackpots = distribution[cfg.winningBalls] || 0;
  let nearJackpots = distribution[cfg.winningBalls - 1] || 0;
  let zeros = distribution[0] || 0;

  for (let h = cfg.winningBalls; h >= 0; h--) {
    const count = distribution[h] || 0;
    const pct = ((count / totalTested) * 100).toFixed(2);
    const star = h === cfg.winningBalls ? ' 🏆 JACKPOT!' : h === (cfg.winningBalls - 1) ? ' 🥈 Trave (Quase)' : h === 0 ? ' ⚖️ Zero (Anti-Jackpot)' : '';
    console.log(`  ${h} acertos: ${count.toString().padStart(4, ' ')} vezes (${pct}%)${star}`);
  }

  console.log(`\n📊 Rácio de Separação (5s + 0s): ${jackpots + zeros} (${(((jackpots + zeros) / totalTested) * 100).toFixed(2)}%)`);
  console.log(`🎯 Jackpots Puros: ${jackpots} (1 a cada ${(totalTested / (jackpots || 1)).toFixed(1)} sorteios)`);
  console.log(`🥈 Traves (${cfg.winningBalls - 1} acertos): ${nearJackpots} (${(((nearJackpots) / totalTested) * 100).toFixed(2)}%)`);
}

async function main() {
  await runSimulation('TOTOLOTO');
  await runSimulation('EUROMILLIONS');
}

main().catch(console.error).finally(() => prisma.$disconnect());
