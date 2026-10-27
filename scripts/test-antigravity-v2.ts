import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function predictAntigravityV2(history: { numbers: number[] }[], maxNum: number, returnCount: number): number[] {
  if (history.length < 30) {
    return Array.from({ length: returnCount }, (_, i) => i + 1);
  }

  const totalBalls = maxNum;
  const numDecades = Math.ceil(totalBalls / 10);

  // 1. Matriz de Co-ocorrência dos últimos 100 sorteios
  const pairMatrix: number[][] = Array.from({ length: totalBalls + 1 }, () => new Array(totalBalls + 1).fill(0));
  const recentWindow = Math.min(100, history.length);

  for (let t = 0; t < recentWindow; t++) {
    const nums = history[t].numbers;
    const w = 1.0 / Math.sqrt(t + 1);
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const a = nums[i], b = nums[j];
        if (a <= totalBalls && b <= totalBalls) {
          pairMatrix[a][b] += w;
          pairMatrix[b][a] += w;
        }
      }
    }
  }

  // Sementes dos últimos 3 sorteios (o pulso cinético imediato)
  const lastDrawNums = history[0].numbers;

  // 2. Pontuação por Ressonância de Pares com os últimos sorteios
  const resonanceScore: number[] = new Array(totalBalls + 1).fill(0);
  for (let b = 1; b <= totalBalls; b++) {
    for (const seed of lastDrawNums) {
      if (seed <= totalBalls) {
        resonanceScore[b] += pairMatrix[b][seed];
      }
    }
  }

  // 3. Cadência de Atraso
  const delays: number[] = new Array(totalBalls + 1).fill(history.length);
  for (let b = 1; b <= totalBalls; b++) {
    for (let t = 0; t < history.length; t++) {
      if (history[t].numbers.includes(b)) {
        delays[b] = t;
        break;
      }
    }
  }

  // 4. Score Composto
  const expectedCadence = totalBalls / 5.0;
  const candidates: { num: number; score: number; decade: number }[] = [];

  for (let b = 1; b <= totalBalls; b++) {
    const delay = delays[b];
    // Evitar repetição imediata excessiva (ressaca de 1 sorteio reduz um pouco, atraso entre 3 e 18 atinge o pico)
    let delayFactor = 1.0;
    if (delay === 0) delayFactor = 0.6; // Saiu no sorteio anterior
    else if (delay >= 3 && delay <= 18) delayFactor = 1.35; // Zona de retorno ouro
    else if (delay > 35) delayFactor = 0.75; // Frio em demasia

    const score = (resonanceScore[b] * 0.7) * delayFactor;
    const decade = Math.min(numDecades, Math.floor((b - 1) / 10) + 1);
    candidates.push({ num: b, score, decade });
  }

  // 5. Alocação Balanceada (Mínimo de 3 e Máximo de 6 por década)
  const selected: number[] = [];
  const selectedSet = new Set<number>();

  // Primeiro garante 3 bolas em cada uma das 5 décadas
  for (let d = 1; d <= numDecades; d++) {
    const decCandidates = candidates.filter(c => c.decade === d).sort((a, b) => b.score - a.score);
    const take = Math.min(3, decCandidates.length);
    for (let i = 0; i < take; i++) {
      selected.push(decCandidates[i].num);
      selectedSet.add(decCandidates[i].num);
    }
  }

  // Depois preenche até ao pool total (25 bolas) com as de maior score global respeitando max 6 por década
  const decadeCounts: Record<number, number> = {};
  for (let d = 1; d <= numDecades; d++) decadeCounts[d] = 3;

  const remaining = candidates.filter(c => !selectedSet.has(c.num)).sort((a, b) => b.score - a.score);
  for (const c of remaining) {
    if (selected.length >= returnCount) break;
    if (decadeCounts[c.decade] < 6) {
      selected.push(c.num);
      selectedSet.add(c.num);
      decadeCounts[c.decade]++;
    }
  }

  // Se faltar algum para atingir returnCount
  for (const c of remaining) {
    if (selected.length >= returnCount) break;
    if (!selectedSet.has(c.num)) {
      selected.push(c.num);
      selectedSet.add(c.num);
    }
  }

  return selected;
}

async function testGame(game: string, maxNum: number) {
  const rawDraws = await prisma.draw.findMany({
    where: { game },
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
  }).filter(d => d.numbers.length === 5);

  const distribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalTested = 0;

  for (let i = 50; i < parsedDraws.length; i++) {
    const history = parsedDraws.slice(0, i).reverse();
    const actual = parsedDraws[i].numbers;

    const prediction = predictAntigravityV2(history, maxNum, 25);
    const predSet = new Set(prediction);
    let hits = 0;
    for (const w of actual) {
      if (predSet.has(w)) hits++;
    }
    distribution[hits]++;
    totalTested++;
  }

  console.log(`\n======================================================`);
  console.log(`Resultados Antigravity V2 em ${game} (${totalTested} sorteios):`);
  console.log(`======================================================`);
  for (let h = 5; h >= 0; h--) {
    const count = distribution[h];
    const pct = ((count / totalTested) * 100).toFixed(2);
    console.log(`  ${h} acertos: ${count.toString().padStart(4, ' ')} vezes (${pct}%)`);
  }
  console.log(`Jackpots: ${distribution[5]} | Traves (4): ${distribution[4]} | Total 4 e 5: ${distribution[5] + distribution[4]} (${(((distribution[5] + distribution[4]) / totalTested) * 100).toFixed(2)}%)`);
}

async function main() {
  await testGame('TOTOLOTO', 49);
  await testGame('EUROMILLIONS', 50);
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
});
