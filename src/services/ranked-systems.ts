import { SistMediaCamadas } from './custom/SistMediaCamadas';
import { SistMedia3Otimizado } from './custom/SistMedia3Otimizado';
import { mdiasemaspontasSystem } from './custom/mdiasemaspontas';
import { SistCombinadoMedia3System } from './custom/SistCombinadoMedia3';
import { Draw } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PyramidPascalSystem } from './pyramid-pascal';
import { PyramidGapsSystem } from './pyramid-gaps';
import { VortexPyramidSystem } from './vortex-pyramid';
import { VortexMultiChannelSystem } from './vortex-multichannel';
import { RandomSystem } from './random-system';

// ============================================================================
// SISTEMAS ML TEMPORARIAMENTE DESATIVADOS (03/02/2026)
// ============================================================================
// Razão: Causam hangs durante cálculos e precisam ser refeitos do zero
// Status na BD: isActive = false (desativados via script deactivate-ml-systems.ts)
// Plano: Refazer após arquitetura multi-game estar estável
//
// Sistemas desativados:
// - LSTM Neural Net (52.26% accuracy, 1818 previsões)
// - Random Forest AI (49.65% accuracy, 1907 previsões)
// - Standard Deviation (50.19% accuracy, 1862 previsões)
// - Sistema Elástico (50.23% accuracy, 1907 previsões)
//
// Imports comentados:
// import { RandomForestModel } from '../models/implementations/RandomForestModel';
// import { LSTMModel } from './ml/lstm';
// import { PatternBasedModel } from '../models/implementations/PatternBasedModel';
// import { MLClassifierModel } from '../models/implementations/MLClassifierModel';
// import { StandardDeviationModel } from '../models/implementations/StandardDeviationModel';
// import { RootSumModel } from '../models/implementations/RootSumModel';
// import { ElasticModel } from '../models/implementations/ElasticModel';
//
// Documentação: Ver SYSTEMS_REMOVED.md para análise completa
// ============================================================================

import { PredictionModel } from '../models/types';
import { SeededRNG } from '../utils/seeded-rng';
import { UniversalOscillationV2System } from './universal-oscillation-v2-system';
import { ConsensusSystem } from '../models/implementations/ConsensusSystem';
import QuartetoComplementar from './quarteto-complementar';
import { ConsensusAutoV1, ConsensusAutoV2 } from './consensus-auto';
import { QuartetoDeImpacto } from './quarteto-impacto';
// import { QuartetoEliteSystem } from '../systems/ensemble/QuartetoEliteSystem';

/**
 * System types
 */
export type SystemType = 'base' | 'ensemble';
export type SystemDomain = 'numbers' | 'stars';

/**
 * Interface for a ranked prediction system
 */
export interface IPredictiveSystem {
    name: string;
    description: string;
    type?: SystemType;           // 'base' or 'ensemble' (optional for backward compatibility)
    domain?: SystemDomain;       // 'numbers' or 'stars' (optional for backward compatibility)
    dependencies?: string[];     // System names this ensemble depends on (only for ensemble)
    generateTop10(draws: Draw[]): Promise<number[]>; // Returns up to 25 numbers
}

/**
 * Adapter for PredictionModel to IPredictiveSystem
 */
export class PredictionModelAdapter implements IPredictiveSystem {
    name: string;
    description: string;
    private model: PredictionModel;

    constructor(model: PredictionModel) {
        this.name = model.name;
        this.description = model.description;
        this.model = model;
    }

    async generateTop10(draws: Draw[]): Promise<number[]> {
        // Adapt Draw[] from Prisma to Draw[] from types (if needed)
        // We ask for 25 numbers to match the ranking system standard
        // The predict method expects history.
        const result = await this.model.predict(draws as any[], 25);
        return result.numbers;
    }
}

/**
 * Helper to parse numbers from Draw
 */
function parseNumbers(draw: Draw): number[] {
    if (typeof draw.numbers === 'string') {
        return JSON.parse(draw.numbers);
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
    }
    return 50; // Default to EuroMillions
}

/**
 * Helper to ensure exactly 25 numbers are returned
 * Fills with Hot Numbers if short, Trims if long
 */
