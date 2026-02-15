
import { prisma } from '@/lib/prisma';

async function cleanup() {
    console.log('🧹 Cleaning up _EURODREAMS systems...');

    const invalidSystems = await prisma.rankedSystem.findMany({
        where: { name: { endsWith: '_EURODREAMS' } },
        select: { name: true }
    });

    const names = invalidSystems.map(s => s.name);
    console.log(`Found ${names.length} invalid systems.`);

    if (names.length === 0) return;

    // 1. Delete Dependencies
    console.log('Deleting SystemPerformance...');
    const p = await prisma.systemPerformance.deleteMany({
        where: { systemName: { in: names } }
    });
    console.log(`Deleted ${p.count} performance records.`);

    console.log('Deleting SystemRanking...');
    const r = await prisma.systemRanking.deleteMany({
        where: { systemName: { in: names } }
    });
    console.log(`Deleted ${r.count} ranking records.`);

    console.log('Deleting CachedPredictions...');
    const c = await prisma.cachedPrediction.deleteMany({
        where: { systemName: { in: names } }
    });
    console.log(`Deleted ${c.count} cached predictions.`);

    // 2. Delete Systems
    console.log('Deleting RankedSystems...');
    const rs = await prisma.rankedSystem.deleteMany({
        where: { name: { in: names } }
    });
    console.log(`Deleted ${rs.count} systems.`);

    console.log('✅ Cleanup complete.');
}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
