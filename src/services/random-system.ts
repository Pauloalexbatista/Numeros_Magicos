import { Draw } from '@prisma/client';
import { SeededRNG } from '../utils/seeded-rng';

/**
 * Random System (O Macaco 🐒)
 * 
 * Logic:
 * Simply picks 25 unique random numbers between 1 and 50.
 * This serves as a "Real" baseline to compare other systems against actual randomness.
 */
export class RandomSystem {
    name = "Random Generator";
    description = "Gerador Aleatório Puro (Baseline Real)";

    async generateTop10(history: Draw[]): Promise<number[]> {
        // Initialize Seeded RNG based on last draw
        const lastDraw = history[0];
        const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'default-seed';
        const rng = new SeededRNG(seedStr);

        const numbers = new Set<number>();

        while (numbers.size < 25) {
            const random = rng.nextInt(1, 50);
            numbers.add(random);
        }

        return Array.from(numbers);
    }
}
