import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';
import path from 'path';

export class RandomForestSystem implements ISystem {
    public metadata: ISystemMetadata;
    private targetField: 'numbers' | 'stars';
    private maxVal: number;

    constructor(targetField: 'numbers' | 'stars' = 'numbers', maxVal: number = 50) {
        this.targetField = targetField;
        this.maxVal = maxVal;
        
        this.metadata = {
            name: targetField === 'numbers' ? 'Random Forest (Números)' : 'Random Forest (Estrelas)',
            description: 'Inteligência Artificial baseada em milhares de Árvores de Decisão.',
            type: targetField === 'numbers' ? 'NUMBERS_ML' : 'STARS_ML',
            version: '1.0.0',
            isActiveByDefault: true,
            requiresTraining: true
        };
    }

    async predict(history: Draw[]): Promise<IPredictionResult> {
        const results = await this.generateTop25(history, this.targetField, this.maxVal);
        const limit = this.targetField === 'numbers' ? 25 : (this.maxVal <= 13 ? 4 : 20); // standard counts
        const prediction = results.slice(0, limit);
        
        if (this.targetField === 'stars') {
            return { numbers: [], stars: prediction, confidence: 0.85 };
        } else {
            return { numbers: prediction, confidence: 0.85 };
        }
    }

    async generateTop25(draws: Draw[], targetField: 'numbers' | 'stars', __legacy_maxVal: number): Promise<number[]> {
        if (draws.length < 50) return [];
        const gameName = draws[0]?.game || 'EUROMILLIONS';
        
        let dynamicMaxVal = 50;
        if (gameName === 'TOTOLOTO') dynamicMaxVal = targetField === 'numbers' ? 49 : 13;
        else if (gameName === 'EURODREAMS') dynamicMaxVal = targetField === 'numbers' ? 40 : 5;
        else if (gameName === 'EUROMILLIONS') dynamicMaxVal = targetField === 'numbers' ? 50 : 12;

        const { buildCurrentPredictionMatrix } = await import('../../services/neural/feature-extractor');
        const features = buildCurrentPredictionMatrix(draws, dynamicMaxVal, targetField);

        const fs = await import('fs');
        const path = await import('path');
        const { DecisionTreeClassifier } = await import('ml-cart');

        // Derive our model type based on what game this history belongs to
        const modelType = `RF_${gameName}_${targetField.toUpperCase()}`;
        const modelPath = path.join(process.cwd(), 'trained_models', `${modelType}.json`);

        if (!fs.existsSync(modelPath)) {
             return [];
        }

        const modelJson = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
        const classifier = DecisionTreeClassifier.load(modelJson);
        
        // Since it's a Decision Tree, we just predict directly (0 or 1)
        const predictions = classifier.predict(features);
        
        // Map predictions to numbers (1 to maxVal)
        const numberProbs = predictions.map((pred: number, idx: number) => ({
            num: idx + 1,
            // To rank them properly since they are just binary [0, 1] 
            // We give a base score + add their fundamental delay/frequency as a tie breaker
            prob: pred === 1 ? (1000 + features[idx][1] + features[idx][2] - features[idx][0]) : (features[idx][1] + features[idx][2] - features[idx][0])
        }));

        // Sort descending
        numberProbs.sort((a: any, b: any) => b.prob - a.prob);

        // Define top count (25 for numbers, 5 for stars, depending on maxVal...)
        const count = targetField === 'stars' ? (dynamicMaxVal <= 13 ? 4 : 2) : (dynamicMaxVal === 50 ? 25 : (dynamicMaxVal === 40 ? 20 : 25));
        return numberProbs.slice(0, count).map((x: any) => x.num);
    }
}
