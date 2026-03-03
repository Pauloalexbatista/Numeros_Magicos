
import { prisma } from '../../lib/prisma';

async function purgeAntiSystems() {
    console.log('🗑️  STARTING ANTI-SYSTEM PURGE...');

    // 1. Find them first to count
    const antiSystems = await prisma.rankedSystem.findMany({
        where: { name: { startsWith: 'Anti-' } }
    });
    console.log(`🎯 Found ${antiSystems.length} Anti-Systems to delete.`);

    if (antiSystems.length === 0) {
        console.log('✅ Nothing to delete.');
        return;
    }

    const names = antiSystems.map(s => s.name);

    // 2. Delete Child Records first (if no cascade)
    // Performance
    const deletedPerf = await prisma.systemPerformance.deleteMany({
        where: { systemName: { in: names } }
    });
    console.log(`- Deleted ${deletedPerf.count} performance records.`);

    // Predictions
    const deletedPred = await prisma.systemPrediction.deleteMany({
        where: { systemName: { in: names } }
    });
    console.log(`- Deleted ${deletedPred.count} historical predictions.`);

    // Cache
    const deletedCache = await prisma.cachedPrediction.deleteMany({
        where: { systemName: { in: names } }
    });
    console.log(`- Deleted ${deletedCache.count} cached predictions.`);

    // Rankings
    const deletedRank = await prisma.systemRanking.deleteMany({
        where: { systemName: { in: names } }
    });
    console.log(`- Deleted ${deletedRank.count} rankings.`);

    // 3. Delete the Systems
    const deletedSys = await prisma.rankedSystem.deleteMany({
        where: { name: { in: names } }
    });
    console.log(`🔥 DELETED ${deletedSys.count} ANTI-SYSTEMS.`);

    console.log('✅ PURGE COMPLETE.');
}

purgeAntiSystems()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
