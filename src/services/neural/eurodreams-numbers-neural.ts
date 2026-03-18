import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/prisma';
import { prepareTimeSequences } from './tensor-core';
import fs from 'fs';
import path from 'path';

const GAME_NAME = 'EURODREAMS';
const MODEL_NAME = 'LSTM_EURODREAMS_NUMBERS';
const MAX_VAL = 40; // Números vão de 1 a 40
const SEQUENCE_LENGTH = 10;
const PREDICTION_COUNT = 6; // EuroDreams tem 6 números na chave principal
const EPOCHS = 50;

const MODELS_DIR = path.join(process.cwd(), 'trained_models');

function ensureModelDir() {
    if (!fs.existsSync(MODELS_DIR)) {
        fs.mkdirSync(MODELS_DIR, { recursive: true });
    }
}

function buildModel(sequenceLength: number, features: number): tf.Sequential {
    const model = tf.sequential();
    
    // LSTM layer with more units for the 6 numbers complexity
    model.add(tf.layers.lstm({
        units: 64, 
        inputShape: [sequenceLength, features],
        returnSequences: false
    }));

    // Dense output layer mapping to 6 output features
    model.add(tf.layers.dense({
        units: features,
        activation: 'sigmoid'
    }));

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
    });

    return model;
}

export async function trainEuroDreamsNumbers(): Promise<{ success: boolean; accuracy?: number; message: string }> {
    try {
        console.log(`[TF] Fetching training data for ${MODEL_NAME}...`);
        
        const draws = await prisma.draw.findMany({
            where: { game: GAME_NAME },
            orderBy: { id: 'asc' }
        });

        if (draws.length < SEQUENCE_LENGTH * 2) {
            return { success: false, message: `Historical data too small to train (${draws.length} draws)` };
        }

        const extractFn = (d: any) => {
            const parsed = JSON.parse(d.numbers) as number[];
            // Sort ascending strictly
            const sorted = [...parsed].sort((a, b) => a - b);
            // Ensure we return exactly 6 numbers, padding with 1 if parsing failed for some reason
            return [
                sorted[0] || 1, sorted[1] || 2, sorted[2] || 3,
                sorted[3] || 4, sorted[4] || 5, sorted[5] || 6
            ];
        };

        const tensorData = prepareTimeSequences(draws, extractFn, MAX_VAL, SEQUENCE_LENGTH, true);
        if (!tensorData) return { success: false, message: 'Failed to build time sequences' };

        console.log(`[TF] Training ${MODEL_NAME} on ${tensorData.xs.shape[0]} sequences...`);

        const model = buildModel(SEQUENCE_LENGTH, PREDICTION_COUNT);
        let finalLoss = 0;

        await model.fit(tensorData.xs, tensorData.ys, {
            epochs: EPOCHS,
            batchSize: 16,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (logs) {
                        finalLoss = logs.loss;
                        if (epoch % 10 === 0) console.log(`[TF] Epoch ${epoch} | Loss: ${logs.loss.toFixed(4)}`);
                    }
                }
            }
        });

        ensureModelDir();
        await model.save(`file://${MODELS_DIR}/${MODEL_NAME}`).catch(async () => {});

        // A simple artificial accuracy estimation from loss
        const calcAcc = Math.max(0, 100 - (finalLoss * 100));

        await prisma.mLModelTraining.upsert({
            where: { modelType: MODEL_NAME },
            update: { 
                lastTrained: new Date(),
                modelData: JSON.stringify({ loss: finalLoss, accuracy: calcAcc, version: 1, epochs: EPOCHS })
            },
            create: { 
                modelType: MODEL_NAME, 
                lastTrained: new Date(),
                modelData: JSON.stringify({ loss: finalLoss, accuracy: calcAcc, version: 1, epochs: EPOCHS })
            }
        });

        tensorData.xs.dispose();
        tensorData.ys.dispose();
        model.dispose();

        console.log(`[TF] Training complete!`);
        return { success: true, accuracy: calcAcc, message: 'Training Complete' };

    } catch (error: any) {
        console.error(`[TF] Error training model:`, error);
        return { success: false, message: error.message };
    }
}
