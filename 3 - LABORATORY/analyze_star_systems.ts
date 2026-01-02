import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeStarSystems() {
    console.log('\n🌟 ANÁLISE DE SISTEMAS DE ESTRELAS\n');
    console.log('='.repeat(60));

    // Top 10 sistemas
    const top10 = await prisma.starSystemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 10,
    });

    console.log('\n📊 TOP 10 SISTEMAS DE ESTRELAS:\n');
    top10.forEach((s, i) => {
        console.log(`${i + 1}. ${s.systemName.padEnd(30)} - ${s.avgAccuracy.toFixed(2)}% (${s.jackpots} JPs)`);
    });

    // Análise de complementaridade
    console.log('\n\n🔗 ANÁLISE DE COMPLEMENTARIDADE (Pares):\n');

    const draws = await prisma.draw.findMany({
        orderBy: { id: 'desc' },
        take: 100,
    });

    const systemNames = top10.map(s => s.systemName);
    const pairResults: any[] = [];

    for (let i = 0; i < systemNames.length; i++) {
        for (let j = i + 1; j < systemNames.length; j++) {
            const sys1 = systemNames[i];
            const sys2 = systemNames[j];

            let combinedJackpots = 0;
            let sys1Alone = 0;
            let sys2Alone = 0;

            for (const draw of draws) {
                const actualStars = JSON.parse(draw.stars);

                // Get predictions
                const perf1 = await prisma.starSystemPerformance.findFirst({
                    where: { drawId: draw.id, systemName: sys1 },
                });
                const perf2 = await prisma.starSystemPerformance.findFirst({
                    where: { drawId: draw.id, systemName: sys2 },
                });

                if (perf1 && perf2) {
                    const pred1 = JSON.parse(perf1.predictedStars);
                    const pred2 = JSON.parse(perf2.predictedStars);

                    const hits1 = actualStars.filter((s: number) => pred1.includes(s)).length;
                    const hits2 = actualStars.filter((s: number) => pred2.includes(s)).length;

                    if (hits1 === 2) sys1Alone++;
                    if (hits2 === 2) sys2Alone++;
                    if (hits1 === 2 || hits2 === 2) combinedJackpots++;
                }
            }

            const coverage = (combinedJackpots / draws.length) * 100;
            const complementarity = combinedJackpots - Math.max(sys1Alone, sys2Alone);

            pairResults.push({
                pair: `${sys1} + ${sys2}`,
                combinedJackpots,
                coverage: coverage.toFixed(1),
                complementarity,
            });
        }
    }

    pairResults.sort((a, b) => b.combinedJackpots - a.combinedJackpots);

    console.log('\nTOP 5 MELHORES PARES (mais jackpots combinados):\n');
    pairResults.slice(0, 5).forEach((p, i) => {
        console.log(`${i + 1}. ${p.pair}`);
        console.log(`   → ${p.combinedJackpots} JPs combinados (${p.coverage}% cobertura)`);
        console.log(`   → Complementaridade: ${p.complementarity > 0 ? '+' : ''}${p.complementarity}\n`);
    });

    await prisma.$disconnect();
}

analyzeStarSystems().catch(console.error);
