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
 * Mais Quentes System (Janela Recente de 20 Sorteios)
 */
export async function generateHotRecentNumbers(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
    const predCount = returnFullPool ? maxNum : defaultPredCount;

    if (!draws || draws.length === 0) {
        return Array.from({ length: predCount }, (_, i) => i + 1);
    }

    // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
    const d0 = new Date(draws[0].date).getTime();
    const dEnd = new Date(draws[draws.length - 1].date).getTime();
    const chronDraws = (d0 < dEnd) ? [...draws].reverse() : draws;

    // Frequência base na janela de 20 sorteios
    const recent20 = chronDraws.slice(0, 20);
    const freq20: Record<number, number> = {};
    for (let i = 1; i <= maxNum; i++) freq20[i] = 0;

    recent20.forEach(draw => {
        const nums = parseNumbers(draw);
        nums.forEach(n => {
            if (freq20[n] !== undefined) freq20[n]++;
        });
    });

    // Pré-calcular frequências cumulativas para desempates progressivos (+5 em +5 sorteios)
    // Janelas de 25, 30, 35, 40, ... até ao total de sorteios
    const cumFreqWindows: Record<number, Record<number, number>> = {};
    for (let w = 25; w <= chronDraws.length + 5; w += 5) {
        const winLimit = Math.min(w, chronDraws.length);
        const winDraws = chronDraws.slice(0, winLimit);
        cumFreqWindows[w] = {};
        for (let i = 1; i <= maxNum; i++) cumFreqWindows[w][i] = 0;
        winDraws.forEach(draw => {
            parseNumbers(draw).forEach(n => {
                if (cumFreqWindows[w][n] !== undefined) cumFreqWindows[w][n]++;
            });
        });
        if (winLimit === chronDraws.length) break;
    }

    const candidates = Array.from({ length: maxNum }, (_, i) => i + 1);

    candidates.sort((a, b) => {
        // 1. REGRA DE OURO DA INVIOLABILIDADE: Nível 20 é absoluto
        const diff20 = freq20[b] - freq20[a];
        if (diff20 !== 0) return diff20;

        // 2. Desempate progressivo exclusivo dentro do mesmo escalão de empate
        for (let w = 25; w <= chronDraws.length + 5; w += 5) {
            if (cumFreqWindows[w]) {
                const diffW = cumFreqWindows[w][b] - cumFreqWindows[w][a];
                if (diffW !== 0) return diffW;
            }
            if (w >= chronDraws.length) break;
        }

        // 3. Desempate canónico final: Opção A (ordem crescente)
        return a - b;
    });

    return candidates.slice(0, predCount);
}

/**
 * Markov Chain System
 */
