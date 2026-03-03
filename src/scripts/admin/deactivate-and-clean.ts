
import { prisma } from '../../lib/prisma';

async function cleanup() {
    console.log('🧹 Starting System Cleanup...');

    // 1. Deactivate Consensus/Neural/Vortex Multi
    const toDeactivate = [
        'Vortex Multi-Canal (2 canais)',
        'Vortex Multi-Canal (3 canais)',
        'Consensus Auto (Vortex + Camadas + Media3)',
        'Vortex Multi-Canal (2 canais)_TOTOLOTO',
        'Vortex Multi-Canal (3 canais)_TOTOLOTO',
        'Consensus Auto (Vortex + Camadas + Media3)_TOTOLOTO',
        'Vortex Multi-Canal (2 canais)_EURODREAMS',
        'Vortex Multi-Canal (3 canais)_EURODREAMS',
        'Consensus Auto (Vortex + Camadas + Media3)_EURODREAMS'
    ];

    const updated = await prisma.rankedSystem.updateMany({
        where: { name: { in: toDeactivate } },
        data: { isActive: false }
    });
    console.log(`✅ Deactivated ${updated.count} systems (Consensus/Vortex Multi).`);

    // 2. Delete Random Generator Systems
    // Must delete related records first due to FKs
    const toDeleteNames = [
        'Random Generator',
        'Random Generator_TOTOLOTO',
        'Random Generator_EURODREAMS'
    ];

    // Delete Performance
    const delPerf = await prisma.systemPerformance.deleteMany({
        where: { systemName: { in: toDeleteNames } }
    });
    console.log(`   - Deleted ${delPerf.count} performance records.`);

    // Delete Predictions
    const delPred = await prisma.systemPrediction.deleteMany({
        where: { systemName: { in: toDeleteNames } }
    });
    console.log(`   - Deleted ${delPred.count} predictions.`);

    // Delete Cache
    const delCache = await prisma.cachedPrediction.deleteMany({
        where: { systemName: { in: toDeleteNames } }
    });
    console.log(`   - Deleted ${delCache.count} cached predictions.`);

    // Delete Rankings
    const delRank = await prisma.systemRanking.deleteMany({
        where: { systemName: { in: toDeleteNames } }
    });
    console.log(`   - Deleted ${delRank.count} rankings.`);

    // Finally, Delete Systems
    const delSys = await prisma.rankedSystem.deleteMany({
        where: { name: { in: toDeleteNames } }
    });
    console.log(`🔥 Deleted ${delSys.count} Random Generator systems.`);

}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
