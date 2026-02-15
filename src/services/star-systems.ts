
import { Draw } from '@prisma/client';
import { SystemType, SystemDomain } from './ranked-systems';

export interface StarSystem {
    name: string;
    description: string;
    type?: SystemType;           // 'base' or 'ensemble' (optional for backward compatibility)
    domain?: SystemDomain;       // Always 'stars' for star systems
    dependencies?: string[];     // System names this ensemble depends on (only for ensemble)
    generatePrediction(history: Draw[]): Promise<number[]> | number[]; // Allow both for now, or enforce Promise
}


/**
 * Helper to determine max star based on game type
 */
export function getMaxStar(draws: Draw[]): number {
    if (draws.length > 0) {
        if (draws[0].game === 'TOTOLOTO') return 13;
        if (draws[0].game === 'EURODREAMS') return 5;
    }
    return 12; // Default to EuroMillions
}

/**
 * Helper to determine how many predictions to generate based on game type
 * CRITICAL: EURODREAMS and TOTOLOTO only have 1 special number per draw!
 * Predicting 6 numbers when only 1 comes out guarantees ~100% hit rate (BUG!)
 */
/**
 * Helper to determine how many stars to predict based on game type
 * - EUROMILLIONS: 6 stars (50% of 12)
 * - TOTOLOTO: 6 stars (46% of 13)
 * - EURODREAMS: 3 stars (60% of 5)
 */
export function getPredictionCount(draws: Draw[]): number {
    if (draws.length > 0) {
        if (draws[0].game === 'EURODREAMS') return 3;
    }
    // EUROMILLIONS and TOTOLOTO: 6 stars
    return 6;
}

// 1. Hot Stars (Frequency in last 20 draws)
export class HotStarsSystem implements StarSystem {
    name = 'Hot Stars';
    description = 'Estrelas mais frequentes nos últimos 20 sorteios';

    generatePrediction(history: Draw[]): number[] {
        const recentDraws = history.slice(0, 20); // Standardized to 20 draws
        const frequency: Record<number, number> = {};
        const predCount = getPredictionCount(history);

        recentDraws.forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}

// 2. Late Stars (Delay)
export class LateStarsSystem implements StarSystem {
    name = 'Late Stars';
    description = 'Estrelas que não saem há mais tempo';

