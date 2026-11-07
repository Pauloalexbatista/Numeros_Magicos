import { prisma } from '../src/lib/prisma';

async function calculateCorrelations() {
  const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA'];

  for (const game of games) {
    console.log(`\n======================================================`);
    console.log(`>>> MATRIZ DE CORRELAÇÃO DE SISTEMAS: ${game}`);
    console.log(`======================================================`);

    const preds = await prisma.systemPrediction.findMany({
      where: { game, domain: 'NUMBERS' },
      select: { drawId: true, systemName: true, num_hits_10: true }
    });

    // Agrupar por sorteio
    const byDraw: Record<number, Record<string, number>> = {};
    const systemsSet = new Set<string>();

    for (const p of preds) {
      if (p.num_hits_10 === null || p.num_hits_10 === undefined) continue;
      if (!byDraw[p.drawId]) byDraw[p.drawId] = {};
      byDraw[p.drawId][p.systemName] = p.num_hits_10;
      systemsSet.add(p.systemName);
    }

    const systems = Array.from(systemsSet);
    const drawIds = Object.keys(byDraw).map(Number);
    console.log(`Sorteios analisados: ${drawIds.length} | Sistemas: ${systems.length}`);

    // Identificar os pares com maior correlação negativa (Anticorrelacionados / Espelhos)
    const antiPairs: { sysA: string; sysB: string; corr: number; zeroCompensateRate: number; avgHitsBWhenAZero: number }[] = [];

    for (let i = 0; i < systems.length; i++) {
      for (let j = i + 1; j < systems.length; j++) {
        const sysA = systems[i];
        const sysB = systems[j];

        const seriesA: number[] = [];
        const seriesB: number[] = [];
        let aZeroCount = 0;
        let bHitsWhenAZero = 0;
        let bHits2PlusWhenAZero = 0;

        for (const id of drawIds) {
          const valA = byDraw[id][sysA];
          const valB = byDraw[id][sysB];
          if (valA !== undefined && valB !== undefined) {
            seriesA.push(valA);
            seriesB.push(valB);

            if (valA === 0) {
              aZeroCount++;
              bHitsWhenAZero += valB;
              if (valB >= 2) bHits2PlusWhenAZero++;
            }
          }
        }

        if (seriesA.length >= 100 && aZeroCount >= 20) {
          // Pearson Correlation
          const n = seriesA.length;
          const meanA = seriesA.reduce((a, b) => a + b, 0) / n;
          const meanB = seriesB.reduce((a, b) => a + b, 0) / n;

          let num = 0;
          let denA = 0;
          let denB = 0;
          for (let k = 0; k < n; k++) {
            const diffA = seriesA[k] - meanA;
            const diffB = seriesB[k] - meanB;
            num += diffA * diffB;
            denA += diffA * diffA;
            denB += diffB * diffB;
          }

          const den = Math.sqrt(denA * denB);
          const corr = den > 0 ? num / den : 0;
          const avgHitsB = bHitsWhenAZero / aZeroCount;
          const zeroCompensateRate = (bHits2PlusWhenAZero / aZeroCount) * 100;

          antiPairs.push({
            sysA,
            sysB,
            corr,
            zeroCompensateRate,
            avgHitsBWhenAZero: avgHitsB
          });
        }
      }
    }

    // Ordenar pelos pares mais anticorrelacionados (menor correlação de Pearson)
    antiPairs.sort((a, b) => a.corr - b.corr);

    console.log(`\nTop 5 Pares Mais Anticorrelacionados (Sistemas Opostos / Espelho):`);
    for (const p of antiPairs.slice(0, 5)) {
      console.log(`  * [${p.sysA}] vs [${p.sysB}]: Correlação = ${p.corr.toFixed(3)} | Quando ${p.sysA}=0, ${p.sysB} acerta ${p.avgHitsBWhenAZero.toFixed(2)} bolas (${p.zeroCompensateRate.toFixed(1)}% das vezes com 2+ acertos)`);
    }

    console.log(`\nTop 5 Pares Mais Fortemente Correlacionados (Sistemas Gémeos / Convergentes):`);
    for (const p of antiPairs.slice(-5).reverse()) {
      console.log(`  * [${p.sysA}] vs [${p.sysB}]: Correlação = +${p.corr.toFixed(3)} (Movem-se em uníssono)`);
    }
  }

  await prisma.$disconnect();
}

calculateCorrelations().catch(console.error);
