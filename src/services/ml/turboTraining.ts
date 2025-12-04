
import { prisma } from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';
import * as tf from '@tensorflow/tfjs';
import { RandomForestClassifier } from './randomForest';
import { LogisticRegressionClassifier } from './classifier';
import { generateTrainingData } from './featureEngineering';

export async function trainAllModels() {
    console.log('🚀 Starting Turbo ML Update (Service)...');

    // 1. Fetch History
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });
    console.log(`📚 Loaded ${draws.length} draws from history.`);

    if (draws.length < 100) {
        console.error('❌ Not enough history to train models (need 100+).');
        return;
    }

    // Parse numbers
    const history = draws.map(d => ({
        ...d,
        date: d.date.toISOString(),
        numbers: typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers,
        stars: typeof d.stars === 'string' ? JSON.parse(d.stars) : d.stars,
        numbersDrawOrder: d.numbersDrawOrder ? (typeof d.numbersDrawOrder === 'string' ? JSON.parse(d.numbersDrawOrder) : d.numbersDrawOrder) : undefined,
        starsDrawOrder: d.starsDrawOrder ? (typeof d.starsDrawOrder === 'string' ? JSON.parse(d.starsDrawOrder) : d.starsDrawOrder) : undefined
    }));

    // ==========================================
    // 2. Random Forest
    // ==========================================
    console.log('\n🌲 Training Random Forest...');
    try {
        const rfPath = path.join(process.cwd(), 'src', 'data', 'ml_models', 'random_forest.json');
        const rf = new RandomForestClassifier(20, 10); // Slightly boosted settings for offline training

        const trainingData = generateTrainingData(history.slice(-300), 100); // Train on last 300
        rf.train(trainingData);

        const rfData = {
            ...rf.toJSON(),
            lastDrawId: history[history.length - 1].id,
            updatedAt: new Date().toISOString()
        };

        ensureDir(rfPath);
        fs.writeFileSync(rfPath, JSON.stringify(rfData));
        console.log('✅ Random Forest saved.');
    } catch (e) {
        console.error('❌ Failed Random Forest:', e);
    }

    // ==========================================
    // 3. Logistic Regression
    // ==========================================
    console.log('\n📈 Training Logistic Regression...');
    try {
        const lrPath = path.join(process.cwd(), 'src', 'data', 'ml_models', 'logistic_regression.json');
        const lr = new LogisticRegressionClassifier();

        const trainingData = generateTrainingData(history.slice(-300), 100);
        lr.train(trainingData);

        const lrData = {
            ...lr.toJSON(),
            lastDrawId: history[history.length - 1].id,
            updatedAt: new Date().toISOString()
        };

        ensureDir(lrPath);
        fs.writeFileSync(lrPath, JSON.stringify(lrData));
        console.log('✅ Logistic Regression saved.');
    } catch (e) {
        console.error('❌ Failed Logistic Regression:', e);
    }

    // ==========================================
    // 4. LSTM Neural Network
    // ==========================================
    console.log('\n🧠 Training LSTM Neural Network...');
    try {
        const lstmPath = path.join(process.cwd(), 'src', 'data', 'ml_models', 'lstm_weights.json');
        const SEQUENCE_LENGTH = 50;
        const NUM_NUMBERS = 50;

        // Prepare Data (Multi-Hot)
        const data = history.map(draw => {
            const vector = new Array(NUM_NUMBERS).fill(0);
            (draw.numbers as number[]).forEach(n => vector[n - 1] = 1);
            return vector;
        });

        const X: number[][][] = [];
        const Y: number[][] = [];
        const trainingWindow = Math.min(data.length - 1, 500); // Train on last 500
        const startIndex = data.length - trainingWindow;

        for (let i = startIndex; i < data.length - SEQUENCE_LENGTH; i++) {
            X.push(data.slice(i, i + SEQUENCE_LENGTH));
            Y.push(data[i + SEQUENCE_LENGTH]);
        }

        if (X.length > 0) {
            const model = tf.sequential();
            model.add(tf.layers.lstm({
                units: 32, // Optimized for speed (was 64)
                inputShape: [SEQUENCE_LENGTH, NUM_NUMBERS],
                returnSequences: false
            }));
            model.add(tf.layers.dropout({ rate: 0.2 }));
            model.add(tf.layers.dense({ units: NUM_NUMBERS, activation: 'sigmoid' }));
            model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });

            const xs = tf.tensor3d(X);
            const ys = tf.tensor2d(Y);

            await model.fit(xs, ys, {
                epochs: 10, // Optimized for speed (was 20)
                batchSize: 32,
                verbose: 0,
                shuffle: true
            });

            // Save Weights
            const weights = model.getWeights().map(w => ({
                data: Array.from(w.dataSync()),
                shape: w.shape,
                dtype: w.dtype
            }));

            ensureDir(lstmPath);
            fs.writeFileSync(lstmPath, JSON.stringify(weights));
            console.log('✅ LSTM weights saved.');

            xs.dispose();
            ys.dispose();
            model.dispose();
        }
    } catch (e) {
        console.error('❌ Failed LSTM:', e);
    }

    console.log('\n✨ Turbo ML Update Complete!');
}

function ensureDir(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
