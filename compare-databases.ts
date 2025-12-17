import { PrismaClient } from '@prisma/client';

async function compareDatabases() {
    console.log('🔍 Comparing Databases: dev.db vs lab.db\n');
    console.log('========================================\n');

    // Connect to both databases
    const devPrisma = new PrismaClient({
        datasources: { db: { url: 'file:./prisma/dev.db' } }
    });

    const labPrisma = new PrismaClient({
        datasources: { db: { url: 'file:./laboratory/prisma/lab.db' } }
    });

    try {
        // Compare Draws
        console.log('📊 DRAWS:');
        const devDraws = await devPrisma.draw.count();
        const labDraws = await labPrisma.draw.count();
        console.log(`   dev.db: ${devDraws} draws`);
        console.log(`   lab.db: ${labDraws} draws`);
        console.log(`   Diff: ${devDraws - labDraws} ${devDraws === labDraws ? '✅' : '⚠️'}\n`);

        // Get latest draw from each
        const devLatest = await devPrisma.draw.findFirst({
            orderBy: { date: 'desc' }
        });
        const labLatest = await labPrisma.draw.findFirst({
            orderBy: { date: 'desc' }
        });

        console.log('📅 LATEST DRAW:');
        console.log(`   dev.db: ${devLatest?.date} (ID: ${devLatest?.id})`);
        console.log(`   lab.db: ${labLatest?.date} (ID: ${labLatest?.id})`);
        console.log(`   Same: ${devLatest?.id === labLatest?.id ? '✅' : '⚠️'}\n`);

        // Compare SystemPerformance
        console.log('🎯 SYSTEM PERFORMANCE:');
        const devPerf = await devPrisma.systemPerformance.count();
        const labPerf = await labPrisma.systemPerformance.count();
        console.log(`   dev.db: ${devPerf} records`);
        console.log(`   lab.db: ${labPerf} records`);
        console.log(`   Diff: ${devPerf - labPerf} ${devPerf === labPerf ? '✅' : '⚠️'}\n`);

        // Compare SystemPrediction
        console.log('🔮 SYSTEM PREDICTIONS:');
        const devPred = await devPrisma.systemPrediction.count();
        const labPred = await labPrisma.systemPrediction.count();
        console.log(`   dev.db: ${devPred} records`);
        console.log(`   lab.db: ${labPred} records`);
        console.log(`   Diff: ${devPred - labPred} ${devPred === labPred ? '✅' : '⚠️'}\n`);

        // Compare RankedSystems
        console.log('⭐ RANKED SYSTEMS:');
        const devSystems = await devPrisma.rankedSystem.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        const labSystems = await labPrisma.rankedSystem.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });

        console.log(`   dev.db: ${devSystems.length} systems`);
        console.log(`   lab.db: ${labSystems.length} systems\n`);

        // Find systems only in one DB
        const devSystemNames = new Set(devSystems.map(s => s.name));
        const labSystemNames = new Set(labSystems.map(s => s.name));

        const onlyInDev = devSystems.filter(s => !labSystemNames.has(s.name));
        const onlyInLab = labSystems.filter(s => !devSystemNames.has(s.name));

        if (onlyInDev.length > 0) {
            console.log('   Only in dev.db:');
            onlyInDev.forEach(s => console.log(`      - ${s.name}`));
            console.log('');
        }

        if (onlyInLab.length > 0) {
            console.log('   Only in lab.db:');
            onlyInLab.forEach(s => console.log(`      - ${s.name}`));
            console.log('');
        }

        // Check for duplicates in both
        console.log('🔍 DUPLICATE CHECK:\n');

        // Dev duplicates
        const devDupDraws = await devPrisma.$queryRaw<any[]>`
            SELECT date, COUNT(*) as count
            FROM Draw
            GROUP BY date
            HAVING COUNT(*) > 1
        `;
        const devDupPerf = await devPrisma.$queryRaw<any[]>`
            SELECT drawId, systemName, COUNT(*) as count
            FROM SystemPerformance
            GROUP BY drawId, systemName
            HAVING COUNT(*) > 1
        `;

        console.log('   dev.db:');
        console.log(`      Duplicate Draws: ${devDupDraws.length} ${devDupDraws.length === 0 ? '✅' : '❌'}`);
        console.log(`      Duplicate Performance: ${devDupPerf.length} ${devDupPerf.length === 0 ? '✅' : '❌'}`);

        // Lab duplicates
        const labDupDraws = await labPrisma.$queryRaw<any[]>`
            SELECT date, COUNT(*) as count
            FROM Draw
            GROUP BY date
            HAVING COUNT(*) > 1
        `;
        const labDupPerf = await labPrisma.$queryRaw<any[]>`
            SELECT drawId, systemName, COUNT(*) as count
            FROM SystemPerformance
            GROUP BY drawId, systemName
            HAVING COUNT(*) > 1
        `;

        console.log('   lab.db:');
        console.log(`      Duplicate Draws: ${labDupDraws.length} ${labDupDraws.length === 0 ? '✅' : '❌'}`);
        console.log(`      Duplicate Performance: ${labDupPerf.length} ${labDupPerf.length === 0 ? '✅' : '❌'}`);

        console.log('\n========================================');
        console.log('✅ Comparison Complete!\n');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        await devPrisma.$disconnect();
        await labPrisma.$disconnect();
    }
}

compareDatabases();
