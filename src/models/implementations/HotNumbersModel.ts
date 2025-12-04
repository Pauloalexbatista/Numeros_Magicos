import { Draw, PredictionModel, PredictionResult } from '../types';

export class HotNumbersModel implements PredictionModel {
    id = 'hot_numbers_50';
    name = 'Números Quentes';
    description = 'Escolhe os números mais frequentes do histórico disponível.';

    predict(history: Draw[], predictionSize: number = 5): PredictionResult {
        // Use ALL available history instead of hardcoded 50
        const recentHistory = history;

        // Calculate frequency
        const frequency: Record<number, number> = {};
        recentHistory.forEach(draw => {
            draw.numbers.forEach(num => {
                frequency[num] = (frequency[num] || 0) + 1;
            });
        });

        // Sort by frequency (descending)
        const sortedNumbers = Object.entries(frequency)
            .map(([num, freq]) => ({ num: parseInt(num), freq }))
            .sort((a, b) => b.freq - a.freq);

        // Pick top N
        const topNumbers = sortedNumbers.slice(0, predictionSize).map(item => item.num);

        // Generate reasoning string
        const reasoning = `Top ${predictionSize} Frequentes: ${sortedNumbers.slice(0, predictionSize).map(i => `#${i.num} (${i.freq}x)`).join(', ')}`;

        // If we don't have enough numbers (rare), fill with random
        while (topNumbers.length < predictionSize) {
            const num = Math.floor(Math.random() * 50) + 1;
            if (!topNumbers.includes(num)) {
                topNumbers.push(num);
            }
        }

        return {
            numbers: topNumbers.sort((a, b) => a - b),
            reasoning
        };
    }
}
