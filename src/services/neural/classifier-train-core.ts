import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/prisma';
import { buildFeaturesMatrix, buildCurrentPredictionMatrix } from './feature-extractor';
import { NeuralPersistenceService } from './persistence';
import { NeuralTrainingOptions } from './adapters';
 
export async function trainMLClassifierModel(
    gameName: string,
    isStars: boolean,
    maxVal: number,
    modelType: string,
    options: NeuralTrainingOptions = {}
): Promise<{ success: boolean; accuracy?: number; message: string }> {
    try {
        console.log(`[TF_CLASSIFIER] Fetching data for ${modelType} (${gameName})...`);
        
        let draws = options.customHistory;
        
        if (!draws || draws.length === 0) {
            let whereClause: any = { game: gameName };
            
            if (options.backtestDrawId) {
                whereClause.id = { lte: options.backtestDrawId };
            }
 
            draws = await prisma.draw.findMany({
                where: whereClause,
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

        const MAX_TFJS_SAMPLES = 50000;
        let trainFeatures = extracted.features;
        let trainLabels = extracted.labels;

        if (trainFeatures.length > MAX_TFJS_SAMPLES) {
            trainFeatures = trainFeatures.slice(-MAX_TFJS_SAMPLES);
            trainLabels = trainLabels.slice(-MAX_TFJS_SAMPLES);
        }

        const xs = tf.tensor2d(trainFeatures);
        const ys = tf.tensor2d(trainLabels, [trainLabels.length, 1]);

        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [3] })); 
        model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })); 

        model.compile({
            optimizer: tf.train.adam(0.005),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        console.log(`[TF_CLASSIFIER] Starting Training (50 Epochs)...`);
        
        let finalLoss = 0;
        let finalAcc = 0;

        await model.fit(xs, ys, {
            epochs: 50,
            batchSize: 64,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (logs) {
                        finalLoss = logs.loss;
                        finalAcc = logs.acc;
                    }
                }
            }
        });

        const accuracyPerc = Math.round(finalAcc * 100);
        
        // --- PERSISTENCE: SAVE TO DB ---
        await NeuralPersistenceService.saveModel(model, modelType, {
            accuracy: accuracyPerc,
            loss: finalLoss,
            game: gameName,
            isStars
        });

        const featuresArray = buildCurrentPredictionMatrix(draws, maxVal, isStars ? 'stars' : 'numbers');
        
        let nextPrediction: number[] = [];
        if (featuresArray && featuresArray.length > 0) {
            const inputTensor = tf.tensor2d(featuresArray);
            const predictionTensor = model.predict(inputTensor) as any;
            const probabilities = await predictionTensor.data();
            
            inputTensor.dispose();
            predictionTensor.dispose();

            const numberProbs = Array.from(probabilities).map((prob: any, idx: number) => {
                const f10 = featuresArray[idx][1] || 0;
                const f50 = featuresArray[idx][2] || 0;
                const microBoost = (f10 * 0.001) + (f50 * 0.0001);
                
                return {
                    num: idx + 1,
                    prob: parseFloat(prob as unknown as string) + microBoost
                };
            });
            
            numberProbs.sort((a, b) => b.prob - a.prob);
            
            let limit: number;
            if (isStars) {
                if (gameName === 'EURODREAMS') limit = 3;
                else if (gameName === 'TOTOLOTO') limit = 5;
                else limit = 6; 
            } else {
                if (gameName === 'EURODREAMS') limit = 20;
                else limit = 25; 
            }
                
            nextPrediction = numberProbs.slice(0, limit).map((x: any) => x.num);
        }

        xs.dispose();
        ys.dispose();
        model.dispose();

        await prisma.mLModelTraining.upsert({
            where: { modelType: modelType },
            update: { 
                lastTrained: new Date(),
                modelData: JSON.stringify({ loss: finalLoss, accuracy: accuracyPerc, version: 2, epochs: 50, nextPrediction })
            },
            create: { 
                modelType: modelType, 
                lastTrained: new Date(),
                modelData: JSON.stringify({ loss: finalLoss, accuracy: accuracyPerc, version: 2, epochs: 50, nextPrediction })
            }
        });

        return { success: true, accuracy: accuracyPerc, message: `ML Classifier ${modelType} treinado e salvo na BD.` };

    } catch (error: any) {
        console.error(`[TF_CLASSIFIER] Error training:`, error);
        return { success: false, message: error.message };
    }
}
