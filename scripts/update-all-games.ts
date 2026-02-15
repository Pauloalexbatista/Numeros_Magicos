/**
 * Update All Games - CachedPrediction & SystemRanking
 * 
 * Updates current predictions and rankings for ALL games:
 * - EuroMillions
 * - Totoloto
 * - EuroDreams
 */

import { PrismaClient } from '@prisma/client';
import { numberBaseSystems } from '../src/services/ranked-systems';
import { starBaseSystems } from '../src/services/star-systems';

const prisma = new PrismaClient();

async function processGame(game: 'EUROMILLIONS' | 'TOTOLOTO' | 'EURODREAMS') {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎮 Processing ${game}`);
    console.log('='.repeat(60));

    const history = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' }
    });

    if (history.length === 0) {
        console.log(`⚠️  No draws found for ${game}`);
        return;
    }

    console.log(`📊 Found ${history.length} draws\n`);

    // Process number systems
    console.log(`🔢 Number Systems:`);
    for (const system of numberBaseSystems) {
        const prediction = await system.generateTop10(history);

        await prisma.cachedPrediction.upsert({
            where: {
                systemName_game: {
                    systemName: system.name,
                    game
                }
            },
            update: {
                numbers: JSON.stringify(prediction),
                updatedAt: new Date()
            },
            create: {
                systemName: system.name,
                game,
                numbers: JSON.stringify(prediction)
            }
        });

        console.log(`  ✅ ${system.name}: ${prediction.length} numbers`);
    }

    // Process star systems
    console.log(`\n⭐ Star Systems:`);
    for (const system of starBaseSystems) {
        const prediction = await system.generatePrediction(history);

        await prisma.cachedPrediction.upsert({
            where: {
                systemName_game: {
                    systemName: system.name,
                    game
                }
            },
            update: {
                numbers: JSON.stringify(prediction),
                updatedAt: new Date()
            },
            create: {
                systemName: system.name,
                game,
                numbers: JSON.stringify(prediction)
            }
        });

        console.log(`  ✅ ${system.name}: ${prediction.length} stars`);
    }

    // Calculate rankings
    console.log(`\n📊 Calculating Rankings...`);
    const recentDraws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' },
        take: 20
    });

    const predictions = await prisma.cachedPrediction.findMany({
        where: { game }
    });

    for (const pred of predictions) {
        let totalHits = 0;
        let totalPossible = 0;

        const isStarSystem = starBaseSystems.some(s => s.name === pred.systemName);

        for (const draw of recentDraws) {
            const drawnNumbers = JSON.parse(draw.numbers) as number[];
            const drawnStars = JSON.parse(draw.stars) as number[];
            const predictedItems = JSON.parse(pred.numbers) as number[];

            if (isStarSystem) {
                const starHits = predictedItems.filter(s => drawnStars.includes(s)).length;
                totalHits += starHits;
                totalPossible += drawnStars.length;
            } else {
                const numberHits = predictedItems.filter(n => drawnNumbers.includes(n)).length;
                totalHits += numberHits;
                totalPossible += drawnNumbers.length;
            }
        }

        const accuracy = totalPossible > 0 ? (totalHits / totalPossible) * 100 : 0;

        await prisma.systemRanking.upsert({
            where: {
                systemName_game: {
                    systemName: pred.systemName,
                    game
                }
            },
            update: {
                avgAccuracy: accuracy,
                totalPredictions: recentDraws.length,
                lastUpdated: new Date()
            },
            create: {
                systemName: pred.systemName,
                game,
                avgAccuracy: accuracy,
                totalPredictions: recentDraws.length
            }
        });
    }

    console.log(`✅ ${game} complete!`);
}

async function main() {
    console.log('🔄 Updating All Games...\n');

    await processGame('EUROMILLIONS');
    await processGame('TOTOLOTO');
    await processGame('EURODREAMS');

    const finalCached = await prisma.cachedPrediction.count();
    const finalRankings = await prisma.systemRanking.count();

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ ALL GAMES UPDATED!');
    console.log('='.repeat(60));
    console.log(`📊 Total CachedPrediction: ${finalCached} (expected: 72 = 24 systems × 3 games)`);
    console.log(`📊 Total SystemRanking: ${finalRankings} (expected: 72 = 24 systems × 3 games)\n`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
