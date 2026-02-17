import { prisma } from '../../lib/prisma';
import { evaluateDraw, evaluateDrawStars, initializeSystems, updateRanking, updateStarRankings, cachePredictions } from '../../services/ranking';
import { processInBatches } from '../../utils/batch-processor';

async function main() {
    console.log('🚀 SMART BACKFILL: Filling missing performance entries...');

    try {
        await initializeSystems();

        const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

        for (const game of games) {
            console.log(`\n📦 Processing Game: ${game}`);

            const draws = await prisma.draw.findMany({
                where: { game },
                orderBy: { date: 'asc' }
            });

            console.log(`   📚 Found ${draws.length} draws in total.`);

            // Skip first 5 draws as we need history to predict
            const drawsToProcess = draws.slice(5);

            await processInBatches(
                drawsToProcess,
                1, // Only 1 draw at a time for SQLite stability
                async (draw) => {
                    await evaluateDraw(draw.id);
                    await evaluateDrawStars(draw.id);
                },
                (processed, total) => {
                    process.stdout.write(`\r      ⏳ Progress: ${processed}/${total} draws processed`);
                },
                100 // 100ms delay between draws
            );
            console.log(`\n   ✅ ${game} backfill complete.`);
        }

        console.log('\n📊 Updating rankings and cache...');
        await updateRanking();
        await updateStarRankings();
        await cachePredictions();

        console.log('\n✨ SMART BACKFILL COMPLETE!');

    } catch (error) {
        console.error('❌ Error during smart backfill:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
