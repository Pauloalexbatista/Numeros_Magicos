
import { prismaProd } from '../../lib/prisma-prod';

async function cleanupProduction() {
    console.log('🧹 Starting PRODUCTION Cleanup...');

    // 1. Deactivate Consensus/Neural/Vortex Multi on PRODUCTION
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

    // Typings for prismaProd are loose, so we use any
    const prisma = prismaProd as any;

    const updated = await prisma.rankedSystem.updateMany({
        where: { name: { in: toDeactivate } },
        data: { isActive: false }
    });
    console.log(`✅ [PROD] Deactivated ${updated.count} systems (Consensus/Vortex Multi).`);

    // 2. Delete Random Generator Systems on PRODUCTION
    const toDeleteNames = [
        'Random Generator',
        'Random Generator_TOTOLOTO',
        'Random Generator_EURODREAMS'
    ];

    // Delete Performance
    const delPerf = await prisma.systemPerformance.deleteMany({
        where: { systemName: { in: toDeleteNames } }
    });
    console.log(`   - [PROD] Deleted ${delPerf.count} performance records.`);

    // Delete Predictions
    const delPred = await prisma.systemPrediction.deleteMany({
        where: { systemName: { in: toDeleteNames } }
    });
    console.log(`   - [PROD] Deleted ${delPred.count} predictions.`);

    // Delete Cache
    const delCache = await prisma.cachedPrediction.deleteMany({
        where: { systemName: { in: toDeleteNames } }
    });
    console.log(`   - [PROD] Deleted ${delCache.count} cached predictions.`);

    // Delete Rankings
    const delRank = await prisma.systemRanking.deleteMany({
        where: { systemName: { in: toDeleteNames } }
    });
    console.log(`   - [PROD] Deleted ${delRank.count} rankings.`);

    // Finally, Delete Systems
    const delSys = await prisma.rankedSystem.deleteMany({
        where: { name: { in: toDeleteNames } }
    });
    console.log(`🔥 [PROD] Deleted ${delSys.count} Random Generator systems.`);

}

cleanupProduction()
    .catch(console.error)
    .finally(() => (prismaProd as any).$disconnect());
