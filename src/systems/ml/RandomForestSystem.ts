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

    async generateTop25(draws: Draw[], targetField: 'numbers' | 'stars', __legacy_maxVal: number, manualClassifier?: any): Promise<number[]> {
        if (draws.length < 50) return [];
        const gameName = draws[0]?.game || 'EUROMILLIONS';
        
        let dynamicMaxVal = 50;
        if (gameName === 'TOTOLOTO') dynamicMaxVal = targetField === 'numbers' ? 49 : 13;
        else if (gameName === 'EURODREAMS') dynamicMaxVal = targetField === 'numbers' ? 40 : 5;
        else if (gameName === 'EUROMILLIONS') dynamicMaxVal = targetField === 'numbers' ? 50 : 12;

        const { buildCurrentPredictionMatrix } = await import('../../services/neural/feature-extractor');
        const features = buildCurrentPredictionMatrix(draws, dynamicMaxVal, targetField);

        const { DecisionTreeClassifier } = await import('ml-cart');
        let classifier = manualClassifier;

        if (!classifier) {
            // Try loading from DB first
            const { prisma } = await import('@/lib/prisma');
            const modelType = `RF_${gameName}_${targetField.toUpperCase()}`;
            const stored = await prisma.aIModelStore.findUnique({ where: { modelType } });

            if (stored) {
                classifier = DecisionTreeClassifier.load(JSON.parse(stored.weights));
            } else {
                // Fallback to disk (legacy)
                const fs = await import('fs');
                const path = await import('path');
                const modelPath = path.join(process.cwd(), 'trained_models', `${modelType}.json`);
                if (fs.existsSync(modelPath)) {
                    classifier = DecisionTreeClassifier.load(JSON.parse(fs.readFileSync(modelPath, 'utf8')));
                }
            }
        }

        if (!classifier) return [];
        
        // Since it's a Decision Tree, we just predict directly (0 or 1)
        const predictions = classifier.predict(features);
        
        // Map predictions to numbers (1 to maxVal)
        const numberProbs = predictions.map((pred: number, idx: number) => ({
            num: idx + 1,
            prob: pred === 1 ? (1000 + features[idx][1] + features[idx][2] - features[idx][0]) : (features[idx][1] + features[idx][2] - features[idx][0])
        }));

        numberProbs.sort((a: any, b: any) => b.prob - a.prob);

        const count = targetField === 'stars' ? (dynamicMaxVal <= 13 ? 4 : 2) : (dynamicMaxVal === 50 ? 25 : (dynamicMaxVal === 40 ? 20 : 25));
        return numberProbs.slice(0, count).map((x: any) => x.num);
    }
}
