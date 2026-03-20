import { Draw } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { IPredictiveSystem, SystemType, SystemDomain } from '../ranked-systems';
import { StarSystem } from '../star-systems';
import { getNumberPredictionCount } from '../ranked-systems';

/**
 * Super Fast 0-Latency DB Adapter.
 * Instead of booting TensorFlow and blocking the API for 40 seconds,
 * this adapter reads the pre-calculated `nextPrediction` directly from the Admin DB.
 */
export class NeuralPredictiveAdapter implements IPredictiveSystem {
    name: string;
    description: string;
    type: SystemType = 'base';
    domain: SystemDomain = 'numbers';
    private modelPrefix: string; // e.g. "LSTM" or "RF" or "CLASSIFIER"

    constructor(name: string, description: string, modelPrefix: string) {
        this.name = name;
        this.description = description;
        this.modelPrefix = modelPrefix;
    }

    async generateTop10(draws: Draw[]): Promise<number[]> {
        let game = 'EUROMILLIONS';
        if (draws.length > 0) game = draws[0].game;
        
        const dbModelType = `${this.modelPrefix}_${game}_NUMBERS`;

        // Find the trained Payload
        const modelData = await prisma.mLModelTraining.findUnique({
            where: { modelType: dbModelType }
        });

        if (!modelData || !modelData.modelData) {
            console.warn(`[NeuralAdapter] Missing DB payload for ${dbModelType}. Falling back.`);
            return this.fallbackN(draws);
        }

        try {
            const parsed = JSON.parse(modelData.modelData);
            if (parsed.nextPrediction && Array.isArray(parsed.nextPrediction) && parsed.nextPrediction.length > 0) {
                return parsed.nextPrediction as number[];
            }
        } catch (e) {
            console.error(`[NeuralAdapter] JSON Parse Error for ${dbModelType}:`, e);
        }

        return this.fallbackN(draws);
    }

    private fallbackN(draws: Draw[]): number[] {
        const predCount = getNumberPredictionCount(draws);
        return Array.from({ length: predCount }, (_, i) => i + 1);
    }
}

/**
 * Star variation of the 0-Latency Adapter.
 */
export class NeuralStarAdapter implements StarSystem {
    name: string;
    description: string;
    private modelPrefix: string;

    constructor(name: string, description: string, modelPrefix: string) {
        this.name = name;
        this.description = description;
        this.modelPrefix = modelPrefix;
    }

    async generatePrediction(draws: Draw[]): Promise<number[]> {
        return this.generateStars(draws);
    }

    async generateStars(draws: Draw[]): Promise<number[]> {
        let game = 'EUROMILLIONS';
        if (draws.length > 0) game = draws[0].game;

        const dbDomain = game === 'EURODREAMS' ? 'DREAMS' : 'STARS';
        const dbModelType = `${this.modelPrefix}_${game}_${dbDomain}`;

        const modelData = await prisma.mLModelTraining.findUnique({
            where: { modelType: dbModelType }
        });

        if (!modelData || !modelData.modelData) {
            return [1, 2]; // Safe fallback
        }

        try {
            const parsed = JSON.parse(modelData.modelData);
            if (parsed.nextPrediction && Array.isArray(parsed.nextPrediction) && parsed.nextPrediction.length > 0) {
                const pool = parsed.nextPrediction as number[];
                
                // Enforce exact Game Rules for final UI display
                if (game === 'EUROMILLIONS') return pool.slice(0, 2);
                if (game === 'TOTOLOTO') return pool.slice(0, 1);
                if (game === 'EURODREAMS') return pool.slice(0, 1);
                
                return pool.slice(0, 2);
            }
        } catch (e) {
            // Ignored error in parsing
        }

        return [1, 2];
    }
}
