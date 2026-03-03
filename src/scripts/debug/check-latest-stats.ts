
import { prisma } from '../../lib/prisma';
import { prismaProd } from '../../lib/prisma-prod';

async function checkLatestStats() {
    console.log('🔍 Checking Latest Draws & Stats (Local vs Prod)...\n');

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];
    const prod = prismaProd as any;

    for (const game of games) {
        console.log(`\n=== ${game} ===`);

        // Get last 2 draws Local
        const localDraws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'desc' },
            take: 2
        });

        for (const draw of localDraws) {
            console.log(`📅 Draw #${draw.id} (${draw.date.toISOString().split('T')[0]})`);

            // Check Local
            const localPerf = await prisma.systemPerformance.count({ where: { drawId: draw.id } });
            const localPred = await prisma.systemPrediction.count({ where: { drawId: draw.id } });

            // Check Prod
            const prodDraw = await prod.draw.findUnique({ where: { id: draw.id } });
            let prodPerf = 0;
            let prodPred = 0;

            if (prodDraw) {
                prodPerf = await prod.systemPerformance.count({ where: { drawId: draw.id } });
                prodPred = await prod.systemPrediction.count({ where: { drawId: draw.id } });
            }

            console.log(`   [LOCAL] Perf: ${localPerf} | Pred: ${localPred}`);
            console.log(`   [PROD ] Found: ${!!prodDraw} | Perf: ${prodPerf} | Pred: ${prodPred}`);

            if (prodDraw && (prodPerf === 0 || prodPred === 0)) {
                console.log(`   ❌ MISSING DATA IN PROD!`);
            }
        }
    }
}

checkLatestStats()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await (prismaProd as any).$disconnect();
    });
