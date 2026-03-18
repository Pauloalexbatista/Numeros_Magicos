import * as tf from '@tensorflow/tfjs';
import { Draw } from '@prisma/client';

export interface SequenceData {
    xs: tf.Tensor3D;
    ys: tf.Tensor2D;
}

/**
 * Normalizes an array of numbers (e.g., [1, 2, 3]) to values between 0 and 1
 * by dividing by the maximum possible value for that game/domain.
 */
export function normalizeData(data: number[], maxVal: number): number[] {
    return data.map(val => val / maxVal);
}

/**
 * Denormalizes a value from [0, 1] back to the original scale.
 */
export function denormalizeData(val: number, maxVal: number): number {
    return Math.round(val * maxVal);
}

/**
 * Creates sequences of data for LSTM training.
 * LSTMs require 3D input: [batch_size, time_steps, features]
 * 
 * @param draws Required ordered array of historical Draws (oldest to newest is expected, but depending on how you sort them it works)
 * @param extractFn A function to extract the relevant numbers from a Draw
 * @param maxVal The maximum possible number (for normalization)
 * @param timeSteps How many past draws to look at to predict the next one
 * @param sortAscending If true, ensures draws are sorted oldest to newest (by drawId or date)
 */
export function prepareTimeSequences(
    draws: Draw[], 
    extractFn: (d: Draw) => number[],
    maxVal: number,
    timeSteps: number = 10,
    sortAscending: boolean = true
): SequenceData | null {
    
    // Safety check
    if (draws.length <= timeSteps) {
        return null;
    }

    // Sort draws ascending (oldest first) so sequences flow forward in time
    const sortedDraws = sortAscending 
        ? [...draws].sort((a, b) => a.id - b.id)
        : [...draws];

    const sequences: number[][][] = [];
    const labels: number[][] = [];

    // sliding window
    for (let i = 0; i < sortedDraws.length - timeSteps; i++) {
        // Build the sequence window
        // normalize
        const sequence: number[][] = [];
        for (let j = 0; j < timeSteps; j++) {
            const rawNums = extractFn(sortedDraws[i + j]);
            // normalize
            sequence.push(normalizeData(rawNums, maxVal));
        }
        sequences.push(sequence);
        
        // The label is the *next* draw after the window
        const labelNums = extractFn(sortedDraws[i + timeSteps]);
        labels.push(normalizeData(labelNums, maxVal));
    }

    if (sequences.length === 0) return null;

    // Convert to tensors
    const xs = tf.tensor3d(sequences); // Shape: [batch_size, timeSteps, num_features]
    const ys = tf.tensor2d(labels);    // Shape: [batch_size, num_features]

    return { xs, ys };
}

/**
 * Extracts the single next prediction sequence from the MOST RECENT draws
 * to use in predicting the upcoming undocumented draw.
 */
export function preparePredictionInput(
    recentDraws: Draw[],
    extractFn: (d: Draw) => number[],
    maxVal: number,
    timeSteps: number = 10
): tf.Tensor3D | null {
    if (recentDraws.length < timeSteps) return null;
    
    // Grab the most recent `timeSteps` draws and sort oldest to newest
    const window = [...recentDraws]
        .sort((a, b) => b.id - a.id) // Descending first to get latest
        .slice(0, timeSteps)
        .sort((a, b) => a.id - b.id); // Ascending for the sequence

    const sequence: number[][] = [];
    for (let i = 0; i < timeSteps; i++) {
        const rawNums = extractFn(window[i]);
        sequence.push(normalizeData(rawNums, maxVal));
    }

    return tf.tensor3d([sequence]); // Shape: [1, timeSteps, num_features]
}
