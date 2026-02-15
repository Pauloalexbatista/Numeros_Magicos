import { prisma } from '@/lib/prisma';
import { evaluateDraw, evaluateDrawStars, updateRanking, initializeSystems } from '@/services/ranking';

async function main() {
    console.log('🔄 Full Recalculation for Recent EuroDreams Draws...');

    // 1. Cleanup: Deactivate "Turbo Backfill" systems (named with _EURODREAMS suffix)
    // These caused the 6-hit anomaly due to 25-number prediction size.
    console.log('🧹 Cleaning up incorrect systems...');
    await prisma.rankedSystem.updateMany({
        where: { name: { endsWith: '_EURODREAMS' } },
        data: { isActive: false }
    });
    console.log('✅ Disabled _EURODREAMS systems.');

    // 2. Initialize Correct Systems (named "Name (EuroDreams)")
    console.log('🛠️  Initializing canonical systems...');
    await initializeSystems();

    // 3. Recalculate
    const draws = await prisma.draw.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'desc' },
        take: 10
    });

    console.log(`Found ${draws.length} draws. Processing...`);

    for (const draw of draws) {
        console.log(`\n📅 Processing ${draw.date.toISOString().split('T')[0]} (ID: ${draw.id})...`);

        // We force recalculation of missing systems by relying on evaluateDraw logic
        // But evaluateDraw only calculates if NOT exists.
        // To be safe, we might want to delete performance for these draws first?
        // Or trust evaluateDraw to fill gaps.
        // Given we want to fill "missing" systems, evaluateDraw is perfect.

        try {
            // CRITICAL: Delete existing performance first!
            // The turbo-backfill script generated 25 numbers (too many for EuroDreams),
            // causing inflated 100% accuracy. We want standard 18 numbers.
            const pDeleted = await prisma.systemPerformance.deleteMany({
                where: { drawId: draw.id }
            });
            const sDeleted = await prisma.starSystemPerformance.deleteMany({
                where: { drawId: draw.id }
            });
            console.log(`   Deleted ${pDeleted.count} performances and ${sDeleted.count} star perfs to force clean recalc.`);

            await evaluateDraw(draw.id);
            await evaluateDrawStars(draw.id);
            console.log(`✅ Draw ${draw.id} processed.`);
        } catch (error) {
            console.error(`❌ Error processing draw ${draw.id}:`, error);
        }
    }

    console.log('\n📊 Updating Rankings...');
    await updateRanking();

    console.log('✅ Done!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
