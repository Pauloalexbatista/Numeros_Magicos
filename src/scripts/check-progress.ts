
import { prisma } from '../lib/prisma';

async function checkProgress() {
    const now = new Date();
    console.log(`Current Time: ${now.toISOString()}`);

    // 1. Check SystemPerformance (Processing Draws)
    const perfCount = await prisma.systemPerformance.count();
    const lastPerf = await prisma.systemPerformance.findFirst({
        orderBy: { createdAt: 'desc' }
    });
    console.log(`\n[SystemPerformance] Total: ${perfCount}`);
    if (lastPerf) console.log(`Last Created: ${lastPerf.createdAt.toISOString()} (${((now.getTime() - lastPerf.createdAt.getTime()) / 60000).toFixed(1)} mins ago)`);

    // 2. Check SystemRanking (Updating Global Ranks)
    const rankCount = await prisma.systemRanking.count();
    const lastRank = await prisma.systemRanking.findFirst({
        orderBy: { lastUpdated: 'desc' }
    });
    console.log(`\n[SystemRanking] Total: ${rankCount}`);
    if (lastRank) console.log(`Last Updated: ${lastRank.lastUpdated.toISOString()} (${((now.getTime() - lastRank.lastUpdated.getTime()) / 60000).toFixed(1)} mins ago)`);

    // 3. Check CachedPrediction (Final Step)
    const cacheCount = await prisma.cachedPrediction.count();
    const lastCache = await prisma.cachedPrediction.findFirst({
        orderBy: { updatedAt: 'desc' }
    });
    console.log(`\n[CachedPrediction] Total: ${cacheCount}`);
    if (lastCache) console.log(`Last Updated: ${lastCache.updatedAt.toISOString()} (${((now.getTime() - lastCache.updatedAt.getTime()) / 60000).toFixed(1)} mins ago)`);
}

checkProgress()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
