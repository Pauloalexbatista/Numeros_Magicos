import { prisma } from '@/lib/prisma';
import { starSystems } from '@/services/star-systems';

/**
 * Incremental update for starSystemPerformance table
 * Adds performance data for the LATEST draw only
 */

async function updateStarSystemsIncremental() {
    console.log('🔄 INCREMENTAL UPDATE: starSystemPerformance');
    console.log('═'.repeat(80));

    // Get latest draw
    const latestDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' },
        select: { id: true, date: true, stars: true }
    });

    if (!latestDraw) {
        console.log('❌ No draws found!');
        return;
    }

    console.log(`📅 Latest draw: ${new Date(latestDraw.date).toLocaleDateString('pt-PT')}`);

    // Check if already calculated
    const existing = await prisma.starSystemPerformance.count({
        where: { drawId: latestDraw.id }
    });

    if (existing > 0) {
        console.log(`✅ Already calculated (${existing} systems). Skipping.`);
        return;
    }

    // Get history (excluding latest draw)
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        skip: 1,
        take: 200
    });

    console.log(`📚 Using ${history.length} draws for prediction`);
    console.log(`🎯 Calculating for ${starSystems.length} star systems...\n`);

    const actualStars = typeof latestDraw.stars === 'string'
        ? JSON.parse(latestDraw.stars)
        : latestDraw.stars;

    let processed = 0;
    const performances: any[] = [];

    for (const system of starSystems) {
        try {
            process.stdout.write(`[${processed + 1}/${starSystems.length}] ${system.name.padEnd(30)}... `);

            // Get prediction
            const prediction = await system.generatePrediction(history as any[]);

            // Count hits
            const hits = prediction.filter(s => actualStars.includes(s)).length;

            performances.push({
                drawId: latestDraw.id,
                systemName: system.name,
                predictedStars: JSON.stringify(prediction),
                actualStars: JSON.stringify(actualStars),
                hits
            });

            const accuracy = (hits / 2) * 100;
            console.log(`✅ Hits: ${hits}/2 (${accuracy.toFixed(0)}%)`);
            processed++;

        } catch (error) {
            console.log(`❌ Error: ${error}`);
        }
    }

    // Batch insert
    if (performances.length > 0) {
        console.log(`\n💾 Saving ${performances.length} performances...`);
        await prisma.starSystemPerformance.createMany({
            data: performances
        });
        console.log('✅ Saved!');
    }

    // Stats
    const perfect = performances.filter(p => p.hits === 2).length;
    const good = performances.filter(p => p.hits === 1).length;

    console.log('\n📊 STATS:');
    console.log(`   Systems: ${performances.length}`);
    console.log(`   Perfect (2/2): ${perfect}`);
    console.log(`   Good (1/2): ${good}`);

    console.log('\n✨ Incremental update complete!');
    console.log('═'.repeat(80));
}

updateStarSystemsIncremental()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
