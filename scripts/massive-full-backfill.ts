import { prisma } from '../src/lib/prisma';
import { evaluateDraw, evaluateDrawStars, updateRanking, updateStarRankings, cachePredictions } from '../src/services/ranking';

async function massiveBackfill() {
    console.log('🚀 INITIALIZING MASSIVE HISTORICAL BACKFILL');
    const startTime = Date.now();

    const games = ['EURODREAMS', 'EUROMILLIONS', 'TOTOLOTO'];

    for (const game of games) {
        console.log(`\n\n${'='.repeat(50)}`);
        console.log(`🎮 PROCESSING GAME: ${game}`);
        console.log(`${'='.repeat(50)}`);

        // Fetch all draws for this game in chronological order
        const draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' },
            select: { id: true, date: true }
        });

        console.log(`Found ${draws.length} draws to evaluate for ${game}.`);

        let processedCount = 0;
        const total = draws.length;

        for (const draw of draws) {
            try {
                // Check if we already have performance for this draw (basic check)
                const existingCount = await prisma.systemPerformance.count({
                    where: { drawId: draw.id, game }
                });

                // Optimization: If we have at least 11 systems calculated (base count), skip
                if (existingCount >= 11) {
                    processedCount++;
                    if (processedCount % 50 === 0) {
                        process.stdout.write('.');
                    }
                    continue;
                }

                // Evaluate Draw (Numbers)
                await evaluateDraw(draw.id);

                // Evaluate Draw (Stars)
                await evaluateDrawStars(draw.id);

                processedCount++;

                if (processedCount % 10 === 0 || processedCount === total) {
                    const elapsed = Math.round((Date.now() - startTime) / 1000);
                    console.log(`\n[${game}] Progress: ${processedCount}/${total} draws. Elapsed: ${elapsed}s`);
                }
            } catch (error) {
                console.error(`\n❌ Error evaluating draw ${draw.id} (${game}):`, error);
            }
        }
    }

    console.log('\n\nFinalizing... Updating rankings and cache.');
    await updateRanking();
    await updateStarRankings();
    await cachePredictions();

    const totalElapsed = Math.round((Date.now() - startTime) / 1000 / 60);
    console.log(`\n✅ MASSIVE BACKFILL COMPLETED in ${totalElapsed} minutes.`);
}

massiveBackfill().catch(err => {
    console.error('CRITICAL BACKFILL ERROR:', err);
    process.exit(1);
});
