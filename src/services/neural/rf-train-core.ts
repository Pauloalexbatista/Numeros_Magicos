import { prisma } from '@/lib/prisma';
import { buildFeaturesMatrix } from './feature-extractor';
import { RandomForestSystem } from '@/systems/ml/RandomForestSystem';
import { NeuralPersistenceService } from './persistence';
import { NeuralTrainingOptions } from './adapters';
 
export async function trainRandomForestModel(
    gameName: string,
    isStars: boolean,
    maxVal: number,
    modelType: string,
    options: NeuralTrainingOptions = {}
): Promise<{ success: boolean; accuracy?: number; message: string }> {
    try {
        const domain = isStars ? 'ESTRELAS/SONHOS' : 'NÚMEROS';
        await NeuralPersistenceService.reportProgress('RF', gameName, domain, 5);
        console.log(`[RF_LAB] Fetching training data for ${modelType} (${gameName})...`);
        
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
            return { success: false, message: `Histórico muito curto para treinar (${draws.length} sorteios)` };
        }

        const targetField = isStars ? 'stars' : 'numbers';
        const extracted = buildFeaturesMatrix(draws, maxVal, targetField);
        
        await NeuralPersistenceService.reportProgress('RF', gameName, domain, 35);
        
        if (extracted.features.length === 0) {
             return { success: false, message: 'Falha ao extrair matriz de features e labels.' };
        }

        const { DecisionTreeClassifier } = require('ml-cart');
        
        const MAX_TRAINING_SAMPLES = 10000; 
        let trainFeatures = extracted.features;
        let trainLabels = extracted.labels;

        if (trainFeatures.length > MAX_TRAINING_SAMPLES) {
            trainFeatures = trainFeatures.slice(-MAX_TRAINING_SAMPLES);
            trainLabels = trainLabels.slice(-MAX_TRAINING_SAMPLES);
        }

        const rfOptions = {
            maxDepth: 15,
            minNumSamples: 3
        };

        const classifier = new DecisionTreeClassifier(rfOptions);
        classifier.train(trainFeatures, trainLabels);
        await NeuralPersistenceService.reportProgress('RF', gameName, domain, 85);
        
        const trainPredictions = classifier.predict(trainFeatures);
        let correctCount = 0;
        for (let i = 0; i < trainLabels.length; i++) {
            if (trainPredictions[i] === trainLabels[i]) {
                correctCount++;
            }
        }
        
        const calcAcc = Math.round((correctCount / trainLabels.length) * 100);

        // --- PERSISTENCE: SAVE TO DB ---
        const modelJson = classifier.toJSON();
        await prisma.aIModelStore.upsert({
            where: { modelType: modelType },
            update: {
                weights: JSON.stringify(modelJson),
                metadata: JSON.stringify({ accuracy: calcAcc, type: 'RandomForest', updatedAt: new Date() }),
                updatedAt: new Date()
            },
            create: {
                modelType: modelType,
                weights: JSON.stringify(modelJson),
                metadata: JSON.stringify({ accuracy: calcAcc, type: 'RandomForest' })
            }
        });

        // Generate the live prediction for the *next* real draw
        const systemEngine = new RandomForestSystem(isStars ? 'stars' : 'numbers', maxVal);
        const rawArray = await systemEngine.generateTop25(draws, isStars ? 'stars' : 'numbers', maxVal);
        
        let nextPrediction: number[] = [];
        let limit: number;

        if (isStars) {
            if (gameName === 'EURODREAMS') limit = 3;
            else if (gameName === 'TOTOLOTO') limit = 5;
            else limit = 6; 
        } else {
            if (gameName === 'EURODREAMS') limit = 20;
            else limit = 25; 
        }
        
        nextPrediction = rawArray.slice(0, limit);

        await prisma.mLModelTraining.upsert({
            where: { modelType: modelType },
            update: { 
                lastTrained: new Date(),
                modelData: JSON.stringify({ accuracy: calcAcc, version: 2, nEstimators: 100, type: 'RandomForest', nextPrediction })
            },
            create: { 
                modelType: modelType, 
                lastTrained: new Date(),
                modelData: JSON.stringify({ accuracy: calcAcc, version: 2, nEstimators: 100, type: 'RandomForest', nextPrediction })
            }
        });

        // --- NEW: AUTO-SYNC CACHE FOR UI ---
        const systemName = isStars ? 'Random Forest (Estrelas)' : 'Random Forest (Números)';
        const allNums = Array.from({ length: maxVal }, (_, i) => i + 1);
        const worstNumbers = allNums.filter(n => !nextPrediction.includes(n));

        await prisma.cachedPrediction.upsert({
            where: { systemName_game: { systemName, game: gameName } },
            update: {
                numbers: JSON.stringify(nextPrediction),
                worstNumbers: JSON.stringify(worstNumbers),
                updatedAt: new Date()
            },
            create: {
                systemName,
                game: gameName,
                numbers: JSON.stringify(nextPrediction),
                worstNumbers: JSON.stringify(worstNumbers)
            }
        });

        await NeuralPersistenceService.reportProgress('RF', gameName, domain, 100);
        return { success: true, accuracy: calcAcc, message: `Random Forest ${modelType} treinado e sincronizado com o site.` };

    } catch (error: any) {
        console.error(`[RF_LAB] Error training Random Forest model:`, error);
        return { success: false, message: error.message };
    }
}
