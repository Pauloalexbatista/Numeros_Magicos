import { Draw } from '@prisma/client';
import { SystemType, SystemDomain } from './ranked-systems';
import { MonteCarloStarsSystem } from './new-star-systems';

export interface StarSystem {
    name: string;
    description: string;
    type?: 'base' | 'neural' | 'ensemble';
    domain?: 'stars' | 'numbers';
    dependencies?: string[];
    generatePrediction(history: Draw[]): Promise<number[]> | number[];
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
 * Helper to determine how many stars to predict based on game type
 */
export function getPredictionCount(draws: Draw[]): number {
    if (draws.length > 0) {
        const game = draws[0].game.toUpperCase();
        if (game === 'EURODREAMS') return 3;
        if (game === 'TOTOLOTO') return 5;
        if (game === 'EUROMILLIONS') return 6;
    }
    return 6; // Fallback
}

// 1. Hot Stars
export class HotStarsSystem implements StarSystem {
    name = 'Hot Stars';
    description = 'Estrelas mais frequentes nos sorteios recentes';

    generatePrediction(history: Draw[]): number[] {
        const recentDraws = history.slice(0, 20);
        const frequency: Record<number, number> = {};
        const predCount = getPredictionCount(history);

        recentDraws.forEach(draw => {
            const stars = (typeof draw.stars === "string" ? (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars) : draw.stars as unknown) as number[];
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

// 2. Late Stars
export class LateStarsSystem implements StarSystem {
    name = 'Late Stars';
    description = 'Estrelas que não saem há mais tempo';

    generatePrediction(history: Draw[]): number[] {
        const lastSeen: Record<number, number> = {};
        const maxStar = getMaxStar(history);
        const predCount = getPredictionCount(history);

        for (let i = 1; i <= maxStar; i++) lastSeen[i] = -1;

        for (let i = 0; i < history.length; i++) {
            const stars = (typeof history[i].stars === "string" ? (typeof history[i].stars === "string" ? JSON.parse(history[i].stars) : history[i].stars) : history[i].stars as unknown) as number[];
            stars.forEach(star => {
                if (lastSeen[star] === -1) lastSeen[star] = i;
            });
            if (Object.values(lastSeen).every(v => v !== -1)) break;
        }

        return Object.entries(lastSeen)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}

// 3. Markov Stars
export class MarkovStarsSystem implements StarSystem {
    name = 'Markov Stars';
    description = 'Probabilidade de transição baseada no último sorteio';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        if (history.length < 2) {
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        const transitions: Record<string, Record<number, number>> = {};

        for (let i = 0; i < history.length - 1; i++) {
            const currentStars = JSON.parse(history[i + 1].stars).sort((a: number, b: number) => a - b).join(',');
            const nextStars = (typeof history[i].stars === "string" ? (typeof history[i].stars === "string" ? JSON.parse(history[i].stars) : history[i].stars) : history[i].stars as unknown) as number[];
            if (!transitions[currentStars]) transitions[currentStars] = {};
            nextStars.forEach(star => {
                transitions[currentStars][star] = (transitions[currentStars][star] || 0) + 1;
            });
        }

        const lastDrawStars = JSON.parse(history[0].stars).sort((a: number, b: number) => a - b).join(',');
        const probs = transitions[lastDrawStars] || {};

        return Object.entries(probs)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}

// 4. Clustering Stars
export class ClusteringStarsSystem implements StarSystem {
    name = 'Clustering Stars';
    description = 'Agrupamento de estrelas em clusters';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const recentDraws = history.slice(0, 20);
        const clusters: Record<number, number[]> = {};

        const numClusters = Math.ceil(maxStar / 3);
        for (let i = 1; i <= numClusters; i++) clusters[i] = [];

        recentDraws.forEach(draw => {
            const stars = (typeof draw.stars === "string" ? (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars) : draw.stars as unknown) as number[];
            stars.forEach(star => {
                const cluster = Math.ceil(star / 3);
                if (clusters[cluster]) clusters[cluster].push(star);
            });
        });

        const clusterActivity = Object.entries(clusters).map(([id, nums]) => ({
            id: parseInt(id),
            count: nums.length,
            numbers: nums
        }));

        clusterActivity.sort((a, b) => b.count - a.count);
        const frequency: Record<number, number> = {};
        const topClusters = clusterActivity.slice(0, 2);

        topClusters.forEach(cluster => {
            cluster.numbers.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        let result = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([star]) => parseInt(star));

        result = [...new Set(result)];

        if (result.length < predCount) {
            for (let i = 1; i <= maxStar; i++) {
                if (result.length >= predCount) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result.slice(0, predCount);
    }
}

// 5. PyramidPascal Stars
export class PyramidPascalStarsSystem implements StarSystem {
    name = 'PyramidPascal Stars';
    description = 'Análise baseada no Triângulo de Pascal';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const frequency: Record<number, number> = {};

        for (let i = 1; i <= maxStar; i++) frequency[i] = 0;

        history.slice(0, 30).forEach((draw, idx) => {
            const weight = 30 - idx;
            const stars = (typeof draw.stars === "string" ? (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars) : draw.stars as unknown) as number[];
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
    description = 'Análise de intervalos entre aparições';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const gaps: Record<number, number[]> = {};

        for (let i = 1; i <= maxStar; i++) gaps[i] = [];

        for (let star = 1; star <= maxStar; star++) {
            let lastSeen = -1;
            for (let i = 0; i < history.length; i++) {
                const stars = (typeof history[i].stars === "string" ? (typeof history[i].stars === "string" ? JSON.parse(history[i].stars) : history[i].stars) : history[i].stars as unknown) as number[];
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

// 7. Recent Stars
export class RecentStarsSystem implements StarSystem {
    name = 'Recent Stars';
    description = 'Estrelas mais recentes a sair';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const uniqueStars = new Set<number>();

        for (const draw of history) {
            if (uniqueStars.size >= predCount) break;
            const stars = (typeof draw.stars === "string" ? (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars) : draw.stars as unknown) as number[];
            for (const star of stars) {
                if (uniqueStars.size < predCount) uniqueStars.add(star);
            }
        }

        return Array.from(uniqueStars).sort((a, b) => a - b);
    }
}

// 8. Sist Media +3 Otimizado Stars
export class SistMedia3OtimizadoStarsSystem implements StarSystem {
    name = 'Sist Média +3 Otimizado Stars';
    description = 'Média otimizada com peso +3';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const recentDraws = history.slice(0, 10);

        if (recentDraws.length === 0) return [];
        const starsLength = JSON.parse(recentDraws[0].stars).length;
        const candidates = new Set<number>();

        for (let pos = 0; pos < starsLength; pos++) {
            const valuesAtPos = recentDraws.map(d => {
                const s = (typeof d.stars === "string" ? (typeof d.stars === "string" ? JSON.parse(d.stars) : d.stars) : d.stars);
                return s[pos];
            }).filter(n => !isNaN(n));

            if (valuesAtPos.length < 3) continue;
            valuesAtPos.sort((a: number, b: number) => a - b);
            const trimmed = valuesAtPos.slice(1, -1);
            if (trimmed.length === 0) continue;

            const sum = trimmed.reduce((a: number, b: number) => a + b, 0);
            const mean = Math.round(sum / trimmed.length);

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
            .slice(0, predCount)
            .sort((a, b) => a - b);
    }
}

// 9. Universal Oscillation V2 Stars
export class UniversalOscillationV2StarsSystem implements StarSystem {
    name = 'Universal Oscillation V2 Stars';
    description = 'Análise de oscilações universais';

    generatePrediction(history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        const oscillation: Record<number, number> = {};

        for (let i = 1; i <= maxStar; i++) oscillation[i] = 0;

        history.slice(0, 25).forEach((draw, idx) => {
            const stars = (typeof draw.stars === "string" ? (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars) : draw.stars as unknown) as number[];
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

// Registry of all active ranked star systems
const baseStarSystemsArray: StarSystem[] = [
    new HotStarsSystem(),
    new RecentStarsSystem(),
    new LateStarsSystem(),
    new MarkovStarsSystem(),
    new ClusteringStarsSystem(),
    new PyramidPascalStarsSystem(),
    new PyramidGapsStarsSystem(),
    new SistMedia3OtimizadoStarsSystem(),
    new UniversalOscillationV2StarsSystem(),
    new MonteCarloStarsSystem(),
];

export const starBaseSystems: StarSystem[] = baseStarSystemsArray.map(sys => {
    if (!sys.type) sys.type = 'base';
    sys.domain = 'stars';
    return sys;
});

export const starEnsembleSystems: StarSystem[] = [];

export const starSystems: StarSystem[] = [
    ...starBaseSystems
];
