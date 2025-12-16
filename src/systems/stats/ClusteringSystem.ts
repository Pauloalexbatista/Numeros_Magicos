
import { Draw } from '@prisma/client';
import { ISystem } from '../core/types';
import { ensure25, parseNumbers } from '../utils/helpers';

export class ClusteringSystem implements ISystem {

    metadata = {
        name: 'Clustering',
        description: 'Agrupa números em décadas (1-10, 11-20...) e foca nos grupos mais ativos',
        tags: ['Estatístico', 'Padrões']
    };

    async generateTop10(draws: Draw[]): Promise<number[]> {
        // Simple clustering: divide into 5 clusters (1-10, 11-20, etc.)
        const clusters: Record<number, number[]> = {
            1: [], 2: [], 3: [], 4: [], 5: []
        };

        // 1. Collect all numbers into clusters
        draws.forEach(draw => {
            const numbers = parseNumbers(draw);
            numbers.forEach(num => {
                const cluster = Math.ceil(num / 10);
                if (clusters[cluster]) {
                    clusters[cluster].push(num);
                }
            });
        });

        // 2. Determine Cluster Activity (Size of cluster population in history)
        const clusterActivity = Object.entries(clusters)
            .map(([clusterId, nums]) => ({
                id: parseInt(clusterId),
                count: nums.length,
                numbers: nums
            }))
            .sort((a, b) => b.count - a.count);

        // 3. Get frequency within Top 3 most active clusters
        const frequency: Record<number, number> = {};

        // Take top 3 clusters to ensure we have enough numbers (max 30 numbers theoretically if evenly distributed, but we check freq)
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
}
