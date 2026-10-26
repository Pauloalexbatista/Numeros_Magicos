const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCalibration() {
  const check = await prisma.draw.findFirst({
    where: { OR: [{ game: 'lotofacil' }, { game: 'LOTOFACIL' }] }
  });
  const gameKey = check ? check.game : 'LOTOFACIL';

  const draws = await prisma.draw.findMany({
    where: { game: gameKey },
    orderBy: { date: 'asc' },
    select: { sequenceNumber: true, numbers: true, date: true }
  });

  const parsed = draws.map(d => JSON.parse(d.numbers));
  console.log('Testando calibração em', parsed.length, 'sorteios da Lotofácil.');

  const testSize = 100;
  const startIdx = parsed.length - testSize;

  let totalHits20 = 0;
  let hits15 = 0, hits14 = 0, hits13 = 0, hits12 = 0, hits11 = 0;

  for (let i = startIdx; i < parsed.length; i++) {
    const actual = parsed[i];
    const history = parsed.slice(0, i).reverse();

    const cycleSeen = new Set();
    let cycleLen = 0;
    for (let c = 0; c < Math.min(history.length, 12); c++) {
      cycleLen++;
      for (const n of history[c]) cycleSeen.add(n);
      if (cycleSeen.size === 25) break;
    }
    const missingInCycle = [];
    for (let n = 1; n <= 25; n++) {
      if (!cycleSeen.has(n)) missingInCycle.push(n);
    }

    const last2 = history.slice(0, 2);
    const freqX = {};
    for (let n = 1; n <= 25; n++) freqX[n] = 0;
    for (const r of last2) {
      for (const n of r) freqX[n]++;
    }

    const lastDraw = history[0];
    const lastSet = new Set(lastDraw);

    const streak = {};
    for (let n = 1; n <= 25; n++) {
      let s = 0;
      while (s < history.length && history[s].includes(n)) s++;
      streak[n] = s;
    }

    const cx1 = new Set();
    const cx3 = new Set();
    const cx2 = [];

    if (cycleLen >= 4 && missingInCycle.length > 0 && missingInCycle.length <= 2) {
      for (const m of missingInCycle) cx1.add(m);
    }

    const scoreForRetention = [];
    for (let n = 1; n <= 25; n++) {
      if (cx1.has(n)) continue;

      let score = 50;

      if (freqX[n] === 0) {
        if (missingInCycle.includes(n) && cycleLen >= 3) score += 35;
        else score += 10;
      } else if (freqX[n] === 1) {
        score += 15;
      } else if (freqX[n] >= 2) {
        if (streak[n] >= 4) score -= 30;
        else score += 5;
      }

      if (lastSet.has(n)) score += 12;

      scoreForRetention.push({ n, score });
    }

    scoreForRetention.sort((a, b) => a.score - b.score);
    for (let k = 0; k < 5; k++) {
      cx3.add(scoreForRetention[k].n);
    }

    const bestCandidates = scoreForRetention.slice(5).reverse();
    for (const item of bestCandidates) {
      if (cx1.size < 10) cx1.add(item.n);
    }

    for (let n = 1; n <= 25; n++) {
      if (!cx1.has(n) && !cx3.has(n)) cx2.push(n);
    }

    const primes = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);
    const cx1Arr = Array.from(cx1);
    const needImpar = 8 - cx1Arr.filter(n => n % 2 !== 0).length;
    const needBaixo = 7 - cx1Arr.filter(n => n <= 12).length;
    const needPrimo = 5 - cx1Arr.filter(n => primes.has(n)).length;

    const scoredCx2 = cx2.map(n => {
      let fit = 0;
      const isImp = n % 2 !== 0;
      const isBx = n <= 12;
      const isPrim = primes.has(n);

      if (needImpar > 0 && isImp) fit += 4;
      if (needImpar <= 0 && !isImp) fit += 4;

      if (needBaixo > 0 && isBx) fit += 3;
      if (needBaixo <= 0 && !isBx) fit += 3;

      if (needPrimo > 0 && isPrim) fit += 3;
      if (needPrimo <= 0 && !isPrim) fit += 2;

      fit += (freqX[n] * 0.5);
      return { n, fit };
    });

    scoredCx2.sort((a, b) => b.fit - a.fit);
    const cx2Ordered = scoredCx2.map(x => x.n);

    const fullPred = [...Array.from(cx1), ...cx2Ordered, ...Array.from(cx3)];
    const top20 = fullPred.slice(0, 20);

    const hits = top20.filter(n => actual.includes(n)).length;
    totalHits20 += hits;
    if (hits === 15) hits15++;
    if (hits === 14) hits14++;
    if (hits === 13) hits13++;
    if (hits === 12) hits12++;
    if (hits === 11) hits11++;
  }

  console.log('=== RESULTADOS NOS ÚLTIMOS 100 SORTEIOS (CALIBRAÇÃO REGRA DAS X BOLAS) ===');
  console.log('Média de acertos nas 20:', (totalHits20 / testSize).toFixed(2), '/ 15 (' + ((totalHits20 / (testSize * 15)) * 100).toFixed(1) + '%)');
  console.log('15 Acertos (Jackpots no grupo):', hits15);
  console.log('14 Acertos (Prémios Altos):', hits14, '(' + ((hits14/testSize)*100).toFixed(1) + '%)');
  console.log('13 Acertos:', hits13);
  console.log('12 Acertos:', hits12);
  console.log('11 Acertos:', hits11);

  await prisma.$disconnect();
}

testCalibration().catch(console.error);
