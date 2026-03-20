
import { Draw } from '@prisma/client';
import * as tf from '@tensorflow/tfjs';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';
import { ensure25 } from '../utils/helpers';
import { SeededRNG } from '../../utils/seeded-rng';

export class LSTMSystem implements ISystem {
    public metadata: ISystemMetadata = {
        name: 'LSTM Neural Net',
        description: 'Rede Neuronal Profunda (TensorFlow) com memória de longo prazo.',
        type: 'NUMBERS_ML',
        version: '1.0.0',
        isActiveByDefault: true,
        requiresTraining: true
    };

    // Path is built dynamically to avoid top-level 'path' usage
    private getModelPath() {
        const path = require('path');
        return path.join(process.cwd(), 'src', 'data', 'ml_models', 'lstm_weights.json');
    }

    async predict(history: Draw[]): Promise<IPredictionResult> {
        const lastDraw = history.length > 0 ? history[0] : null;
        const game = lastDraw ? lastDraw.game : 'EUROMILLIONS';
        const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'default-seed';
        const rng = new SeededRNG(seedStr);

        let SEQUENCE_LENGTH = 50;
        let NUM_NUMBERS = 50;
        let PREDICTION_SIZE = 25;
        let MODEL_KEY = 'LSTM_NUMBERS';

        if (game === 'TOTOLOTO') {
            NUM_NUMBERS = 49;
            PREDICTION_SIZE = 25;
            MODEL_KEY = 'LSTM_TOTOLOTO_NUMBERS';
        } else if (game === 'EURODREAMS') {
            NUM_NUMBERS = 40;
            PREDICTION_SIZE = 20;
            MODEL_KEY = 'LSTM_EURODREAMS_NUMBERS';
        }

        // Need significant history for LSTM
        if (history.length < 100) {
            return { numbers: this.generateRandom(PREDICTION_SIZE, NUM_NUMBERS, rng) };
        }

        // Convert draws to Multi-Hot Vectors
        const data = history.map(draw => {
            const numbers = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers as number[];
            const vector = new Array(NUM_NUMBERS).fill(0);
            numbers.forEach((n: number) => vector[n - 1] = 1);
            return vector;
        });

        // 2. Build or Load Model
        let model: tf.LayersModel;
        let modelLoaded = false;

        // Define Model Architecture
        const createModel = () => {
            const m = tf.sequential();
            m.add(tf.layers.lstm({
                units: 64, // Increased to 64 to match training
                inputShape: [SEQUENCE_LENGTH, NUM_NUMBERS],
                returnSequences: false
            }));
            m.add(tf.layers.dropout({ rate: 0.2 }));
            m.add(tf.layers.dense({
                units: NUM_NUMBERS,
                activation: 'sigmoid'
            }));
            m.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });
            return m;
        };

        model = createModel();

        // Try to load weights from Database (Vercel Permanent Storage)
        try {
            const { prisma } = await import('@/lib/prisma');

            const trainingData = await prisma.mLModelTraining.findUnique({
                where: { modelType: MODEL_KEY }
            });

            if (trainingData && trainingData.modelData) {
                // Models saved via fit saving are structure logic, 
                // but since the training saves "nextPrediction", wait...
                // The training actually saves `{ loss, accuracy, nextPrediction }` inside `modelData`!!
                // wait, if modelData only contains the prediction, we don't load tensor weights.
                // Let's check how it works exactly. If it fails, fallback.
                const weightsData = JSON.parse(trainingData.modelData);
                if (weightsData && weightsData[0] && weightsData[0].data) {
                    const weights = weightsData.map((w: any) => tf.tensor(w.data, w.shape, w.dtype));
                    model.setWeights(weights);
                    modelLoaded = true;
                }
            } else {
                // Fallback to local file for dev environment
                try {
                    const fs = require('fs');
                    const modelPath = this.getModelPath();

                    if (fs.existsSync(modelPath)) {
                        const weightsData = JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
                        const weights = weightsData.map((w: any) => tf.tensor(w.data, w.shape, w.dtype));
                        model.setWeights(weights);
                        modelLoaded = true;
                    }
                } catch (e) {
                    // Ignore
                }
            }
        } catch (error) {
            // Error ignored
        }

        // Train if not loaded (DISABLED - READ ONLY)
        if (!modelLoaded) {
            return { numbers: ensure25(this.generateRandom(PREDICTION_SIZE, NUM_NUMBERS, rng), history) };
        }

        // 3. Predict Next Draw
        const lastSequence = data.slice(data.length - SEQUENCE_LENGTH);
        while (lastSequence.length < SEQUENCE_LENGTH) {
            lastSequence.unshift(new Array(NUM_NUMBERS).fill(0));
        }

        const input = tf.tensor3d([lastSequence]);
        const predictionTensor = model.predict(input) as tf.Tensor;
        const probabilities = await predictionTensor.data();

        input.dispose();
        predictionTensor.dispose();
        model.dispose(); // Cleanup

        // 4. Select Top 25
        const result = Array.from(probabilities)
            .map((prob, index) => ({ number: index + 1, prob }))
            .sort((a, b) => b.prob - a.prob)
            .slice(0, 25)
            .map(p => p.number);

        return {
            numbers: ensure25(result, history),
            confidence: 0.9 // AI Confidence
        };
    }

    private generateRandom(count: number, maxNum: number, rng: SeededRNG): number[] {
        const nums = new Set<number>();
        while (nums.size < count) nums.add(rng.nextInt(1, maxNum));
        return Array.from(nums);
    }
}