    generatePrediction(history: Draw[]): number[] {
        const lastSeen: Record<number, number> = {};
        const maxStar = getMaxStar(history);
        const predCount = getPredictionCount(history);

        // Initialize all stars with "Infinity" (never seen)
        for (let i = 1; i <= maxStar; i++) lastSeen[i] = -1;

        // Scan history to find last appearance
        for (let i = 0; i < history.length; i++) {
            const stars = JSON.parse(history[i].stars) as number[];
            stars.forEach(star => {
                if (lastSeen[star] === -1) {
                    lastSeen[star] = i; // 'i' is the "delay" (0 = last draw)
                }
            });

            // If we found all, stop
            if (Object.values(lastSeen).every(v => v !== -1)) break;
        }

        return Object.entries(lastSeen)
            .sort(([, a], [, b]) => b - a) // Sort by delay (descending)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}

// 3. Markov Stars (Transitions)
export class MarkovStarsSystem implements StarSystem {
    name = 'Markov Stars';
    description = 'Probabilidade de transição baseada no último sorteio';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        if (history.length < 2) {
            // Fallback: return first N numbers
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        const transitions: Record<string, Record<number, number>> = {};

        // Build Matrix
        for (let i = 0; i < history.length - 1; i++) {
            const currentStars = JSON.parse(history[i + 1].stars).sort((a: number, b: number) => a - b).join(',');
            const nextStars = JSON.parse(history[i].stars) as number[];

            if (!transitions[currentStars]) transitions[currentStars] = {};

            nextStars.forEach(star => {
                transitions[currentStars][star] = (transitions[currentStars][star] || 0) + 1;
            });
        }

        // Predict based on LAST draw
        const lastDrawStars = JSON.parse(history[0].stars).sort((a: number, b: number) => a - b).join(',');
        const probs = transitions[lastDrawStars] || {};

        return Object.entries(probs)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}


// 4. Star Platinum (Ensemble)
export class StarPlatinumSystem implements StarSystem {
    name = 'Star Platinum';
    description = 'Ensemble ponderado dos melhores sistemas de estrelas';

    private systems: StarSystem[] = [
        new HotStarsSystem(),
        new LateStarsSystem(),
        new MarkovStarsSystem()
    ];

    async generatePrediction(history: Draw[]): Promise<number[]> {
        const votes: Record<number, number> = {};

        for (const sys of this.systems) {
            // Await each system's prediction
            const preds = await sys.generatePrediction(history);
            preds.forEach((star, idx) => {
                // Weighted vote: 1st place gets more points
                const weight = 6 - idx;
                votes[star] = (votes[star] || 0) + weight;
            });
        }

        return Object.entries(votes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, getPredictionCount(history))
            .map(([star]) => parseInt(star));
    }
}

// 5. Anti-Hot Stars (Betting on Cold)
export class AntiHotStarsSystem implements StarSystem {
    name = 'Anti-Hot Stars';
    description = 'Aposta nas estrelas MENOS frequentes (Frias)';

    generatePrediction(history: Draw[]): number[] {
        const recentDraws = history.slice(0, 50);
        const frequency: Record<number, number> = {};
        const maxStar = getMaxStar(history);

        // Initialize all stars with 0
        for (let i = 1; i <= maxStar; i++) frequency[i] = 0;

        recentDraws.forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => a - b) // Ascending (Least frequent first)
            .slice(0, getPredictionCount(history))
            .map(([star]) => parseInt(star));
    }
}

// 6. Anti-Late Stars (Betting on Recent)
export class AntiLateStarsSystem implements StarSystem {
    name = 'Anti-Late Stars';
    description = 'Aposta nas estrelas que saíram MAIS recentemente';

    generatePrediction(history: Draw[]): number[] {
        const lastSeen: Record<number, number> = {};
        const maxStar = getMaxStar(history);

        // Initialize all stars with "Infinity"
        for (let i = 1; i <= maxStar; i++) lastSeen[i] = Infinity;

        // Scan history
        for (let i = 0; i < history.length; i++) {
            const stars = JSON.parse(history[i].stars) as number[];
            stars.forEach(star => {
                // If we haven't seen it yet, record the delay
                if (lastSeen[star] === Infinity) {
                    lastSeen[star] = i;
                }
            });

            if (Object.values(lastSeen).every(v => v !== Infinity)) break;
        }

        return Object.entries(lastSeen)
            .sort(([, a], [, b]) => a - b) // Ascending (Smallest delay first)
            .slice(0, getPredictionCount(history))
            .map(([star]) => parseInt(star));
    }
}

// 7. Golden Pair (Correlation)
export class GoldenPairSystem implements StarSystem {
    name = 'Golden Pair';
    description = 'Aposta nos PARES de estrelas que saem juntos mais frequentemente (Histórico)';

    generatePrediction(history: Draw[]): number[] {
        // Golden Pair only makes sense for draws with >= 2 stars (EuroMillions)
        if (history.length > 0) {
            const stars = JSON.parse(history[0].stars) as number[];
            if (stars.length < 2) {
                // Fallback for single-star games (Totoloto)
                // Just return hot stars logic or empty
                return [];
            }
        }

        const pairCounts: Record<string, number> = {};

        // Analyze full history provided
        history.forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            if (stars.length === 2) {
                const sorted = stars.sort((a, b) => a - b);
                const key = `${sorted[0]}-${sorted[1]}`;
                pairCounts[key] = (pairCounts[key] || 0) + 1;
            }
        });

        // Sort pairs by frequency
        const sortedPairs = Object.entries(pairCounts)
            .sort(([, a], [, b]) => b - a);

        // Get Top Pairs until we have 6 unique stars
        const uniqueStars = new Set<number>();

        for (const [pairStr] of sortedPairs) {
            const [s1, s2] = pairStr.split('-').map(Number);
            uniqueStars.add(s1);
            uniqueStars.add(s2);
            if (uniqueStars.size >= 6) break;
        }

        return Array.from(uniqueStars).slice(0, getPredictionCount(history)).sort((a, b) => a - b);
    }
}

// import { StarLSTMSystem } from './ml/star-lstm';
import { MonteCarloStarsSystem, VortexStarsSystem, AveragePlusOneStarsSystem, AntiStarSystem } from './new-star-systems';

// Create instances
// const clusteringStars = new ClusteringStarsSystem();
const monteCarloStars = new MonteCarloStarsSystem();
const vortexStars = new VortexStarsSystem();
const avgPlusOneStars = new AveragePlusOneStarsSystem();

// ============================================================================
// ANTI-STAR SYSTEMS DESATIVADOS (14/02/2026)
// ============================================================================
// Razão: Solicitação do utilizador para desativar todos os sistemas "Anti"
// ============================================================================

// 13. Clustering Stars
export class ClusteringStarsSystem implements StarSystem {
    name = 'Clustering Stars';
    description = 'Agrupamento de estrelas em clusters de tamanho 3';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);

