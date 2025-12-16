
import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';
import { parseNumbers, ensure25 } from '../utils/helpers';

export class MarkovSystem implements ISystem {
    public metadata: ISystemMetadata = {
        name: 'Markov Chain',
        description: 'Análise de probabilidades de transição entre números',
        type: 'NUMBERS_STATISTICAL',
        version: '1.0.0',
        isActiveByDefault: true
    };

    async predict(history: Draw[]): Promise<IPredictionResult> {
        // Simplified Markov: numbers that appear together frequently
        const coOccurrence: Record<number, Record<number, number>> = {};

        history.forEach(draw => {
            const numbers = parseNumbers(draw);
            numbers.forEach((num1, i) => {
                if (!coOccurrence[num1]) coOccurrence[num1] = {};
                numbers.forEach((num2, j) => {
                    if (i !== j) {
                        coOccurrence[num1][num2] = (coOccurrence[num1][num2] || 0) + 1;
                    }
                });
            });
        });

        if (history.length === 0) {
            return { numbers: ensure25([], history) };
        }

        // Get last draw numbers
        const lastNumbers = parseNumbers(history[0]); // Assuming history[0] is most recent

        // Find numbers with highest transition probability from last draw
        const scores: Record<number, number> = {};
        lastNumbers.forEach(num => {
            if (coOccurrence[num]) {
                Object.entries(coOccurrence[num]).forEach(([nextNum, count]) => {
                    scores[parseInt(nextNum)] = (scores[parseInt(nextNum)] || 0) + count;
                });
            }
        });

        const candidates = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        return {
            numbers: ensure25(candidates, history),
            confidence: 0.7
        };
    }
}
