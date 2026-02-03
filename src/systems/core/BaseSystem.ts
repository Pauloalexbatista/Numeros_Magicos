
import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from './types';
import { GameConfig } from '@/types/game';

/**
 * Base class for all betting systems.
 * Provides access to GameConfig to handle different rules (ranges, counts).
 */
export abstract class BaseSystem implements ISystem {
    abstract metadata: ISystemMetadata;

    constructor(protected config: GameConfig) { }

    abstract predict(history: Draw[]): Promise<IPredictionResult>;

    /**
     * Helper to cast Draw numbers/stars from String/JSON to number[]
     */
    protected parseDraw(draw: Draw): { numbers: number[], stars: number[] } {
        let numbers: number[] = [];
        let stars: number[] = [];

        try {
            numbers = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers;
            stars = typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars;
        } catch (e) {
            console.error(`Error parsing draw ${draw.id}`, e);
        }

        return { numbers, stars };
    }

    /**
     * Helper to normalize predictions to the correct count (e.g., 5 numbers)
     * and ensure they are within the game's range.
     * This is a simplified version of ensure25, adapted for game rules.
     */
    protected normalizePrediction(candidates: number[], count: number = 0): number[] {
        const requiredCount = count || this.config.rules.mainCount;
        const range = this.config.rules.mainRange;

        // 1. Unique and Integer
        let unique = [...new Set(candidates.map(Math.floor))];

        // 2. Filter within range
        unique = unique.filter(n => n >= 1 && n <= range);

        // 3. Fill if needed (simple linear fill - subclasses should override for better logic if needed)
        if (unique.length < requiredCount) {
            for (let i = 1; i <= range; i++) {
                if (!unique.includes(i)) {
                    unique.push(i);
                    if (unique.length >= requiredCount) break;
                }
            }
        }

        // 4. Trim
        return unique.slice(0, requiredCount);
    }
}
