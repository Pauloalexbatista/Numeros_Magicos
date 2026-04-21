import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/prisma';
import { prepareTimeSequences, preparePredictionInput, denormalizeData } from './tensor-core';
import { NeuralPersistenceService } from './persistence';

const GAME_NAME = 'EUROMILLIONS';
const MODEL_NAME = 'LSTM_EUROMILLIONS_NUMBERS'; // Standardized Name
const MAX_VAL = 50; 
const SEQUENCE_LENGTH = 10;
const PREDICTION_COUNT = 5; 
const EPOCHS = 200; // Increased complexity as requested

function buildModel(sequenceLength: number, features: number): tf.Sequential {
    const model = tf.sequential();
    
    model.add(tf.layers.lstm({
        units: 128, // Increased from 64 for more "brain" capacity
        inputShape: [sequenceLength, features],
        returnSequences: true
    }));

    model.add(tf.layers.dropout({ rate: 0.2 }));

    model.add(tf.layers.lstm({
        units: 64,
        returnSequences: false
    }));

    model.add(tf.layers.dense({
        units: features,
        activation: 'sigmoid'
    }));

    model.compile({
        optimizer: tf.train.adam(0.001), 
        loss: 'meanSquaredError'
    });

    return model;
}

export async function trainEuromillionsNumbers(options?: { forceFullHistory?: boolean, backtestDrawId?: number }): Promise<{ success: boolean; accuracy?: number; message: string }> {
    try {
        console.log(`[TF] Starting DEEP training for ${MODEL_NAME}...`);
        
        let whereClause: any = { game: GAME_NAME };
        
        // --- 2-YEAR WINDOW ENFORCEMENT ---
        if (!options?.forceFullHistory) {
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            whereClause.date = { gte: twoYearsAgo };
            console.log(`[TF] Narrowing focus to draws since ${twoYearsAgo.toISOString().split('T')[0]} (2-Year Window)`);
        }

        if (options?.backtestDrawId) {
            whereClause.id = { lte: options.backtestDrawId };
        }

        const draws = await prisma.draw.findMany({
            where: whereClause,
            orderBy: { date: 'asc' }
        });

        if (draws.length < SEQUENCE_LENGTH * 2) {
            return { success: false, message: `Historical data too small for 2Y Window (${draws.length} draws). Try forceFullHistory.` };
        }

        const extractFn = (d: any) => {
            const parsed = (typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers) as number[];
            const sorted = [...parsed].sort((a, b) => a - b);
            return [sorted[0] || 1, sorted[1] || 2, sorted[2] || 3, sorted[3] || 4, sorted[4] || 5];
        };

        const tensorData = prepareTimeSequences(draws, extractFn, MAX_VAL, SEQUENCE_LENGTH, true);
        if (!tensorData) return { success: false, message: 'Failed to build time sequences' };

        const model = buildModel(SEQUENCE_LENGTH, PREDICTION_COUNT);
        let finalLoss = 0;

        await model.fit(tensorData.xs, tensorData.ys, {
            epochs: EPOCHS,
            batchSize: 32,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (logs && epoch % 20 === 0) {
                        finalLoss = logs.loss;
                        console.log(`[TF] ${MODEL_NAME} | Epoch ${epoch}/${EPOCHS} | Loss: ${logs.loss.toFixed(4)}`);
                    }
                }
            }
        });

        // --- NEW PERSISTENCE: SAVE TO DB ---
        const calcAcc = Math.max(0, 100 - (finalLoss * 100));
        await NeuralPersistenceService.saveModel(model, MODEL_NAME, {
            accuracy: calcAcc,
            loss: finalLoss,
            game: GAME_NAME,
            window: options?.forceFullHistory ? 'FULL' : '2Y'
        });

        // Generate prediction for the UI metadata (legacy support)
        const latestDrawsForPrediction = draws.slice(-SEQUENCE_LENGTH).reverse();
        const inputTensor = preparePredictionInput(latestDrawsForPrediction, extractFn, MAX_VAL, SEQUENCE_LENGTH);
        let nextPrediction: number[] | null = null;
        
        if (inputTensor) {
            const predTensor = model.predict(inputTensor) as tf.Tensor;
            const predArray = await predTensor.data();
            nextPrediction = Array.from(predArray).map(v => denormalizeData(v, MAX_VAL));
            nextPrediction = nextPrediction.map(v => Math.round(Math.max(1, Math.min(MAX_VAL, v))));
            
            inputTensor.dispose();
            predTensor.dispose();
        }
        
        await prisma.mLModelTraining.upsert({
            where: { modelType: MODEL_NAME },
            update: { 
                lastTrained: new Date(),
                modelData: JSON.stringify({ loss: finalLoss, accuracy: calcAcc, version: 2, epochs: EPOCHS, nextPrediction })
            },
            create: { 
                modelType: MODEL_NAME, 
                lastTrained: new Date(),
                modelData: JSON.stringify({ loss: finalLoss, accuracy: calcAcc, version: 2, epochs: EPOCHS, nextPrediction })
            }
        });

        tensorData.xs.dispose();
        tensorData.ys.dispose();
        model.dispose();

        console.log(`[TF] DEEP Training complete for ${MODEL_NAME}!`);
        return { success: true, accuracy: calcAcc, message: 'Deep Training Complete' };

    } catch (error: any) {
        console.error(`[TF] Error training deep model:`, error);
        return { success: false, message: error.message };
    }
}
