import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { buildFeaturesMatrix } from './feature-extractor';
import { MLClassifierSystem } from '@/systems/ml/MLClassifierSystem';

export async function trainMLClassifierModel(
    gameName: string,
    isStars: boolean,
    maxVal: number,
    modelType: string,
    mockHistory?: any[] // Optional parameter for backtesting simulations
): Promise<{ success: boolean; accuracy?: number; message: string }> {
    try {
        console.log(`[TF_CLASSIFIER] Fetching data for ${modelType} (${gameName})...`);
        
        let draws = mockHistory;
        
        if (!draws) {
            draws = await prisma.draw.findMany({
                where: { game: gameName },
                orderBy: { id: 'asc' }
            });
        }

        if (draws.length < 100) {
            return { success: false, message: `Histórico insuficiente (${draws.length} sorteios)` };
        }

        const targetField = isStars ? 'stars' : 'numbers';
        const extracted = buildFeaturesMatrix(draws, maxVal, targetField);
        
        if (extracted.features.length === 0) {
             return { success: false, message: 'Falha ao extrair features tensor.' };
        }

        console.log(`[TF_CLASSIFIER] Extracted ${extracted.features.length} samples. Slicing and Building Tensors...`);

        // Limit training size to prevent TFJS Out-Of-Memory crashes
        const MAX_TFJS_SAMPLES = 50000;
        let trainFeatures = extracted.features;
        let trainLabels = extracted.labels;

        if (trainFeatures.length > MAX_TFJS_SAMPLES) {
            trainFeatures = trainFeatures.slice(-MAX_TFJS_SAMPLES);
            trainLabels = trainLabels.slice(-MAX_TFJS_SAMPLES);
        }

        // Convert to Tensors
        const xs = tf.tensor2d(trainFeatures);
        // Expand dims to match single output neuron constraint
        const ys = tf.tensor2d(trainLabels, [trainLabels.length, 1]);

        // Build Dense Architecture tailored for Binary Classification
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [3] })); // 3 Features: delay, freq10, freq50
        model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })); // Binary Probability [0, 1]

        model.compile({
            optimizer: tf.train.adam(0.005), // slightly faster learning rate
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        console.log(`[TF_CLASSIFIER] Starting Training (20 Epochs)...`);
        
        let finalLoss = 0;
        let finalAcc = 0;

        await model.fit(xs, ys, {
            epochs: 20,
            batchSize: 64, // larger batch size as the dataset is large ~25000 rows
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (logs) {
                        finalLoss = logs.loss;
                        finalAcc = logs.acc;
                        if (epoch % 5 === 0) {
                            console.log(`[TF_CLASSIFIER] Epoch ${epoch} | Loss: ${finalLoss.toFixed(4)} | Acc: ${(finalAcc * 100).toFixed(2)}%`);
                        }
                    }
                }
            }
        });

        const accuracyPerc = Math.round(finalAcc * 100);
        console.log(`[TF_CLASSIFIER] Training Complete! Accuracy: ${accuracyPerc}%`);

        const MODELS_DIR = path.join(process.cwd(), 'trained_models');
        if (!fs.existsSync(MODELS_DIR)) {
            fs.mkdirSync(MODELS_DIR, { recursive: true });
        }

        await model.save(`file://${MODELS_DIR}/${modelType}`).catch(async () => {});

        // Generate the live prediction for the *next* real draw
        const systemEngine = new MLClassifierSystem(isStars ? 'stars' : 'numbers', maxVal);
        const rawArray = await systemEngine.generateTop25(draws, isStars ? 'stars' : 'numbers', maxVal);
        
        let nextPrediction: number[] = [];
        if (isStars) {
            const limit = gameName === 'EUROMILLIONS' ? 2 : 1;
            nextPrediction = rawArray.slice(0, limit);
        } else {
            const limit = gameName === 'EURODREAMS' ? 6 : 5;
            nextPrediction = rawArray.slice(0, limit);
        }

        // Cleanup memory
        xs.dispose();
        ys.dispose();
        model.dispose();

        await prisma.mLModelTraining.upsert({
            where: { modelType: modelType },
            update: { 
                lastTrained: new Date(),
                modelData: JSON.stringify({ loss: finalLoss, accuracy: accuracyPerc, version: 1, epochs: 20, nextPrediction })
            },
            create: { 
                modelType: modelType, 
                lastTrained: new Date(),
                modelData: JSON.stringify({ loss: finalLoss, accuracy: accuracyPerc, version: 1, epochs: 20, nextPrediction })
            }
        });

        return { success: true, accuracy: accuracyPerc, message: `ML Classifier ${modelType} treinado com sucesso.` };

    } catch (error: any) {
        console.error(`[TF_CLASSIFIER] Error training:`, error);
        return { success: false, message: error.message };
    }
}
