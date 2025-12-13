
import { prisma } from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';
import { LogisticRegressionClassifier } from '../../services/ml/classifier';
import { generateTrainingData } from '../../services/ml/featureEngineering';

async function main() {
    console.log('📈 Starting Independent Logistic Regression Training...');

    // 1. Fetch History
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });
    console.log(`📚 Loaded ${draws.length} draws from history.`);

    if (draws.length < 100) {
        console.error('❌ Not enough history to train models (need 100+).');
        return;
    }

    // Parse numbers (handling stringified JSON if needed)
    const history = draws.map(d => ({
        ...d,
        date: d.date.toISOString(),
        numbers: typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers,
        stars: typeof d.stars === 'string' ? JSON.parse(d.stars) : d.stars
    }));

    try {
        const lrPath = path.join(process.cwd(), 'src', 'data', 'ml_models', 'logistic_regression.json');

        // Initialize Classifier
        const lr = new LogisticRegressionClassifier();

        // Prepare Data
        // Train on last 300 draws (sliding window)
        const trainingData = generateTrainingData(history.slice(-300), 100);

        console.log(`🧠 Training on ${trainingData.length} samples...`);
        lr.train(trainingData);

        // Save Model
        const lrData = {
            ...lr.toJSON(),
            lastDrawId: history[history.length - 1].id,
            updatedAt: new Date().toISOString()
        };

        ensureDir(lrPath);
        fs.writeFileSync(lrPath, JSON.stringify(lrData));
        console.log('✅ Logistic Regression Model saved successfully!');
        console.log(`📂 Location: ${lrPath}`);

    } catch (e) {
        console.error('❌ Failed to train Logistic Regression:', e);
    }
}

function ensureDir(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
