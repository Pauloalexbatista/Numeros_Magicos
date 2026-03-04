import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const client = new Client({ connectionString: process.env.POSTGRES_URL_PROD });
    await client.connect();

    console.log('--- Columns in ranked_systems ---');
    const res1 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ranked_systems'");
    res1.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

    console.log('\n--- Columns in cached_predictions ---');
    const res2 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cached_predictions'");
    res2.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

    console.log('\n--- Columns in system_ranking ---');
    const res3 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'system_ranking'");
    res3.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

    await client.end();
}

run().catch(console.error);
