
import { prisma } from '../lib/prisma';
import { rankedSystems, evaluateDraw, evaluateDrawStars, updateRanking, updateStarRankings, cachePredictions } from '../services/ranking';
import { processInBatches } from '../utils/batch-processor';

async function main() {
    // FORCE FULL RANKING MODE
    process.env.FULL_RANKING_MODE = 'true';

    const LIMIT = 100; // Last 100 draws (~1 year of EuroMillions bi-weekly)

    console.log(`🚀 Starting Surgical Backfill for the last ${LIMIT} draws...`);
    console.log("⚠️  This will overwrite existing performance data with FULL RANKINGS (up to 50 numbers).");

    // 1. Get last N draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: LIMIT
    });

    // Process from oldest to newest
    const sortedDraws = draws.reverse();

    console.log(`Phase 1: Deleting old performance data for these ${sortedDraws.length} draws...`);
    const drawIds = sortedDraws.map(d => d.id);

    await prisma.systemPerformance.deleteMany({
        where: { drawId: { in: drawIds } }
    });

    await prisma.starSystemPerformance.deleteMany({
        where: { drawId: { in: drawIds } }
    });

    console.log(`Phase 2: Recalculating with Full Ranking...`);

    await processInBatches(
        sortedDraws,
        5, // Batch size
        async (draw) => {
            console.log(`Processing Draw ${draw.id} (${draw.game} - ${draw.date.toISOString().split('T')[0]})...`);
            try {
                // Determine max complexity based on game or time? 
                // Just run standard evaluation.
                await evaluateDraw(draw.id);
                await evaluateDrawStars(draw.id);
            } catch (err) {
                console.error(`❌ Error processing draw ${draw.id}:`, err);
            }
        },
        (processed, total) => {
            console.log(`Progress: ${processed}/${total}`);
        },
        100 // Delay
    );

    console.log(`Phase 3: Updating Rankings...`);
    await updateRanking();
    await updateStarRankings();

    console.log(`Phase 4: Caching Future Predictions...`);
    await cachePredictions();

    console.log(`✅ Surgical Backfill Complete!`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
