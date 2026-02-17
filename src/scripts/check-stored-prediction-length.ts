
import { prisma } from '../lib/prisma';

async function main() {
    console.log("🔍 Inspecting SystemPerformance stored predictions...");

    const performance = await prisma.systemPerformance.findFirst({
        where: { systemName: 'Clustering' }, // Use a known system
        orderBy: { draw: { date: 'desc' } }
    });

    if (!performance) {
        console.log("No performance data found.");
        return;
    }

    const predictions = JSON.parse(performance.predictedNumbers);
    console.log(`System: ${performance.systemName}`);
    console.log(`Date: ${performance.drawId} (Draw ID)`);
    console.log(`Stored Prediction Count: ${predictions.length}`);
    console.log(`Predictions: ${predictions.join(', ')}`);

    if (predictions.length >= 20) {
        console.log("✅ GOOD: We have enough data to simulate 'Top N' performance dynamically.");
    } else {
        console.log(`⚠️ LIMITATION: We only have top ${predictions.length}. Dynamic analysis unlimited up to ${predictions.length}.`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
