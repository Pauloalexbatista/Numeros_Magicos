import { Draw, PredictionModel, PredictionResult } from '../types';

export class RandomModel implements PredictionModel {
    id = 'random_baseline';
    name = 'Aleatório (Baseline)';
    description = 'Escolhe 5 números completamente aleatórios. Serve como base de comparação.';

    predict(history: Draw[], predictionSize: number = 5): PredictionResult {
        const numbers: number[] = [];
        while (numbers.length < predictionSize) {
            const num = Math.floor(Math.random() * 50) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return {
            numbers: numbers.sort((a, b) => a - b)
        };
    }
}
