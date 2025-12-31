import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function recalculateEnsembleSystems() {
    console.log('🔧 RECALCULATING ENSEMBLE SYSTEMS WITH FIX\n');

    const affectedSystems = [
        'Consensus Auto (Vortex + Camadas + Media3)',
        'Anti-Consensus Auto (Vortex + Camadas + Media3)',
        'Quarteto de Impacto',
        'Anti-Quarteto de Impacto',
        'Quarteto de Impacto (Hot + Pascal + Elastic + Random)',
        'Anti-Quarteto de Impacto (Hot + Pascal + Elastic + Random)',
        'Consensus Auto (Vortex + LSTM + Media3)',
        'Anti-Consensus Auto (Vortex + LSTM + Media3)'
    ];

    console.log('📋 Affected systems:');
    affectedSystems.forEach(s => console.log(`   - ${s}`));

    console.log('\n🗑️  Deleting old data...');

    // Delete SystemPerformance
    const deletedPerf = await prisma.systemPerformance.deleteMany({
        where: { systemName: { in: affectedSystems } }
    });
    console.log(`   ✅ Deleted ${deletedPerf.count} SystemPerformance records`);

    // Delete SystemPrediction
    const deletedPred = await prisma.systemPrediction.deleteMany({
        where: { systemName: { in: affectedSystems } }
    });
    console.log(`   ✅ Deleted ${deletedPred.count} SystemPrediction records`);

    // Delete CachedPrediction
    const deletedCache = await prisma.cachedPrediction.deleteMany({
        where: { systemName: { in: affectedSystems } }
    });
    console.log(`   ✅ Deleted ${deletedCache.count} CachedPrediction records`);

    console.log('\n✅ Data deleted successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: .\\tools\\2-MASTER_UPDATE.bat');
    console.log('   2. This will recalculate all 8 systems with the fix');
    console.log('   3. Expected: Ensemble systems should now have ~50-60% win rate');
    console.log('   4. Expected: Anti-ensemble systems should now have ~40-50% win rate');

    await prisma.$disconnect();
}

recalculateEnsembleSystems().catch(console.error);
