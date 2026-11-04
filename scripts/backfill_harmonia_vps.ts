import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { SistemaAntigravityHarmonia } from '../src/services/custom/SistemaAntigravityHarmonia';
import { batchUpsertPredictions } from './batch_pg_helper';
dotenv.config();

const calculateNumberHits = (prediction: number[], actual: number[]) => {
    const hits: Record<string, number> = {};
    for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
        const top = prediction.slice(0, cut);
        hits[`num_hits_${cut}`] = top.filter(n => actual.includes(n)).length;
    }
    return hits;
};

async function backfillHarmoniaLotofacilVPS() {
    const client = new Client({ connectionString: process.env.POSTGRES_URL_PROD });
    await client.connect();

    console.log('🚀 Fetching LOTOFACIL draws from VPS...');
    const res = await client.query(`
        SELECT id, game, numbers, date
        FROM "Draw"
        WHERE game = 'LOTOFACIL'
        ORDER BY date ASC
    `);

    const draws = res.rows.map(d => ({
        ...d,
        date: new Date(d.date)
    }));

    console.log(`Loaded ${draws.length} LOTOFACIL draws.`);

    const sys = new SistemaAntigravityHarmonia();
    const systemName = 'Harmonia Dimensional (Antigravity)';
    const maxNum = 25;
    const records: any[] = [];
    let jackpots = 0;
    let highPrizes = 0;

    const t0 = Date.now();
    for (let i = 0; i < draws.length; i++) {
        const currentDraw = draws[i];
        // Chronological history before this draw
        const history = draws.slice(0, i);
        if (history.length < 5) continue;

        // history is in asc order, sys.generateTop10 handles chrono order internally
        const prediction = await sys.generateTop10(history as any, true);
        const actual = typeof currentDraw.numbers === 'string'
            ? JSON.parse(currentDraw.numbers)
            : (Array.isArray(currentDraw.numbers) ? currentDraw.numbers : []);
        const hits = calculateNumberHits(prediction, actual);

        if (hits.num_hits_20 === 15) jackpots++;
        if (hits.num_hits_20 === 14) highPrizes++;

        records.push({
            drawId: currentDraw.id,
            game: 'LOTOFACIL',
            systemName,
            prediction: JSON.stringify(prediction),
            calculatedAt: new Date(),
            domain: 'NUMBERS',
            cutoff: maxNum,
            ...hits
        });

        if (records.length % 500 === 0) {
            console.log(`  Calculated ${records.length}/${draws.length - 5}...`);
        }
    }

    console.log(`Calculated ${records.length} predictions in ${((Date.now() - t0) / 1000).toFixed(1)}s!`);
    console.log(`Jackpots: ${jackpots}, High Prizes: ${highPrizes}`);

    console.log('Inserting into VPS PostgreSQL in batches...');
    const tInsert = Date.now();
    await batchUpsertPredictions(client, records);
    console.log(`✅ Upserted ${records.length} records into VPS in ${((Date.now() - tInsert) / 1000).toFixed(1)}s!`);

    await client.end();
}

backfillHarmoniaLotofacilVPS().catch(console.error);
