import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.POSTGRES_URL_PROD || 'postgresql://admin_magico:UmaSenhaForte123@187.124.32.121:5432/numeros_magicos_prod';

async function main() {
    console.log('🔍 CONNECTING TO PRODUCTION POSTGRESQL...');
    console.log('Connection URL:', connectionString.replace(/:[^:]+@/, ':****@'));

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected successfully!');

        const tables = [
            'Draw',
            'ranked_systems',
            'system_performance',
            'star_system_performance',
            'cached_predictions',
            'system_ranking',
            'star_system_ranking',
            'User'
        ];

        console.log('\n📊 TABLE STATUS (PRODUCTION):');
        for (const table of tables) {
            try {
                const res = await client.query(`SELECT COUNT(*) FROM "${table}"`);
                console.log(`   - ${table}: ${res.rows[0].count} records`);
            } catch (err: any) {
                console.log(`   - ${table}: ERROR (${err.message})`);
            }
        }

        try {
            const lastDrawRes = await client.query('SELECT * FROM "Draw" ORDER BY date DESC LIMIT 1');
            if (lastDrawRes.rows.length > 0) {
                const draw = lastDrawRes.rows[0];
                console.log(`\n📅 Last Draw: Game ${draw.game}, ID ${draw.id}, Date ${draw.date.toISOString().split('T')[0]}, Numbers: ${draw.numbers}`);
            } else {
                console.log('\n⚠️ No draws found in Draw table!');
            }
        } catch (err: any) {
            console.log(`\n⚠️ Failed to fetch last draw: ${err.message}`);
        }

    } catch (error) {
        console.error('❌ Database connection failed:', error);
    } finally {
        await client.end();
    }
}

main();
