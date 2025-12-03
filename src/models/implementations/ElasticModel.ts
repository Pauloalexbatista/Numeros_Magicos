import { Draw } from '@prisma/client';
import { IPredictiveSystem } from '../../services/ranked-systems';
import { SeededRNG } from '../../utils/seeded-rng';

export class ElasticModel implements IPredictiveSystem {
    name = "Sistema Elástico";
    description = "Baseado na Regressão à Média (Força Elástica)";

    async generateTop10(draws: Draw[]): Promise<number[]> {
        if (draws.length < 50) {
            // Not enough history, return random
            return Array.from({ length: 25 }, (_, i) => i + 1);
        }

        // 1. Calculate Means for each Position (1-5) over last 50 draws
        // We need to parse the draws first
        const parsedDraws = draws.slice(0, 50).map(d => {
            try {
                return JSON.parse(d.numbers) as number[];
            } catch {
                return [];
            }
        }).filter(n => n.length === 5);

        if (parsedDraws.length === 0) return Array.from({ length: 25 }, (_, i) => i + 1);

        const means: number[] = [0, 0, 0, 0, 0];

        for (let pos = 0; pos < 5; pos++) {
            const sum = parsedDraws.reduce((acc, nums) => acc + nums[pos], 0);
            means[pos] = sum / parsedDraws.length;
        }

        // 2. Determine Constraints based on LAST draw
        const lastDraw = parsedDraws[0]; // Newest
        const constraints: { pos: number, type: 'UP' | 'DOWN', threshold: number, strength: number }[] = [];

        for (let pos = 0; pos < 5; pos++) {
            const val = lastDraw[pos];
            const mean = means[pos];
            const diff = val - mean;

            // Strength based on distance
            const strength = Math.abs(diff);

            if (val < mean) {
                // Should go UP
                constraints.push({ pos, type: 'UP', threshold: val, strength });
            } else {
                // Should go DOWN
                constraints.push({ pos, type: 'DOWN', threshold: val, strength });
            }
        }

        // 3. Monte Carlo Simulation to find best fitting sets
        // We generate random sets and score them against constraints
        const rng = new SeededRNG(`${draws[0].id}-elastic`);
        const simulations = 5000;
        const numberScores: Record<number, number> = {};

        for (let i = 0; i < simulations; i++) {
            const set = this.generateRandomSet(rng);

            // Score this set
            let setScore = 0;
            for (let pos = 0; pos < 5; pos++) {
                const num = set[pos];
                const constraint = constraints[pos];

                let met = false;
                if (constraint.type === 'UP' && num >= constraint.threshold) met = true;
                if (constraint.type === 'DOWN' && num <= constraint.threshold) met = true;

                if (met) {
                    // Weighted by strength of the signal
                    // e.g. if distance was 10, this is a very important constraint
                    setScore += (1 + (constraint.strength * 0.5));
                }
            }

            // Add score to individual numbers
            set.forEach(num => {
                numberScores[num] = (numberScores[num] || 0) + setScore;
            });
        }

        // 4. Return Top 25 numbers by score
        return Object.entries(numberScores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 25)
            .map(([num]) => parseInt(num));
    }

    private generateRandomSet(rng: SeededRNG): number[] {
        const nums: number[] = [];
        const pool = Array.from({ length: 50 }, (_, i) => i + 1);

        for (let i = 0; i < 5; i++) {
            const idx = Math.floor(rng.next() * pool.length);
            nums.push(pool[idx]);
            pool.splice(idx, 1);
        }
        return nums.sort((a, b) => a - b);
    }
}
