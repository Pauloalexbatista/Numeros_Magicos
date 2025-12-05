import * as fs from 'fs';
import * as path from 'path';
import { StarSystem } from '../star-systems';
import { Draw } from '@prisma/client';
import * as tf from '@tensorflow/tfjs';
import { SeededRNG } from '../../utils/seeded-rng';

export class StarLSTMSystem implements StarSystem {
    name = "Star LSTM Neural Net";
    description = "Rede Neuronal (LSTM) especializada em prever Estrelas (1-12).";

    private modelPath = path.join(process.cwd(), 'src', 'data', 'ml_models', 'star_lstm_weights.json');

    async generatePrediction(history: Draw[]): Promise<number[]> {
        // Initialize Seeded RNG based on last draw
        const lastDraw = history[0];
        const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'default-seed';
        const rng = new SeededRNG(seedStr);

        // Need significant history
        if (history.length < 50) {
            return this.generateRandom(2, rng);
        }

        // 1. Prepare Data
        const SEQUENCE_LENGTH = 20; // Shorter sequence for stars
        const NUM_STARS = 12;

        // Parse stars from history
        const starHistory = history.map(d => {
            const stars = typeof d.stars === 'string' ? JSON.parse(d.stars) : d.stars;
            return stars as number[];
        }).reverse(); // Oldest first

        // Create sequences
        const xs: number[][][] = [];
        const ys: number[][] = [];

        for (let i = 0; i < starHistory.length - SEQUENCE_LENGTH; i++) {
            const sequence = starHistory.slice(i, i + SEQUENCE_LENGTH);
            const target = starHistory[i + SEQUENCE_LENGTH];

            // Multi-hot encoding for input sequence
            const xSeq = sequence.map(stars => {
                const vec = Array(NUM_STARS).fill(0);
                stars.forEach(s => {
                    if (s >= 1 && s <= 12) vec[s - 1] = 1;
                });
                return vec;
            });

            // Multi-hot encoding for target
            const yTarget = Array(NUM_STARS).fill(0);
            target.forEach(s => {
                if (s >= 1 && s <= 12) yTarget[s - 1] = 1;
            });

            xs.push(xSeq);
            ys.push(yTarget);
        }

        // 2. Load or Train Model
        let model: tf.LayersModel;
        let modelLoaded = false;

        try {
            if (fs.existsSync(this.modelPath)) {
                // Create model architecture first
                model = this.createModel(SEQUENCE_LENGTH, NUM_STARS);

                // Load weights
                const weightsData = JSON.parse(fs.readFileSync(this.modelPath, 'utf-8'));
                const weights = weightsData.map((w: any) => tf.tensor(w));
                model.setWeights(weights);
                modelLoaded = true;
                // console.log('✅ Star LSTM weights loaded.');
            } else {
                model = this.createModel(SEQUENCE_LENGTH, NUM_STARS);
            }
        } catch (error) {
            console.error('Failed to load Star LSTM weights:', error);
            model = this.createModel(SEQUENCE_LENGTH, NUM_STARS);
        }

        // Train if not loaded (DISABLED - READ ONLY)
        if (!modelLoaded) {
            console.warn('⚠️ Star LSTM Model not found - Using ensemble fallback');
            // Instead of pure random, use simple frequency analysis as fallback
            return this.generateFrequencyBased(history);
        } else {
            // console.log('⏩ Skipped training (Model loaded).');
        }

        // 3. Predict
        const lastSequence = starHistory.slice(-SEQUENCE_LENGTH);
        const input = lastSequence.map(stars => {
            const vec = Array(NUM_STARS).fill(0);
            stars.forEach(s => {
                if (s >= 1 && s <= 12) vec[s - 1] = 1;
            });
            return vec;
        });

        const inputTensor = tf.tensor3d([input]);
        const predictionTensor = model.predict(inputTensor) as tf.Tensor;
        const probabilities = await predictionTensor.data();

        inputTensor.dispose();
        predictionTensor.dispose();
        // Don't dispose model to keep it in memory if possible, or dispose if memory is tight.
        // For serverless/API, we usually dispose.
        model.dispose();

        // 4. Select Top Stars
        const candidates = Array.from(probabilities)
            .map((prob, i) => ({ star: i + 1, prob }))
            .sort((a, b) => b.prob - a.prob)
            .slice(0, 4) // Return Top 4 (user can pick 2)
            .map(c => c.star);

        return candidates;
    }

    private createModel(sequenceLength: number, numStars: number): tf.LayersModel {
        const model = tf.sequential();

        // LSTM Layer
        model.add(tf.layers.lstm({
            units: 32,
            inputShape: [sequenceLength, numStars],
            returnSequences: false
        }));

        // Dropout
        model.add(tf.layers.dropout({ rate: 0.2 }));

        // Dense Output Layer (Sigmoid for multi-label classification)
        model.add(tf.layers.dense({
            units: numStars,
            activation: 'sigmoid'
        }));

        model.compile({
            optimizer: 'adam',
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        return model;
    }

    private generateFrequencyBased(history: Draw[]): number[] {
        // Fallback: frequency-based prediction
        const recentDraws = history.slice(0, Math.min(100, history.length));
        const frequency: Record<number, number> = {};

        // Initialize all stars
        for (let i = 1; i <= 12; i++) frequency[i] = 0;

        recentDraws.forEach(draw => {
            const stars = typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars;
            stars.forEach((star: number) => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([star]) => parseInt(star));
    }

    private generateRandom(count: number, rng: SeededRNG): number[] {
        const nums = new Set<number>();
        while (nums.size < count) {
            nums.add(Math.floor(rng.next() * 12) + 1);
        }
        return Array.from(nums);
    }
}
