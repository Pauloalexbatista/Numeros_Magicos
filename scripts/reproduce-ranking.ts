
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reproduceRankingMetrics(game: string = 'EURODREAMS', timeframe: 'last20') {
    console.log(`🔍 Reproducing Ranking Metrics for ${game} (${timeframe})...`);

    // 1. Determine Draw Range
    const drawCount = timeframe === 'last20' ? 20 : 100;
    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' }, // Fix: Order by Date
        take: drawCount,
        select: { id: true, date: true }
    });

    if (draws.length === 0) {
        console.log('No draws found');
        return;
    }

    const drawIds = draws.map(d => d.id);
    console.log(`Fetched ${draws.length} draws.`);
    // const startDrawId = draws[draws.length - 1].id; // No longer needed for logic, but for logging ok

    // 2. Fetch Performance Data
    const performances = await prisma.systemPerformance.findMany({
        where: {
            drawId: { in: drawIds }, // Fix: Use IN operator
            draw: { game },
            system: { domain: 'NUMBERS' } // STRICTLY Numbers (Restored filter)
        },
        select: {
            systemName: true,
            drawId: true,
            hits: true,
            accuracy: true
        }
    });

    console.log(`Fetched ${performances.length} performance records.`);

    // Check specific system
    const targetSys = 'Hot Numbers (EuroDreams)';
    const targetPerfs = performances.filter(p => p.systemName === targetSys);
    console.log(`Records for '${targetSys}': ${targetPerfs.length}`);
    targetPerfs.forEach(p => console.log(` - Draw ${p.drawId}: ${p.hits} hits`));

    // 3. Aggregate Stats (Exact logic from actions.ts)
    const stats: Record<string, any> = {};

    performances.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = {
                name: p.systemName,
                hits3: 0, hits4: 0, hits5: 0, hits6: 0,
                totalPreds: 0, sumAccuracy: 0
            };
        }

        const s = stats[p.systemName];
        s.totalPreds++;
        s.sumAccuracy += p.accuracy;

        if (p.hits === 3) s.hits3++;
        if (p.hits === 4) s.hits4++;
        if (p.hits === 5) s.hits5++;
        if (p.hits === 6 && game === 'EURODREAMS') s.hits6++;
    });

    const s = stats[targetSys];
    if (s) {
        console.log(`\nAggregated Stats for ${targetSys}:`);
        console.log(`Total Preds: ${s.totalPreds}`);
        let qualityScore = (s.hits3 * 1) + (s.hits4 * 10) + (s.hits5 * 100);
        if (game === 'EURODREAMS') {
            qualityScore = (s.hits4 * 1) + (s.hits5 * 10) + (s.hits6 * 100);
        }

        console.log(`Aggregated Stats for ${targetSys}:`);
        console.log(`Total Preds: ${s.totalPreds}`);
        console.log(`Hits: 3=${s.hits3}, 4=${s.hits4}, 5=${s.hits5}, 6=${s.hits6}`);

        // Check score calculation details
        const edScore = (s.hits4 * 1) + (s.hits5 * 10) + (s.hits6 * 100);
        console.log(`ED Score Calc (1/10/100): ${edScore}`);

        const standardScore = (s.hits3 * 1) + (s.hits4 * 10) + (s.hits5 * 100);
        console.log(`Standard Score Calc (1/10/100): ${standardScore}`);

        console.log(`Quality Score: ${edScore}`); // Assuming ED logic

        const totalWins = s.hits3 + s.hits4 + s.hits5 + s.hits6;
        const winRate = s.totalPreds > 0 ? (totalWins / s.totalPreds) * 100 : 0;
        console.log(`Win Rate: ${winRate}%`);
    } else {
        console.log(`System ${targetSys} not found in aggregated stats.`);
    }
}

reproduceRankingMetrics('EURODREAMS', 'last20')
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
