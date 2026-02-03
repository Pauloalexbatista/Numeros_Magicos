
import { prisma } from '../../lib/prisma';
import { evaluateDraw, evaluateDrawStars, updateRanking, initializeSystems } from '../../services/ranking';
import { processInBatches } from '../../utils/batch-processor';

async function seedTotolotoHistory() {
    console.log('🌱 Seeding Totoloto History (Filling Gaps)...');

    try {
        await initializeSystems();

        // 1. Find draws that are MISSING performance data
        // We focus on the last 200 active draws for the dashboard
        const recentDraws = await prisma.draw.findMany({
            where: { game: 'TOTOLOTO' },
            orderBy: { date: 'desc' },
            take: 200,
            include: {
                _count: {
                    select: { systemPerformances: true, starPerformances: true }
                }
            }
        });

        // Filter draws that have 0 performance records (Number OR Star)
        // Note: checking < 10 to ensure we have at least SOME systems run, not just 1.
        // If we have 50 active systems, we expect ~50 records.
        const drawsToProcess = recentDraws.filter(d =>
            d._count.systemPerformances < 5 || d._count.starPerformances < 5
        ).reverse(); // Process oldest to newest

        if (drawsToProcess.length === 0) {
            console.log('✅ Totoloto history (last 200 draws) is fully populated!');
            return;
        }

        console.log(`📦 Found ${drawsToProcess.length} draws with missing data.`);

        // 2. Process in Batches
        let processed = 0;

        await processInBatches(drawsToProcess, 5, async (draw) => {
            process.stdout.write(`\rWorking on Draw ${draw.id} (${draw.date.toISOString().split('T')[0]})... Results: Num=${draw._count.systemPerformances}, Star=${draw._count.starPerformances}`);

            // Run Number Systems
            await evaluateDraw(draw.id);
            // Run Star Systems
            await evaluateDrawStars(draw.id);

            processed++;
        }, (p, t) => {
            // logging handled above
        }, 50);

        console.log('\n');

        // 3. Update Rankings
        console.log('🔄 Updating Rankings...');
        await updateRanking();

        console.log('🎉 Totoloto Seeding Complete!');

    } catch (error) {
        console.error('\n❌ Error seeding Totoloto:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedTotolotoHistory();
