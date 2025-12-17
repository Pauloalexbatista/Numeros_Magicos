const sqlite3 = require('better-sqlite3');

function compareDatabases() {
    console.log('🔍 Comparing Databases: dev.db vs lab.db\n');
    console.log('========================================\n');

    const devDb = new sqlite3('./prisma/dev.db', { readonly: true });
    const labDb = new sqlite3('./laboratory/prisma/lab.db', { readonly: true });

    try {
        // Compare Draws
        console.log('📊 DRAWS:');
        const devDraws = devDb.prepare('SELECT COUNT(*) as count FROM Draw').get();
        const labDraws = labDb.prepare('SELECT COUNT(*) as count FROM Draw').get();
        console.log(`   dev.db: ${devDraws.count} draws`);
        console.log(`   lab.db: ${labDraws.count} draws`);
        console.log(`   Diff: ${devDraws.count - labDraws.count} ${devDraws.count === labDraws.count ? '✅' : '⚠️'}\n`);

        // Latest draw
        console.log('📅 LATEST DRAW:');
        const devLatest = devDb.prepare('SELECT id, date FROM Draw ORDER BY date DESC LIMIT 1').get();
        const labLatest = labDb.prepare('SELECT id, date FROM Draw ORDER BY date DESC LIMIT 1').get();
        console.log(`   dev.db: ${devLatest.date} (ID: ${devLatest.id})`);
        console.log(`   lab.db: ${labLatest.date} (ID: ${labLatest.id})`);
        console.log(`   Same: ${devLatest.id === labLatest.id ? '✅' : '⚠️'}\n`);

        // SystemPerformance
        console.log('🎯 SYSTEM PERFORMANCE:');
        const devPerf = devDb.prepare('SELECT COUNT(*) as count FROM SystemPerformance').get();
        const labPerf = labDb.prepare('SELECT COUNT(*) as count FROM SystemPerformance').get();
        console.log(`   dev.db: ${devPerf.count} records`);
        console.log(`   lab.db: ${labPerf.count} records`);
        console.log(`   Diff: ${devPerf.count - labPerf.count} ${devPerf.count === labPerf.count ? '✅' : '⚠️'}\n`);

        // SystemPrediction
        console.log('🔮 SYSTEM PREDICTIONS:');
        const devPred = devDb.prepare('SELECT COUNT(*) as count FROM SystemPrediction').get();
        const labPred = labDb.prepare('SELECT COUNT(*) as count FROM SystemPrediction').get();
        console.log(`   dev.db: ${devPred.count} records`);
        console.log(`   lab.db: ${labPred.count} records`);
        console.log(`   Diff: ${devPred.count - labPred.count} ${devPred.count === labPred.count ? '✅' : '⚠️'}\n`);

        // RankedSystems
        console.log('⭐ RANKED SYSTEMS:');
        const devSystems = devDb.prepare('SELECT name FROM RankedSystem WHERE isActive = 1 ORDER BY name').all();
        const labSystems = labDb.prepare('SELECT name FROM RankedSystem WHERE isActive = 1 ORDER BY name').all();
        console.log(`   dev.db: ${devSystems.length} systems`);
        console.log(`   lab.db: ${labSystems.length} systems\n`);

        const devNames = new Set(devSystems.map(s => s.name));
        const labNames = new Set(labSystems.map(s => s.name));

        const onlyInDev = devSystems.filter(s => !labNames.has(s.name));
        const onlyInLab = labSystems.filter(s => !devNames.has(s.name));

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

        // Duplicates
        console.log('🔍 DUPLICATE CHECK:\n');

        const devDupDraws = devDb.prepare('SELECT date, COUNT(*) as count FROM Draw GROUP BY date HAVING COUNT(*) > 1').all();
        const devDupPerf = devDb.prepare('SELECT drawId, systemName, COUNT(*) as count FROM SystemPerformance GROUP BY drawId, systemName HAVING COUNT(*) > 1').all();

        console.log('   dev.db:');
        console.log(`      Duplicate Draws: ${devDupDraws.length} ${devDupDraws.length === 0 ? '✅' : '❌'}`);
        console.log(`      Duplicate Performance: ${devDupPerf.length} ${devDupPerf.length === 0 ? '✅' : '❌'}`);

        const labDupDraws = labDb.prepare('SELECT date, COUNT(*) as count FROM Draw GROUP BY date HAVING COUNT(*) > 1').all();
        const labDupPerf = labDb.prepare('SELECT drawId, systemName, COUNT(*) as count FROM SystemPerformance GROUP BY drawId, systemName HAVING COUNT(*) > 1').all();

        console.log('   lab.db:');
        console.log(`      Duplicate Draws: ${labDupDraws.length} ${labDupDraws.length === 0 ? '✅' : '❌'}`);
        console.log(`      Duplicate Performance: ${labDupPerf.length} ${labDupPerf.length === 0 ? '✅' : '❌'}`);

        console.log('\n========================================');
        console.log('✅ Comparison Complete!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        devDb.close();
        labDb.close();
    }
}

compareDatabases();
