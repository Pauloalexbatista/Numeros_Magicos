import { MLClassifierModel } from '../models/implementations/MLClassifierModel';
import { prisma } from '@/lib/prisma';
import { PredictionModelAdapter, InverseSystem } from '../services/ranked-systems';

async function main() {
    console.log("Testing MLClassifierModel...");

    const history = await prisma.draw.findMany({
        take: 300,
        orderBy: { date: 'asc' }
    });

    if (history.length < 200) {
        console.error("Not enough history.");
        return;
    }

    const model = new PredictionModelAdapter(new MLClassifierModel());
    const antiModel = new InverseSystem(model);

    // Test on last draw
    const testDrawIndex = history.length - 1;
    const testHistory = history.slice(0, testDrawIndex);

    console.log("Generating Prediction...");
    const pred = await model.generateTop10(testHistory);
    console.log(`Prediction Count: ${pred.length}`);
    console.log(`Prediction: ${pred.join(', ')}`);

    console.log("Generating Anti-Prediction...");
    const antiPred = await antiModel.generateTop10(testHistory);
    console.log(`Anti-Prediction Count: ${antiPred.length}`);
    console.log(`Anti-Prediction: ${antiPred.join(', ')}`);

    if (pred.length === 25 && antiPred.length === 25) {
        console.log("✅ MLClassifierModel returns correct number of predictions.");
    } else {
        console.error("❌ MLClassifierModel failed count check.");
    }
}

main();
