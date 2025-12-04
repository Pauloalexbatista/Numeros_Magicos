import { Draw } from '@/models/types';

export interface NumberFeatures {
    number: number;
    lag: number;
    absoluteFreq: number;
    recentFreq: number; // Last 100 draws
    isEven: number; // 0 or 1
    decade: number; // 1-5
    coOccurrence: number; // Frequency with best partner
    previousSum: number;
}

/**
 * Calculate features for all 50 numbers based on history up to (but not including) the target draw.
 * @param history Full history of draws
 * @param targetIndex Index of the draw we want to predict (or next draw index)
 */
export function calculateFeatures(history: Draw[], targetIndex: number): NumberFeatures[] {
    // Ensure we have enough history
    if (targetIndex < 1) {
        throw new Error('Not enough history to calculate features');
    }

    // Slice history to only include draws BEFORE the target
    const pastDraws = history.slice(0, targetIndex);
    const recentDraws = pastDraws.slice(-100); // For recent frequency
    const lastDraw = pastDraws[pastDraws.length - 1];
    const previousSum = lastDraw.numbers.reduce((a, b) => a + b, 0);

    // Pre-calculate co-occurrence matrix if needed, or just do it per number
    // For 50 numbers, it's fast enough to do it on the fly for a single prediction.
    // But for generating training data (many calls), we might want to optimize.
    // For now, let's implement the logic clearly.

    const features: NumberFeatures[] = [];

    for (let num = 1; num <= 50; num++) {
        // 1. LAG (Draws since last appearance)
        let lag = 0;
        let found = false;
        for (let i = pastDraws.length - 1; i >= 0; i--) {
            if (pastDraws[i].numbers.includes(num)) {
                lag = pastDraws.length - 1 - i;
                found = true;
                break;
            }
        }
        if (!found) lag = pastDraws.length; // Never appeared

        // 2. Absolute Frequency
        const absoluteFreq = pastDraws.filter(d => d.numbers.includes(num)).length;

        // 3. Recent Frequency (Last 100)
        const recentFreq = recentDraws.filter(d => d.numbers.includes(num)).length;

        // 4. Even/Odd
        const isEven = num % 2 === 0 ? 0 : 1; // 1 for Odd, 0 for Even (as per user request/standard ML encoding)

        // 5. Decade (1-5)
        // 1-10 -> 1, 11-20 -> 2, etc.
        const decade = Math.ceil(num / 10);

        // 6. Co-occurrence (Frequency with best partner)
        // Find draws containing 'num'
        const drawsWithNum = pastDraws.filter(d => d.numbers.includes(num));
        let maxCoFreq = 0;

        if (drawsWithNum.length > 0) {
            const partnerCounts: Record<number, number> = {};
            drawsWithNum.forEach(d => {
                d.numbers.forEach(partner => {
                    if (partner !== num) {
                        partnerCounts[partner] = (partnerCounts[partner] || 0) + 1;
                    }
                });
            });
            // Find max
            const counts = Object.values(partnerCounts);
            if (counts.length > 0) {
                maxCoFreq = Math.max(...counts);
            }
        }

        features.push({
            number: num,
            lag,
            absoluteFreq,
            recentFreq,
            isEven,
            decade,
            coOccurrence: maxCoFreq,
            previousSum
        });
    }

    return features;
}

/**
 * Helper to prepare a full training dataset from history.
 * @param history Full history
 * @param minDraws Minimum history required before starting to generate rows
 */
export function generateTrainingData(history: Draw[], minDraws: number = 100) {
    const trainingRows: any[] = []; // Explicitly type as any[] or define interface

    for (let i = minDraws; i < history.length; i++) {
        const targetDraw = history[i];
        const features = calculateFeatures(history, i);

        // Create a row for each number
        features.forEach(feat => {
            trainingRows.push({
                drawId: i, // Or use date/ID if available
                ...feat,
                target: targetDraw.numbers.includes(feat.number) ? 1 : 0
            });
        });
    }

    return trainingRows;
}
