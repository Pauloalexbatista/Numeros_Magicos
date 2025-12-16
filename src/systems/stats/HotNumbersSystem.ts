
import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';
import { parseNumbers, ensure25 } from '../utils/helpers';

export class HotNumbersSystem implements ISystem {
    public metadata: ISystemMetadata = {
        name: 'Hot Numbers',
        description: 'Top 10 números mais frequentes nos últimos sorteios',
        type: 'NUMBERS_STATISTICAL',
        version: '1.0.0',
        isActiveByDefault: true
    };

    async predict(history: Draw[]): Promise<IPredictionResult> {
        const frequency: Record<number, number> = {};

        // Count frequencies
        history.forEach(draw => {
            const numbers = parseNumbers(draw);
            numbers.forEach(num => {
                frequency[num] = (frequency[num] || 0) + 1;
            });
        });

        // Sort by frequency
        const candidates = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        const finalNumbers = ensure25(candidates, history);

        return {
            numbers: finalNumbers,
            confidence: 0.8 // Statistical confidence placeholder
        };
    }
}
