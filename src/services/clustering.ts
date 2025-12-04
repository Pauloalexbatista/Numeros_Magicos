
import { Draw } from '@/models/types';

export interface DataPoint {
    id: number; // Draw ID or index
    features: number[]; // [Sum, EvenCount, HighCount]
    cluster?: number; // Assigned cluster ID
    label?: string; // Optional label (e.g., "Outlier")
}

export interface ClusterResult {
    points: DataPoint[];
    centroids: number[][];
    k: number;
    wcss: number; // Within-Cluster Sum of Squares
    iterations: number;
}

export interface ElbowResult {
    k: number;
    wcss: number;
}

/**
 * Calculates Euclidean distance between two points
 */
function distance(p1: number[], p2: number[]): number {
    return Math.sqrt(p1.reduce((sum, val, i) => sum + Math.pow(val - p2[i], 2), 0));
}

/**
 * Extract features from a draw: [Sum, EvenCount, HighCount]
 */
export function extractFeatures(draw: Draw, index: number): DataPoint {
    const sum = draw.numbers.reduce((a, b) => a + b, 0);
    const evenCount = draw.numbers.filter(n => n % 2 === 0).length;
    const highCount = draw.numbers.filter(n => n > 25).length;

    // Normalize features? 
    // Sum ranges ~60-200. EvenCount 0-5. HighCount 0-5.
    // Without normalization, Sum will dominate.
    // Let's return raw features first, normalization should happen before clustering.
    return {
        id: index,
        features: [sum, evenCount, highCount]
    };
}

/**
 * Min-Max Normalization
 */
function normalizePoints(points: DataPoint[]): DataPoint[] {
    if (points.length === 0) return points;

    const dimensions = points[0].features.length;
    const min = new Array(dimensions).fill(Infinity);
    const max = new Array(dimensions).fill(-Infinity);

    points.forEach(p => {
        p.features.forEach((val, i) => {
            if (val < min[i]) min[i] = val;
            if (val > max[i]) max[i] = val;
        });
    });

    return points.map(p => ({
        ...p,
        features: p.features.map((val, i) => (max[i] === min[i]) ? 0 : (val - min[i]) / (max[i] - min[i]))
    }));
}

/**
 * K-Means Algorithm
 */
export function kMeans(data: DataPoint[], k: number, maxIterations = 100): ClusterResult {
    // 1. Initialize Centroids (Randomly pick k points)
    // Better: K-Means++ initialization (simplified here: pick random distinct points)
    let centroids: number[][] = [];
    const usedIndices = new Set<number>();
    while (centroids.length < k && usedIndices.size < data.length) {
        const idx = Math.floor(Math.random() * data.length);
        if (!usedIndices.has(idx)) {
            usedIndices.add(idx);
            centroids.push([...data[idx].features]);
        }
    }

    let iterations = 0;
    let oldCentroids: number[][] = [];
    let points = data.map(p => ({ ...p })); // Clone

    while (iterations < maxIterations) {
        // 2. Assign points to nearest centroid
        points.forEach(p => {
            let minDist = Infinity;
            let clusterIdx = -1;
            centroids.forEach((c, i) => {
                const d = distance(p.features, c);
                if (d < minDist) {
                    minDist = d;
                    clusterIdx = i;
                }
            });
            p.cluster = clusterIdx;
        });

        // 3. Update Centroids
        oldCentroids = centroids.map(c => [...c]);
        centroids = centroids.map((_, i) => {
            const clusterPoints = points.filter(p => p.cluster === i);
            if (clusterPoints.length === 0) return oldCentroids[i]; // Keep old if empty

            // Calculate mean
            const sumFeatures = new Array(clusterPoints[0].features.length).fill(0);
            clusterPoints.forEach(p => {
                p.features.forEach((val, dim) => sumFeatures[dim] += val);
            });
            return sumFeatures.map(v => v / clusterPoints.length);
        });

        // 4. Check Convergence
        const centroidShift = centroids.reduce((sum, c, i) => sum + distance(c, oldCentroids[i]), 0);
        if (centroidShift < 0.001) break;

        iterations++;
    }

    // Calculate WCSS
    const wcss = points.reduce((sum, p) => {
        if (p.cluster === undefined || p.cluster === -1) return sum;
        return sum + Math.pow(distance(p.features, centroids[p.cluster]), 2);
    }, 0);

    return { points, centroids, k, wcss, iterations };
}

/**
 * Elbow Method to find optimal K
 */
export function findOptimalK(data: DataPoint[], maxK = 10): ElbowResult[] {
    const results: ElbowResult[] = [];
    // Normalize once
    const normalizedData = normalizePoints(data);

    for (let k = 1; k <= maxK; k++) {
        // Run multiple times to avoid local optima
        let bestResult: ClusterResult | null = null;
        for (let i = 0; i < 5; i++) {
            const res = kMeans(normalizedData, k);
            if (!bestResult || res.wcss < bestResult.wcss) {
                bestResult = res;
            }
        }
        if (bestResult) {
            results.push({ k, wcss: bestResult.wcss });
        }
    }
    return results;
}

/**
 * DBSCAN Algorithm (Simplified)
 * Density-Based Spatial Clustering of Applications with Noise
 */
export function dbscan(data: DataPoint[], epsilon: number, minPts: number): ClusterResult {
    const points: DataPoint[] = normalizePoints(data).map(p => ({ ...p, cluster: undefined, label: undefined }));
    let clusterIdx = 0;

    const getNeighbors = (p: DataPoint) => points.filter(n => distance(p.features, n.features) <= epsilon);

    for (const point of points) {
        if (point.cluster !== undefined || point.label === 'Noise') continue;

        const neighbors = getNeighbors(point);

        if (neighbors.length < minPts) {
            point.label = 'Noise';
            continue;
        }

        clusterIdx++;
        point.cluster = clusterIdx;

        // Expand Cluster
        const seeds = [...neighbors]; // Queue
        // Remove current point from seeds to avoid infinite loop if it's in neighbors
        const pIndex = seeds.findIndex(s => s.id === point.id);
        if (pIndex > -1) seeds.splice(pIndex, 1);

        for (let i = 0; i < seeds.length; i++) {
            const q = seeds[i];

            if (q.label === 'Noise') q.label = undefined; // Change noise to border point
            if (q.cluster !== undefined) continue;

            q.cluster = clusterIdx;

            const qNeighbors = getNeighbors(q);
            if (qNeighbors.length >= minPts) {
                // Add new neighbors to seeds if not already processed (optimization needed for large datasets)
                // For simplicity, just pushing unique ones
                qNeighbors.forEach(n => {
                    if (!seeds.includes(n)) seeds.push(n);
                });
            }
        }
    }

    return {
        points,
        centroids: [], // DBSCAN doesn't have centroids
        k: clusterIdx,
        wcss: 0,
        iterations: 0
    };
}
