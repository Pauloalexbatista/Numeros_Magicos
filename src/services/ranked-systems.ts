import { SistMedia3Otimizado } from './custom/SistMedia3Otimizado';
export { SistMedia3Otimizado };

import { Draw } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PyramidPascalSystem } from './pyramid-pascal';
export { PyramidPascalSystem };
import { PyramidGapsSystem } from './pyramid-gaps';
export { PyramidGapsSystem };

import { SeededRNG } from '../utils/seeded-rng';
import { getGameConfig } from './game-config';
import { UniversalOscillationV2System } from './universal-oscillation-v2-system';
export { UniversalOscillationV2System };
import { DiagonaisMatrizSystem } from './diagonais-matriz';
export { DiagonaisMatrizSystem };
import { DiagonaisMatriz3DSystem } from './diagonais-matriz-3d';
export { DiagonaisMatriz3DSystem };

// Ensemble Imports
// RandomSystem removed â€” apagado da BD e do projecto

/**
 * System types
 */
export type SystemType = 'base' | 'ensemble' | 'neural';
export type SystemDomain = 'numbers' | 'stars';

/**
 * Interface for a ranked prediction system
 */
export interface IPredictiveSystem {
    name: string;
    description: string;
    type?: SystemType;           // 'base' or 'ensemble'
    domain?: SystemDomain;       // 'numbers' or 'stars'
    dependencies?: string[];     // System names this ensemble depends on
    generateTop10(draws: Draw[], returnFullPool?: boolean): Promise<number[]>; // Returns up to 15/18 numbers
}

/**
 * Helper to parse numbers from Draw
 */
function parseNumbers(draw: Draw): number[] {
    if (typeof draw.numbers === 'string') {
        return (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers);
    }
    return draw.numbers as unknown as number[];
}

/**
 * Helper to determine max number based on game type
 */
export function getMaxNumber(draws: Draw[]): number {
    if (draws.length > 0) {
        if (draws[0].game === 'TOTOLOTO') return 49;
        if (draws[0].game === 'EURODREAMS') return 40;
        if (draws[0].game === 'MEGASENA') return 60;
    }
    return 50; // Default to EuroMillions
}

/**
 * Helper to determine how many numbers to predict based on game type
 */
export function getNumberPredictionCount(draws: Draw[]): number {
    const config = getGameConfig(draws);
    return config.predCount;
}

/**
 * Helper to determine how many numbers are drawn per game
 */
export function getNumbersDrawn(draws: Draw[]): number {
    if (draws.length > 0) {
        if (draws[0].game === 'EURODREAMS') return 6;
        if (draws[0].game === 'MEGASENA') return 6;
    }
    return 5;
}

/**
 * Helper to ensure exactly N numbers are returned
 */
function ensureN(numbers: number[], draws: Draw[], returnFullPool: boolean = false): number[] {
    let result = [...new Set(numbers)]; // Deduplicate
    const maxNum = getMaxNumber(draws);
    const predCount = returnFullPool ? maxNum : getNumberPredictionCount(draws); // TARGET THE FULL POOL SIZE

    if (result.length > predCount) {
        return result.slice(0, predCount);
    }

    if (result.length < predCount) {
        const frequency: Record<number, number> = {};
        draws.forEach(draw => {
            const nums = parseNumbers(draw);
            nums.forEach(num => frequency[num] = (frequency[num] || 0) + 1);
        });

        const sortedByFreq = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        for (const num of sortedByFreq) {
            if (result.length >= predCount) break;
            if (!result.includes(num)) {
                result.push(num);
            }
        }

        if (result.length < predCount) {
            for (let i = 1; i <= maxNum; i++) {
                if (result.length >= predCount) break;
                if (!result.includes(i)) result.push(i);
            }
        }
    }

    return result;
}

/**
 * Late Numbers System
 */
export async function generateLateNumbers(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const lastAppearance: Record<number, number> = {};
    const maxNum = getMaxNumber(draws);

    for (let i = 1; i <= maxNum; i++) {
        lastAppearance[i] = draws.length;
    }

    draws.forEach((draw, index) => {
        const numbers = parseNumbers(draw);
        numbers.forEach(num => {
            if (lastAppearance[num] === draws.length) {
                lastAppearance[num] = index;
            }
        });
    });

    const candidates = Object.entries(lastAppearance)
        .sort(([, a], [, b]) => b - a)
        .map(([num]) => parseInt(num));

    return ensureN(candidates, draws, returnFullPool);
}

/**
 * Hot Numbers System
 */
export async function generateHotNumbers(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const frequency: Record<number, number> = {};

    draws.forEach(draw => {
        const numbers = parseNumbers(draw);
        numbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
    });

    const candidates = Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .map(([num]) => parseInt(num));

    return ensureN(candidates, draws, returnFullPool);
}

/**
 * Markov Chain System
 */
export async function generateMarkovChain(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const coOccurrence: Record<number, Record<number, number>> = {};

    draws.forEach(draw => {
        const numbers = parseNumbers(draw);
        numbers.forEach((num1, i) => {
            if (!coOccurrence[num1]) coOccurrence[num1] = {};
            numbers.forEach((num2, j) => {
                if (i !== j) {
                    coOccurrence[num1][num2] = (coOccurrence[num1][num2] || 0) + 1;
                }
            });
        });
    });

    if (draws.length === 0) return ensureN([], draws, returnFullPool);

    const lastNumbers = parseNumbers(draws[0]);
    const scores: Record<number, number> = {};
    lastNumbers.forEach(num => {
        if (coOccurrence[num]) {
            Object.entries(coOccurrence[num]).forEach(([nextNum, count]) => {
                scores[parseInt(nextNum)] = (scores[parseInt(nextNum)] || 0) + count;
            });
        }
    });

    const candidates = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .map(([num]) => parseInt(num));

    return ensureN(candidates, draws, returnFullPool);
}

