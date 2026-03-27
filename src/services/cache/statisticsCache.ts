
import { prisma } from '@/lib/prisma';
import { analyzePyramidAccuracy, analyzeNumberProperties, analyzeStarPatterns, analyzePrimeNumbers, Draw } from '../statistics';
import { prisma as db } from '@/lib/prisma';

/**
 * Valid keys for the statistics cache
 */
export type StatisticsKey =
    | 'GLOBAL_NUMBER_STATS'
    | 'GLOBAL_STAR_STATS'
    | 'PYRAMID_STATS_10'
    | 'PYRAMID_STATS_15'
    | 'PYRAMID_STATS_20'
    | 'PYRAMID_STATS_25'
    | 'PYRAMID_STATS_30';

/**
 * Get cached statistics object
 */
export async function getCachedStatistics<T>(key: StatisticsKey): Promise<T | null> {
    try {
        const cache = await prisma.statisticsCache.findUnique({
            where: { key }
        });

        if (!cache) return null;
        return JSON.parse(cache.data) as T;
    } catch (error) {
        console.error(`Failed to fetch cache for key ${key}:`, error);
        return null;
    }
}

/**
 * update or create statistics cache
 */
export async function setCachedStatistics(key: StatisticsKey, data: any): Promise<void> {
    try {
        await prisma.statisticsCache.upsert({
            where: { key },
            update: {
                data: JSON.stringify(data)
            },
            create: {
                key,
                data: JSON.stringify(data)
            }
        });
    } catch (error) {
        console.error(`Failed to update cache for key ${key}:`, error);
    }
}

/**
 * Trigger a full update of all cached statistics
 * This is a heavy operation and should be run in background
 */
export async function updateAllStatisticsCache() {
    console.log("🔄 Starting Statistics Cache Update...");
    const start = performance.now();

    try {
        // 1. Fetch all draws
        const draws = await db.draw.findMany({
            orderBy: { date: 'desc' }
        });

        // Convert to compatible type
        const statsDraws: Draw[] = draws.map(d => ({
            ...d,
            date: d.date, // Keep Date object
            numbers: (typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers),
            stars: (typeof d.stars === "string" ? JSON.parse(d.stars) : d.stars),
            numbersDrawOrder: d.numbersDrawOrder ? JSON.parse(d.numbersDrawOrder) : undefined,
            starsDrawOrder: d.starsDrawOrder ? JSON.parse(d.starsDrawOrder) : undefined
        }));

        // 2. Calculate Pyramid Stats (Heavy O(N^2))
        const pyramidStats = analyzePyramidAccuracy(statsDraws, 100);
        await setCachedStatistics('PYRAMID_STATS_10', pyramidStats);

        // 3. Calculate Global Number Stats
        const numberStats = analyzeNumberProperties(statsDraws);
        await setCachedStatistics('GLOBAL_NUMBER_STATS', numberStats);

        // 4. Calculate Star Stats
        const starStats = analyzeStarPatterns(statsDraws);
        await setCachedStatistics('GLOBAL_STAR_STATS', starStats);

        const end = performance.now();
        console.log(`✅ Statistics Cache Updated in ${(end - start).toFixed(0)}ms`);
        return true;

    } catch (error) {
        console.error("❌ Failed to update statistics cache:", error);
        return false;
    }
}
