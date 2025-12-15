
import { prisma } from '@/lib/prisma';
import { getSystemByName } from './ranked-systems';
import { getRanking } from './ranking-evaluator';

/**
 * Service to handle generation and caching of future predictions
 */
export class PredictionService {

    /**
     * Generates and caches predictions for ALL active systems for the upcoming draw.
     * This ensures that the "CachedPrediction" table is populated.
     */
    async generateAndCacheAllPredictions() {
        console.log('🔮 Generating predictions for all systems...');

        // 1. Get all active systems
        const activeSystems = await prisma.rankedSystem.findMany({
            where: { isActive: true }
        });

        // 2. Get history (last 100 draws)
        const allDraws = await prisma.draw.findMany({
            orderBy: { date: 'desc' },
            take: 100
        });

        const predictions: Record<string, number[]> = {};

        // 3. Generate predictions
        for (const sysDb of activeSystems) {
            try {
                const system = getSystemByName(sysDb.name);
                if (!system) continue;

                const prediction = await system.generateTop10(allDraws);
                // System returns top 10, but some might return more?
                // Standardize to top 25 for UI if possible, or just store what we get.
                // Most systems return 10-15 numbers.
                // Wait, generateTop10 returns number[].

                predictions[sysDb.name] = prediction;

                // Cache it
                await this.cachePrediction(sysDb.name, prediction);
                console.log(`✅ Cached prediction for ${sysDb.name}`);

            } catch (error) {
                console.error(`❌ Error generating prediction for ${sysDb.name}:`, error);
            }
        }

        // 4. Generate Medal Predictions (Ensembles)
        await this.generateMedalPredictions(predictions);
    }

    /**
     * Generates predictions for Medal Systems (Gold, Silver, Bronze) based on current ranking
     */
    async generateMedalPredictions(basePredictions: Record<string, number[]>) {
        console.log('🏅 Generating Medal System predictions...');

        // Get Ranking
        const ranking = await getRanking(); // [{ systemName, avgAccuracy }]

        // Define Tiers
        const tiers = [
            { name: 'Sistema Ouro', count: 3 },
            { name: 'Sistema Prata', count: 6 },
            { name: 'Sistema Bronze', count: 9 },
            { name: 'Sistema Platina', count: 12 }
        ];

        // Ensure we have predictions for top systems
        // If passed basePredictions is incomplete (e.g. only updating medals), fetch from DB?
        // For now assume basePredictions is fresh from previous step.

        const votes: Record<number, number> = {};

        // Accumulate votes based on tiers
        // Logic similar to turbo-medals.ts

        for (const tier of tiers) {
            // We accumulate votes cumulatively.
            // Gold = Top 3. Silver = Top 6 (includes Gold's 3).
            // So we can just iterate 0..12 and capture snapshots.

            const limit = tier.count;

            // Reset votes for unconnected tiers? 
            // In turbo-medals, it seems they accumulate into the SAME votes object?
            // "finalizePrediction" uses current state of votes.
            // And the loop continues adds more votes.
            // So Silver includes votes from Gold systems + next 3.
            // Yes, "Add next 3".
        }

        // Re-implementing the cumulative logic
        // We will build one master vote map and snapshot it at specific counts.

        const masterVotes: Record<number, number> = {};

        let currentRankIndex = 0;

        for (const tier of tiers) {
            // Add systems until we reach tier.count
            while (currentRankIndex < tier.count && currentRankIndex < ranking.length) {
                const rankItem = ranking[currentRankIndex];
                const sysName = rankItem.systemName;
                const pred = basePredictions[sysName]; // || await fetchFromCache...

                if (pred && pred.length > 0) {
                    // Add votes
                    // Weight is avgAccuracy
                    pred.forEach(num => {
                        masterVotes[num] = (masterVotes[num] || 0) + rankItem.avgAccuracy;
                    });
                } else {
                    console.warn(`⚠️ Missing prediction for ${sysName} (Rank #${currentRankIndex + 1})`);
                }

                currentRankIndex++;
            }

            // Snapshot for this tier
            const tierPrediction = Object.entries(masterVotes)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 25)
                .map(([num]) => parseInt(num));

            await this.cachePrediction(tier.name, tierPrediction);
            console.log(`✅ Cached prediction for ${tier.name}`);
        }
    }

    private async cachePrediction(systemName: string, numbers: number[]) {
        const antiNumbers = this.getInverse(numbers);

        await prisma.cachedPrediction.upsert({
            where: { systemName },
            update: {
                numbers: JSON.stringify(numbers),
                worstNumbers: JSON.stringify(antiNumbers),
                updatedAt: new Date()
            },
            create: {
                systemName,
                numbers: JSON.stringify(numbers),
                worstNumbers: JSON.stringify(antiNumbers)
            }
        });
    }

    private getInverse(nums: number[]): number[] {
        const all = Array.from({ length: 50 }, (_, i) => i + 1);
        return all.filter(n => !nums.includes(n)).slice(0, 25);
    }
}

export const predictionService = new PredictionService();
