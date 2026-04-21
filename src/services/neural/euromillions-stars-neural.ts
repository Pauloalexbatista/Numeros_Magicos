import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/prisma';
import { prepareTimeSequences, preparePredictionInput, denormalizeData } from './tensor-core';
import { NeuralPersistenceService } from './persistence';
import { NeuralTrainingOptions } from './adapters';
 
const GAME_NAME = 'EUROMILLIONS';
const MODEL_NAME = 'LSTM_STARS'; // Standardized in DB
const MAX_VAL = 12; // Estrelas vão de 1 a 12
const SEQUENCE_LENGTH = 10;
const PREDICTION_COUNT = 2; // EuroMilhões tem 2 estrelas
const EPOCHS = 100; // Increased for better accuracy
 
function buildModel(sequenceLength: number, features: number): tf.Sequential {
    const model = tf.sequential();
    
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
 
export async function trainEuromillionsStars(options: NeuralTrainingOptions = {}): Promise<{ success: boolean; accuracy?: number; message: string }> {
    try {
        console.log(`[TF] Starting training for ${MODEL_NAME}...`);
        
        let draws = options.customHistory;
        
        if (!draws || draws.length === 0) {
            let whereClause: any = { game: GAME_NAME };
            
            // --- 2-YEAR WINDOW ENFORCEMENT ---
            if (!options.forceFullHistory) {
                const twoYearsAgo = new Date();
                twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
                whereClause.date = { gte: twoYearsAgo };
                console.log(`[TF] Narrowing focus to draws since ${twoYearsAgo.toISOString().split('T')[0]} (2-Year Window)`);
            }
 
            if (options.backtestDrawId) {
                whereClause.id = { lte: options.backtestDrawId };
            }
 
            draws = await prisma.draw.findMany({
                where: whereClause,
                orderBy: { date: 'asc' }
            });
        }
 
        if (draws.length < SEQUENCE_LENGTH * 2) {
            return { success: false, message: `Historical data too small to train (${draws.length} draws)` };
        }
 
        const extractFn = (d: any) => {
            const parsed = (typeof d.stars === "string" ? JSON.parse(d.stars) : d.stars) as number[];
            const sorted = [...parsed].sort((a, b) => a - b);
            return [sorted[0] || 1, sorted[1] || 2];
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
                    if (logs && epoch % 20 === 0) {
                        finalLoss = logs.loss;
                        console.log(`[TF] ${MODEL_NAME} | Epoch ${epoch} | Loss: ${logs.loss.toFixed(4)}`);
                    }
                }
            }
        });
 
        // --- PERSISTENCE: SAVE TO DB ---
        const calcAcc = Math.max(0, 100 - (finalLoss * 100));
        await NeuralPersistenceService.saveModel(model, MODEL_NAME, {
            accuracy: calcAcc,
            loss: finalLoss,
            game: GAME_NAME,
            window: options.forceFullHistory ? 'FULL' : '2Y'
        });
 
        // Prediction for legacy metadata
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
 
        console.log(`[TF] Training complete!`);
        return { success: true, accuracy: calcAcc, message: 'Training Complete' };
 
    } catch (error: any) {
        console.error(`[TF] Error training model:`, error);
        return { success: false, message: error.message };
    }
}
