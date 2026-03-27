
import { prisma } from '@/lib/prisma';
import { starSystems } from '@/services/star-systems';

const BATCH_SIZE = 50; // Number of past draws to evaluate

async function seedStarHistory() {
    console.log('⭐ SEEDING STAR SYSTEM HISTORY');
    console.log('═'.repeat(60));

    // Get last N draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: BATCH_SIZE + 50 // Fetch extra for history context
    });

    if (draws.length < 50) {
        console.log('⚠️ Not enough draws to seed history.');
        return;
    }

    // We process the first BATCH_SIZE draws (newest ones)
    // The "extra" ones are just history for the oldest of the batch
    const targetDraws = draws.slice(0, BATCH_SIZE);

    // Sort oldest to newest for cleaner logs, but calculations work per draw
    const sortedTargetDraws = targetDraws.reverse();

    console.log(`🎯 Evaluating ${sortedTargetDraws.length} draws for ${starSystems.length} star systems...`);

    let processed = 0;

    for (const draw of sortedTargetDraws) {
        process.stdout.write(`Evaluating Draw ${draw.id} (${draw.date.toISOString().split('T')[0]})... `);

        // History for THIS draw (must be draws BEFORE this one)
        const drawIndex = draws.findIndex(d => d.id === draw.id);

        // Take history starting from the draw AFTER this one (since draws is sorted DESC)
        // Wait, draws is DESC. So draws[drawIndex + 1...end] are older.
        const historyForDraw = draws.slice(drawIndex + 1);

        if (historyForDraw.length < 10) {
            console.log('Skipping (insufficient history)');
            continue;
        }

        const actualStars = typeof draw.stars === 'string'
            ? (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars)
            : draw.stars;

        const performances: any[] = [];

        for (const system of starSystems) {
            try {
                const prediction = await system.generatePrediction(historyForDraw as any[]);
                const hits = prediction.filter(s => actualStars.includes(s)).length;

                // Check duplicates effectively
                const existing = await prisma.starSystemPerformance.findFirst({
                    where: {
                        drawId: draw.id,
                        systemName: system.name
                    }
                });

                if (!existing) {
                    performances.push({
                        drawId: draw.id,
                        systemName: system.name,
                        predictedStars: JSON.stringify(prediction),
                        actualStars: JSON.stringify(actualStars),
                        hits
                    });
                }
            } catch (error) {
                // Ignore errors to keep flowing
            }
        }

        if (performances.length > 0) {
            await prisma.starSystemPerformance.createMany({
                data: performances
            });
            console.log(`✅ Saved ${performances.length} records`);
        } else {
            console.log('⏭️ No new records');
        }
        processed++;
    }

    console.log('\n✅ Seeding Complete!');
}

seedStarHistory()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
