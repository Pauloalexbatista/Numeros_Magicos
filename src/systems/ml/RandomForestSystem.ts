
import * as fs from 'fs';
import * as path from 'path';
import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';
import { ensure25 } from '../utils/helpers';
import { calculateFeatures } from '../../services/ml/featureEngineering';
import { RandomForestClassifier } from '../../services/ml/randomForest';

export class RandomForestSystem implements ISystem {
    public metadata: ISystemMetadata = {
        name: 'Random Forest AI',
        description: 'Floresta Aleatória: Ensemble de Árvores de Decisão treinadas em subconjuntos de dados.',
        type: 'NUMBERS_ML',
        version: '1.0.0',
        isActiveByDefault: true,
        requiresTraining: true
    };

    private modelPath = path.join(process.cwd(), 'src', 'data', 'ml_models', 'random_forest.json');

    async predict(history: Draw[]): Promise<IPredictionResult> {
        // Parse numbers if they are strings
        const parsedHistory = history.map(draw => ({
            ...draw,
            numbers: typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers
        }));

        // Use parsedHistory for all subsequent operations
        const cleanHistory = parsedHistory as Draw[];

        // 1. Configuration
        const minHistory = 100;

        if (cleanHistory.length < minHistory + 50) {
            return { numbers: this.generateRandom(25) };
        }

        // 2. Load Model (READ-ONLY)
        const classifier = new RandomForestClassifier(15, 8);
        let modelLoaded = false;

        try {
            if (fs.existsSync(this.modelPath)) {
                const data = JSON.parse(fs.readFileSync(this.modelPath, 'utf-8'));
                classifier.fromJSON(data);
                modelLoaded = true;
            }
        } catch (error) {
            console.error('Failed to load RF model:', error);
        }

        if (!modelLoaded) {
            // console.warn('⚠️ RF Model not found. Please run ML_UPDATE.bat');
            return { numbers: this.generateRandom(25) };
        }

        // 3. Predict for Next Draw
        const nextDrawFeatures = calculateFeatures(cleanHistory as any[], cleanHistory.length);

        // Get probabilities
        const predictions = nextDrawFeatures.map(feat => ({
            number: feat.number,
            prob: classifier.predict(feat)
        }));

        // 4. Select Top Numbers
        const sortedPredictions = predictions.sort((a, b) => b.prob - a.prob);

        // We need 25 numbers for the system
        const candidates = sortedPredictions.map(p => p.number);

        return {
            numbers: ensure25(candidates, history),
            confidence: 0.85 // Placeholder confidence
        };
    }

    private generateRandom(count: number): number[] {
        const nums = new Set<number>();
        while (nums.size < count) nums.add(Math.floor(Math.random() * 50) + 1);
        return Array.from(nums);
    }
}