function ensure25(numbers: number[], draws: Draw[]): number[] {
    let result = [...new Set(numbers)]; // Deduplicate
    const maxNum = getMaxNumber(draws);

    // Case 1: Too many (> 25) -> Trim
    if (result.length > 25) {
        return result.slice(0, 25);
    }

    // Case 2: Too few (< 25) -> Fill
    if (result.length < 25) {
        // Generate frequency map for filling
        const frequency: Record<number, number> = {};
        draws.forEach(draw => {
            const nums = parseNumbers(draw);
            nums.forEach(num => frequency[num] = (frequency[num] || 0) + 1);
        });

        const sortedByFreq = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        for (const num of sortedByFreq) {
            if (result.length >= 25) break;
            if (!result.includes(num)) {
                result.push(num);
            }
        }

        // If still < 25 (empty history?), fill with 1..N
        if (result.length < 25) {
            for (let i = 1; i <= maxNum; i++) {
                if (result.length >= 25) break;
                if (!result.includes(i)) result.push(i);
            }
        }
    }

    return result;
}

/**
 * Hot Numbers System
 * Returns top 10 most frequent numbers
 */
async function generateHotNumbers(draws: Draw[]): Promise<number[]> {
    const frequency: Record<number, number> = {};

    // Count frequencies
    draws.forEach(draw => {
        const numbers = parseNumbers(draw);
        numbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
    });

    // Sort by frequency and get top 25
    const candidates = Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .map(([num]) => parseInt(num));

    return ensure25(candidates, draws);
}

/**
 * Markov Chain System
 * Analyzes transition probabilities between numbers
 */
async function generateMarkovChain(draws: Draw[]): Promise<number[]> {
    // Simplified Markov: numbers that appear together frequently
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

    if (draws.length === 0) return ensure25([], draws);

    // Get last draw numbers
    const lastNumbers = parseNumbers(draws[0]);

    // Find numbers with highest transition probability from last draw
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

    return ensure25(candidates, draws);
}

/**
 * Monte Carlo System
 * Simulates random draws based on historical probabilities
 */
