
// import { prisma } from '../../lib/prisma';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
        }
    }
});
import { starSystems } from '../../services/star-systems';
import { Draw } from '@prisma/client';

async function main() {
    const args = process.argv.slice(2);
    // Usage: txs script limit game
    const LIMIT = args[0] && args[0] !== '0' ? parseInt(args[0]) : undefined;
    const GAME = args[1]?.toUpperCase() || 'EUROMILLIONS';

    console.log(`🌟 TURBO STARS: Initializing for ${GAME}...`);
    const startTime = performance.now();

    // Determine Star Count
    let starCount = 2; // Euromillions
    if (GAME === 'TOTOLOTO' || GAME === 'EURODREAMS') starCount = 1;

    // 1. Get History (Oldest First)
    const draws = await prisma.draw.findMany({
        where: { game: GAME },
        orderBy: { date: 'asc' },
        take: LIMIT
    });
    console.log(`📚 Loaded ${draws.length} draws.`);

    if (draws.length === 0) {
        console.warn('⚠️ No draws found. Exiting.');
        return;
    }

    // 2. Initialize Systems in DB
    console.log('🛠️  Registering Star Systems...');
    for (const system of starSystems) {
        // Suffix System Name if not Euromillions
        const originalName = system.name; // Keep for logic
        let dbSystemName = system.name;

        if (GAME !== 'EUROMILLIONS') {
            if (!dbSystemName.endsWith(`_${GAME}`)) {
                dbSystemName = `${dbSystemName}_${GAME}`;
            }
        }

        // We temporarily mutate the system name to match DB for this run.
        // Ideally we should clone the system or handle this better, but for scripts it's okay.
        // Wait, starSystems are singletons in the service export?
        // Actually they are instances in the array.
        // Let's just use dbSystemName for DB ops, and keep system.name as is if possible?
        // But the system might rely on its name? 'star-systems.ts' doesn't seem to use 'this.name' for logic.

        // HOWEVER, if we change the system name in the object, next run for another game might see the suffix?
        // Since the script runs once per process, it's fine.
        system.name = dbSystemName;

        await prisma.starSystemRanking.upsert({
            where: { systemName: dbSystemName },
            update: {},
            create: {
                systemName: dbSystemName,
                avgAccuracy: 0,
                totalPredictions: 0,
                totalHits: 0
            }
        });
    }

    // 3. Process Each System
    for (const system of starSystems) {
        console.log(`\n🚀 Processing: ${system.name}`);
        const sysStart = performance.now();

        // Clear old performance for this specific game system
        // Since name is unique/suffixed, this is safe.
        await prisma.starSystemPerformance.deleteMany({
            where: { systemName: system.name }
        });

        const performances: any[] = [];
        let totalHits = 0;
        let predictionCount = 0;

        // Simulate history - predict for NEXT draw
        // Start from index 20 to have some history
        for (let i = 20; i < draws.length - 1; i++) {
            const nextDraw = draws[i + 1]; // The draw we're predicting FOR
            const history = draws.slice(0, i + 1).reverse(); // History including current draw (descending date)

            let prediction: number[] = [];
            try {
                // prediction matches interface (promise or direct)
                prediction = await system.generatePrediction(history);
            } catch (e) {
                // console.error(e);
                continue;
            }

            // System usually returns Top 6.
            // We store the full prediction.

            const actualStars = JSON.parse(nextDraw.stars) as number[];

            // Calculate Hits (Intersection)
            const hits = actualStars.filter(s => prediction.includes(s)).length;

            performances.push({
                drawId: nextDraw.id, // Store for NEXT draw
                systemName: system.name,
                predictedStars: JSON.stringify(prediction),
                actualStars: nextDraw.stars,
                hits
            });

            // Accuracy Calculation Logic:
            // If I predict [1,2,3,4,5,6] and result is [1], hit is 1.
            // But predicting 6 numbers to hit 1 is easier than predicting 1 to hit 1.
            // The Ranking 'avgAccuracy' should probably reflect "Quality".
            // For now, let's stick to raw hits for the 'totalHits' metric.
            totalHits += hits;
            predictionCount++;

            // Batch Insert every 500
            if (performances.length >= 500) {
                await prisma.starSystemPerformance.createMany({ data: performances });
                performances.length = 0;
            }
        }

        // Insert remaining
        if (performances.length > 0) {
            await prisma.starSystemPerformance.createMany({ data: performances });
        }

        // Update Ranking
        // Accuracy Metric:
        // (Total Hits / (TotalPredictions * StarCount)) * 100
        // Example: EuroDreams (1 Star). 100 Preds. 100 Hits. Accuracy = 100%.
        // Example: Euromillions (2 Stars). 100 Preds. 200 Hits (Max). Accuracy = 100%.
        // NOTE: The systems return 6 suggestions. 
        // If we strictly check "did the winner appear in the top 6?", then precision is low but recall is high.
        // Let's keep it simple: Average Hits.
        // Or normalized accuracy based on *Max Possible Hits per Draw* (which is starCount).

        let normalizedAccuracy = 0;
        if (predictionCount > 0) {
            const maxPossibleHits = predictionCount * starCount;
            normalizedAccuracy = (totalHits / maxPossibleHits) * 100;
        }

        await prisma.starSystemRanking.update({
            where: { systemName: system.name },
            data: {
                avgAccuracy: normalizedAccuracy,
                totalPredictions: predictionCount,
                totalHits,
                lastUpdated: new Date()
            }
        });

        const sysEnd = performance.now();
        console.log(`✅ Done in ${(sysEnd - sysStart).toFixed(0)}ms. Accuracy: ${normalizedAccuracy.toFixed(1)}%`);
    }

    const endTime = performance.now();
    console.log(`\n✨ All Star Systems Updated for ${GAME} in ${(endTime - startTime).toFixed(2)}ms`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