        // Standardized to last 20 draws
        const recentDraws = history.slice(0, 20);

        // Cluster size 3: 1-3, 4-6, 7-9, 10-12, 13
        const clusters: Record<number, number[]> = {};

        // Initialize clusters
        const numClusters = Math.ceil(maxStar / 3);
        for (let i = 1; i <= numClusters; i++) clusters[i] = [];

        recentDraws.forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => {
                const cluster = Math.ceil(star / 3);
                if (clusters[cluster]) clusters[cluster].push(star);
            });
        });

        // Find most active cluster
        const clusterActivity = Object.entries(clusters).map(([id, nums]) => ({
            id: parseInt(id),
            count: nums.length,
            numbers: nums
        }));

        clusterActivity.sort((a, b) => b.count - a.count);

        // Get frequency from top active cluster(s)
        const frequency: Record<number, number> = {};

        // Use top 2 clusters to ensure enough candidates
        const topClusters = clusterActivity.slice(0, 2);

        topClusters.forEach(cluster => {
            cluster.numbers.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        let result = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([star]) => parseInt(star));

        // Remove duplicates and limit
        result = [...new Set(result)];

        // Fallback: If we don't have enough stars, fill with other available stars (1..maxStar)
        // (This happens if top clusters are small or history is sparse)
        if (result.length < predCount) {
            for (let i = 1; i <= maxStar; i++) {
                if (result.length >= predCount) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result.slice(0, predCount);
    }
}

// ============================================================================
// NEW STAR SYSTEMS (14/02/2026) - Mirroring Number Systems
// ============================================================================
// Created to match the 12 base number systems
// ============================================================================

// 5. PyramidPascal Stars
export class PyramidPascalStarsSystem implements StarSystem {
    name = 'PyramidPascal Stars';
    description = 'Análise baseada no Triângulo de Pascal aplicado a estrelas';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const frequency: Record<number, number> = {};

        for (let i = 1; i <= maxStar; i++) frequency[i] = 0;

        history.slice(0, 30).forEach((draw, idx) => {
            const weight = 30 - idx;
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + weight;
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}

// 6. PyramidGaps Stars
export class PyramidGapsStarsSystem implements StarSystem {
    name = 'PyramidGaps Stars';
    description = 'Análise de gaps (intervalos) entre aparições de estrelas';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const gaps: Record<number, number[]> = {};

        for (let i = 1; i <= maxStar; i++) gaps[i] = [];

        for (let star = 1; star <= maxStar; star++) {
            let lastSeen = -1;
            for (let i = 0; i < history.length; i++) {
                const stars = JSON.parse(history[i].stars) as number[];
                if (stars.includes(star)) {
                    if (lastSeen !== -1) gaps[star].push(i - lastSeen);
                    lastSeen = i;
                }
            }
        }

        const avgGaps: Record<number, number> = {};
        for (let star = 1; star <= maxStar; star++) {
            avgGaps[star] = gaps[star].length > 0
                ? gaps[star].reduce((a, b) => a + b, 0) / gaps[star].length
                : 999;
        }

        return Object.entries(avgGaps)
            .sort(([, a], [, b]) => a - b)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}

// 7. Random Stars
export class RandomStarsSystem implements StarSystem {
    name = 'Random Stars';
    description = 'Baseline aleatório para comparação';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const stars: number[] = [];

        while (stars.length < predCount) {
            const randomStar = Math.floor(Math.random() * maxStar) + 1;
            if (!stars.includes(randomStar)) stars.push(randomStar);
        }

        return stars.sort((a, b) => a - b);
    }
}

// 8. Sistema Combinado Media3 Stars (Updated to 5 draws)
export class SistCombinadoMedia3StarsSystem implements StarSystem {
    name = 'Sistema Combinado Media3 Stars'; // Keeping ID name for DB consistency
    description = 'Combinação de médias dos últimos 5 sorteios';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const frequency: Record<number, number> = {};

        for (let i = 1; i <= maxStar; i++) frequency[i] = 0;

        // Updated to 5 draws
        history.slice(0, 5).forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}

// 9. Sist Média sem as pontas Stars
export class MdiaSemasPontasStarsSystem implements StarSystem {
    name = 'Sist Média sem as pontas Stars';
    description = 'Média excluindo extremos';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const frequency: Record<number, number> = {};

        for (let i = 1; i <= maxStar; i++) frequency[i] = 0;

        const minStar = 2;
        const maxExclude = maxStar - 1;

        history.slice(0, 20).forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => {
                if (star >= minStar && star <= maxExclude) {
                    frequency[star] = (frequency[star] || 0) + 1;
                }
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}

// 10. Sist Média +3 Otimizado Stars
export class SistMedia3OtimizadoStarsSystem implements StarSystem {
    name = 'Sist Média +3 Otimizado Stars';
    description = 'Média otimizada com peso +3';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const frequency: Record<number, number> = {};

        // 1. Process positions (Stars usually have 2 positions)
        // Note: Stars logic in DB is often flattened, but let's try to simulate position logic
        // If history has standard format, stars array is sorted.
        const recentDraws = history.slice(0, 10);

        // Count typical stars count (e.g. 2 for EuroMillions)
        if (recentDraws.length === 0) return [];
        const starsLength = JSON.parse(recentDraws[0].stars).length;

        const candidates = new Set<number>();

        for (let pos = 0; pos < starsLength; pos++) {
            const valuesAtPos = recentDraws.map(d => {
                const s = JSON.parse(d.stars);
                return s[pos];
            }).filter(n => !isNaN(n));

            if (valuesAtPos.length < 3) continue;

            // Sort & Trim
            valuesAtPos.sort((a: number, b: number) => a - b);
            const trimmed = valuesAtPos.slice(1, -1);
            if (trimmed.length === 0) continue;

            const sum = trimmed.reduce((a: number, b: number) => a + b, 0);
            const mean = Math.round(sum / trimmed.length);

            // Add Mean +/- 1, 2, 3 to ensure enough candidates for Totoloto (needs 6)
            candidates.add(mean);
            candidates.add(mean - 1);
            candidates.add(mean + 1);
            candidates.add(mean - 2);
            candidates.add(mean + 2);
            candidates.add(mean - 3);
            candidates.add(mean + 3);
        }

        return Array.from(candidates)
            .filter(n => n >= 1 && n <= maxStar)
            .slice(0, predCount) // Ensure we respect limit
            .sort((a, b) => a - b);
    }
}

// 11. Sistema Camadas Stars
export class SistemaCamadasStarsSystem implements StarSystem {
    name = 'Sistema Camadas Stars';
    description = 'Análise por camadas de frequência';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const layers: Record<number, number> = {};

        for (let i = 1; i <= maxStar; i++) layers[i] = 0;

        history.slice(0, 5).forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => layers[star] = (layers[star] || 0) + 3);
        });

        history.slice(5, 15).forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => layers[star] = (layers[star] || 0) + 2);
        });

        history.slice(15, 30).forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => layers[star] = (layers[star] || 0) + 1);
        });

        return Object.entries(layers)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}

