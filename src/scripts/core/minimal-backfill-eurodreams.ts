import { prisma } from '@/lib/prisma';
import { euroDreamsRankedSystems, euroDreamsStarSystems } from '@/services/ranking';

/**
 * ULTRA-MINIMAL Backfill: Process only 5 most important systems
 * This ensures we have SOME data for EuroDreams without memory issues
 */
async function minimalBackfill() {
    console.log('⚡ Minimal EuroDreams Backfill (Top 5 Systems Only)...\n');

    // Select only the 5 most reliable base systems
    const topSystems = [
        euroDreamsRankedSystems.find(s => s.name.includes('Hot Numbers')),
        euroDreamsRankedSystems.find(s => s.name.includes('Cold Numbers')),
        euroDreamsRankedSystems.find(s => s.name.includes('Frequency')),
        euroDreamsStarSystems.find(s => s.name.includes('Hot')),
        euroDreamsStarSystems.find(s => s.name.includes('Cold'))
    ].filter(Boolean);

    console.log(`Selected ${topSystems.length} systems\n`);

    const draws = await prisma.draw.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'asc' }
    });

    console.log(`Processing ${draws.length} draws...\n`);

    for (let i = 0; i < draws.length; i++) {
        const draw = draws[i];
        const actualNumbers = JSON.parse(draw.numbers) as number[];
        const actualStars = JSON.parse(draw.stars) as number[];

        // Get ONLY last 20 draws for history (not all)
        const history = draws.slice(Math.max(0, i - 20), i);

        for (const system of topSystems) {
            try {
                const isStarSystem = system.name.includes('(EuroDreams)') &&
                    (system.name.includes('Hot Star') || system.name.includes('Cold Star'));

                let predicted: number[];
                let hits: number;
                let accuracy: number;
                let actualData: string;

                if (isStarSystem) {
                    predicted = await (system as any).generatePrediction(history);
                    hits = actualStars.filter(n => predicted.includes(n)).length;
                    accuracy = (hits / 1) * 100;
                    actualData = draw.stars;
                } else {
                    predicted = await (system as any).generateTop10(history);
                    hits = actualNumbers.filter(n => predicted.includes(n)).length;
                    accuracy = (hits / 6) * 100;
                    actualData = draw.numbers;
                }

                await prisma.systemPerformance.upsert({
                    where: {
                        drawId_systemName: {
                            drawId: draw.id,
                            systemName: system.name
                        }
                    },
                    update: {
                        predictedNumbers: JSON.stringify(predicted),
                        actualNumbers: actualData,
                        hits,
                        accuracy
                    },
                    create: {
                        drawId: draw.id,
                        systemName: system.name,
                        predictedNumbers: JSON.stringify(predicted),
                        actualNumbers: actualData,
                        hits,
                        accuracy
                    }
                });
            } catch (error) {
                console.error(`Error with ${system.name}:`, error.message);
            }
        }

        if ((i + 1) % 10 === 0) {
            console.log(`✓ ${i + 1}/${draws.length}`);
        }
    }

    console.log(`\n✅ Complete! Processed ${draws.length} draws`);

    // Update rankings
    for (const system of topSystems) {
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

minimalBackfill()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
