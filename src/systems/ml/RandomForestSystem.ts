import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';

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
            version: '2.0.0',
            isActiveByDefault: true,
            requiresTraining: true
        };
    }

    async predict(history: Draw[]): Promise<IPredictionResult> {
        const results = await this.generateTop25(history, this.targetField, this.maxVal);
        const limit = this.targetField === 'numbers' ? 25 : (this.maxVal <= 13 ? 4 : 20);
        const prediction = results.slice(0, limit);
        
        if (this.targetField === 'stars') {
            return { numbers: [], stars: prediction, confidence: 0.85 };
        } else {
            return { numbers: prediction, confidence: 0.85 };
        }
    }

    /**
     * Builds a simple frequency-based feature matrix for each number 1..maxVal.
     * Features per number: [gap_since_last, freq_last_20, freq_last_50]
     * (Internalised from the deleted services/neural/feature-extractor.ts)
     */
    private buildFeatureMatrix(draws: Draw[], maxVal: number, targetField: 'numbers' | 'stars'): number[][] {
        const getField = (d: Draw): number[] => {
            if (targetField === 'stars') return (d as any).stars || [];
            return (d as any).numbers || [];
        };

        const features: number[][] = [];
        for (let num = 1; num <= maxVal; num++) {
            let gapSinceLast = draws.length;
            for (let i = 0; i < draws.length; i++) {
                if (getField(draws[i]).includes(num)) { gapSinceLast = i; break; }
            }
            const freqLast20 = draws.slice(0, 20).filter(d => getField(d).includes(num)).length;
            const freqLast50 = draws.slice(0, 50).filter(d => getField(d).includes(num)).length;
            features.push([gapSinceLast, freqLast20, freqLast50]);
        }
        return features;
    }

    async generateTop25(draws: Draw[], targetField: 'numbers' | 'stars', __legacy_maxVal: number, manualClassifier?: any): Promise<number[]> {
        if (draws.length < 50) return [];
        const gameName = draws[0]?.game || 'EUROMILLIONS';
        
        let dynamicMaxVal = 50;
        if (gameName === 'TOTOLOTO') dynamicMaxVal = targetField === 'numbers' ? 49 : 13;
        else if (gameName === 'EURODREAMS') dynamicMaxVal = targetField === 'numbers' ? 40 : 5;
        else if (gameName === 'EUROMILLIONS') dynamicMaxVal = targetField === 'numbers' ? 50 : 12;

        const features = this.buildFeatureMatrix(draws, dynamicMaxVal, targetField);

        const { DecisionTreeClassifier } = await import('ml-cart');
        let classifier = manualClassifier;

        if (!classifier) {
            // Load model from disk (DB-resident weights removed during neural purge)
            const fs = await import('fs');
            const pathMod = await import('path');
            const modelType = `RF_${gameName}_${targetField.toUpperCase()}`;
            const modelPath = pathMod.join(process.cwd(), 'trained_models', `${modelType}.json`);
            if (fs.existsSync(modelPath)) {
                classifier = DecisionTreeClassifier.load(JSON.parse(fs.readFileSync(modelPath, 'utf8')));
            }
        }

        if (!classifier) return [];
        
        const predictions = classifier.predict(features);
        
        const numberProbs = predictions.map((pred: number, idx: number) => ({
            num: idx + 1,
            prob: pred === 1
                ? (1000 + features[idx][1] + features[idx][2] - features[idx][0])
                : (features[idx][1] + features[idx][2] - features[idx][0])
        }));

        numberProbs.sort((a: any, b: any) => b.prob - a.prob);

        const count = targetField === 'stars'
            ? (gameName === 'EURODREAMS' ? 3 : (gameName === 'TOTOLOTO' ? 5 : 6))
            : (dynamicMaxVal === 50 ? 25 : (dynamicMaxVal === 40 ? 20 : 25));
        return numberProbs.slice(0, count).map((x: any) => x.num);
    }
}