// 12. Universal Oscillation V2 Stars
export class UniversalOscillationV2StarsSystem implements StarSystem {
    name = 'Universal Oscillation V2 Stars';
    description = 'Análise de oscilações universais';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const oscillation: Record<number, number> = {};

        for (let i = 1; i <= maxStar; i++) oscillation[i] = 0;

        history.slice(0, 25).forEach((draw, idx) => {
            const stars = JSON.parse(draw.stars) as number[];
            const phase = Math.sin((idx * Math.PI) / 12);
            stars.forEach(star => {
                oscillation[star] = (oscillation[star] || 0) + (1 + phase);
            });
        });

        return Object.entries(oscillation)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}

// 12. Recent Stars (New)
export class RecentStarsSystem implements StarSystem {
    name = 'Recent Stars';
    description = 'Estrelas mais recentes (únicas) a sair';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const uniqueStars = new Set<number>();

        for (const draw of history) {
            if (uniqueStars.size >= predCount) break;
            const stars = JSON.parse(draw.stars) as number[];
            for (const star of stars) {
                if (uniqueStars.size < predCount) uniqueStars.add(star);
            }
        }

        return Array.from(uniqueStars).sort((a, b) => a - b);
    }
}

// Base star systems - generate from historical data
// SIMPLIFIED (14/02/2026): Only 12 base systems, mirroring number systems
const baseStarSystemsArray: StarSystem[] = [
    // Original 4 systems
    new HotStarsSystem(),
    new RecentStarsSystem(),
    new LateStarsSystem(),
    new MarkovStarsSystem(),
    new ClusteringStarsSystem(),
    // New 8 mirrored systems
    new PyramidPascalStarsSystem(),
    new PyramidGapsStarsSystem(),
    // new RandomStarsSystem(),
    // new SistCombinadoMedia3StarsSystem(), // DISABLED
    // new MdiaSemasPontasStarsSystem(), // DISABLED
    new SistMedia3OtimizadoStarsSystem(),
    // new SistemaCamadasStarsSystem(), // DISABLED
    new UniversalOscillationV2StarsSystem(),
];

