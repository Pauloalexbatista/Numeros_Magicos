
import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';
import { parseNumbers, ensure25 } from '../utils/helpers';

export class VortexPyramidSystem implements ISystem {
    public metadata: ISystemMetadata = {
        name: 'Vortex Pyramid',
        description: 'Pirâmide Vortex (Cálculo Toroidal/Cilíndrico)',
        type: 'NUMBERS_STATISTICAL',
        version: '1.0.0',
        isActiveByDefault: true
    };

    /**
     * Analyze resonance for all numbers (1-50)
     * Returns detailed scores for visualization
     */
    analyzeResonance(history: Draw[]): { num: number, score: number }[] {
        if (history.length === 0) return [];

        const candidates: { num: number, score: number }[] = [];

        for (let candidate = 1; candidate <= 50; candidate++) {
            let score = 0;

            // Trace Left Diagonal Backwards (Candidate -> Past)
            let currentNum = candidate;
            for (let i = history.length - 1; i >= 0; i--) {
                const draw = history[i];
                const drawnNumbers = parseNumbers(draw);

                // Move Left (Wrap-around)
                currentNum = currentNum - 1;
                if (currentNum < 1) currentNum = 50;

                if (drawnNumbers.includes(currentNum)) {
                    score++;
                }
            }

            // Trace Right Diagonal Backwards (Candidate -> Past)
            currentNum = candidate;
            for (let i = history.length - 1; i >= 0; i--) {
                const draw = history[i];
                const drawnNumbers = parseNumbers(draw);

                // Move Right (Wrap-around)
                currentNum = currentNum + 1;
                if (currentNum > 50) currentNum = 1;

                if (drawnNumbers.includes(currentNum)) {
                    score++;
                }
            }

            candidates.push({ num: candidate, score });
        }

        // Sort by score descending
        candidates.sort((a, b) => b.score - a.score);
        return candidates;
    }

    async predict(history: Draw[]): Promise<IPredictionResult> {
        const candidates = this.analyzeResonance(history);

        // Return Top 25
        const result = candidates.slice(0, 25).map(c => c.num);

        return {
            numbers: ensure25(result, history)
        };
    }
}
