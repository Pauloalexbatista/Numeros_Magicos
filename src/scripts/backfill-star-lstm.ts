
import { prisma } from '../lib/prisma';
import { starSystems } from '../services/star-systems';

async function main() {
    console.log('🌟 BACKFILL STAR LSTM ONLY');
    console.log('============================');
    const startTime = performance.now();

    // Filter only Star LSTM
    const targetSystem = starSystems.find(s => s.name === "Star LSTM Neural Net");

    if (!targetSystem) {
        console.error("❌ System 'Star LSTM Neural Net' not found!");
        return;
    }

    const systemsToProcess = [targetSystem];

    // 1. Initialize System in DB
    console.log(`🛠️  Registering ${targetSystem.name}...`);
    await prisma.starSystemRanking.upsert({
        where: { systemName: targetSystem.name },
        update: {},
        create: {
            systemName: targetSystem.name,
            avgAccuracy: 0,
            totalPredictions: 0
        }
    });

    // 2. Get History
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' } // Oldest first
    });
    console.log(`📚 Loaded ${draws.length} draws.`);

    // 3. Process
    for (const system of systemsToProcess) {
        console.log(`\n🚀 Processing: ${system.name}`);
        const sysStart = performance.now();

        // Clear old performance
        await prisma.starSystemPerformance.deleteMany({
            where: { systemName: system.name }
        });

        const performances = [];
        let totalHits = 0;
        let predictionCount = 0;

        // Simulate history
        // Start from index 50 to have some history
        for (let i = 50; i < draws.length; i++) {
            const currentDraw = draws[i];
            const history = draws.slice(0, i).reverse(); // Pass history (newest first)

            const prediction = await system.generatePrediction(history); // Top 4

            // Handle JSON parsing of stars safely
            const actualStars = typeof currentDraw.stars === 'string'
                ? JSON.parse(currentDraw.stars)
                : currentDraw.stars;

            // Calculate Hits
            const hits = actualStars.filter((s: number) => prediction.includes(s)).length;

            performances.push({
                drawId: currentDraw.id,
                systemName: system.name,
                predictedStars: JSON.stringify(prediction),
                actualStars: JSON.stringify(actualStars), // Ensure string for DB
                hits
            });

            totalHits += hits;
            predictionCount++;

            // Batch Insert every 200
            if (performances.length >= 200) {
                process.stdout.write('.');
                await prisma.starSystemPerformance.createMany({ data: performances });
                performances.length = 0;
            }
        }

        // Insert remaining
        if (performances.length > 0) {
            await prisma.starSystemPerformance.createMany({ data: performances });
        }

        // Update Ranking
        const avgAccuracy = (totalHits / (predictionCount * 2)) * 100;

        await prisma.starSystemRanking.update({
            where: { systemName: system.name },
            data: {
                avgAccuracy,
                totalPredictions: predictionCount,
                lastUpdated: new Date()
            }
        });

        const sysEnd = performance.now();
        console.log(`\n✅ Done in ${((sysEnd - sysStart) / 1000).toFixed(2)}s. Accuracy: ${avgAccuracy.toFixed(2)}%`);
    }

    const endTime = performance.now();
    console.log(`\n✨ Completed in ${((endTime - startTime) / 1000).toFixed(2)}s`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
