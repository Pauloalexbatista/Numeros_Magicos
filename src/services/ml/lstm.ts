import * as fs from 'fs';
import * as path from 'path';
import { IPredictiveSystem } from '../ranked-systems';
import { Draw } from '@prisma/client';
import * as tf from '@tensorflow/tfjs';
import { SeededRNG } from '../../utils/seeded-rng';

export class LSTMModel implements IPredictiveSystem {
    name = "LSTM Neural Net";
    description = "Rede Neuronal Profunda (TensorFlow) com memória de longo prazo.";

    private modelPath = path.join(process.cwd(), 'src', 'data', 'ml_models', 'lstm_weights.json');

    async generateTop10(history: Draw[]): Promise<number[]> {
        // Initialize Seeded RNG based on last draw
        const lastDraw = history[0];
        const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'default-seed';
        const rng = new SeededRNG(seedStr);

        // Need significant history for LSTM
        if (history.length < 100) {
            return this.generateRandom(25, rng);
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
        try {
            const dir = path.dirname(this.modelPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            if (fs.existsSync(this.modelPath)) {
                console.log('📂 Loading LSTM weights from disk...');
                const weightsData = JSON.parse(fs.readFileSync(this.modelPath, 'utf-8'));
                const weights = weightsData.map((w: any) => tf.tensor(w.data, w.shape, w.dtype));
                model.setWeights(weights);
                modelLoaded = true;
                console.log('✅ LSTM weights loaded.');
            }
        } catch (error) {
            console.error('Failed to load LSTM weights:', error);
        }

        // Train if not loaded (DISABLED - READ ONLY)
        if (!modelLoaded) {
            console.warn('⚠️ LSTM Model not found. Please run ML_UPDATE.bat');
            return this.ensure25(this.generateRandom(25, rng), history);
        } else {
            // console.log('⏩ Skipped training (Model loaded).');
        }

        // 3. Predict Next Draw
        const lastSequence = data.slice(data.length - SEQUENCE_LENGTH);
        // Pad if sequence is too short (unlikely with check above)
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

        return this.ensure25(result, history);
    }

    private ensure25(numbers: number[], history: Draw[]): number[] {
        const result = [...numbers];
        if (result.length < 25) {
            const frequency: Record<number, number> = {};
            history.forEach(draw => {
                const nums = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers as number[];
                nums.forEach((n: number) => frequency[n] = (frequency[n] || 0) + 1);
            });

            const sortedByFreq = Object.entries(frequency)
                .sort(([, a], [, b]) => b - a)
                .map(([num]) => parseInt(num));

            for (const num of sortedByFreq) {
                if (result.length >= 25) break;
                if (!result.includes(num)) result.push(num);
            }

            // Fallback
            if (result.length < 25) {
                for (let i = 1; i <= 50; i++) {
                    if (result.length >= 25) break;
                    if (!result.includes(i)) result.push(i);
                }
            }
        }
        return result;
    }

    private generateRandom(count: number, rng: SeededRNG): number[] {
        const nums = new Set<number>();
        while (nums.size < count) nums.add(rng.nextInt(1, 50));
        return Array.from(nums);
    }
}
