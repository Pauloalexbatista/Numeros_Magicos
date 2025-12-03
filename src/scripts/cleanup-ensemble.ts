import { prisma } from '../lib/prisma';

async function main() {
    console.log('🧹 Starting cleanup of obsolete systems...');

    const targetSystem = 'Ensemble Voting';

    // 1. Delete from SystemRanking
    const rankingDelete = await prisma.systemRanking.deleteMany({
        where: { systemName: targetSystem }
    });
    console.log(`✅ Removed ${rankingDelete.count} entries from SystemRanking for '${targetSystem}'.`);

    // 2. Delete from SystemPerformance
    const performanceDelete = await prisma.systemPerformance.deleteMany({
        where: { systemName: targetSystem }
    });
    console.log(`✅ Removed ${performanceDelete.count} entries from SystemPerformance for '${targetSystem}'.`);

    console.log('🎉 Cleanup complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
