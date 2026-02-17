
import { prisma } from '../lib/prisma';

async function main() {
    const CANCELLED_SYSTEMS = [
        'Random Generator',
        'Vortex MultiChannel (2 canais)',
        'Vortex MultiChannel', // Variant name just in case
        'Random System' // Variant name just in case
    ];

    console.log(`🗑️ Cleaning up cancelled systems: ${CANCELLED_SYSTEMS.join(', ')}`);

    // Delete from SystemPrediction
    const deletedPredictions = await prisma.systemPrediction.deleteMany({
        where: { systemName: { in: CANCELLED_SYSTEMS } }
    });
    console.log(`✅ Deleted ${deletedPredictions.count} predictions.`);

    // Delete from SystemPerformance
    const deletedPerformance = await prisma.systemPerformance.deleteMany({
        where: { systemName: { in: CANCELLED_SYSTEMS } }
    });
    console.log(`✅ Deleted ${deletedPerformance.count} performance records.`);

    // Delete from SystemRanking
    const deletedRanking = await prisma.systemRanking.deleteMany({
        where: { systemName: { in: CANCELLED_SYSTEMS } }
    });
    console.log(`✅ Deleted ${deletedRanking.count} ranking records.`);

    // Delete from CachedPrediction
    const deletedCached = await prisma.cachedPrediction.deleteMany({
        where: { systemName: { in: CANCELLED_SYSTEMS } }
    });
    console.log(`✅ Deleted ${deletedCached.count} cached predictions.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
