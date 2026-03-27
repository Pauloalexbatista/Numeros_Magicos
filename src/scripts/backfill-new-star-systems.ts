/**
 * Backfill script for new star systems
 * Calculates performance for Clustering, Monte Carlo, and Vortex Stars
 * across all historical draws
 */

import { prisma } from '../lib/prisma';
import { starSystems } from '../services/star-systems';

async function backfillNewStarSystems() {
    console.log('🌟 BACKFILL: New Star Systems');
    console.log('═'.repeat(80));

    // Get only the new systems + their anti-systems
    const newSystemNames = [
        'Clustering Stars',
        'Monte Carlo Stars',
        'Vortex Stars',
        'Média +1 Stars',
        'Anti-Clustering Stars',
        'Anti-Monte Carlo Stars',
        'Anti-Vortex Stars',
        'Anti-Média +1 Stars'
    ];

    const systemsToBackfill = starSystems.filter(s => newSystemNames.includes(s.name));

    console.log(`📋 Systems to backfill: ${systemsToBackfill.length}`);
    systemsToBackfill.forEach(s => console.log(`   - ${s.name}`));

    // Get all draws
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    console.log(`\n📊 Total draws: ${allDraws.length}`);

    // Delete existing data for these systems (if any)
    console.log('\n🗑️  Cleaning existing data...');
    const deleted = await prisma.starSystemPerformance.deleteMany({
        where: {
            systemName: { in: newSystemNames }
        }
    });
    console.log(`   Deleted ${deleted.count} old records`);

    // Process each draw
    console.log('\n🔄 Processing draws...\n');
    let totalProcessed = 0;

    for (let i = 0; i < allDraws.length; i++) {
        const draw = allDraws[i];
        const history = allDraws.slice(i + 1, i + 201); // Next 200 draws as history

        if (history.length < 10) {
            console.log(`⏭️  Skipping draw ${i + 1}/${allDraws.length} (insufficient history)`);
            continue;
        }

        const actualStars = typeof draw.stars === 'string'
            ? (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars)
            : draw.stars;

        const performances: any[] = [];

        for (const system of systemsToBackfill) {
            try {
                const prediction = await system.generatePrediction(history as any[]);
                const hits = prediction.filter(s => actualStars.includes(s)).length;

                performances.push({
                    drawId: draw.id,
                    systemName: system.name,
                    predictedStars: JSON.stringify(prediction),
                    actualStars: JSON.stringify(actualStars),
                    hits
                });
            } catch (error) {
                console.error(`   ❌ ${system.name}: ${error}`);
            }
        }

        // Batch insert
        if (performances.length > 0) {
            await prisma.starSystemPerformance.createMany({
                data: performances
            });
        }

        totalProcessed++;
        if (totalProcessed % 10 === 0) {
            console.log(`✅ Processed ${totalProcessed}/${allDraws.length} draws...`);
        }
    }

    // Calculate stats
    console.log('\n📊 FINAL STATS:');
    for (const systemName of newSystemNames) {
        const stats = await prisma.starSystemPerformance.aggregate({
            where: { systemName },
            _count: { id: true },
            _avg: { hits: true }
        });

        const jackpots = await prisma.starSystemPerformance.count({
            where: { systemName, hits: 2 }
        });

        console.log(`\n   ${systemName}:`);
        console.log(`      Total: ${stats._count.id}`);
        console.log(`      Avg Hits: ${stats._avg.hits?.toFixed(2) || 0}`);
        console.log(`      Jackpots (2★): ${jackpots}`);
    }

    console.log('\n✨ Backfill complete!');
    console.log('═'.repeat(80));
}

backfillNewStarSystems()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
