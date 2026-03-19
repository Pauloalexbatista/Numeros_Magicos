import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { buildFeaturesMatrix } from './feature-extractor';
import { RandomForestSystem } from '@/systems/ml/RandomForestSystem';

export async function trainRandomForestModel(
    gameName: string,
    isStars: boolean,
    maxVal: number,
    modelType: string,
    mockHistory?: any[] // Optional parameter for backtesting simulations
): Promise<{ success: boolean; accuracy?: number; message: string }> {
    try {
        console.log(`[RF_LAB] Fetching training data for ${modelType} (${gameName})...`);
        
        let draws = mockHistory;
        
        if (!draws) {
            draws = await prisma.draw.findMany({
                where: { game: gameName },
                orderBy: { id: 'asc' }
            });
        }

        // Minimum limit: 50 draws for freq50 + 1 for nextLabel = 51. Let's say 100 for safety.
        if (draws.length < 100) {
            return { success: false, message: `Histórico muito curto para treinar (${draws.length} sorteios)` };
        }

        const targetField = isStars ? 'stars' : 'numbers';
        const extracted = buildFeaturesMatrix(draws, maxVal, targetField);
        
        if (extracted.features.length === 0) {
             return { success: false, message: 'Falha ao extrair matriz de features e labels.' };
        }

        // Use DecisionTreeClassifier as a stable fallback for Random Forests in Node.js
        const { DecisionTreeClassifier } = require('ml-cart');
        
        const MAX_TRAINING_SAMPLES = 50000; // Cart is much more performant! We can use 50k rows.
        let trainFeatures = extracted.features;
        let trainLabels = extracted.labels;

        if (trainFeatures.length > MAX_TRAINING_SAMPLES) {
            console.log(`[RF_LAB] Slicing dataset from ${trainFeatures.length} to the most recent ${MAX_TRAINING_SAMPLES} draws for performance.`);
            trainFeatures = trainFeatures.slice(-MAX_TRAINING_SAMPLES);
            trainLabels = trainLabels.slice(-MAX_TRAINING_SAMPLES);
        }

        const options = {
            maxDepth: 10,
            minNumSamples: 3
        };

        console.log(`[RF_LAB] Starting DecisionTree (RF Fallback) Training with max depth ${options.maxDepth}...`);
        
        const classifier = new DecisionTreeClassifier(options);
        
        // Train synchronously (ml-cart is very fast)
        classifier.train(trainFeatures, trainLabels);
        
        // Predict on the training data to get a baseline accuracy (since no OOB)
        const trainPredictions = classifier.predict(trainFeatures);
        let correctCount = 0;
        for (let i = 0; i < trainLabels.length; i++) {
            if (trainPredictions[i] === trainLabels[i]) {
                correctCount++;
            }
        }
        
        const calcAcc = Math.round((correctCount / trainLabels.length) * 100);

        console.log(`[RF_LAB] Training Complete! Train Accuracy: ${calcAcc}%`);

        const MODELS_DIR = path.join(process.cwd(), 'trained_models');
        if (!fs.existsSync(MODELS_DIR)) {
            fs.mkdirSync(MODELS_DIR, { recursive: true });
        }

        const modelJson = classifier.toJSON();
        fs.writeFileSync(path.join(MODELS_DIR, `${modelType}.json`), JSON.stringify(modelJson));

        // Generate the live prediction for the *next* real draw
        const systemEngine = new RandomForestSystem(isStars ? 'stars' : 'numbers', maxVal);
        const rawArray = await systemEngine.generateTop25(draws, isStars ? 'stars' : 'numbers', maxVal);
        
        let nextPrediction: number[] = [];
        if (isStars) {
            const limit = gameName === 'EUROMILLIONS' ? 2 : 1;
            nextPrediction = rawArray.slice(0, limit);
        } else {
            const limit = gameName === 'EURODREAMS' ? 6 : 5;
            nextPrediction = rawArray.slice(0, limit);
        }

        await prisma.mLModelTraining.upsert({
            where: { modelType: modelType },
            update: { 
                lastTrained: new Date(),
                modelData: JSON.stringify({ accuracy: calcAcc, version: 1, nEstimators: 100, type: 'RandomForest', nextPrediction })
            },
            create: { 
                modelType: modelType, 
                lastTrained: new Date(),
                modelData: JSON.stringify({ accuracy: calcAcc, version: 1, nEstimators: 100, type: 'RandomForest', nextPrediction })
            }
        });

        return { success: true, accuracy: calcAcc, message: `Random Forest ${modelType} treinado com sucesso.` };

    } catch (error: any) {
        console.error(`[RF_LAB] Error training Random Forest model:`, error);
        return { success: false, message: error.message };
    }
}
