import { Draw } from '@prisma/client';

export interface NumberFeatureRow {
    number: number;
    delay: number;
    freq10: number;
    freq50: number;
    label: number; // 1 if drawn in the next draw, 0 otherwise
}

export interface ExtractedFeatures {
    features: number[][]; // [delay, freq10, freq50]
    labels: number[];    // [1 or 0]
}

/**
 * Parses the stringified numbers or stars into an array of integers.
 */
function parseDrawArray(drawContent: any): number[] {
    if (typeof drawContent === 'string') {
        try {
            return JSON.parse(drawContent);
        } catch {
            return [];
        }
    }
    if (Array.isArray(drawContent)) return drawContent;
    if (typeof drawContent === 'number') return [drawContent];
    return [];
}

/**
 * Builds a universal feature matrix for Random Forest and ML Classifiers.
 * Evaluates the history and calculates metrics for EVERY possible number 
 * directly against the subsequent draw result.
 * 
 * @param draws Ascending list of historical draws
 * @param maxVal Max number (eg: 50 for EM numbers, 12 for EM stars)
 * @param targetField 'numbers' or 'stars' to decide what array to parse
 * @returns Object with features array (2D) and labels array (1D)
 */
export function buildFeaturesMatrix(draws: Draw[], maxVal: number, targetField: 'numbers' | 'stars'): ExtractedFeatures {
    const features: number[][] = [];
    const labels: number[] = [];
    
    // We need at least 50 draws to calculate 'freq50' accurately
    if (draws.length < 55) {
        return { features, labels };
    }

    // Pre-parse all draws to avoid repeated JSON parsing
    const parsedDraws = draws.map(d => parseDrawArray(d[targetField]));
    
    // Memory map to track the last index where each number was seen
    // Initialize with -1 to indicate not seen yet
    const lastSeen = new Array(maxVal + 1).fill(-1);

    // Initial population of lastSeen up to index 49
    for (let i = 0; i < 50; i++) {
        const arr = parsedDraws[i];
        for (const num of arr) {
            if (num <= maxVal) {
                lastSeen[num] = i;
            }
        }
    }

    // For every draw starting from index 50 up to the end (excluding the very last one because we need a target "next draw")
    for (let i = 50; i < draws.length - 1; i++) {
        // Update lastSeen for the current draw BEFORE calculating delay for this draw
        const currentArr = parsedDraws[i];
        for (const num of currentArr) {
             if (num <= maxVal) {
                 lastSeen[num] = i;
             }
        }

        const nextDrawArray = parsedDraws[i + 1];
        
        // Slices for frequency calculation (already parsed)
        const slice50 = parsedDraws.slice(i - 49, i + 1); // 50 items up to current
        const slice10 = parsedDraws.slice(i - 9, i + 1);  // 10 items up to current
        
        for (let num = 1; num <= maxVal; num++) {
            // 1. Calculate Delay (O(1) lookup!)
            // If it was never seen, delay is just the current index (i)
            let delay = lastSeen[num] === -1 ? i : (i - lastSeen[num]);

            // 2. Frequency in 10
            let freq10 = 0;
            for (const d of slice10) {
                if (d.includes(num)) freq10++;
            }

            // 3. Frequency in 50
            let freq50 = 0;
            for (const d of slice50) {
                if (d.includes(num)) freq50++;
            }

            // 4. Label (Is it drawn in the NEXT draw?)
            const label = nextDrawArray.includes(num) ? 1 : 0;

            features.push([delay, freq10, freq50]);
            labels.push(label);
        }
    }

    return { features, labels };
}

/**
 * Builds the feature matrix for CURRENT prediction (the latest draw state)
 * Used purely for generation/prediction logic, assumes 'labels' are unknown.
 */
export function buildCurrentPredictionMatrix(draws: Draw[], maxVal: number, targetField: 'numbers' | 'stars'): number[][] {
    const features: number[][] = [];
    
    if (draws.length < 50) return features;
    
    // Pre-parse draws
    const parsedDraws = draws.map(d => parseDrawArray(d[targetField]));

    // Memory map to track the last index where each number was seen
    const lastSeen = new Array(maxVal + 1).fill(-1);

    // Populate lastSeen up to the current (last) index
    for (let i = 0; i < draws.length; i++) {
        const arr = parsedDraws[i];
        for (const num of arr) {
            if (num <= maxVal) {
                lastSeen[num] = i;
            }
        }
    }

    // Slices for frequency calculation
    const currentIndex = draws.length - 1;
    const slice50 = parsedDraws.slice(draws.length - 50);
    const slice10 = parsedDraws.slice(draws.length - 10);

    for (let num = 1; num <= maxVal; num++) {
        // Calculate Delay (O(1) lookup!)
        let delay = lastSeen[num] === -1 ? currentIndex : (currentIndex - lastSeen[num]);

        let freq10 = 0;
        for (const d of slice10) {
            if (d.includes(num)) freq10++;
        }

        let freq50 = 0;
        for (const d of slice50) {
            if (d.includes(num)) freq50++;
        }

        features.push([delay, freq10, freq50]);
    }

    return features;
}
