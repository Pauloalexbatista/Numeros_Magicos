import { prisma } from '@/lib/prisma';
import { getSystemByName } from '../../services/ranked-systems';

async function main() {
    console.log("🌪️ Verifying Vortex Pyramid System...");

    const system = getSystemByName('Vortex Pyramid');
    const antiSystem = getSystemByName('Anti-Vortex Pyramid');

    if (!system || !antiSystem) {
        console.error("❌ Systems not found!");
        return;
    }

    const history = await prisma.draw.findMany({
        orderBy: { date: 'asc' },
        take: 300 // Need significant history for Time-Vortex
    });

    if (history.length === 0) {
        console.error("❌ No history found.");
        return;
    }

    console.log("Testing Generation...");
    const prediction = await system.generateTop10(history);
    const antiPrediction = await antiSystem.generateTop10(history);

    console.log(`Prediction Count: ${prediction.length}`);
    console.log(`Anti-Prediction Count: ${antiPrediction.length}`);

    if (prediction.length !== 25 || antiPrediction.length !== 25) {
        console.error("❌ Incorrect output size!");
    } else {
        console.log("✅ Output size is correct (25).");
    }

    // Check intersection
    const intersection = prediction.filter(n => antiPrediction.includes(n));
    if (intersection.length > 0) {
        console.error(`❌ Sets overlap! ${intersection.join(', ')}`);
    } else {
        console.log("✅ Sets are disjoint (Perfect Complement).");
    }

    // Check union
    const union = new Set([...prediction, ...antiPrediction]);
    if (union.size === 50) {
        console.log("✅ Union covers all 50 numbers.");
    } else {
        console.error(`❌ Union size is ${union.size} (Expected 50).`);
    }
}

main();