import { getPrediction as getStarPrediction, calculateConsensus, calculateWeightedVote } from './ensemble-helpers';

// ... existing imports ...

// 8. Consensus Stars (Ensemble)
export class ConsensusStarsSystem implements StarSystem {
    name = 'Consensus Stars (Hot + Markov + Vortex)';
    description = 'Consenso automático entre 3 melhores sistemas de estrelas';
    type = 'ensemble' as SystemType;
    domain = 'stars' as SystemDomain;
    dependencies = ['Hot Stars', 'Markov Stars', 'Vortex Stars'];

    async generatePrediction(history: Draw[]): Promise<number[]> {
        const p1 = await getStarPrediction('Hot Stars');
        const p2 = await getStarPrediction('Markov Stars');
        const p3 = await getStarPrediction('Vortex Stars');

        // Return 6 stars based on consensus (frequency)
        const predCount = getPredictionCount(history);
        return calculateConsensus([p1, p2, p3]).slice(0, predCount).sort((a, b) => a - b);
    }
}

// 9. Quarteto Stars Elite (Ensemble)
export class QuartetoStarsEliteSystem implements StarSystem {
    name = 'Quarteto Stars Elite';
    description = 'Ensemble de elite com votação ponderada (Hot, Markov, Vortex, Anti-Hot)';
    type = 'ensemble' as SystemType;
    domain = 'stars' as SystemDomain;
    dependencies = ['Hot Stars', 'Markov Stars', 'Vortex Stars', 'Anti-Hot Stars'];

    async generatePrediction(history: Draw[]): Promise<number[]> {
        const hot = await getStarPrediction('Hot Stars');
        const markov = await getStarPrediction('Markov Stars');
        const vortex = await getStarPrediction('Vortex Stars');
        const antiHot = await getStarPrediction('Anti-Hot Stars');

        // Weighted Vote: Hot (3), Markov (2), Vortex (2), Anti-Hot (1)
        const predCount = getPredictionCount(history);
        return calculateWeightedVote(
            [hot, markov, vortex, antiHot],
            [3, 2, 2, 1]
        ).slice(0, predCount).sort((a, b) => a - b);
    }
}

// ... existing code ...

// ============================================================================
// STAR ENSEMBLE SYSTEMS DESATIVADOS (14/02/2026)
// ============================================================================
// Razão: Simplificação para manter apenas 12 sistemas base
// Star Platinum e Consensus Stars foram desativados
// ============================================================================

// 13. Clustering Stars




// Ensemble star systems - DISABLED
const ensembleStarSystemsArray: StarSystem[] = [
    // DISABLED: All ensemble systems
    /*
    new StarPlatinumSystem(),       // Combines Hot + Late + Markov
    new ConsensusStarsSystem(),     // Combines Hot + Markov + Vortex
    */
];

/**
 * Star Base Systems - Generate predictions from historical data
 * These systems are independent and execute first
 */
export const starBaseSystems: StarSystem[] = baseStarSystemsArray.map(sys => {
    sys.type = 'base' as SystemType;
    sys.domain = 'stars' as SystemDomain;
    return sys;
});

/**
 * Star Ensemble Systems - Combine predictions from other star systems
 * These systems depend on base systems and execute after them
 */
export const starEnsembleSystems: StarSystem[] = ensembleStarSystemsArray.map(sys => {
    sys.type = 'ensemble' as SystemType;
    sys.domain = 'stars' as SystemDomain;
    // Dependencies are already defined in the class, but we map them here for consistency/overrides if needed
    if (!sys.dependencies && sys.name === 'Star Platinum') {
        sys.dependencies = ['Hot Stars', 'Late Stars', 'Markov Stars'];
    }
    return sys;
});

// Combine all for backward compatibility
export const starSystems: StarSystem[] = [
    ...starBaseSystems,
    ...starEnsembleSystems
];
