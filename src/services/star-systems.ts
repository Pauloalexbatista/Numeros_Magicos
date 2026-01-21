
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

// 1. Hot Stars (Frequency)
export class HotStarsSystem implements StarSystem {
    name = 'Hot Stars';
    description = 'Estrelas mais frequentes nos últimos 50 sorteios';

    generatePrediction(history: Draw[]): number[] {
        const recentDraws = history.slice(0, 50);
        const frequency: Record<number, number> = {};

        recentDraws.forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6) // Top 6 (50% of 12)
            .map(([star]) => parseInt(star));
    }
}

// 2. Late Stars (Delay)
export class LateStarsSystem implements StarSystem {
    name = 'Late Stars';
    description = 'Estrelas que não saem há mais tempo';

    generatePrediction(history: Draw[]): number[] {
        const lastSeen: Record<number, number> = {};

        // Initialize all stars with "Infinity" (never seen)
        for (let i = 1; i <= 12; i++) lastSeen[i] = -1;

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
            .slice(0, 6)
            .map(([star]) => parseInt(star));
    }
}

// 3. Markov Stars (Transitions)
export class MarkovStarsSystem implements StarSystem {
    name = 'Markov Stars';
    description = 'Probabilidade de transição baseada no último sorteio';

    generatePrediction(history: Draw[]): number[] {
        if (history.length < 2) return [1, 2, 3, 4, 5, 6];

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
            .slice(0, 6)
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
            .slice(0, 6)
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

        // Initialize all stars with 0
        for (let i = 1; i <= 12; i++) frequency[i] = 0;

        recentDraws.forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => a - b) // Ascending (Least frequent first)
            .slice(0, 6)
            .map(([star]) => parseInt(star));
    }
}

// 6. Anti-Late Stars (Betting on Recent)
export class AntiLateStarsSystem implements StarSystem {
    name = 'Anti-Late Stars';
    description = 'Aposta nas estrelas que saíram MAIS recentemente';

    generatePrediction(history: Draw[]): number[] {
        const lastSeen: Record<number, number> = {};

        // Initialize all stars with "Infinity"
        for (let i = 1; i <= 12; i++) lastSeen[i] = Infinity;

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
            .slice(0, 6)
            .map(([star]) => parseInt(star));
    }
}

// 7. Golden Pair (Correlation)
export class GoldenPairSystem implements StarSystem {
    name = 'Golden Pair';
    description = 'Aposta nos PARES de estrelas que saem juntos mais frequentemente (Histórico)';

    generatePrediction(history: Draw[]): number[] {
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

        return Array.from(uniqueStars).slice(0, 6).sort((a, b) => a - b);
    }
}

// import { StarLSTMSystem } from './ml/star-lstm';
import { ClusteringStarsSystem, MonteCarloStarsSystem, VortexStarsSystem, AveragePlusOneStarsSystem, AntiStarSystem } from './new-star-systems';

// Create instances
const clusteringStars = new ClusteringStarsSystem();
const monteCarloStars = new MonteCarloStarsSystem();
const vortexStars = new VortexStarsSystem();
const avgPlusOneStars = new AveragePlusOneStarsSystem();

// Base star systems - generate from historical data
const baseStarSystemsArray: StarSystem[] = [
    new HotStarsSystem(),
    new LateStarsSystem(),
    new MarkovStarsSystem(),
    new AntiHotStarsSystem(),
    new AntiLateStarsSystem(),
    new GoldenPairSystem(),
    // new StarLSTMSystem(),
    clusteringStars,
    monteCarloStars,
    vortexStars,
    avgPlusOneStars,
    new AntiStarSystem(clusteringStars),
    new AntiStarSystem(monteCarloStars),
    new AntiStarSystem(vortexStars),
    new AntiStarSystem(avgPlusOneStars),
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
        return calculateConsensus([p1, p2, p3]).slice(0, 6).sort((a, b) => a - b);
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
        return calculateWeightedVote(
            [hot, markov, vortex, antiHot],
            [3, 2, 2, 1]
        ).slice(0, 6).sort((a, b) => a - b);
    }
}

// ... existing code ...

// Ensemble star systems - combine predictions from other star systems
const ensembleStarSystemsArray: StarSystem[] = [
    new StarPlatinumSystem(),       // Combines Hot + Late + Markov
    new ConsensusStarsSystem(),     // Combines Hot + Markov + Vortex
    new QuartetoStarsEliteSystem(), // Combines Hot + Markov + Vortex + Anti-Hot
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
