
import { BaseSystem } from '../core/BaseSystem';
import { Draw } from '@prisma/client';
import { IPredictionResult, ISystemMetadata } from '../core/types';

export class HotNumbersSystem extends BaseSystem {
    metadata: ISystemMetadata = {
        name: 'Hot Numbers',
        description: 'Top números mais frequentes nos últimos sorteios',
        type: 'NUMBERS_STATISTICAL',
        version: '1.0.0',
        isActiveByDefault: true
    };

    async predict(history: Draw[]): Promise<IPredictionResult> {
        const frequency: Record<number, number> = {};

        // Count frequencies
        history.forEach(draw => {
            const { numbers } = this.parseDraw(draw);
            numbers.forEach(num => {
                frequency[num] = (frequency[num] || 0) + 1;
            });
        });

        // Sort by frequency
        const candidates = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        // Use BaseSystem's normalize to handle game-specific rules (e.g. range 1-49 or 1-50)
        const numbers = this.normalizePrediction(candidates);

        return {
            numbers,
            confidence: 0.8 // Static confidence for statistical systems
        };
    }
}
