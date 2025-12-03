
import { PredictionModel, PredictionResult } from '../types';
import { Draw } from '../types';
import { analyzePositions, generatePositionalPool } from '@/services/positional';

export class PositionalModel implements PredictionModel {
    id = 'positional-analysis';
    name = 'Análise Posicional (Desvio Padrão)';
    description = 'Gera previsões baseadas na distribuição normal de cada posição (1º-5º) nos últimos sorteios.';

    // Default configuration
    private windowSize: number = 100;
    private multipliers: number[] = [1.0, 1.0, 1.0, 1.0, 1.0];

    constructor(windowSize: number = 100, multipliers: number[] = [1.0, 1.0, 1.0, 1.0, 1.0]) {
        this.windowSize = windowSize;
        this.multipliers = multipliers;
    }

    predict(history: Draw[]): PredictionResult {
        // Use the service logic to analyze positions
        const stats = analyzePositions(history, this.windowSize);

        // Generate pool using the same logic as the client, but adapted for the model class
        // We need to manually apply the multipliers since the service's generatePositionalPool 
        // uses the "suggestedRange" which is fixed at Mean +/- 1 SD.

        const pool = new Set<number>();
        stats.forEach((stat, idx) => {
            const mult = this.multipliers[idx] || 1.0;
            const range = stat.stdDev * mult;
            const min = Math.max(1, Math.round(stat.mean - range));
            const max = Math.min(50, Math.round(stat.mean + range));

            for (let n = min; n <= max; n++) {
                pool.add(n);
            }
        });

        const sortedPool = Array.from(pool).sort((a, b) => a - b);

        // Since this model generates a POOL of numbers (usually > 5), 
        // we return the first 5 as the "primary" prediction (just to satisfy the interface),
        // but we really should communicate that it's a pool.
        // For the Model Comparison tool, it checks if the winning numbers are in the predicted array.
        // So we should return the WHOLE pool as the prediction.
        // The interface expects `numbers: number[]`. 
        // If the pool is large (e.g. 20 numbers), the hit rate will be high, but the "precision" low.
        // This is acceptable for a "System" type model.

        return {
            numbers: sortedPool,
            stars: [], // This model focuses on numbers only for now
            reasoning: `Análise de ${this.windowSize} sorteios. Pool gerada com desvios [${this.multipliers.join(', ')}]. Tamanho da Pool: ${sortedPool.length}`
        };
    }
}
