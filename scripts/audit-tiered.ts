import { PrismaClient } from '@prisma/client';
import { calculateMatrizCorte } from '../src/services/matriz-corte-engine';

const prisma = new PrismaClient();

async function runTieredAudit() {
  const g = { key: 'EUROMILLIONS', name: 'Euromilhões', totalBalls: 50, pickSize: 5 };
  const totalDrawsCount = await prisma.draw.count({ where: { game: g.key } });
  const sampleSize = 100;
  const startDraw = totalDrawsCount - sampleSize + 1;
  const endDraw = totalDrawsCount;

  console.log(`=== AUDITORIA POR NÍVEIS DE CORTE NO EUROMILHÕES (Últimos 100 Sorteios) ===\n`);

  const cutLevels = [4, 8, 12, 16, 20, 25];

  for (const nCuts of cutLevels) {
    let jackpotIntact = 0;
    let totalWinSurv = 0;
    let totalWinTest = 0;

    for (let drawIdx = startDraw; drawIdx <= endDraw; drawIdx++) {
      const result = await calculateMatrizCorte(g.key, drawIdx);
      const cuts = result.balls.slice(0, nCuts);
      const cutSet = new Set(cuts.map(b => b.ball));
      const winning = result.actualWinningNumbers || [];

      const winCut = winning.filter(n => cutSet.has(n));
      const winSurv = winning.filter(n => !cutSet.has(n));

      totalWinTest += winning.length;
      totalWinSurv += winSurv.length;

      if (winCut.length === 0) {
        jackpotIntact++;
      }
    }

    const survPct = (totalWinSurv / totalWinTest) * 100;
    console.log(`Nível: Corta ${nCuts} Bolas (Sobram ${50 - nCuts} Bolas):`);
    console.log(`  * Sobrevivência de Bolas Vencedoras: ${survPct.toFixed(1)}%`);
    console.log(`  * Jackpot 100% Intacto (5 em 5 na Pool): ${jackpotIntact}% dos sorteios\n`);
  }

  await prisma.$disconnect();
}

runTieredAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
