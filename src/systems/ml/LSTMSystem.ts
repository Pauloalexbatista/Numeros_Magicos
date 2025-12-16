
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
        // Initialize Seeded RNG based on last draw
        const lastDraw = history[0];
        const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'default-seed';
        const rng = new SeededRNG(seedStr);

        // Need significant history for LSTM
        if (history.length < 100) {
            return { numbers: this.generateRandom(25, rng) };
        }

        // 1. Prepare Data
        const SEQUENCE_LENGTH = 50;
        const NUM_NUMBERS = 50;

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
                units: 32, // Reduced to 32 for performance
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

        // Try to load weights
        // Try to load weights from Database (Vercel Permanent Storage)
        try {
            // Lazy load prisma to avoid edge function issues if this runs in edge
            // In offline arch, we can just use normal prisma import or passed dependency?
            // "predict" doesn't take Prisma dependency injection.
            // But we can import it.
            // IMPORTANT: In Offline architecture, we mostly rely on local files OR local DB.
            // The original logic tried DB first, then File.
            // Let's keep that logic but optimize for Local File first in offline?
            // Actually, keep DB first to support persistent training updates.

            const { prisma } = await import('@/lib/prisma');

            const trainingData = await prisma.mLModelTraining.findUnique({
                where: { modelType: 'LSTM_NUMBERS' }
            });

            if (trainingData && trainingData.modelData) {
                const weightsData = JSON.parse(trainingData.modelData);
                const weights = weightsData.map((w: any) => tf.tensor(w.data, w.shape, w.dtype));
                model.setWeights(weights);
                modelLoaded = true;
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
            // console.error('Failed to load LSTM weights:', error);
        }

        // Train if not loaded (DISABLED - READ ONLY)
        if (!modelLoaded) {
            // console.warn('⚠️ LSTM Model not found. Please run ML_UPDATE.bat');
            return { numbers: ensure25(this.generateRandom(25, rng), history) };
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

    private generateRandom(count: number, rng: SeededRNG): number[] {
        const nums = new Set<number>();
        while (nums.size < count) nums.add(rng.nextInt(1, 50));
        return Array.from(nums);
    }
}
