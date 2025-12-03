
import { Draw, PredictionModel } from '@/models/types';
import { getTier, ESTIMATED_PRIZES } from './investment';
import { getRulesForDate } from './rules';

export interface ModelPerformance {
    modelId: string;
    modelName: string;
    totalHits: number;
    hitRate: number;
    totalInvested: number;
    totalWon: number;
    roi: number;
    distribution: { [matches: number]: number }; // 0-5 matches
    history: {
        date: string;
        matches: number;
        balance: number;
    }[];
}

export async function compareModels(
    models: PredictionModel[],
    history: Draw[],
    testDraws: number = 50,
    predictionSize: number = 5
): Promise<ModelPerformance[]> {
    // Initialize results
    const results: { [id: string]: ModelPerformance } = {};
    models.forEach(m => {
        results[m.id] = {
            modelId: m.id,
            modelName: m.name,
            totalHits: 0,
            hitRate: 0,
            totalInvested: 0,
            totalWon: 0,
            roi: 0,
            distribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            history: []
        };
    });

    // Determine start index
    // We need at least some history to train. Let's say we start testing at index (Total - TestDraws)
    // Ensure we have enough history before the test period (e.g., 50 draws)
    const startIndex = Math.max(50, history.length - testDraws);
    const endIndex = history.length;

    // Iterate through test period
    for (let i = startIndex; i < endIndex; i++) {
        const trainHistory = history.slice(0, i);
        const actualDraw = history[i];
        const rules = getRulesForDate(actualDraw.date);

        // Run each model
        for (const model of models) {
            // Predict
            const prediction = model.predict(trainHistory, predictionSize);

            // Validate prediction (ensure predictionSize numbers)
            const predictedNumbers = prediction.numbers.slice(0, predictionSize);

            // Check matches
            const matches = predictedNumbers.filter(n => actualDraw.numbers.includes(n)).length;

            // Update stats
            const res = results[model.id];
            res.totalHits += matches;
            res.distribution[matches] = (res.distribution[matches] || 0) + 1;

            // Financials
            const cost = rules.costPerBet;
            res.totalInvested += cost;

            // Calculate Prize (Simplified: Assume 0 stars for now, or use predicted stars if available)
            // Most models currently only predict numbers. 
            // If model predicts stars, use them. If not, maybe assume random stars or ignore star prizes?
            // For fair comparison of NUMBER models, we should probably ignore stars or assume 0 matches.
            // OR, we can simulate "Best Case" stars (random) or just focus on Number prizes (5+0, 4+0, etc.)
            // Let's use predicted stars if available, else assume 0 matches for stars.

            const predictedStars = prediction.stars || [];
            const starMatches = predictedStars.filter(s => actualDraw.stars.includes(s)).length;

            const tier = getTier(matches, starMatches);
            let prize = 0;
            if (tier) {
                // Use jackpot if 5+2, else estimated
                if (tier === '5+2' && (actualDraw as any).jackpot) {
                    prize = (actualDraw as any).jackpot;
                } else {
                    prize = ESTIMATED_PRIZES[tier] || 0;
                }
            }

            res.totalWon += prize;

            // Update history
            const currentBalance = res.history.length > 0
                ? res.history[res.history.length - 1].balance + (prize - cost)
                : (prize - cost);

            res.history.push({
                date: (actualDraw.date as any) instanceof Date ? (actualDraw.date as any).toISOString() : actualDraw.date,
                matches,
                balance: currentBalance
            });
        }

        // Optional: Yield to event loop if processing is heavy (not possible in sync loop easily without async/await)
        // Since this is an async function, we can await a microtask every N iterations if needed.
        if (i % 10 === 0) await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Final calculations
    const finalResults = Object.values(results).map(res => {
        const drawsTested = endIndex - startIndex;
        res.hitRate = drawsTested > 0 ? res.totalHits / drawsTested : 0;
        res.roi = res.totalInvested > 0 ? ((res.totalWon - res.totalInvested) / res.totalInvested) * 100 : 0;
        return res;
    });

    return finalResults.sort((a, b) => b.hitRate - a.hitRate);
}
