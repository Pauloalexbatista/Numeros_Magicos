import { Draw } from './statistics';

export interface TransitionMatrix {
    [fromNumber: number]: {
        [toNumber: number]: number; // Count of transitions
    };
}

export interface MarkovPrediction {
    number: number;
    probability: number;
    transitionsCount: number; // How many times this transition happened
}

/**
 * Build a transition matrix from historical draws.
 * Counts how many times number B appeared in the draw IMMEDIATELY following a draw with number A.
 * Note: Since draws contain 5 numbers, we look at:
 * If Draw N has [1, 2, 3, 4, 5] and Draw N+1 has [6, 7, 8, 9, 10]
 * We count transitions: 1->6, 1->7... 1->10, 2->6... 5->10.
 * This is a "Set-to-Set" transition model.
 */
export function buildTransitionMatrix(draws: Draw[]): TransitionMatrix {
    const matrix: TransitionMatrix = {};

    // Initialize matrix for numbers 1-50
    for (let i = 1; i <= 50; i++) {
        matrix[i] = {};
        for (let j = 1; j <= 50; j++) {
            matrix[i][j] = 0;
        }
    }

    // Iterate through draws (chronological order is crucial)
    // Assuming draws are sorted most recent first, we need to reverse or iterate backwards
    // Let's iterate from end (oldest) to start (newest)
    for (let i = draws.length - 1; i > 0; i--) {
        const currentDraw = draws[i];
        const nextDraw = draws[i - 1]; // The draw that happened AFTER currentDraw

        currentDraw.numbers.forEach(fromNum => {
            nextDraw.numbers.forEach(toNum => {
                matrix[fromNum][toNum]++;
            });
        });
    }

    return matrix;
}

/**
 * Get the most probable next numbers given a set of current numbers.
 * @param currentNumbers The numbers from the most recent draw (or any set of numbers)
 * @param matrix The transition matrix
 * @param topN Number of predictions to return
 */
export function getProbableNextNumbers(
    currentNumbers: number[],
    matrix: TransitionMatrix,
    topN: number = 10
): MarkovPrediction[] {
    const scores: { [num: number]: number } = {};
    const counts: { [num: number]: number } = {};

    // Initialize scores
    for (let i = 1; i <= 50; i++) {
        scores[i] = 0;
        counts[i] = 0;
    }

    // Aggregate probabilities from all current numbers
    currentNumbers.forEach(fromNum => {
        const transitions = matrix[fromNum];
        if (!transitions) return;

        let totalTransitionsForNum = 0;
        for (let i = 1; i <= 50; i++) {
            totalTransitionsForNum += transitions[i];
        }

        if (totalTransitionsForNum > 0) {
            for (let toNum = 1; toNum <= 50; toNum++) {
                // Add probability P(toNum | fromNum)
                scores[toNum] += transitions[toNum] / totalTransitionsForNum;
                counts[toNum] += transitions[toNum];
            }
        }
    });

    // Normalize scores (average probability)
    const predictions: MarkovPrediction[] = [];
    for (let i = 1; i <= 50; i++) {
        // We divide by currentNumbers.length to average the probabilities from each source number
        const probability = scores[i] / currentNumbers.length;
        predictions.push({
            number: i,
            probability,
            transitionsCount: counts[i]
        });
    }

    // Sort by probability descending
    return predictions
        .sort((a, b) => b.probability - a.probability)
        .slice(0, topN);
}