/**
 * Monte Carlo System
 */
export async function generateMonteCarlo(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const frequency: Record<number, number> = {};
    const maxNum = getMaxNumber(draws);

    draws.forEach(draw => {
        const numbers = parseNumbers(draw);
        numbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
    });

    const totalDraws = draws.length;
    const probabilities: Record<number, number> = {};
    Object.entries(frequency).forEach(([num, count]) => {
        probabilities[parseInt(num)] = count / totalDraws;
    });

    const lastDraw = draws[0];
    const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'default-seed';
    const rng = new SeededRNG(seedStr);

    const simulations = 1000;
    const simulationResults: Record<number, number> = {};

    for (let i = 0; i < simulations; i++) {
        const simDraw: number[] = [];
        const available = Array.from({ length: maxNum }, (_, i) => i + 1);

        while (simDraw.length < 5) {
            const weights = available.map(n => probabilities[n] || 0.01);
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = rng.next() * totalWeight;

            for (let j = 0; j < available.length; j++) {
                random -= weights[j];
                if (random <= 0) {
                    const selected = available[j];
                    simDraw.push(selected);
                    available.splice(j, 1);
                    break;
                }
            }
        }

        simDraw.forEach(num => {
            simulationResults[num] = (simulationResults[num] || 0) + 1;
        });
    }

    const candidates = Object.entries(simulationResults)
        .sort(([, a], [, b]) => b - a)
        .map(([num]) => parseInt(num));

    return ensureN(candidates, draws, returnFullPool);
}

/**
 * Clustering System
 */
export async function generateClustering(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const recentDraws = draws.slice(0, 20);
    const clusters: Record<number, number[]> = {
        1: [], 2: [], 3: [], 4: [], 5: []
    };

    recentDraws.forEach(draw => {
        const numbers = parseNumbers(draw);
        numbers.forEach(num => {
            const cluster = Math.ceil(num / 10);
            if (clusters[cluster]) {
                clusters[cluster].push(num);
            }
        });
    });

    const clusterActivity = Object.entries(clusters).map(([id, nums]) => ({
        id: parseInt(id),
        count: nums.length,
        numbers: nums
    }));

    clusterActivity.sort((a, b) => b.count - a.count);
    const frequency: Record<number, number> = {};
    const topClusters = clusterActivity.slice(0, 3);

    topClusters.forEach(cluster => {
        cluster.numbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
    });

    const candidates = Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .map(([num]) => parseInt(num));

    return ensureN(candidates, recentDraws, returnFullPool);
}

/**
 * Recent Numbers System (Last Unique)
 */
export async function generateRecentNumbers(history: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const { predCount: defaultPredCount, maxNum } = getGameConfig(history);
    const predCount = returnFullPool ? maxNum : defaultPredCount;
    const uniqueNumbers = new Set<number>();

    for (const draw of history) {
        if (uniqueNumbers.size >= predCount) break;
        const numbers = typeof draw.numbers === 'string' ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers) : draw.numbers;
        if (Array.isArray(numbers)) {
            for (const num of numbers) {
                if (uniqueNumbers.size < predCount) {
                    uniqueNumbers.add(num);
                }
            }
        }
    }

    // Fill any missing numbers up to predCount
    for (let i = 1; i <= maxNum; i++) {
        if (uniqueNumbers.size >= predCount) break;
        uniqueNumbers.add(i);
    }

    return Array.from(uniqueNumbers);
}

/**
 * Registry of all active ranked systems
 */
const baseSystems: IPredictiveSystem[] = [
    {
        name: 'Hot Numbers',
        description: 'NÃºmeros mais frequentes nos sorteios recentes',
        generateTop10: generateHotNumbers
    },
    {
        name: 'Recent Numbers',
        description: 'NÃºmeros mais recentes (Ãºnicos) a sair',
        generateTop10: generateRecentNumbers
    },
    {
        name: 'Markov Chain',
        description: 'AnÃ¡lise de probabilidades de transiÃ§Ã£o entre nÃºmeros',
        generateTop10: generateMarkovChain
    },
    {
        name: 'Clustering',
        description: 'Agrupamento de padrÃµes e nÃºmeros relacionados',
        generateTop10: generateClustering
    },
    new PyramidPascalSystem(),
    new PyramidGapsSystem(),
    new SistMedia3Otimizado(),
    new UniversalOscillationV2System(),
    new DiagonaisMatrizSystem(),
    new DiagonaisMatriz3DSystem(),
    {
        name: 'Late Numbers',
        description: 'NÃºmeros que nÃ£o saem hÃ¡ mais tempo',
        generateTop10: generateLateNumbers
    },
    {
        name: 'Monte Carlo',
        description: 'SimulaÃ§Ãµes probabilÃ­sticas baseadas em frequÃªncia histÃ³rica',
        generateTop10: generateMonteCarlo
    },
];

// Initialize Ensemble Systems
const ensembleSystems: IPredictiveSystem[] = [];

export const numberBaseSystems: IPredictiveSystem[] = baseSystems;
export const numberEnsembleSystems: IPredictiveSystem[] = ensembleSystems;

export const rankedSystems: IPredictiveSystem[] = [
    ...baseSystems.map(sys => {
        if (!sys.type) sys.type = 'base' as SystemType;
        sys.domain = 'numbers' as SystemDomain;
        return sys;
    })
];

/**
 * Get a system by name
 */
export function getSystemByName(name: string): IPredictiveSystem | undefined {
    return rankedSystems.find(s => s.name === name);
}