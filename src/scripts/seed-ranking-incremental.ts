import { prisma } from '../lib/prisma';
import { evaluateDraw, updateRanking, cachePredictions, initializeSystems } from '../services/ranking';

const BATCH_SIZE = 50;

async function main() {
    console.log('🌱 Incremental Ranking Seeding...');

    try {
        await initializeSystems();

        // 1. Find last processed draw
        // We look for the most recent draw that has ANY system performance recorded
        const lastPerformance = await prisma.systemPerformance.findFirst({
            orderBy: { draw: { date: 'desc' } },
            include: { draw: true }
        });

        let lastDate = new Date('1900-01-01'); // Default to beginning of time
        if (lastPerformance) {
            lastDate = lastPerformance.draw.date;
            console.log(`📍 Resuming from draw date: ${lastDate.toISOString().split('T')[0]}`);
        } else {
            console.log('📍 No previous performance found. Starting from beginning.');
        }

        // 2. Fetch next batch of draws
        const drawsToProcess = await prisma.draw.findMany({
            where: {
                date: { gt: lastDate }
            },
            orderBy: { date: 'asc' }, // Oldest first (chronological)
            take: BATCH_SIZE
        });

        if (drawsToProcess.length === 0) {
            console.log('✅ All caught up! No new draws to process.');
            return;
        }

        console.log(`📦 Processing batch of ${drawsToProcess.length} draws...`);

        // 3. Process batch
        let processed = 0;
        for (const draw of drawsToProcess) {
            process.stdout.write(`\r⏳ Processing draw ${draw.id} (${draw.date.toISOString().split('T')[0]})...`);

            await evaluateDraw(draw.id);
            processed++;
        }
        console.log('\n'); // New line after progress

        // 4. Update Rankings & Cache
        console.log('🔄 Updating Global Rankings...');
        await updateRanking();

        console.log('💾 Caching Future Predictions...');
        await cachePredictions();

        // 5. Feedback
        const remaining = await prisma.draw.count({
            where: { date: { gt: drawsToProcess[drawsToProcess.length - 1].date } }
        });

        console.log('--------------------------------------------------');
        console.log(`✅ Batch complete! Processed ${processed} draws.`);
        if (remaining > 0) {
            console.log(`⚠️  ${remaining} draws remaining. RUN SCRIPT AGAIN to continue.`);
        } else {
            console.log('🎉 All history processed!');
        }
        console.log('--------------------------------------------------');

    } catch (error) {
        console.error('❌ Error in incremental seeding:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
