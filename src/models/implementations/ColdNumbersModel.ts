import { Draw, PredictionModel, PredictionResult } from '../types';

export class ColdNumbersModel implements PredictionModel {
    id = 'cold_numbers';
    name = 'Números Frios';
    description = 'Escolhe os números MENOS frequentes do histórico disponível (estratégia de "atraso").';

    predict(history: Draw[], predictionSize: number = 5): PredictionResult {
        // Use ALL available history
        const recentHistory = history;

        // Calculate frequency for ALL numbers 1-50
        const frequency: Record<number, number> = {};
        for (let i = 1; i <= 50; i++) {
            frequency[i] = 0;
        }

        recentHistory.forEach(draw => {
            draw.numbers.forEach(num => {
                frequency[num]++;
            });
        });

        // Sort by frequency (ASCENDING for Cold numbers)
        const sortedNumbers = Object.entries(frequency)
            .map(([num, freq]) => ({ num: parseInt(num), freq }))
            .sort((a, b) => a.freq - b.freq);

        // Pick top N (which are the coldest)
        const topNumbers = sortedNumbers.slice(0, predictionSize).map(item => item.num);

        // Generate reasoning string
        const reasoning = `Top ${predictionSize} Frios: ${sortedNumbers.slice(0, predictionSize).map(i => `#${i.num} (${i.freq}x)`).join(', ')}`;

        return {
            numbers: topNumbers.sort((a, b) => a - b),
            reasoning
        };
    }
}
