import { prisma } from '@/lib/prisma';
import { rankedSystems, getMaxNumber } from '@/services/ranked-systems';

/**
 * Incremental update for SystemPrediction table
 * Adds predictions for the LATEST draw only (fast update after new draw)
 */

async function updateSystemPredictionsIncremental() {
    console.log('🔄 INCREMENTAL UPDATE: SystemPrediction');
    console.log('═'.repeat(80));

    // Get latest draw
    const latestDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    });

    if (!latestDraw) {
        console.log('❌ No draws found!');
        return;
    }

    console.log(`📅 Latest draw: ${new Date(latestDraw.date).toLocaleDateString('pt-PT')}`);

    // Check if already calculated
    const existing = await prisma.systemPrediction.count({
        where: { drawId: latestDraw.id }
    });

    if (existing > 0) {
        console.log(`✅ Already calculated (${existing} systems). Skipping.`);
        return;
    }

    // Get history (excluding latest draw)
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        skip: 1, // Skip the latest draw
        take: 200, // Use last 200 draws for prediction
        select: { id: true, date: true, numbers: true }
    });

    console.log(`📚 Using ${history.length} draws for prediction`);
    console.log(`🎯 Calculating for ${rankedSystems.length} systems...\\n`);

    const actualNumbers = typeof latestDraw.numbers === 'string'
        ? JSON.parse(latestDraw.numbers)
        : latestDraw.numbers;

    let processed = 0;
    const predictions: any[] = [];

    for (const system of rankedSystems) {
        try {
            process.stdout.write(`[${processed + 1}/${rankedSystems.length}] ${system.name.padEnd(30)}... `);

            // Get prediction
            const prediction = await system.generateTop10(history as any[]);

            // Anti-system (ALL numbers NOT predicted)
            const maxNum = getMaxNumber(history as any[]);
            const allNums = Array.from({ length: maxNum }, (_, i) => i + 1);
            const antiPrediction = allNums.filter(n => !prediction.includes(n));
            // No slice! InverseSystem already returns ALL non-predicted numbers

            // Count hits
            const hits = prediction.filter(n => actualNumbers.includes(n)).length;
            const antiHits = antiPrediction.filter(n => actualNumbers.includes(n)).length;

            predictions.push({
                drawId: latestDraw.id,
                systemName: system.name,
                prediction: JSON.stringify(prediction),
                antiPrediction: JSON.stringify(antiPrediction),
                hits,
                antiHits,
                jackpot: hits === 5,
                antiJackpot: antiHits === 5
            });

            console.log(`✅ Hits: ${hits}/5 | Anti: ${antiHits}/5`);
            processed++;

        } catch (error) {
            console.log(`❌ Error: ${error}`);
        }
    }

    // Batch insert
    if (predictions.length > 0) {
        console.log(`\\n💾 Saving ${predictions.length} predictions...`);
        await prisma.systemPrediction.createMany({
            data: predictions
        });
        console.log('✅ Saved!');
    }

    // Stats
    const jackpots = predictions.filter(p => p.jackpot).length;
    const antiJackpots = predictions.filter(p => p.antiJackpot).length;

    console.log('\\n📊 STATS:');
    console.log(`   Systems: ${predictions.length}`);
    console.log(`   Jackpots (5/5): ${jackpots}`);
    console.log(`   Anti-Jackpots (5/5): ${antiJackpots}`);

    console.log('\\n✨ Incremental update complete!');
    console.log('═'.repeat(80));
}

updateSystemPredictionsIncremental()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
