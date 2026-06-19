import { Draw } from '@prisma/client';
import { SeededRNG } from '../utils/seeded-rng';
import { getGameConfig } from './game-config';

/**
 * Random System (O Macaco 🐒)
 * 
 * Logic:
 * Picks N unique random numbers (15 for EM/TL, 18 for ED) within the game's range.
 * This serves as a "Real" baseline to compare other systems against actual randomness.
 */
export class RandomSystem {
    name = "Random Generator";
    description = "Gerador Aleatório Puro (Baseline Real)";

    async generateTop10(history: Draw[], returnFullPool?: boolean): Promise<number[]> {
        const { predCount: defaultPredCount, maxNum } = getGameConfig(history);
        const predCount = returnFullPool ? maxNum : defaultPredCount;

        // Initialize Seeded RNG based on last draw
        const lastDraw = history[0];
        const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'default-seed';
        const rng = new SeededRNG(seedStr);

        const numbers = new Set<number>();

        while (numbers.size < predCount) {
            const random = rng.nextInt(1, maxNum);
            numbers.add(random);
        }

        return Array.from(numbers);
    }
}