async function generateMonteCarlo(draws: Draw[]): Promise<number[]> {
    const frequency: Record<number, number> = {};
    const maxNum = getMaxNumber(draws);

    // Calculate probabilities
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

    // Initialize Seeded RNG based on last draw
    const lastDraw = draws[0];
    const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'default-seed';
    const rng = new SeededRNG(seedStr);

    // Run simulations
    const simulations = 1000;
    const simulationResults: Record<number, number> = {};

    for (let i = 0; i < simulations; i++) {
        const simDraw: number[] = [];
        const available = Array.from({ length: maxNum }, (_, i) => i + 1);

        while (simDraw.length < 5) {
            // Weighted random selection
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

    return ensure25(candidates, draws);
}

/**
 * Clustering System
 * Groups numbers and returns top 10 from most active cluster
 */
async function generateClustering(draws: Draw[]): Promise<number[]> {
    // Simple clustering: divide into 5 clusters (1-10, 11-20, etc.)
    const clusters: Record<number, number[]> = {
        1: [], 2: [], 3: [], 4: [], 5: []
    };

    draws.forEach(draw => {
        const numbers = parseNumbers(draw);
        numbers.forEach(num => {
            const cluster = Math.ceil(num / 10);
            if (clusters[cluster]) {
                clusters[cluster].push(num);
            }
        });
    });

    // Find most active cluster
    const clusterActivity = Object.entries(clusters).map(([id, nums]) => ({
        id: parseInt(id),
        count: nums.length,
        numbers: nums
    }));

    clusterActivity.sort((a, b) => b.count - a.count);

    // Get frequency within Top 3 most active clusters
    const frequency: Record<number, number> = {};

    // Take top 3 clusters to ensure we have enough numbers (max 30 numbers)
    const topClusters = clusterActivity.slice(0, 3);

    topClusters.forEach(cluster => {
        cluster.numbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
    });

    const candidates = Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .map(([num]) => parseInt(num));

    return ensure25(candidates, draws);
}

/**
 * Inverse System Wrapper
 * Takes a system and returns the numbers it DIDN'T predict
 */
export class InverseSystem implements IPredictiveSystem {
    name: string;
    description: string;
    private originalSystem: IPredictiveSystem;

    constructor(originalSystem: IPredictiveSystem) {
        this.name = `Anti-${originalSystem.name}`;
        this.description = `Estratégia Inversa: Aposta contra o ${originalSystem.name}`;
        this.originalSystem = originalSystem;
    }

    async generateTop10(draws: Draw[]): Promise<number[]> {
        // Get original prediction
        const predicted = await this.originalSystem.generateTop10(draws);
        const maxNum = getMaxNumber(draws);

        // Return the numbers NOT in the prediction
        // Pool is 1-N
        const allNumbers = Array.from({ length: maxNum }, (_, i) => i + 1);
        const inverseNumbers = allNumbers.filter(n => !predicted.includes(n));

        // We need to return "Top 10" (or 25 in our case).
        return inverseNumbers.slice(0, 25);
    }
}

/**
 * Registry of all ranked systems
 */
const baseSystems: IPredictiveSystem[] = [
    {
        name: 'Hot Numbers',
        description: 'Top 10 números mais frequentes nos últimos sorteios',
        generateTop10: generateHotNumbers
    },
    {
        name: 'Markov Chain',
        description: 'Análise de probabilidades de transição entre números',
        generateTop10: generateMarkovChain
    },
    {
        name: 'Monte Carlo',
        description: 'Simulações probabilísticas para prever números',
        generateTop10: generateMonteCarlo
    },
    {
        name: 'Clustering',
        description: 'Agrupamento de padrões e números relacionados',
        generateTop10: generateClustering
    },
    new PyramidPascalSystem(),
    new PyramidGapsSystem(),
    // new VortexPyramidSystem(),
    // new VortexMultiChannelSystem(2),
    // new VortexMultiChannelSystem(3),
    // TEMPORARILY DISABLED: ML Systems causing hang
    // new RandomForestModel(),
    // new LSTMModel(),
    // new PredictionModelAdapter(new PatternBasedModel()),
    // new PredictionModelAdapter(new MLClassifierModel()),
    // new StandardDeviationModel(),
    // new RootSumModel(),
    // new ElasticModel(),
    new RandomSystem(),
    new SistCombinadoMedia3System(),
    new mdiasemaspontasSystem(),
    new SistMedia3Otimizado(),
    new SistMediaCamadas(),
    new UniversalOscillationV2System(),
    // Ensemble systems moved to numberEnsembleSystems below
    // __DYNAMIC_SYSTEMS_MARKER__
];

/**
 * Number Base Systems - Generate predictions from historical data
 * These systems are independent and execute first
 */
export const numberBaseSystems: IPredictiveSystem[] = baseSystems;

/**
 * Number Ensemble Systems - Combine predictions from other systems
 * These systems depend on base systems and execute after them
 */
export const numberEnsembleSystems: IPredictiveSystem[] = [
    // Consensus Systems
    Object.assign(new ConsensusSystem(), {
        type: 'ensemble' as SystemType,
        domain: 'numbers' as SystemDomain,
        dependencies: ['Vortex Pyramid', 'Sistema Camadas', 'Sist Média +3 Otimizado']
    }),
    Object.assign(new ConsensusAutoV1(), {
        type: 'ensemble' as SystemType,
        domain: 'numbers' as SystemDomain,
        dependencies: ['Sistema Camadas', 'Sistema Combinado Media3'] // Removed Vortex Pyramid
    }),
    /* TEMPORARILY DISABLED: Depends on LSTM
    Object.assign(new ConsensusAutoV2(), {
        type: 'ensemble' as SystemType,
        domain: 'numbers' as SystemDomain,
        dependencies: ['Vortex Pyramid', 'LSTM Neural Net', 'Sistema Combinado Media3']
    }),
    */
    // Quarteto Systems
    Object.assign(new QuartetoComplementar(), {
        type: 'ensemble' as SystemType,
        domain: 'numbers' as SystemDomain,
        dependencies: [] // Will be filled after investigating
    }),
    Object.assign(new QuartetoDeImpacto(), {
        type: 'ensemble' as SystemType,
        domain: 'numbers' as SystemDomain,
        dependencies: ['Hot Numbers', 'PyramidPascal', 'Sistema Elástico', 'Random Generator']
    }),
    /* TEMPORARILY DISABLED: Depends on ML
    Object.assign(new QuartetoEliteSystem(), {
        type: 'ensemble' as SystemType,
        domain: 'numbers' as SystemDomain,
        dependencies: ['LSTM Neural Net', 'Sist Média +3 Otimizado', 'Random Forest', 'Sist Média sem as pontas']
    }),
    */
    // Medal systems will be added below
];

// Generate Anti-Systems automatically
export const rankedSystems: IPredictiveSystem[] = [
    ...baseSystems,
    ...baseSystems.map(sys => new InverseSystem(sys))
];

/**
 * Ensemble Voting System
 */
/**
 * Base class for Medal Systems (Ensemble)
 */
abstract class MedalSystem implements IPredictiveSystem {
    abstract name: string;
    abstract description: string;
    protected abstract topN: number;

    async generateTop10(history: Draw[]): Promise<number[]> {
        // Default weights (fallback)
        let weights: Record<string, number> = {};

        try {
            // Fetch dynamic rankings from DB
            const rankings = await prisma.systemRanking.findMany({
                orderBy: { avgAccuracy: 'desc' },
                take: this.topN // Dynamic Top N
            });

            if (rankings.length > 0) {
                rankings.forEach(rank => {
                    // Weight = Accuracy / 50 (simple weighted voting)
                    weights[rank.systemName] = rank.avgAccuracy / 50;
                });
            }
        } catch (error) {
            console.error(`Failed to fetch dynamic rankings for ${this.name}:`, error);
        }

        const votes: Record<number, number> = {};

        // Get predictions from all systems (Original + Anti)
        // We filter to only include the ones in our top N weights
        // CRITICAL: Exclude Medal Systems to prevent infinite recursion
        const systems = rankedSystems.filter(s =>
            weights[s.name] !== undefined &&
            !['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina'].includes(s.name)
        );

        for (const system of systems) {
            try {
                const systemWeight = weights[system.name] || 0;
                if (systemWeight === 0) continue;

                const predicted = await system.generateTop10(history);

                predicted.forEach(num => {
                    votes[num] = (votes[num] || 0) + systemWeight;
                });
            } catch (error) {
                // Silently fail for individual systems
            }
        }

        // CRITICAL FIX: Object.entries() iterates numeric keys in sorted order!
        // Use array of objects to preserve vote order
        const votesArray = Object.keys(votes).map(numStr => ({
            number: parseInt(numStr),
            voteCount: votes[parseInt(numStr)]
        }));

        return votesArray
            .sort((a, b) => b.voteCount - a.voteCount)  // Sort by votes (descending)
            .slice(0, 25)
            .map(item => item.number);  // Extract numbers in vote order
    }
}

class GoldSystem extends MedalSystem {
    name = "Sistema Ouro";
    description = "Ensemble dos 3 melhores sistemas (Elite)";
    protected topN = 3;
}

class SilverSystem extends MedalSystem {
    name = "Sistema Prata";
    description = "Ensemble dos 6 melhores sistemas (Equilibrado)";
    protected topN = 6;
}

class BronzeSystem extends MedalSystem {
    name = "Sistema Bronze";
    description = "Ensemble dos 9 melhores sistemas (Diversificado)";
    protected topN = 9;
}

class PlatinumSystem extends MedalSystem {
    name = "Sistema Platina";
    description = "Ensemble dos 12 melhores sistemas (Abrangente)";
    protected topN = 12;
}

/**
 * Fixed System (Static Numbers)
 * Used for testing specific strategies like "Média por Casa + Vizinhos"
 */
class FixedSystem implements IPredictiveSystem {
    name: string;
    description: string;
    private numbers: number[];

    constructor(name: string, description: string, numbers: number[]) {
        this.name = name;
        this.description = description;
        this.numbers = numbers;
    }

    async generateTop10(draws: Draw[]): Promise<number[]> {
        return this.numbers;
    }
}

// Numbers based on "Média por Casa + Vizinhos" (Visual Pattern)
const mediaVizinhosNumbers = [
    6, 7, 8, 9, 10,
    14, 15, 16, 17, 18,
    23, 24, 25, 26, 27,
    32, 33, 34, 35, 36,
    41, 42, 43, 44, 45
];

export const fixedMediaSystem = new FixedSystem(
    "Sistema Média Vizinhos",
    "Estratégia fixa: Média por casa + Vizinhos (25 números)",
    mediaVizinhosNumbers
);

// Add Medal Systems to ensemble list
const medalSystems: IPredictiveSystem[] = [
    Object.assign(new GoldSystem(), { type: 'ensemble' as SystemType, domain: 'numbers' as SystemDomain }),
    Object.assign(new SilverSystem(), { type: 'ensemble' as SystemType, domain: 'numbers' as SystemDomain }),
    Object.assign(new BronzeSystem(), { type: 'ensemble' as SystemType, domain: 'numbers' as SystemDomain }),
    Object.assign(new PlatinumSystem(), { type: 'ensemble' as SystemType, domain: 'numbers' as SystemDomain }),
    Object.assign(fixedMediaSystem, { type: 'base' as SystemType, domain: 'numbers' as SystemDomain })
];

numberEnsembleSystems.push(...medalSystems.filter(s => s.type === 'ensemble'));
rankedSystems.push(...medalSystems);

// Generate Anti-Medal Systems automatically
const antiMedalSystems = medalSystems
    .filter(s => s.type === 'ensemble')
    .map(sys => Object.assign(new InverseSystem(sys), {
        type: 'ensemble' as SystemType,
        domain: 'numbers' as SystemDomain
    }));

numberEnsembleSystems.push(...antiMedalSystems);
rankedSystems.push(...antiMedalSystems);

/**
 * Get a system by name
 */
export function getSystemByName(name: string): IPredictiveSystem | undefined {
    return rankedSystems.find(s => s.name === name);
}
