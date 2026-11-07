import { PrismaClient } from '@prisma/client';
import { calculateMatrizCorte } from '../src/services/matriz-corte-engine';

const prisma = new PrismaClient();

const GAMES = [
  { key: 'EUROMILLIONS', name: 'Euromilhões', sampleSize: 100 },
  { key: 'TOTOLOTO', name: 'Totoloto', sampleSize: 100 },
  { key: 'EURODREAMS', name: 'EuroDreams', sampleSize: 100 },
  { key: 'MEGASENA', name: 'Mega-Sena', sampleSize: 100 }
];

async function runAudit() {
  console.log('=== AUDITORIA HISTÓRICA WALK-FORWARD (SEM OLHAR PARA O FUTURO) ===\n');
  console.log('Para cada sorteio T, o motor só conhece os dados até T-1.\n');

  for (const g of GAMES) {
    const totalDrawsCount = await prisma.draw.count({ where: { game: g.key } });
    if (totalDrawsCount < 30) continue;

    const startDraw = Math.max(15, totalDrawsCount - g.sampleSize + 1);
    const endDraw = totalDrawsCount;
    const drawsTested = endDraw - startDraw + 1;

    console.log(`\n======================================================`);
    console.log(`>> Jogo: ${g.name} (A testar os últimos ${drawsTested} sorteios: de #${startDraw} até #${endDraw})`);
    console.log(`======================================================`);

    let jackpotIntactCount = 0;
    let totalWinningNumbersTested = 0;
    let totalWinningNumbersSurvived = 0;
    let totalBallsCutSum = 0;

    for (let drawIdx = startDraw; drawIdx <= endDraw; drawIdx++) {
      const result = await calculateMatrizCorte(g.key, drawIdx);
      const cuts = result.balls.filter(b => b.maxProximityPct >= 50.0); // Corte da meta 50%
      const cutNumbers = new Set(cuts.map(b => b.ball));
      const winning = result.actualWinningNumbers || [];

      const winningCut = winning.filter(n => cutNumbers.has(n));
      const winningSurvived = winning.filter(n => !cutNumbers.has(n));

      totalWinningNumbersTested += winning.length;
      totalWinningNumbersSurvived += winningSurvived.length;
      totalBallsCutSum += cuts.length;

      if (winningCut.length === 0) {
        jackpotIntactCount++;
      }
    }

    const jackpotRate = (jackpotIntactCount / drawsTested) * 100;
    const numberSurvivalRate = (totalWinningNumbersSurvived / totalWinningNumbersTested) * 100;
    const avgCuts = totalBallsCutSum / drawsTested;

    console.log(`Resultados do Molde para ${g.name}:`);
    console.log(`- Média de bolas cortadas por sorteio: ${avgCuts.toFixed(1)} bolas`);
    console.log(`- Taxa de sobrevivência dos números vencedores: ${numberSurvivalRate.toFixed(1)}% das bolas sorteadas sobreviveram ao corte`);
    console.log(`- Sorteios com Jackpot 100% Intacto (0 bolas vencedoras cortadas): ${jackpotIntactCount} em ${drawsTested} (${jackpotRate.toFixed(1)}%)`);
  }

  await prisma.$disconnect();
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
