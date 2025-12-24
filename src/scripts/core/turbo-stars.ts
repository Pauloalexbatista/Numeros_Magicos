
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

async function main() {
    console.log('🌟 TURBO STARS: Initializing...');
    const startTime = performance.now();

    // 1. Initialize Systems in DB
    console.log('🛠️  Registering Star Systems...');
    for (const system of starSystems) {
        await prisma.starSystemRanking.upsert({
            where: { systemName: system.name },
            update: {},
            create: {
                systemName: system.name,
                avgAccuracy: 0,
                totalPredictions: 0
            }
        });
    }

    // 2. Get History
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' } // Oldest first for simulation
    });
    console.log(`📚 Loaded ${draws.length} draws.`);

    // 3. Process Each System
    for (const system of starSystems) {
        console.log(`\n🚀 Processing: ${system.name}`);
        const sysStart = performance.now();

        // Clear old performance
        await prisma.starSystemPerformance.deleteMany({
            where: { systemName: system.name }
        });

        const performances: any[] = [];
        let totalHits = 0;
        let predictionCount = 0;

        // Simulate history - predict for NEXT draw
        // Start from index 50 to have some history
        // Stop at length-1 because we need a next draw to compare
        for (let i = 50; i < draws.length - 1; i++) {
            const currentDraw = draws[i];
            const nextDraw = draws[i + 1]; // The draw we're predicting FOR
            const history = draws.slice(0, i + 1).reverse(); // History including current draw

            const prediction = await system.generatePrediction(history); // Top 6
            const actualStars = JSON.parse(nextDraw.stars) as number[]; // Compare with NEXT draw

            // Calculate Hits
            const hits = actualStars.filter(s => prediction.includes(s)).length;

            performances.push({
                drawId: nextDraw.id, // Store for NEXT draw
                systemName: system.name,
                predictedStars: JSON.stringify(prediction),
                actualStars: nextDraw.stars,
                hits
            });

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
        // Accuracy for stars: 
        // If we predict 4 stars and get 2 right (max), that's 100%?
        // Or simple average hits?
        // Let's use "Hit Rate": (Total Hits / (Total Predictions * 2)) * 100 ? No.
        // Let's use "Accuracy per Draw": (Hits / 2) * 100. (Since there are 2 winning stars)
        // If I predict 4 and get 2 right, I found 100% of the winning stars.

        const avgAccuracy = predictionCount > 0
            ? (totalHits / (predictionCount * 2)) * 100
            : 0;

        await prisma.starSystemRanking.update({
            where: { systemName: system.name },
            data: {
                avgAccuracy,
                totalPredictions: predictionCount,
                totalHits,
                lastUpdated: new Date()
            }
        });

        const sysEnd = performance.now();
        console.log(`✅ Done in ${(sysEnd - sysStart).toFixed(0)}ms. Accuracy: ${avgAccuracy.toFixed(1)}%`);
    }

    const endTime = performance.now();
    console.log(`\n✨ All Star Systems Updated in ${(endTime - startTime).toFixed(2)}ms`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
