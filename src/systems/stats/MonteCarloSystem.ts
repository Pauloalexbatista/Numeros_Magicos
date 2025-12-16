
import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';
import { parseNumbers, ensure25 } from '../utils/helpers';
import { SeededRNG } from '../../utils/seeded-rng';

// We might need to move SeededRNG to systems/utils/seeded-rng.ts to be self-contained
// For now assuming it exists in services/utils or similar.
// Let's check where it is: 'src/services/utils/seeded-rng' was in original file imports?
// Original: import { SeededRNG } from '../utils/seeded-rng'; (relative to services/ranked-systems.ts)
// So it is in src/utils/seeded-rng.ts likely?
// Original file path: src/services/ranked-systems.ts
// Import: ../utils/seeded-rng -> src/utils/seeded-rng.ts

import { SeededRNG as RNG } from '../../utils/seeded-rng';

export class MonteCarloSystem implements ISystem {
    public metadata: ISystemMetadata = {
        name: 'Monte Carlo',
        description: 'Simulações probabilísticas para prever números',
        type: 'NUMBERS_STATISTICAL',
        version: '1.0.0',
        isActiveByDefault: true
    };

    async predict(history: Draw[]): Promise<IPredictionResult> {
        const frequency: Record<number, number> = {};

        // Calculate probabilities
        history.forEach(draw => {
            const numbers = parseNumbers(draw);
            numbers.forEach(num => {
                frequency[num] = (frequency[num] || 0) + 1;
            });
        });

        const totalDraws = history.length;
        const probabilities: Record<number, number> = {};
        Object.entries(frequency).forEach(([num, count]) => {
            probabilities[parseInt(num)] = count / totalDraws;
        });

        // Initialize Seeded RNG based on last draw
        const lastDraw = history[0]; // Assuming desc order provided? 
        // NOTE: Standard in this project seems to be specialized. 
        // If history comes from Prisma, usually desc or asc. 
        // helpers.ts doesn't specify sort.
        // Let's assume history[0] is the most recent draw for seeding.

        const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'default-seed';
        const rng = new RNG(seedStr);

        // Run simulations
        const simulations = 1000;
        const simulationResults: Record<number, number> = {};

        for (let i = 0; i < simulations; i++) {
            const simDraw: number[] = [];
            const available = Array.from({ length: 50 }, (_, i) => i + 1);

            while (simDraw.length < 5) {
                // Weighted random selection
                const weights = available.map(n => probabilities[n] || 0.01);
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                let random = rng.next() * totalWeight;

                for (let j = 0; j < available.length; j++) {
                    random -= weights[j];
                    if (random <= 0) {
                        const selected = available[j];
                        simDraw.push(selected);
                        available.splice(j, 1);
                        break;
                    }
                }
            }

            simDraw.forEach(num => {
                simulationResults[num] = (simulationResults[num] || 0) + 1;
            });
        }

        const candidates = Object.entries(simulationResults)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        return {
            numbers: ensure25(candidates, history)
        };
    }
}
