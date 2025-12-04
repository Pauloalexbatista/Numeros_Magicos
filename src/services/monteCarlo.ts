import { Draw } from './statistics';

export interface MonteCarloResult {
    iterations: number;
    numberFrequency: { [number: number]: number }; // How many times each number appeared
    mostFrequent: { number: number; count: number; probability: number }[];
    executionTimeMs: number;
}

/**
 * Calculate weights for each number based on recent frequency.
 * Returns an array where index is the number (0 unused, 1-50).
 */
function calculateWeights(draws: Draw[], lookback: number = 100): Float64Array {
    const weights = new Float64Array(51).fill(1.0); // Base weight 1.0
    const recentDraws = draws.slice(0, lookback);

    // Add frequency count
    for (const draw of recentDraws) {
        for (const num of draw.numbers) {
            weights[num] += 1.0;
        }
    }

    return weights;
}

/**
 * Select N unique numbers based on weights.
 * Optimized to avoid allocations.
 */
function weightedRandomSelect(weights: Float64Array, count: number, totalWeight: number): number[] {
    const selected: number[] = [];
    // We need to track selected numbers to avoid duplicates. 
    // Since N=5, a simple array check is fast enough.

    for (let i = 0; i < count; i++) {
        // Adjust total weight by removing weights of already selected numbers
        let currentTotalWeight = totalWeight;
        for (const s of selected) {
            currentTotalWeight -= weights[s];
        }

        let random = Math.random() * currentTotalWeight;

        // Find the number
        for (let num = 1; num <= 50; num++) {
            // Skip if already selected
            if (selected.includes(num)) continue;

            random -= weights[num];
            if (random <= 0) {
                selected.push(num);
                break;
            }
        }
    }

    return selected.sort((a, b) => a - b);
}

/**
 * Run Monte Carlo Simulation.
 * @param draws Historical draws (used to calculate initial weights)
 * @param iterations Number of simulations to run
 */
export function runMonteCarloSimulation(draws: Draw[], iterations: number = 10000): MonteCarloResult {
    const startTime = performance.now();

    // 1. Calculate Weights
    const weights = calculateWeights(draws);

    // Calculate initial total weight once
    let totalWeight = 0;
    for (let i = 1; i <= 50; i++) totalWeight += weights[i];

    // 2. Run Simulations
    const numberFrequency: { [num: number]: number } = {};
    for (let i = 1; i <= 50; i++) numberFrequency[i] = 0;

    for (let i = 0; i < iterations; i++) {
        const simulatedDraw = weightedRandomSelect(weights, 5, totalWeight);
        for (const num of simulatedDraw) {
            numberFrequency[num]++;
        }
    }

    // 3. Format Results
    const mostFrequent = Object.entries(numberFrequency)
        .map(([num, count]) => ({
            number: parseInt(num),
            count,
            probability: count / iterations
        }))
        .sort((a, b) => b.count - a.count);

    const endTime = performance.now();

    return {
        iterations,
        numberFrequency,
        mostFrequent,
        executionTimeMs: endTime - startTime
    };
}
