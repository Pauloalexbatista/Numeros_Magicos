
import { prisma } from '@/lib/prisma';
import { getSystemByName } from './ranked-systems';
import { getRanking } from './ranking-evaluator';
import { initializeSystems } from './ranking';

/**
 * Service to handle generation and caching of future predictions
 */
export class PredictionService {

    /**
     * Generates and caches predictions for ALL active systems for the upcoming draw.
     * This ensures that the "CachedPrediction" table is populated.
     */
    async generateAndCacheAllPredictions() {
        console.log('ðŸ”® Generating predictions for all games...');

        // 0. Ensure all systems are registered in DB
        await initializeSystems();

        const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA'];

        for (const game of games) {
            await this.generateAndCachePredictions(game);
        }
    }

    async generateAndCachePredictions(game: string) {
        // 1. Get all active systems
        const activeSystems = await prisma.rankedSystem.findMany({
            where: { isActive: true, game } // Filter by game
        });

        // 2. Get history (last 100 draws)
        const allDraws = await prisma.draw.findMany({
            where: { game }, // Filter by game
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
                await this.cachePrediction(sysDb.name, sysDb.game, prediction);
                console.log(`âœ… Cached prediction for ${sysDb.name} (${sysDb.game})`);

            } catch (error) {
                console.error(`âŒ Error generating prediction for ${sysDb.name}:`, error);
            }
        }

    }


    private async cachePrediction(systemName: string, game: string, numbers: number[]) {
        const antiNumbers = this.getInverse(numbers, game);

        await prisma.cachedPrediction.upsert({
            where: {
                systemName_game: {
                    systemName,
                    game
                }
            },
            update: {
                numbers: JSON.stringify(numbers),
                worstNumbers: JSON.stringify(antiNumbers),
                updatedAt: new Date()
            },
            create: {
                game,
                systemName,
                numbers: JSON.stringify(numbers),
                worstNumbers: JSON.stringify(antiNumbers)
            }
        });
    }

    // New method added based on the provided snippet
    public async getPrediction(systemName: string, game: string): Promise<number[]> {
        const cached = await prisma.cachedPrediction.findUnique({
            where: {
                systemName_game: {
                    systemName,
                    game
                }
            }
        });

        if (cached && cached.numbers) {
            return JSON.parse(cached.numbers);
        }

        // If not cached, generate it
        const system = getSystemByName(systemName);
        if (!system) {
            throw new Error(`System ${systemName} not found.`);
        }

        const draws = await prisma.draw.findMany({
            where: { game }, // Filter draws by game
            orderBy: { date: 'desc' }
        });

        const prediction = await system.generateTop10(draws); // Assuming generateTop10 is the correct method
        const sortedPrediction = prediction.sort((a, b) => a - b);

        // Assuming 'stars' logic is not applicable here, using getInverse for worstNumbers
        const worstNumbers = this.getInverse(sortedPrediction, game);

        await prisma.cachedPrediction.upsert({
            where: {
                systemName_game: {
                    systemName,
                    game
                }
            },
            update: {
                numbers: JSON.stringify(sortedPrediction),
                worstNumbers: JSON.stringify(worstNumbers),
                updatedAt: new Date()
            },
            create: {
                game,
                systemName,
                numbers: JSON.stringify(sortedPrediction),
                worstNumbers: JSON.stringify(worstNumbers)
            }
        });
        return sortedPrediction;
    }

    private getInverse(nums: number[], game: string): number[] {
        let maxNum = 50;
        let predCount = 25;
        if (game === 'EURODREAMS') {
            maxNum = 40;
            predCount = 20;
        } else if (game === 'TOTOLOTO') {
            maxNum = 49;
            predCount = 25;
        } else if (game === 'MEGASENA') {
            maxNum = 60;
            predCount = 30;
        }
        const all = Array.from({ length: maxNum }, (_, i) => i + 1);
        return all.filter(n => !nums.includes(n)).slice(0, predCount);
    }
}

export const predictionService = new PredictionService();

