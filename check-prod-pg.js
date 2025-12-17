const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function checkStatus() {
    console.log('🔍 Checking Production Database...\n');

    try {
        await client.connect();

        const draws = await client.query('SELECT COUNT(*) as count FROM "Draw"');
        const performance = await client.query('SELECT COUNT(*) as count FROM system_performance');
        const predictions = await client.query('SELECT COUNT(*) as count FROM "SystemPrediction"');
        const starPerf = await client.query('SELECT COUNT(*) as count FROM star_system_performance');
        const rankings = await client.query('SELECT COUNT(*) as count FROM system_ranking');

        console.log('📊 PRODUCTION DATABASE STATUS:');
        console.log(`   Draws: ${draws.rows[0].count}`);
        console.log(`   System Performance: ${performance.rows[0].count}`);
        console.log(`   System Predictions: ${predictions.rows[0].count}`);
        console.log(`   Star Performance: ${starPerf.rows[0].count}`);
        console.log(`   System Rankings: ${rankings.rows[0].count}`);
        console.log('');

        const drawCount = parseInt(draws.rows[0].count);
        const perfCount = parseInt(performance.rows[0].count);

        if (drawCount === 0) {
            console.log('⚠️  CRITICAL: No draws in production!');
            console.log('   Impact: Site will show "No data available"');
            console.log('   Status: OFFLINE (no content)\n');
        } else if (perfCount === 0) {
            console.log('⚠️  WARNING: Draws exist but no performance data!');
            console.log(`   Impact: ${drawCount} draws visible, but no rankings`);
            console.log('   Status: PARTIALLY ONLINE\n');
        } else {
            console.log('✅ Site is ONLINE with data\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkStatus();
