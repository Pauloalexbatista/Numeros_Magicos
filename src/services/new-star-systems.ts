
import { Draw } from '@prisma/client';
import { SeededRNG } from '../utils/seeded-rng';
import { getPredictionCount, getMaxStar } from './star-systems';

/**
 * Clustering Stars System
 * Divides stars into 3 clusters and analyzes activity
 */
export class ClusteringStarsSystem {
    name = 'Clustering Stars';
    description = 'Agrupamento de estrelas em 3 clusters (1-4, 5-8, 9-12)';

    generatePrediction(history: Draw[]): number[] {
        // Define 3 clusters
        const clusters: Record<number, number[]> = {
            1: [], // Stars 1-4
            2: [], // Stars 5-8
            3: []  // Stars 9-12
        };

        // Analyze cluster activity
        history.forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => {
                const cluster = Math.ceil(star / 4);
                if (clusters[cluster]) {
                    clusters[cluster].push(star);
                }
            });
        });

        // Find most active clusters
        const clusterActivity = Object.entries(clusters).map(([id, stars]) => ({
            id: parseInt(id),
            count: stars.length,
            stars: stars
        }));

        clusterActivity.sort((a, b) => b.count - a.count);

        // Get frequency within top 2 clusters (to ensure we have enough stars)
        const frequency: Record<number, number> = {};
        const topClusters = clusterActivity.slice(0, 2);

        topClusters.forEach(cluster => {
            cluster.stars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        const candidates = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([star]) => parseInt(star));

        // Return top N, fill with hot stars if needed
        return this.ensure6Stars(candidates, history);
    }

    private ensure6Stars(stars: number[], history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        let result = [...new Set(stars)]; // Deduplicate

        if (result.length >= predCount) {
            return result.slice(0, predCount);
        }

        // Fill with hot stars
        const frequency: Record<number, number> = {};
        history.forEach(draw => {
            const drawStars = JSON.parse(draw.stars) as number[];
            drawStars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        const sortedByFreq = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([star]) => parseInt(star));

        for (const star of sortedByFreq) {
            if (result.length >= predCount) break;
            if (!result.includes(star)) {
                result.push(star);
            }
        }

        // Fallback to 1..maxStar
        if (result.length < predCount) {
            for (let i = 1; i <= maxStar; i++) {
                if (result.length >= predCount) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result.slice(0, predCount);
    }
}

/**
 * Monte Carlo Stars System
 * Probabilistic simulations based on historical frequencies
 */
export class MonteCarloStarsSystem {
    name = 'Monte Carlo Stars';
    description = 'Simulações probabilísticas para prever estrelas';

    generatePrediction(history: Draw[]): number[] {
        const frequency: Record<number, number> = {};

        // Calculate probabilities
        history.forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        const totalDraws = history.length;
        const probabilities: Record<number, number> = {};
        const maxStar = getMaxStar(history);

        // Initialize all stars
        for (let i = 1; i <= maxStar; i++) {
            probabilities[i] = (frequency[i] || 0) / totalDraws;
        }

        // Initialize Seeded RNG
        const lastDraw = history[0];
        const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'default-seed';
        const rng = new SeededRNG(seedStr);

        // Run simulations
        const simulations = 1000;
        const simulationResults: Record<number, number> = {};

        for (let i = 0; i < simulations; i++) {
            const simDraw: number[] = [];
            const available = Array.from({ length: maxStar }, (_, i) => i + 1);

            while (simDraw.length < getPredictionCount(history)) { // Changed from 2 to getPredictionCount(history)
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

            simDraw.forEach(star => {
                simulationResults[star] = (simulationResults[star] || 0) + 1;
            });
        }

        const predCount = getPredictionCount(history);
        const candidates = Object.entries(simulationResults)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));

        return candidates.length >= predCount ? candidates : this.ensure6Stars(candidates, history);
    }

    private ensure6Stars(stars: number[], history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        let result = [...new Set(stars)];

        if (result.length >= predCount) {
            return result.slice(0, predCount);
        }

        const frequency: Record<number, number> = {};
        history.forEach(draw => {
            const drawStars = JSON.parse(draw.stars) as number[];
            drawStars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        const sortedByFreq = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([star]) => parseInt(star));

        for (const star of sortedByFreq) {
            if (result.length >= predCount) break;
            if (!result.includes(star)) result.push(star);
        }

        if (result.length < predCount) {
            for (let i = 1; i <= maxStar; i++) {
                if (result.length >= predCount) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result.slice(0, predCount);
    }
}

/**
 * Vortex Stars System
 * Adapted from Vortex Pyramid for 12 stars
 * Traces diagonal resonance patterns with wrap-around
 */
export class VortexStarsSystem {
    name = 'Vortex Stars';
    description = 'Sistema Vortex adaptado para estrelas (Ressonância Toroidal)';

    analyzeResonance(history: Draw[]): { star: number, score: number }[] {
        if (history.length === 0) return [];

        const candidates: { star: number, score: number }[] = [];
        const maxStar = getMaxStar(history);

        for (let candidate = 1; candidate <= maxStar; candidate++) {
            let score = 0;

            // Trace Left Diagonal Backwards (Candidate -> Past)
            let currentStar = candidate;
            for (let i = history.length - 1; i >= 0; i--) {
                const draw = history[i];
                const drawnStars = JSON.parse(draw.stars) as number[];

                // Move Left (Wrap-around)
                currentStar = currentStar - 1;
                if (currentStar < 1) currentStar = maxStar;

                if (drawnStars.includes(currentStar)) {
                    score++;
                }
            }

            // Trace Right Diagonal Backwards (Candidate -> Past)
            currentStar = candidate;
            for (let i = history.length - 1; i >= 0; i--) {
                const draw = history[i];
                const drawnStars = JSON.parse(draw.stars) as number[];

                // Move Right (Wrap-around)
                currentStar = currentStar + 1;
                if (currentStar > maxStar) currentStar = 1;

                if (drawnStars.includes(currentStar)) {
                    score++;
                }
            }

            candidates.push({ star: candidate, score });
        }

        // Sort by score descending
        candidates.sort((a, b) => b.score - a.score);
        return candidates;
    }

    generatePrediction(history: Draw[]): number[] {
        const candidates = this.analyzeResonance(history);
        const predCount = getPredictionCount(history);

        // Return Top N
        const result = candidates.slice(0, predCount).map(c => c.star);

        // Ensure exactly N stars
        return result.length === predCount ? result : this.ensure6Stars(result, history);
    }

    private ensure6Stars(stars: number[], history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        let result = [...new Set(stars)];

        if (result.length >= predCount) {
            return result.slice(0, predCount);
        }

        const frequency: Record<number, number> = {};
        history.forEach(draw => {
            const drawStars = JSON.parse(draw.stars) as number[];
            drawStars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        const sortedByFreq = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([star]) => parseInt(star));

        for (const star of sortedByFreq) {
            if (result.length >= predCount) break;
            if (!result.includes(star)) result.push(star);
        }

        if (result.length < predCount) {
            for (let i = 1; i <= maxStar; i++) {
                if (result.length >= predCount) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result.slice(0, predCount);
    }
}

/**
 * Average Plus One Stars System
 * For each position (1st and 2nd star), calculates average from last 50 draws
 * Selects: average-1, average, average+1 (3 stars per position = 6 total)
 */
export class AveragePlusOneStarsSystem {
    name = 'Média +1 Stars';
    description = 'Média dos últimos 50 sorteios + vizinhos (±1) por casa';

    generatePrediction(history: Draw[]): number[] {
        // Use last 50 draws
        const recentDraws = history.slice(0, Math.min(50, history.length));
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);

        if (recentDraws.length < 10) {
            // Fallback to hot stars if insufficient history
            return this.fallbackToHotStars(history);
        }

        // Calculate average for each position (1st and 2nd star)
        const position1Stars: number[] = [];
        const position2Stars: number[] = [];

        recentDraws.forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            const sorted = stars.sort((a, b) => a - b);

            if (sorted.length >= 2) {
                position1Stars.push(sorted[0]); // 1st star (lower)
                position2Stars.push(sorted[1]); // 2nd star (higher)
            }
        });

        // Calculate averages
        const avg1 = Math.round(
            position1Stars.reduce((sum, s) => sum + s, 0) / position1Stars.length
        );
        const avg2 = Math.round(
            position2Stars.reduce((sum, s) => sum + s, 0) / position2Stars.length
        );

        // Select: avg-1, avg, avg+1 for each position
        const selected = new Set<number>();

        // Position 1: avg-1, avg, avg+1
        for (let offset = -1; offset <= 1; offset++) {
            const star = avg1 + offset;
            if (star >= 1 && star <= maxStar) {
                selected.add(star);
            }
        }

        // Position 2: avg-1, avg, avg+1
        for (let offset = -1; offset <= 1; offset++) {
            const star = avg2 + offset;
            if (star >= 1 && star <= maxStar) {
                selected.add(star);
            }
        }

        const result = Array.from(selected).sort((a, b) => a - b);

        // Ensure exactly N stars
        return this.ensure6Stars(result, history);
    }

    private fallbackToHotStars(history: Draw[]): number[] {
        const frequency: Record<number, number> = {};

        history.forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            stars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, getPredictionCount(history))
            .map(([star]) => parseInt(star));
    }

    private ensure6Stars(stars: number[], history: Draw[]): number[] {
        const predCount = getPredictionCount(history);
        const maxStar = getMaxStar(history);
        let result = [...new Set(stars)];

        if (result.length >= predCount) {
            return result.slice(0, predCount);
        }

        // Fill with hot stars
        const frequency: Record<number, number> = {};
        history.forEach(draw => {
            const drawStars = JSON.parse(draw.stars) as number[];
            drawStars.forEach(star => {
                frequency[star] = (frequency[star] || 0) + 1;
            });
        });

        const sortedByFreq = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([star]) => parseInt(star));

        for (const star of sortedByFreq) {
            if (result.length >= predCount) break;
            if (!result.includes(star)) {
                result.push(star);
            }
        }

        if (result.length < predCount) {
            for (let i = 1; i <= maxStar; i++) {
                if (result.length >= predCount) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result.slice(0, predCount);
    }
}

/**
 * Anti-System Wrapper
 * Returns the N stars NOT chosen by the original system
 */
export class AntiStarSystem {
    name: string;
    description: string;
    private originalSystem: ClusteringStarsSystem | MonteCarloStarsSystem | VortexStarsSystem | AveragePlusOneStarsSystem;

    constructor(originalSystem: ClusteringStarsSystem | MonteCarloStarsSystem | VortexStarsSystem | AveragePlusOneStarsSystem) {
        this.name = `Anti-${originalSystem.name}`;
        this.description = `Estratégia Inversa: Aposta contra ${originalSystem.name}`;
        this.originalSystem = originalSystem;
    }

    generatePrediction(history: Draw[]): number[] {
        // Get original prediction
        const predicted = this.originalSystem.generatePrediction(history);

        // Return ALL stars NOT in the prediction
        // This guarantees:
        // 1. No overlap between system and anti-system
        // 2. 100% coverage (system + anti cover all possibilities)
        // 3. Accuracy sums to ~100%
        //
        // Examples:
        // - EUROMILLIONS: System predicts 6, Anti predicts 6 → Coverage 12/12 ✅
        // - TOTOLOTO: System predicts 6, Anti predicts 7 → Coverage 13/13 ✅
        // - EURODREAMS: System predicts 3, Anti predicts 2 → Coverage 5/5 ✅
        const maxStar = getMaxStar(history);
        const allStars = Array.from({ length: maxStar }, (_, i) => i + 1);
        const inverseStars = allStars.filter(s => !predicted.includes(s));

        return inverseStars; // Return ALL (not slice!)
    }
}
