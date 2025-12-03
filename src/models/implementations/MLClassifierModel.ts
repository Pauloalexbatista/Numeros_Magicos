import * as fs from 'fs';
import * as path from 'path';
import { Draw, PredictionModel, PredictionResult } from '../types';
import { generateTrainingData, calculateFeatures } from '../../services/ml/featureEngineering';
import { LogisticRegressionClassifier } from '../../services/ml/classifier';
import { findBestCombination } from '../../services/ml/patternFilter';

export class MLClassifierModel implements PredictionModel {
    id = 'ml_logistic_regression';
    name = 'Machine Learning (Regressão Logística)';
    description = 'Usa um modelo de classificação binária treinado no histórico recente para prever a probabilidade de cada número.';

    private modelPath = path.join(process.cwd(), 'src', 'data', 'ml_models', 'logistic_regression.json');

    predict(history: Draw[], predictionSize: number = 5): PredictionResult {
        // Parse numbers if they are strings (Prisma issue)
        const parsedHistory = history.map(draw => ({
            ...draw,
            numbers: typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers
        }));

        // Use parsedHistory for all subsequent operations
        const cleanHistory = parsedHistory;

        // 1. Configuration
        const minHistory = 100; // Need at least 100 draws for features

        if (cleanHistory.length < minHistory + 50) {
            return {
                numbers: [],
                reasoning: 'Histórico insuficiente para ML.'
            };
        }

        // 2. Load Model (READ-ONLY)
        const classifier = new LogisticRegressionClassifier();
        let modelLoaded = false;
        const lastDrawId = cleanHistory[cleanHistory.length - 1].id;

        try {
            if (fs.existsSync(this.modelPath)) {
                const data = JSON.parse(fs.readFileSync(this.modelPath, 'utf-8'));

                // Check staleness
                if (data.lastDrawId !== lastDrawId) {
                    console.warn(`⚠️ ML Model is stale (Last: ${data.lastDrawId}, Current: ${lastDrawId}). Please run ML_UPDATE.bat`);
                }

                classifier.fromJSON(data);
                modelLoaded = true;
            }
        } catch (error) {
            console.error('Failed to load ML model:', error);
        }

        if (!modelLoaded) {
            console.warn('⚠️ ML Model not found. Please run ML_UPDATE.bat');
            return {
                numbers: [],
                reasoning: 'Modelo ML não encontrado. Execute ML_UPDATE.bat.'
            };
        }

        // 3. Predict for Next Draw
        const nextDrawFeatures = calculateFeatures(cleanHistory, cleanHistory.length);

        // Get probabilities
        const predictions = nextDrawFeatures.map(feat => ({
            number: feat.number,
            prob: classifier.predict(feat)
        }));

        // 4. Select Top Numbers & Apply Filters
        const sortedPredictions = predictions.sort((a, b) => b.prob - a.prob);

        // Get top candidates for filtering (need enough for predictionSize)
        const candidateCount = Math.max(40, predictionSize + 10);
        const candidateNumbers = sortedPredictions.slice(0, candidateCount).map(p => p.number);

        // Find best valid combination
        let { numbers: bestCombination, reasoning: filterReasoning } = findBestCombination(candidateNumbers, predictionSize);

        // Ensure exactly predictionSize
        if (bestCombination.length < predictionSize) {
            for (const p of sortedPredictions) {
                if (bestCombination.length >= predictionSize) break;
                if (!bestCombination.includes(p.number)) bestCombination.push(p.number);
            }

            // Fallback
            if (bestCombination.length < predictionSize) {
                const allNums = Array.from({ length: 50 }, (_, i) => i + 1);
                for (const n of allNums) {
                    if (bestCombination.length >= predictionSize) break;
                    if (!bestCombination.includes(n)) bestCombination.push(n);
                }
            }
        }

        // 5. Generate Reasoning
        const top3 = sortedPredictions.slice(0, 3).map(p => `#${p.number} (${(p.prob * 100).toFixed(1)}%)`).join(', ');
        const reasoning = `ML (Regressão Logística) [Modelo Carregado] + Filtros.\nTop Prob: ${top3}...\n${filterReasoning}`;

        return {
            numbers: bestCombination,
            reasoning
        };
    }
}
