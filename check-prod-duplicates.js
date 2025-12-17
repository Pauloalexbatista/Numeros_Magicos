const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function checkDuplicates() {
    console.log('🔍 Checking for Duplicates in Production...\n');

    try {
        await client.connect();

        // Check duplicate draws
        const dupDraws = await client.query(`
            SELECT date, COUNT(*) as count
            FROM "Draw"
            GROUP BY date
            HAVING COUNT(*) > 1
        `);

        // Check duplicate performance
        const dupPerf = await client.query(`
            SELECT "drawId", "systemName", COUNT(*) as count
            FROM system_performance
            GROUP BY "drawId", "systemName"
            HAVING COUNT(*) > 1
        `);

        // Check duplicate predictions
        const dupPred = await client.query(`
            SELECT "drawId", "systemName", COUNT(*) as count
            FROM "SystemPrediction"
            GROUP BY "drawId", "systemName"
            HAVING COUNT(*) > 1
        `);

        console.log('📊 DUPLICATE CHECK RESULTS:\n');

        if (dupDraws.rows.length === 0) {
            console.log('✅ No duplicate draws');
        } else {
            console.log(`❌ Found ${dupDraws.rows.length} duplicate draws:`);
            dupDraws.rows.forEach(r => console.log(`   ${r.date}: ${r.count} entries`));
        }

        if (dupPerf.rows.length === 0) {
            console.log('✅ No duplicate performance records');
        } else {
            console.log(`❌ Found ${dupPerf.rows.length} duplicate performance records`);
        }

        if (dupPred.rows.length === 0) {
            console.log('✅ No duplicate predictions');
        } else {
            console.log(`❌ Found ${dupPred.rows.length} duplicate predictions`);
        }

        console.log('\n========================================');
        if (dupDraws.rows.length === 0 && dupPerf.rows.length === 0 && dupPred.rows.length === 0) {
            console.log('🎉 PRODUCTION DATABASE IS CLEAN!');
            console.log('   Zero duplicates found!');
        } else {
            console.log('⚠️  Duplicates found - needs cleanup');
        }
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkDuplicates();
