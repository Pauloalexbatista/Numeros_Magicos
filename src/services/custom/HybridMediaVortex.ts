import { IPredictiveSystem } from '../ranked-systems';
import { Draw } from '@prisma/client';
import { SistMediaCamadas } from './SistMediaCamadas';
import { VortexPyramidSystem } from '../vortex-pyramid';

/**
 * Hybrid System: Média Camadas + Anti-Vortex Pyramid
 * Combines consistency of Média with jackpot potential of Anti-Vortex
 */
export class HybridMediaVortex implements IPredictiveSystem {
    name = "Híbrido Média+AntiVortex";
    description = "Combina Média Camadas (55%) com Anti-Vortex Pyramid (10 jackpots)";

    private mediaSystem = new SistMediaCamadas();
    private vortexSystem = new VortexPyramidSystem();

    async generateTop10(draws: Draw[]): Promise<number[]> {
        if (draws.length < 10) {
            return Array.from({ length: 25 }, (_, i) => i + 1);
        }

        // Get predictions from both systems
        const mediaPrediction = await this.mediaSystem.generateTop10(draws);
        const vortexPrediction = await this.vortexSystem.generateTop10(draws);

        // Anti-Vortex: invert the vortex prediction
        const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
        const antiVortexPrediction = allNumbers.filter(n => !vortexPrediction.includes(n));

        // Score each number
        const scores: Record<number, number> = {};

        // Initialize all numbers
        for (let i = 1; i <= 50; i++) {
            scores[i] = 0;
        }

        // Score from Média Camadas (weight: 1.2)
        mediaPrediction.forEach((num, idx) => {
            // Higher score for numbers earlier in the list
            const positionScore = 25 - idx;
            scores[num] += positionScore * 1.2;
        });

        // Score from Anti-Vortex (weight: 1.5 - jackpot bonus!)
        antiVortexPrediction.slice(0, 25).forEach((num, idx) => {
            const positionScore = 25 - idx;
            scores[num] += positionScore * 1.5;
        });

        // Bonus for numbers in BOTH systems (weight: 2.0)
        const inBoth = mediaPrediction.filter(n => antiVortexPrediction.includes(n));
        inBoth.forEach(num => {
            scores[num] *= 2.0;
        });

        // Sort by score and get top 25
        const sortedNumbers = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 25)
            .map(([num]) => parseInt(num));

        return sortedNumbers;
    }
}
