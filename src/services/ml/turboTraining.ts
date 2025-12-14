
import { prisma } from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';
import * as tf from '@tensorflow/tfjs';
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
    // 2. Logistic Regression
    // ==========================================
    console.log('\n📈 Training Logistic Regression...');
    try {
        const lrPath = path.join(process.cwd(), 'src', 'data', 'ml_models', 'logistic_regression.json');
        const lr = new LogisticRegressionClassifier();

        const trainingData = generateTrainingData(history.slice(-3000), 100);
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
    // 3. LSTM Neural Network
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
        const trainingWindow = Math.min(data.length - 1, 3000); // Train on full history (was 500)
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
            // Save Weights to Database
            const weights = model.getWeights().map(w => ({
                data: Array.from(w.dataSync()),
                shape: w.shape,
                dtype: w.dtype
            }));

            // Save to DB
            const weightsJson = JSON.stringify(weights);

            await prisma.mLModelTraining.upsert({
                where: { modelType: 'LSTM_NUMBERS' },
                update: {
                    lastTrained: new Date(),
                    updatedAt: new Date(),
                    modelData: weightsJson
                },
                create: {
                    modelType: 'LSTM_NUMBERS',
                    lastTrained: new Date(),
                    modelData: weightsJson
                }
            });
            console.log('✅ LSTM weights saved to Database.');

            xs.dispose();
            ys.dispose();
            model.dispose();
        }
    } catch (e) {
        console.error('❌ Failed LSTM:', e);
    }

    // ==========================================
    // 4. Star LSTM Neural Network
    // ==========================================
    console.log('\n🌟 Training Star LSTM Neural Network...');
    try {
        const starLstmPath = path.join(process.cwd(), 'src', 'data', 'ml_models', 'star_lstm_weights.json');
        const SEQUENCE_LENGTH = 20;
        const NUM_STARS = 12;

        const starHistory = history.map(d => d.stars as number[]).reverse(); // Oldest first? Wait, history is usually ordered asc in this script (line 14)?
        // Line 14: orderBy: { date: 'asc' } -> So history is Oldest -> Newest.
        // star-lstm.ts line 34 says .reverse()... check logic.
        // If history is Oldest->Newest, then index 0 is old.
        // In star-lstm.ts, it uses history[0] as LAST draw for seed... implies history is Newest->Oldest there?
        // Let's check star-lstm.ts line 34: .reverse().
        // If star-lstm.ts expects Newest->Oldest input, but reverses it to Oldest->Newest for training, then here we already have Oldest->Newest.
        // So NO reverse needed here if 'history' is from DB (asc).

        // Actually, let's stick to the data preparation logic in this file which uses history (asc).
        // 3a. Prepare Data
        const inputSequences: number[][][] = [];
        const targetVectors: number[][] = [];

        // Need to parse stars again just in case (already parsed in line 28)
        const parsedStars = history.map(d => d.stars as number[]);

        for (let i = 0; i < parsedStars.length - SEQUENCE_LENGTH; i++) {
            const sequence = parsedStars.slice(i, i + SEQUENCE_LENGTH);
            const target = parsedStars[i + SEQUENCE_LENGTH];

            const xSeq = sequence.map(stars => {
                const vec = Array(NUM_STARS).fill(0);
                stars.forEach(s => { if (s >= 1 && s <= 12) vec[s - 1] = 1; });
                return vec;
            });

            const yTarget = Array(NUM_STARS).fill(0);
            target.forEach(s => { if (s >= 1 && s <= 12) yTarget[s - 1] = 1; });

            inputSequences.push(xSeq);
            targetVectors.push(yTarget);
        }

        if (inputSequences.length > 0) {
            const model = tf.sequential();
            model.add(tf.layers.lstm({
                units: 32,
                inputShape: [SEQUENCE_LENGTH, NUM_STARS],
                returnSequences: false
            }));
            model.add(tf.layers.dropout({ rate: 0.2 }));
            model.add(tf.layers.dense({ units: NUM_STARS, activation: 'sigmoid' }));
            model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });

            const xs = tf.tensor3d(inputSequences);
            const ys = tf.tensor2d(targetVectors);

            await model.fit(xs, ys, {
                epochs: 10,
                batchSize: 32,
                verbose: 0,
                shuffle: true
            });

            // Save to DB
            const weights = model.getWeights().map(w => ({
                data: Array.from(w.dataSync()),
                shape: w.shape,
                dtype: w.dtype
            }));
            const weightsJson = JSON.stringify(weights);

            await prisma.mLModelTraining.upsert({
                where: { modelType: 'LSTM_STARS' },
                update: {
                    lastTrained: new Date(),
                    updatedAt: new Date(),
                    modelData: weightsJson
                },
                create: {
                    modelType: 'LSTM_STARS',
                    lastTrained: new Date(),
                    modelData: weightsJson
                }
            });
            console.log('✅ Star LSTM weights saved to Database.');

            xs.dispose();
            ys.dispose();
            model.dispose();
        }

    } catch (e) {
        console.error('❌ Failed Star LSTM:', e);
    }

    console.log('\n✨ Turbo ML Update Complete!');
}

function ensureDir(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
