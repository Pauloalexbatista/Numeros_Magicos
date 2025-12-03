import { Draw, PredictionModel, PredictionResult } from '../types';

export class BalancedMixModel implements PredictionModel {
    id = 'balanced_mix';
    name = 'Mix Equilibrado (Quentes + Frios)';
    description = 'Combina números muito frequentes com números atrasados (50% / 50%).';

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

        // Sort by frequency
        const allNumbers = Object.entries(frequency)
            .map(([num, freq]) => ({ num: parseInt(num), freq }));

        // Hot numbers (Descending freq)
        const hotNumbers = [...allNumbers].sort((a, b) => b.freq - a.freq);

        // Cold numbers (Ascending freq)
        const coldNumbers = [...allNumbers].sort((a, b) => a.freq - b.freq);

        // Determine split
        const hotCount = Math.ceil(predictionSize / 2);
        const coldCount = Math.floor(predictionSize / 2);

        const selectedHot = hotNumbers.slice(0, hotCount);
        const selectedCold = coldNumbers.slice(0, coldCount);

        // Combine and dedup (though overlap is unlikely with 50 numbers and small prediction size)
        const combined = [...selectedHot, ...selectedCold];

        // Extract numbers
        const finalNumbers = combined.map(item => item.num);

        // Ensure unique numbers (just in case of weird edge cases)
        const uniqueNumbers = Array.from(new Set(finalNumbers));

        // If we lost numbers due to overlap (very rare), fill with next hot numbers
        let extraIndex = hotCount;
        while (uniqueNumbers.length < predictionSize) {
            const nextHot = hotNumbers[extraIndex].num;
            if (!uniqueNumbers.includes(nextHot)) {
                uniqueNumbers.push(nextHot);
            }
            extraIndex++;
        }

        // Generate reasoning
        const hotReasoning = selectedHot.map(i => `#${i.num} (${i.freq}x)`).join(', ');
        const coldReasoning = selectedCold.map(i => `#${i.num} (${i.freq}x)`).join(', ');

        const reasoning = `Mix: ${hotCount} Quentes (${hotReasoning}) + ${coldCount} Frios (${coldReasoning})`;

        return {
            numbers: uniqueNumbers.sort((a, b) => a - b),
            reasoning
        };
    }
}
