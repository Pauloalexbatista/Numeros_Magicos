import { Draw } from '@prisma/client';

export interface ExtractedFeatures {
    features: number[][]; // [delay, freq10, freq50]
    labels: number[];    // [1 or 0]
}

function parseDrawArray(drawContent: any): number[] {
    if (typeof drawContent === 'string') {
        try {
            return JSON.parse(drawContent);
        } catch {
            return [];
        }
    }
    if (Array.isArray(drawContent)) return drawContent;
    return [];
}

/**
 * Builds a universal feature matrix for Random Forest and ML Classifiers.
 */
export function buildFeaturesMatrix(draws: Draw[], maxVal: number, targetField: 'numbers' | 'stars'): ExtractedFeatures {
    const features: number[][] = [];
    const labels: number[] = [];
    
    if (draws.length < 55) return { features, labels };

    const parsedDraws = draws.map(d => parseDrawArray(d[targetField]));
    const lastSeen = new Array(maxVal + 1).fill(-1);

    // Initial seed [0-49]
    for (let i = 0; i < 50; i++) {
        for (const num of parsedDraws[i]) if (num <= maxVal) lastSeen[num] = i;
    }

    for (let i = 50; i < draws.length - 1; i++) {
        for (const num of parsedDraws[i]) if (num <= maxVal) lastSeen[num] = i;

        const nextDrawArray = parsedDraws[i + 1];
        const slice50 = parsedDraws.slice(i - 49, i + 1);
        const slice10 = parsedDraws.slice(i - 9, i + 1);
        
        for (let num = 1; num <= maxVal; num++) {
            const delay = lastSeen[num] === -1 ? i : (i - lastSeen[num]);
            
            let freq10 = 0;
            for (const d of slice10) if (d.includes(num)) freq10++;

            let freq50 = 0;
            for (const d of slice50) if (d.includes(num)) freq50++;

            features.push([delay, freq10, freq50]);
            labels.push(nextDrawArray.includes(num) ? 1 : 0);
        }
    }

    return { features, labels };
}

/**
 * Optimized version: Calculates all features at once.
 */
export function buildAllFeatures(draws: Draw[], maxVal: number, targetField: 'numbers' | 'stars'): ExtractedFeatures {
    return buildFeaturesMatrix(draws, maxVal, targetField);
}

/**
 * For CURRENT prediction (latest state).
 */
export function buildCurrentPredictionMatrix(draws: Draw[], maxVal: number, targetField: 'numbers' | 'stars'): number[][] {
    const features: number[][] = [];
    if (draws.length < 50) return features;
    
    const parsedDraws = draws.map(d => parseDrawArray(d[targetField]));
    const lastSeen = new Array(maxVal + 1).fill(-1);

    for (let i = 0; i < draws.length; i++) {
        for (const num of parsedDraws[i]) if (num <= maxVal) lastSeen[num] = i;
    }

    const currentIndex = draws.length - 1;
    const slice50 = parsedDraws.slice(draws.length - 50);
    const slice10 = parsedDraws.slice(draws.length - 10);

    for (let num = 1; num <= maxVal; num++) {
        const delay = lastSeen[num] === -1 ? currentIndex : (currentIndex - lastSeen[num]);
        let freq10 = 0;
        for (const d of slice10) if (d.includes(num)) freq10++;
        let freq50 = 0;
        for (const d of slice50) if (d.includes(num)) freq50++;

        features.push([delay, freq10, freq50]);
    }
    return features;
}