export async function generateMarkovChain(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const maxNum = getMaxNumber(draws);
    if (draws.length < 2) return ensureN([], draws, returnFullPool);

    // Construir a matriz de transicao baseada no historico
    // draws[0] e o mais recente. A transicao e de draws[k+1] para draws[k]
    const transitions = {};
    const globalFreq = {};

    for (let i = 1; i <= maxNum; i++) {
        transitions[i] = {};
        globalFreq[i] = 0;
    }

    // Calcular frequencias globais para desempate
    draws.forEach(draw => {
        parseNumbers(draw).forEach(n => {
            if (globalFreq[n] !== undefined) globalFreq[n]++;
        });
    });

    for (let k = 0; k < draws.length - 1; k++) {
        const prevDrawNums = parseNumbers(draws[k + 1]);
        const nextDrawNums = parseNumbers(draws[k]);

        prevDrawNums.forEach(prev => {
            if (transitions[prev] !== undefined) {
                nextDrawNums.forEach(next => {
                    transitions[prev][next] = (transitions[prev][next] || 0) + 1;
                });
            }
        });
    }

    // Previsao baseada no ultimo sorteio (draws[0])
    const lastNumbers = parseNumbers(draws[0]);
    const scores = {};
    for (let i = 1; i <= maxNum; i++) scores[i] = 0;

    lastNumbers.forEach(prev => {
        if (transitions[prev]) {
            Object.entries(transitions[prev]).forEach(([nextStr, count]) => {
                const next = Number(nextStr);
                if (scores[next] !== undefined) {
                    scores[next] += count;
                }
            });
        }
    });

    // Ordenar: 1o por probabilidade de transicao (score), 2o por frequencia global
    const candidates = Object.keys(scores)
        .map(Number)
        .sort((a, b) => {
            const diff = scores[b] - scores[a];
            if (diff !== 0) return diff;
            return globalFreq[b] - globalFreq[a];
        });

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
    const maxNum = getMaxNumber(draws);
    const predCount = returnFullPool ? maxNum : getNumberPredictionCount(draws);
    const recentDraws = draws.slice(0, 20);

    // Determinar quantidade de clusters (grupos de 10)
    const numClusters = Math.ceil(maxNum / 10);
    const clusters = {};
    for (let i = 1; i <= numClusters; i++) {
        clusters[i] = [];
    }

    // Contar ocorrencias nos ultimos 20 sorteios por cluster
    recentDraws.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            const clusterId = Math.ceil(num / 10);
            if (clusters[clusterId] !== undefined) {
                clusters[clusterId].push(num);
            }
        });
    });

    // Calcular a atividade de cada cluster (numero de saidas totais nele)
    const clusterActivity = Object.entries(clusters).map(([id, nums]: [string, any]) => ({
        id: parseInt(id),
        count: nums.length
    }));

    // Ordenar clusters pelo mais ativo
    clusterActivity.sort((a, b) => b.count - a.count || a.id - b.id);

    // Contar frequencias individuais nos ultimos 20 e global
    const recentFreq = {};
    const globalFreq = {};
    for (let i = 1; i <= maxNum; i++) {
        recentFreq[i] = 0;
        globalFreq[i] = 0;
    }

    draws.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            if (globalFreq[num] !== undefined) globalFreq[num]++;
        });
    });

    recentDraws.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            if (recentFreq[num] !== undefined) recentFreq[num]++;
        });
    });

    // Montar a lista ordenada completa
    const candidates: number[] = [];
    clusterActivity.forEach(activity => {
        const clusterId = activity.id;
        const startNum = (clusterId - 1) * 10 + 1;
        const endNum = Math.min(clusterId * 10, maxNum);

        // Obter os numeros deste cluster e ordena-los internamente
        const clusterNums: number[] = [];
        for (let num = startNum; num <= endNum; num++) {
            clusterNums.push(num);
        }

        clusterNums.sort((a, b) => {
            const diff = recentFreq[b] - recentFreq[a];
            if (diff !== 0) return diff;
            return globalFreq[b] - globalFreq[a]; // desempate global
        });

        candidates.push(...clusterNums);
    });

    return ensureN(candidates, draws, returnFullPool);
}

/**
 * Recent Numbers System (Last Unique)
 */
export async function generateRecentNumbers(history: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const { predCount: defaultPredCount, maxNum } = getGameConfig(history);
    const predCount = returnFullPool ? maxNum : defaultPredCount;

    if (!history || history.length === 0) {
        return Array.from({ length: predCount }, (_, i) => i + 1);
    }

    // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
    const d0 = new Date(history[0].date).getTime();
    const dEnd = new Date(history[history.length - 1].date).getTime();
    const chronHistory = (d0 < dEnd) ? [...history].reverse() : history;

    const uniqueNumbers = new Set<number>();

    for (const draw of chronHistory) {
        if (uniqueNumbers.size >= predCount) break;
        let numbers: number[] = [];
        if (typeof draw.numbers === 'string') {
            numbers = JSON.parse(draw.numbers);
        } else if (Array.isArray(draw.numbers)) {
            numbers = draw.numbers as unknown as number[];
        }

        if (Array.isArray(numbers)) {
            const sorted = [...numbers].sort((a, b) => a - b);
            for (const num of sorted) {
                if (num >= 1 && num <= maxNum && uniqueNumbers.size < predCount) {
                    uniqueNumbers.add(num);
                }
            }
        }
    }

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
        name: 'Mais Sorteadas de Sempre',
        description: 'Numeros ordenados do mais sorteado para o menos sorteado, desde o 1o sorteio',
        generateTop10: generateHotNumbers
    },
    {
        name: 'Mais Quentes',
        description: 'Numeros ordenados pelo numero de vezes que sairam nos ultimos 20 sorteios',
        generateTop10: generateHotRecentNumbers
    },
    {
        name: 'Últimos a Sair',
        description: 'Numeros ordenados pela data da última aparição (mais recente primeiro) até ao 1o sorteio',
        generateTop10: generateRecentNumbers
    },
    {
                name: 'Transições de Markov',
        description: 'AnÃ¡lise de probabilidades de transiÃ§Ã£o entre nÃºmeros',
        generateTop10: generateMarkovChain
    },
    {
                name: 'Agrupamento de Padrões (Clustering)',
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
