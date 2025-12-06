import { prisma } from '@/lib/prisma';
import { getSystemByName } from '../../services/ranked-systems';

async function main() {
    console.log("🔍 Verifying Anti-Hot Numbers System...");

    const system = getSystemByName('Anti-Hot Numbers');
    if (!system) {
        console.error("❌ System 'Anti-Hot Numbers' not found!");
        return;
    }

    const history = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    if (history.length < 50) {
        console.error("❌ Not enough history.");
        return;
    }

    // Test on last draw
    const prediction = await system.generateTop10(history);

    console.log(`✅ System Found: ${system.name}`);
    console.log(`📊 Prediction Count: ${prediction.length}`);
    console.log(`🔮 Prediction: ${prediction.join(', ')}`);

    if (prediction.length === 25) {
        console.log("✅ SUCCESS: Returns exactly 25 numbers.");
    } else {
        console.error(`❌ FAILURE: Returned ${prediction.length} numbers.`);
    }
}

main();
