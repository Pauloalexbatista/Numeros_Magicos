import { rankedSystems, InverseSystem } from '../services/ranked-systems';
import { prisma } from '@/lib/prisma';

async function main() {
    console.log("🔍 Verifying Complement Property...");

    // Fetch some real history to test with
    const history = await prisma.draw.findMany({
        take: 300,
        orderBy: { date: 'asc' }
    });

    if (history.length < 50) {
        console.error("Not enough history to test.");
        return;
    }

    // Filter out Anti-Systems and Ensemble for now (we test base systems)
    const models = rankedSystems.filter(s => !s.name.startsWith('Anti-') && s.name !== 'Ensemble Voting');

    for (const model of models) {
        console.log(`\nTesting Model: ${model.name}`);
        const antiModel = new InverseSystem(model);

        // Test on the last draw (using previous 50 as history)
        const testDrawIndex = history.length - 1;
        const testHistory = history.slice(0, testDrawIndex); // History UP TO the test draw
        const targetDraw = history[testDrawIndex];
        const actualNumbers = JSON.parse(targetDraw.numbers as string) as number[];

        console.log(`Target Draw: ${targetDraw.date.toISOString()} - Numbers: ${actualNumbers.join(', ')}`);

        // 1. Generate Predictions
        const pred = await model.generateTop10(testHistory);
        const antiPred = await antiModel.generateTop10(testHistory);

        console.log(`Prediction Count: ${pred.length}`);
        console.log(`Anti-Prediction Count: ${antiPred.length}`);

        // 2. Verify Counts
        if (pred.length !== 25) console.error(`❌ ERROR: Prediction has ${pred.length} numbers (Expected 25)`);
        if (antiPred.length !== 25) console.error(`❌ ERROR: Anti-Prediction has ${antiPred.length} numbers (Expected 25)`);

        // 3. Verify Disjoint
        const intersection = pred.filter(n => antiPred.includes(n));
        if (intersection.length > 0) {
            console.error(`❌ ERROR: Sets overlap! Intersection: ${intersection.join(', ')}`);
        } else {
            console.log("✅ Sets are disjoint.");
        }

        // 4. Verify Union covers 1-50
        const union = new Set([...pred, ...antiPred]);
        if (union.size !== 50) {
            console.error(`❌ ERROR: Union size is ${union.size} (Expected 50)`);
            const missing = [];
            for (let i = 1; i <= 50; i++) if (!union.has(i)) missing.push(i);
            console.error(`Missing numbers: ${missing.join(', ')}`);
        } else {
            console.log("✅ Union covers all 50 numbers.");
        }

        // 5. Verify Hits Sum
        const hits = actualNumbers.filter(n => pred.includes(n)).length;
        const antiHits = actualNumbers.filter(n => antiPred.includes(n)).length;

        console.log(`Hits: ${hits}`);
        console.log(`Anti-Hits: ${antiHits}`);
        console.log(`Total Hits: ${hits + antiHits} (Expected 5)`);

        if (hits + antiHits !== 5) {
            console.error("❌ ERROR: Hits do not sum to 5!");
        } else {
            console.log("✅ Math works! Accuracy sum is 100%.");
        }
    }
}

main();
