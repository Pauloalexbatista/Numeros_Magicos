import * as fs from 'fs';
import * as path from 'path';
import { Draw } from '@prisma/client';
import { IPredictiveSystem } from '../../services/ranked-systems';
import { generateTrainingData, calculateFeatures } from '../../services/ml/featureEngineering';
import { RandomForestClassifier } from '../../services/ml/randomForest';
import { findBestCombination } from '../../services/ml/patternFilter';

export class RandomForestModel implements IPredictiveSystem {
    name = "Random Forest AI";
    description = "Floresta Aleatória: Ensemble de Árvores de Decisão treinadas em subconjuntos de dados.";

    private modelPath = path.join(process.cwd(), 'src', 'data', 'ml_models', 'random_forest.json');

    async generateTop10(history: Draw[]): Promise<number[]> {
        // Parse numbers if they are strings
        const parsedHistory = history.map(draw => ({
            ...draw,
            numbers: typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers
        }));

        // Use parsedHistory for all subsequent operations
        const cleanHistory = parsedHistory as Draw[];

        // 1. Configuration
        const TRAINING_WINDOW = 200; // Train on last 200 draws
        const minHistory = 100;

        if (cleanHistory.length < minHistory + 50) {
            return this.generateRandom(25);
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
            console.warn('⚠️ RF Model not found. Please run ML_UPDATE.bat');
            return this.generateRandom(25);
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

        // Use pattern filter to optimize the top 5, but return 25 for the ranking system
        // Ideally we would return the raw sorted list, but let's ensure diversity
        return this.ensure25(candidates);
    }

    private generateRandom(count: number): number[] {
        const nums = new Set<number>();
        while (nums.size < count) nums.add(Math.floor(Math.random() * 50) + 1);
        return Array.from(nums);
    }

    private ensure25(numbers: number[]): number[] {
        const result = [...numbers];
        if (result.length > 25) return result.slice(0, 25);

        if (result.length < 25) {
            for (let i = 1; i <= 50; i++) {
                if (result.length >= 25) break;
                if (!result.includes(i)) result.push(i);
            }
        }
        return result;
    }
}
