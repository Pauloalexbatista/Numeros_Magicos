
import { prisma } from '../lib/prisma';
import { rankedSystems, evaluateDraw, evaluateDrawStars, updateRanking, updateStarRankings, cachePredictions } from '../services/ranking';
import { processInBatches } from '../utils/batch-processor';

async function main() {
    process.env.FULL_RANKING_MODE = 'false'; // Ensure strict limit (25/25/20)

    console.log(`🚀 Starting FULL Recalculation (Resetting all performance data)...`);
    console.log("⚠️  This will delete all SystemPerformance and StarSystemPerformance records.");

    // 1. Get ALL draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' } // Process chronologically for correct history buildup?
        // Actually evaluateDraw uses history BEFORE the draw.
        // It doesn't matter the order of execution as long as history exists.
        // But processing chronological is nicer for logs.
    });

    console.log(`Found ${draws.length} draws to recalculate.`);

    console.log(`Phase 1: Wiping old data...`);
    await prisma.systemPerformance.deleteMany({});
    await prisma.starSystemPerformance.deleteMany({});

    // Also clear CachedPrediction/SystemRanking?
    // User said "apagar toda a BD", likely meaning performance/stats.
    // SystemRanking generates from Performance, so we should clear it or just let updateRanking upsert it.
    // Upsert is safer. But let's delete to be clean.
    await prisma.systemRanking.deleteMany({});
    await prisma.starSystemRanking.deleteMany({});
    await prisma.cachedPrediction.deleteMany({});

    console.log(`Phase 2: Recalculating All Systems...`);

    // Batch process to avoid memory issues
    await processInBatches(
        draws,
        10, // Batch size
        async (draw) => {
            // console.log(`Processing Draw ${draw.id}...`); (Too verbose for 2000 draws)
            if (draw.id % 50 === 0) process.stdout.write('.');
            try {
                await evaluateDraw(draw.id);
                await evaluateDrawStars(draw.id);
            } catch (err) {
                console.error(`❌ Error processing draw ${draw.id}:`, err);
            }
        },
        (processed, total) => {
            if (processed % 100 === 0) console.log(`\nProgress: ${processed}/${total}`);
        },
        50 // Delay
    );

    console.log(`\nPhase 3: Updating Global Rankings...`);
    await updateRanking();
    await updateStarRankings();

    console.log(`Phase 4: Caching Future Predictions...`);
    await cachePredictions();

    console.log(`✅ full Recalculation Complete!`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
