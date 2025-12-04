import { Draw, PredictionModel, BacktestResult } from '../models/types';
import { hypergeometricProbability } from '../utils/math';

export class BacktestService {
    /**
     * Runs a backtest simulation for a given model.
     * @param model The prediction model to test
     * @param fullHistory Complete history of draws
     * @param testDrawsCount Number of recent draws to test against (default 50)
     * @param predictionSize Number of numbers the model predicts (default 5)
     */
    static async runBacktest(
        model: PredictionModel,
        fullHistory: Draw[],
        testDrawsCount: number = 50,
        predictionSize: number = 5,
        type: 'numbers' | 'stars' = 'numbers'
    ): Promise<BacktestResult> {
        if (fullHistory.length < testDrawsCount + 10) {
            throw new Error('Not enough history to run backtest');
        }

        // Ensure chronological order (oldest first)
        const sortedHistory = [...fullHistory].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const startIdx = sortedHistory.length - testDrawsCount;
        let totalHits = 0;
        const distribution: { [key: number]: number } = {};
        const maxHits = type === 'numbers' ? Math.min(5, predictionSize) : Math.min(2, predictionSize);

        for (let i = 0; i <= maxHits; i++) distribution[i] = 0;
        const details = [];

        for (let i = startIdx; i < sortedHistory.length; i++) {
            const targetDraw = sortedHistory[i];
            const historySnapshot = sortedHistory.slice(0, i);
            const prediction = await model.predict(historySnapshot, predictionSize);

            let matches = 0;
            let predicted: number[] = [];
            let actual: number[] = [];

            if (type === 'numbers') {
                predicted = prediction.numbers;
                actual = targetDraw.numbers;
            } else {
                predicted = prediction.stars || [];
                actual = targetDraw.stars;
            }

            matches = predicted.filter(num => actual.includes(num)).length;
            totalHits += matches;
            if (distribution[matches] !== undefined) distribution[matches]++;

            details.push({
                drawDate: targetDraw.date,
                predicted,
                actual,
                matches,
                reasoning: prediction.reasoning,
            });
        }

        // Expected distribution using hypergeometric formula
        const expectedDistribution: { [key: number]: number } = {};
        const N = type === 'numbers' ? 50 : 12;
        const K = type === 'numbers' ? 5 : 2;

        for (let k = 0; k <= maxHits; k++) {
            const prob = hypergeometricProbability(k, K, N, predictionSize);
            expectedDistribution[k] = parseFloat((prob * 100).toFixed(2));
        }

        const hitRate = (totalHits / (testDrawsCount * predictionSize)) * 100;

        return {
            totalDraws: testDrawsCount,
            hits: totalHits,
            hitRate: parseFloat(hitRate.toFixed(2)),
            roi: 0,
            distribution,
            expectedDistribution,
            details: details.reverse(),
        };
    }
}
