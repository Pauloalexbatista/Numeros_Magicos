import { EuroDreamsService } from '@/services/euroDreamsService';
import { prisma } from '@/lib/prisma';
import { initializeSystems, backfillRankings } from '@/services/ranking';

async function main() {
    console.log('🌙 EuroDreams Data Import Started...\n');

    // Step 1: Initialize Systems
    console.log('📋 Step 1: Initializing EuroDreams Systems...');
    await initializeSystems();

    // Step 2: Import Historical Data
    console.log('\n📥 Step 2: Importing Historical Data...');
    const service = new EuroDreamsService();
    const importedCount = await service.seedFromArchive(2023); // EuroDreams started Nov 2023

    console.log(`\n✅ Imported ${importedCount} EuroDreams draws.`);

    // Step 3: Backfill Rankings
    if (importedCount > 0) {
        console.log('\n🔄 Step 3: Backfilling Rankings...');
        await backfillRankings(500); // Should cover all EuroDreams history
        console.log('✅ Rankings backfilled.');
    }

    // Step 4: Verification
    console.log('\n📊 Step 4: Verification...');
    const totalDraws = await prisma.draw.count({ where: { game: 'EURODREAMS' } });
    const totalSystems = await prisma.rankedSystem.count({ where: { game: 'EURODREAMS' } });
    const totalPerformances = await prisma.systemPerformance.count({
        where: { draw: { game: 'EURODREAMS' } }
    });

    console.log(`\n📈 EuroDreams Database Status:`);
    console.log(`   Draws: ${totalDraws}`);
    console.log(`   Systems: ${totalSystems}`);
    console.log(`   Performance Records: ${totalPerformances}`);

    console.log('\n🎉 EuroDreams Integration Complete!');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
