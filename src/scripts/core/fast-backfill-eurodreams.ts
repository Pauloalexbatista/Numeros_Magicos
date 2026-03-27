import { prisma } from '@/lib/prisma';
import { euroDreamsRankedSystems, euroDreamsStarSystems } from '@/services/ranking';

/**
 * Fast backfill for EuroDreams - evaluates only BASE systems (not ensembles)
 * This dramatically reduces processing time while still providing useful rankings
 */
async function fastBackfillEuroDreams() {
    console.log('⚡ Fast EuroDreams Backfill (Base Systems Only)...\n');

    // Filter to only base systems (exclude ensembles which are slow)
    const baseNumberSystems = euroDreamsRankedSystems.filter(s =>
        !s.name.includes('Medal') &&
        !s.name.includes('Ensemble') &&
        !s.name.includes('Neural') &&
        !s.name.includes('Random Forest')
    );

    const baseStarSystems = euroDreamsStarSystems.filter(s =>
        !s.name.includes('Medal') &&
        !s.name.includes('Ensemble')
    );

    console.log(`Selected ${baseNumberSystems.length} number systems`);
    console.log(`Selected ${baseStarSystems.length} star systems\n`);

    const draws = await prisma.draw.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'asc' }
    });

    console.log(`Processing ${draws.length} draws...\n`);

    let processed = 0;

    for (const draw of draws) {
        const actualNumbers = (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers) as number[];
        const actualStars = (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars) as number[];

        // Get history before this draw
        const history = await prisma.draw.findMany({
            where: {
                game: 'EURODREAMS',
                date: { lt: draw.date }
            },
            orderBy: { date: 'desc' }
        });

        // Evaluate number systems
        for (const system of baseNumberSystems) {
            try {
                const predicted = await system.generateTop10(history);
                const hits = actualNumbers.filter(n => predicted.includes(n)).length;
                const accuracy = (hits / 6) * 100; // 6 numbers in EuroDreams

                await prisma.systemPerformance.upsert({
                    where: {
                        drawId_systemName: {
                            drawId: draw.id,
                            systemName: system.name
                        }
                    },
                    update: {
                        predictedNumbers: JSON.stringify(predicted),
                        actualNumbers: draw.numbers,
                        hits,
                        accuracy
                    },
                    create: {
                        drawId: draw.id,
                        systemName: system.name,
                        predictedNumbers: JSON.stringify(predicted),
                        actualNumbers: draw.numbers,
                        hits,
                        accuracy
                    }
                });
            } catch (error) {
                console.error(`Error with ${system.name}:`, error.message);
            }
        }

        // Evaluate star systems
        for (const system of baseStarSystems) {
            try {
                const predicted = await system.generatePrediction(history);
                const hits = actualStars.filter(n => predicted.includes(n)).length;
                const accuracy = (hits / 1) * 100; // 1 Dream Number

                await prisma.systemPerformance.upsert({
                    where: {
                        drawId_systemName: {
                            drawId: draw.id,
                            systemName: system.name
                        }
                    },
                    update: {
                        predictedNumbers: JSON.stringify(predicted),
                        actualNumbers: draw.stars,
                        hits,
                        accuracy
                    },
                    create: {
                        drawId: draw.id,
                        systemName: system.name,
                        predictedNumbers: JSON.stringify(predicted),
                        actualNumbers: draw.stars,
                        hits,
                        accuracy
                    }
                });
            } catch (error) {
                console.error(`Error with ${system.name}:`, error.message);
            }
        }

        processed++;
        if (processed % 10 === 0) {
            console.log(`✓ Processed ${processed}/${draws.length} draws`);
        }
    }

    console.log(`\n✅ Backfill Complete! Processed ${processed} draws`);

    // Update rankings
    console.log('\n📊 Updating rankings...');
    const systems = await prisma.rankedSystem.findMany({
        where: { game: 'EURODREAMS' }
    });

    for (const system of systems) {
        const performances = await prisma.systemPerformance.findMany({
            where: { systemName: system.name }
        });

        if (performances.length === 0) continue;

        const totalAccuracy = performances.reduce((sum, p) => sum + p.accuracy, 0);
        const avgAccuracy = totalAccuracy / performances.length;

        await prisma.systemRanking.upsert({
            where: { systemName: system.name },
            update: {
                avgAccuracy,
                totalPredictions: performances.length,
                lastUpdated: new Date()
            },
            create: {
                systemName: system.name,
                avgAccuracy,
                totalPredictions: performances.length
            }
        });
    }

    console.log('✅ Rankings updated!');
}

fastBackfillEuroDreams()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
