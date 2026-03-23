import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/prisma';
import { prepareTimeSequences, preparePredictionInput, denormalizeData } from './tensor-core';
import fs from 'fs';
import path from 'path';

const GAME_NAME = 'TOTOLOTO';
const MODEL_NAME = 'LSTM_TOTOLOTO_NUMBERS';
const MAX_VAL = 49; // Números do Totoloto vão de 1 a 49
const SEQUENCE_LENGTH = 10;
const PREDICTION_COUNT = 5; // Totoloto tem 5 números na chave
const EPOCHS = 50;

const MODELS_DIR = path.join(process.cwd(), 'trained_models');

function ensureModelDir() {
    if (!fs.existsSync(MODELS_DIR)) {
        fs.mkdirSync(MODELS_DIR, { recursive: true });
    }
}

function buildModel(sequenceLength: number, features: number): tf.Sequential {
    const model = tf.sequential();
    
    // LSTM layer with large unit size for the 5-number complexity mapped to 49
    model.add(tf.layers.lstm({
        units: 64, 
        inputShape: [sequenceLength, features],
        returnSequences: false
    }));

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

export async function trainTotolotoNumbers(customDraws?: any[]): Promise<{ success: boolean; accuracy?: number; message: string }> {
    try {
        console.log(`[TF] Fetching training data for ${MODEL_NAME}...`);
        
        let draws = customDraws;
        if (!draws || draws.length === 0) {
            draws = await prisma.draw.findMany({
                where: { game: GAME_NAME },
                orderBy: { date: 'asc' } // Better to use date than id
            });
        }

        if (draws.length < SEQUENCE_LENGTH * 2) {
            return { success: false, message: `Historical data too small to train (${draws.length} draws)` };
        }

        const extractFn = (d: any) => {
            const parsed = JSON.parse(d.numbers) as number[];
            const sorted = [...parsed].sort((a, b) => a - b);
            return [
                sorted[0] || 1, sorted[1] || 2,
                sorted[2] || 3, sorted[3] || 4,
                sorted[4] || 5
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

        const calcAcc = Math.max(0, 100 - (finalLoss * 100));

                let latestDrawsForPrediction: any[] = [];
        if (customDraws && customDraws.length >= SEQUENCE_LENGTH) {
            latestDrawsForPrediction = [...customDraws].slice(-SEQUENCE_LENGTH).reverse();
        } else {
            latestDrawsForPrediction = await prisma.draw.findMany({
                where: { game: GAME_NAME },
                orderBy: { date: 'desc' },
                take: SEQUENCE_LENGTH
            });
        }
        
        const inputTensor = preparePredictionInput(latestDrawsForPrediction, extractFn, MAX_VAL, SEQUENCE_LENGTH);
        let nextPrediction: number[] | null = null;
        
        if (inputTensor) {
            const predTensor = model.predict(inputTensor) as tf.Tensor;
            const predArray = await predTensor.data();
            nextPrediction = Array.from(predArray).map(v => denormalizeData(v, MAX_VAL));
            nextPrediction = nextPrediction.map(v => Math.max(1, Math.min(MAX_VAL, v)));
            
            inputTensor.dispose();
            predTensor.dispose();
        }
        
        await prisma.mLModelTraining.upsert({
            where: { modelType: MODEL_NAME },
            update: { 
                lastTrained: new Date(),
                modelData: JSON.stringify({ loss: finalLoss, accuracy: calcAcc, version: 1, epochs: EPOCHS, nextPrediction })
            },
            create: { 
                modelType: MODEL_NAME, 
                lastTrained: new Date(),
                modelData: JSON.stringify({ loss: finalLoss, accuracy: calcAcc, version: 1, epochs: EPOCHS, nextPrediction })
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
