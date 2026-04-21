import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/prisma';
import { prepareTimeSequences, preparePredictionInput, denormalizeData } from './tensor-core';
import { NeuralPersistenceService } from './persistence';
import { NeuralTrainingOptions } from './adapters';
 
const GAME_NAME = 'TOTOLOTO';
const MODEL_NAME = 'LSTM_TOTOLOTO_LUCKY';
const MAX_VAL = 13; // Número da sorte vai de 1 a 13
const SEQUENCE_LENGTH = 10;
const PREDICTION_COUNT = 1; // Apenas 1 Número da Sorte
const EPOCHS = 100; // Increased
 
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
 
export async function trainTotolotoLucky(options: NeuralTrainingOptions = {}): Promise<{ success: boolean; accuracy?: number; message: string }> {
    try {
        console.log(`[TF] Starting DEEP training for ${MODEL_NAME}...`);
        
        let draws = options.customHistory;
        
        if (!draws || draws.length === 0) {
            let whereClause: any = { game: GAME_NAME };
            
            // --- 2-YEAR WINDOW ---
            if (!options.forceFullHistory) {
                const twoYearsAgo = new Date();
                twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
                whereClause.date = { gte: twoYearsAgo };
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
            return { success: false, message: `Historical data too small for training (${draws.length} draws)` };
        }
 
        const extractFn = (d: any) => {
            const parsed = (typeof d.stars === "string" ? JSON.parse(d.stars) : d.stars) as number[];
            return [parsed[0] || 1];
        };
 
        const tensorData = prepareTimeSequences(draws, extractFn, MAX_VAL, SEQUENCE_LENGTH, true);
        if (!tensorData) return { success: false, message: 'Failed to build time sequences' };
 
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
 
        // --- PERSISTENCE ---
        const calcAcc = Math.max(0, 100 - (finalLoss * 100));
        await NeuralPersistenceService.saveModel(model, MODEL_NAME, {
            accuracy: calcAcc,
            loss: finalLoss,
            game: GAME_NAME,
            window: options.forceFullHistory ? 'FULL' : '2Y'
        });
 
        // Legacy metadata
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
 
        console.log(`[TF] DEEP Training complete!`);
        return { success: true, accuracy: calcAcc, message: 'Deep Training Complete' };
 
    } catch (error: any) {
        console.error(`[TF] Error training deep model:`, error);
        return { success: false, message: error.message };
    }
}
