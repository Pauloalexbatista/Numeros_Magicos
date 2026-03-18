import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';

export class MLClassifierSystem implements ISystem {
    public metadata: ISystemMetadata;
    private targetField: 'numbers' | 'stars';
    private maxVal: number;

    constructor(targetField: 'numbers' | 'stars' = 'numbers', maxVal: number = 50) {
        this.targetField = targetField;
        this.maxVal = maxVal;
        
        this.metadata = {
            name: targetField === 'numbers' ? 'ML Classifier (Números)' : 'ML Classifier (Estrelas)',
            description: 'Rede Neuronal Densa desenhada para adivinhar a probabilidade de impacto de cada número isolado.',
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

    async generateTop25(draws: Draw[], targetField: 'numbers' | 'stars', maxVal: number): Promise<number[]> {
        if (draws.length < 50) return [];

        const { buildCurrentPredictionMatrix } = await import('../../services/neural/feature-extractor');
        const featuresArray = buildCurrentPredictionMatrix(draws, maxVal, targetField);

        const fs = await import('fs');
        const path = await import('path');
        const tf = await import('@tensorflow/tfjs');

        // Derive our model type based on what game this history belongs to
        const gameName = draws[0]?.game || 'EUROMILLIONS';
        const modelType = `CLASSIFIER_${gameName}_${targetField.toUpperCase()}`;
        const modelPath = path.join(process.cwd(), 'trained_models', modelType, 'model.json');

        if (!fs.existsSync(modelPath)) {
             return [];
        }

        const model = await tf.loadLayersModel(`file://${modelPath}`);
        
        // Convert to Tensor
        const inputTensor = tf.tensor2d(featuresArray);
        const predictionTensor = model.predict(inputTensor) as any;
        const probabilities = await predictionTensor.data();
        
        inputTensor.dispose();
        predictionTensor.dispose();
        model.dispose();

        // Map probabilities to numbers (1 to maxVal)
        const numberProbs = Array.from(probabilities).map((prob: any, idx: number) => ({
            num: idx + 1,
            prob: parseFloat(prob as unknown as string)
        }));

        // Sort descending
        numberProbs.sort((a, b) => b.prob - a.prob);

        const count = targetField === 'stars' ? (maxVal === 12 ? 4 : 2) : (maxVal === 50 ? 25 : 20);
        return numberProbs.slice(0, count).map((x: any) => x.num);
    }
}
