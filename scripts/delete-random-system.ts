
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Deletes all data related to "Random Generator" system from the database.
 * This includes SystemPerformance, CachedPrediction, SystemRanking, and RankedSystem records.
 */
async function deleteRandomSystem() {
    console.log('🗑️  Starting deletion of "Random Generator" system...\n');

    // The system may appear with different suffixes per game
    const names = [
        'Random Generator',
        'Random Generator_TOTOLOTO',
        'Random Generator_EURODREAMS',
        'Random Generator_EUROMILLIONS',
    ];

    // 1. Delete SystemPerformance records
    const perfResult = await prisma.systemPerformance.deleteMany({
        where: { systemName: { in: names } }
    });
    console.log(`✅ Deleted ${perfResult.count} SystemPerformance records`);

    // 2. Delete StarSystemPerformance records (if any)
    const starPerfResult = await prisma.starSystemPerformance.deleteMany({
        where: { systemName: { in: names } }
    });
    console.log(`✅ Deleted ${starPerfResult.count} StarSystemPerformance records`);

    // 3. Delete CachedPrediction records
    const cacheResult = await prisma.cachedPrediction.deleteMany({
        where: { systemName: { in: names } }
    });
    console.log(`✅ Deleted ${cacheResult.count} CachedPrediction records`);

    // 4. Delete SystemRanking records
    const rankingResult = await prisma.systemRanking.deleteMany({
        where: { systemName: { in: names } }
    });
    console.log(`✅ Deleted ${rankingResult.count} SystemRanking records`);

    // 5. Delete RankedSystem records (must be last due to FK constraints)
    const systemResult = await prisma.rankedSystem.deleteMany({
        where: { name: { in: names } }
    });
    console.log(`✅ Deleted ${systemResult.count} RankedSystem records`);

    console.log('\n🎉 Random Generator system fully removed from database!');
    console.log('ℹ️  Remember to also remove the import from ranked-systems.ts');
}

deleteRandomSystem()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
