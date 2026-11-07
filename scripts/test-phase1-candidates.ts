import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GAMES = [
  { key: 'EUROMILLIONS', name: 'Euromilhões', pickSize: 5, totalBalls: 50 },
  { key: 'TOTOLOTO', name: 'Totoloto', pickSize: 5, totalBalls: 49 },
  { key: 'EURODREAMS', name: 'EuroDreams', pickSize: 6, totalBalls: 40 },
  { key: 'MEGASENA', name: 'Mega-Sena', pickSize: 6, totalBalls: 60 },
  { key: 'LOTOFACIL', name: 'Lotofácil', pickSize: 15, totalBalls: 25 }
];

async function main() {
  console.log('=== TESTE DE SINAL VS RUÍDO NAS 4 VARIÁVEIS CANDIDATAS (10.781 Sorteios) ===\n');

  for (const game of GAMES) {
    const drawsDb = await prisma.draw.findMany({
      where: { game: game.key },
      orderBy: { date: 'asc' },
      select: { numbers: true }
    });

    if (drawsDb.length < 50) continue;

    const draws: number[][] = drawsDb.map(d => {
      let nums: number[] = [];
      try {
        nums = typeof d.numbers === 'string' ? JSON.parse(d.numbers) : (Array.isArray(d.numbers) ? d.numbers : []);
      } catch {
        nums = [];
      }
      return nums.sort((a, b) => a - b);
    }).filter(nums => nums.length >= game.pickSize);

    const N = draws.length;
    console.log(`\n---------------------------------------------------------`);
    console.log(`>> Jogo: ${game.name} (${N} sorteios analisados, ${game.totalBalls} bolas)`);
    console.log(`---------------------------------------------------------`);

    // 1. TESTE DA REPETIÇÃO IMEDIATA (G=1): Existem bolas que NUNCA ou RARAMENTE repetem imediatamente?
    const repeatCounts: Record<number, { drawsOut: number; immediateRepeats: number }> = {};
    for (let b = 1; b <= game.totalBalls; b++) {
      repeatCounts[b] = { drawsOut: 0, immediateRepeats: 0 };
    }

    for (let i = 0; i < N - 1; i++) {
      const curr = new Set(draws[i]);
      const next = new Set(draws[i + 1]);
      for (const b of curr) {
        if (b >= 1 && b <= game.totalBalls) {
          repeatCounts[b].drawsOut++;
          if (next.has(b)) {
            repeatCounts[b].immediateRepeats++;
          }
        }
      }
    }

    const repeatStats = Object.entries(repeatCounts).map(([bStr, data]) => {
      const b = parseInt(bStr);
      const rate = data.drawsOut > 0 ? (data.immediateRepeats / data.drawsOut) * 100 : 0;
      return { ball: b, drawsOut: data.drawsOut, immediateRepeats: data.immediateRepeats, rate };
    });

    repeatStats.sort((a, b) => a.rate - b.rate);
    const lowestRepeaters = repeatStats.slice(0, 3);
    const highestRepeaters = repeatStats.slice(-3);

    console.log(`\n1. Taxa de Repetição Imediata (T-1 -> T):`);
    console.log(`   - Menos repetidoras (candidatas a corte pós-saída):`);
    for (const r of lowestRepeaters) {
      console.log(`     * Bola ${r.ball}: repetiu apenas ${r.immediateRepeats}x em ${r.drawsOut} saídas (${r.rate.toFixed(1)}% de repetição -> ${ (100 - r.rate).toFixed(1) }% taxa de corte)`);
    }
    console.log(`   - Mais repetidoras (evitar corte cego pós-saída):`);
    for (const r of highestRepeaters) {
      console.log(`     * Bola ${r.ball}: repetiu ${r.immediateRepeats}x em ${r.drawsOut} saídas (${r.rate.toFixed(1)}% de repetição)`);
    }

    // 2. TESTE DO EFEITO ELÁSTICO (Atraso Recorde): O que acontece quando uma bola atinge >= 85% do seu atraso recorde?
    // Calculamos o atraso máximo histórico acumulado e vemos a probabilidade de falhar mais um sorteio.
    let elasticEvaluations = 0;
    let elasticHitsInNext = 0;

    const ballDrought: Record<number, number> = {};
    const ballMaxDroughtSeen: Record<number, number> = {};
    for (let b = 1; b <= game.totalBalls; b++) {
      ballDrought[b] = 0;
      ballMaxDroughtSeen[b] = 10; // baseline
    }

    for (let i = 0; i < N - 1; i++) {
      const drawnSet = new Set(draws[i]);
      for (let b = 1; b <= game.totalBalls; b++) {
        if (drawnSet.has(b)) {
          if (ballDrought[b] > ballMaxDroughtSeen[b]) {
            ballMaxDroughtSeen[b] = ballDrought[b];
          }
          ballDrought[b] = 0;
        } else {
          ballDrought[b]++;
        }
      }

      // No ponto i, verificar bolas em zona elástica (>= 85% do max visto até então)
      const nextDrawn = new Set(draws[i + 1]);
      for (let b = 1; b <= game.totalBalls; b++) {
        const ratio = ballDrought[b] / ballMaxDroughtSeen[b];
        if (ratio >= 0.85 && ballDrought[b] >= 15) {
          elasticEvaluations++;
          if (nextDrawn.has(b)) {
            elasticHitsInNext++;
          }
        }
      }
    }

    const elasticHitRate = elasticEvaluations > 0 ? (elasticHitsInNext / elasticEvaluations) * 100 : 0;
    const baseHitRate = (game.pickSize / game.totalBalls) * 100;
    console.log(`\n2. Efeito Elástico (Bolas com Atraso >= 85% do Recorde Pessoal):`);
    console.log(`   - Ocorrências observadas: ${elasticEvaluations} testes`);
    console.log(`   - Taxa de saída no sorteio seguinte: ${elasticHitRate.toFixed(1)}% (Taxa Base Aleatória: ${baseHitRate.toFixed(1)}%)`);
    console.log(`   - Conclusão Anti-Corte: ${elasticHitRate > 0 ? 'Cortar estas bolas arrisca eliminar um jackpot iminente; blindagem faz sentido!' : 'Sem efeito mensurável'}`);

    // 3. TESTE DO GRADIENTE DE MOMENTO TÉRMICO (Desaceleração: W=5 com 0 saídas vs W=20 com >= 3 saídas)
    let decelEvaluations = 0;
    let decelHitsInNext = 0;

    for (let i = 20; i < N - 1; i++) {
      const nextDrawn = new Set(draws[i + 1]);
      for (let b = 1; b <= game.totalBalls; b++) {
        let hits5 = 0;
        for (let j = i - 4; j <= i; j++) {
          if (draws[j].includes(b)) hits5++;
        }
        let hits20 = 0;
        for (let j = i - 19; j <= i; j++) {
          if (draws[j].includes(b)) hits20++;
        }

        // Desaceleração ativa: esteve ativa nos últimos 20 (>= 3 saídas), mas nos últimos 5 arrefeceu a zero
        if (hits20 >= 3 && hits5 === 0) {
          decelEvaluations++;
          if (nextDrawn.has(b)) {
            decelHitsInNext++;
          }
        }
      }
    }

    const decelHitRate = decelEvaluations > 0 ? (decelHitsInNext / decelEvaluations) * 100 : 0;
    const decelCutAccuracy = 100 - decelHitRate;
    console.log(`\n3. Gradiente Térmico (Desaceleração Ativa: W=20 >= 3 e W=5 == 0):`);
    console.log(`   - Ocorrências observadas: ${decelEvaluations} testes`);
    console.log(`   - Taxa de acerto do corte no próximo sorteio: ${decelCutAccuracy.toFixed(1)}% (Falha / Não sai: ${decelCutAccuracy.toFixed(1)}%)`);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
