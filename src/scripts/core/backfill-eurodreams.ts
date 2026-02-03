import { prisma } from '@/lib/prisma';
import { evaluateDraw, evaluateDrawStars } from '@/services/ranking';

/**
 * Backfill rankings specifically for EuroDreams draws
 * Processes in small batches to avoid memory issues
 */
async function backfillEuroDreams() {
    console.log('🔄 Starting EuroDreams Backfill...\n');

    // Get all EuroDreams draws that need evaluation
    const draws = await prisma.draw.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'asc' }, // Process oldest first
        include: {
            systemPerformances: true
        }
    });

    console.log(`Found ${draws.length} EuroDreams draws`);

    let processed = 0;
    let skipped = 0;
    const batchSize = 10; // Process 10 draws at a time

    for (let i = 0; i < draws.length; i += batchSize) {
        const batch = draws.slice(i, i + batchSize);

        console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(draws.length / batchSize)}...`);

        for (const draw of batch) {
            // Check if already evaluated
            if (draw.systemPerformances.length > 0) {
                skipped++;
                process.stdout.write('.');
                continue;
            }

            try {
                // Evaluate numbers
                await evaluateDraw(draw.id);

                // Evaluate Dream Number (stars)
                await evaluateDrawStars(draw.id);

                processed++;
                process.stdout.write('✓');
            } catch (error) {
                console.error(`\n❌ Error evaluating draw ${draw.id}:`, error);
            }
        }

        // Small delay between batches to allow garbage collection
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n\n✅ Backfill Complete!`);
    console.log(`   Processed: ${processed}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${draws.length}`);
}

backfillEuroDreams()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
