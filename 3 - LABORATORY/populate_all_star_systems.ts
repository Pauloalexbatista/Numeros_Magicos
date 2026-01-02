import { PrismaClient } from '@prisma/client';
import { starSystems } from '../src/services/star-systems';

const prisma = new PrismaClient();

async function populateAllStarSystems() {
    console.log('\n🌟 POPULATING ALL STAR SYSTEMS IN LABORATORY\n');
    console.log('='.repeat(60));

    // Get all historical draws
    const draws = await prisma.draw.findMany({
        orderBy: { id: 'asc' },
    });

    console.log(`\n📊 Found ${draws.length} historical draws`);
    console.log(`🎯 Processing ${starSystems.length} star systems\n`);

    for (const system of starSystems) {
        console.log(`\n🔄 Processing: ${system.name}...`);

        let totalHits = 0;
        let jackpots = 0;
        let totalPredictions = 0;

        // Process each draw
        for (let i = 0; i < draws.length; i++) {
            const draw = draws[i];
            const history = draws.slice(0, i).reverse(); // History before this draw

            if (history.length < 10) continue; // Need at least 10 draws of history

            try {
                // Generate prediction
                const predicted = await system.generatePrediction(history);
                const actualStars = JSON.parse(draw.stars) as number[];

                // Calculate hits
                const hits = actualStars.filter(s => predicted.includes(s)).length;
                totalHits += hits;
                totalPredictions++;

                if (hits === 2) jackpots++;

                // Delete existing performance if any
                await prisma.starSystemPerformance.deleteMany({
                    where: {
                        drawId: draw.id,
                        systemName: system.name,
                    },
                });

                // Create new performance
                await prisma.starSystemPerformance.create({
                    data: {
                        drawId: draw.id,
                        systemName: system.name,
                        predictedStars: JSON.stringify(predicted),
                        actualStars: JSON.stringify(actualStars),
                        hits,
                    },
                });

            } catch (error) {
                console.error(`  ❌ Error on draw ${draw.id}:`, error);
            }
        }

        // Calculate accuracy
        const avgAccuracy = totalPredictions > 0 ? (totalHits / (totalPredictions * 2)) * 100 : 0;

        // Update ranking
        await prisma.starSystemRanking.upsert({
            where: { systemName: system.name },
            update: {
                avgAccuracy,
                jackpots,
                totalHits,
                totalPredictions,
            },
            create: {
                systemName: system.name,
                avgAccuracy,
                jackpots,
                totalHits,
                totalPredictions,
            },
        });

        console.log(`  ✅ ${system.name}: ${avgAccuracy.toFixed(2)}% accuracy, ${jackpots} jackpots`);
    }

    console.log('\n\n✅ ALL SYSTEMS POPULATED SUCCESSFULLY!\n');

    // Show final ranking
    const ranking = await prisma.starSystemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
    });

    console.log('\n📊 FINAL RANKING:\n');
    ranking.forEach((s, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${s.systemName.padEnd(30)} - ${s.avgAccuracy.toFixed(2)}% (${s.jackpots} JPs)`);
    });

    await prisma.$disconnect();
}

populateAllStarSystems().catch(console.error);
