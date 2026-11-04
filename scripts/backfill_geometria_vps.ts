import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { SistemaGeometriaCiclos } from '../src/services/custom/SistemaGeometriaCiclos';
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

const GAME_CONFIGS: Record<string, { maxNum: number, predCut: number, maxHits: number }> = {
    EUROMILLIONS: { maxNum: 50, predCut: 25, maxHits: 5 },
    TOTOLOTO: { maxNum: 49, predCut: 25, maxHits: 5 },
    EURODREAMS: { maxNum: 40, predCut: 20, maxHits: 6 },
    MEGASENA: { maxNum: 60, predCut: 30, maxHits: 6 },
    LOTOFACIL: { maxNum: 25, predCut: 20, maxHits: 15 }
};

async function backfillGeometriaAllVPS() {
    const client = new Client({ connectionString: process.env.POSTGRES_URL_PROD });
    await client.connect();

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA', 'LOTOFACIL'];
    const sys = new SistemaGeometriaCiclos();
    const systemName = 'Geometria & Ciclos';

    for (const game of games) {
        console.log(`\n======================================================`);
        console.log(`🎯 A processar ${game} - ${systemName} na VPS...`);

        const res = await client.query(`
            SELECT id, game, numbers, date
            FROM "Draw"
            WHERE game = $1
            ORDER BY date ASC
        `, [game]);

        const draws = res.rows.map(d => ({
            ...d,
            date: new Date(d.date)
        }));

        console.log(`📊 Carregados ${draws.length} sorteios de ${game}.`);
        const { maxNum, predCut, maxHits } = GAME_CONFIGS[game];
        const hitKey = `num_hits_${predCut}`;

        const records: any[] = [];
        let jackpots = 0;
        const t0 = Date.now();

        for (let i = 0; i < draws.length; i++) {
            const currentDraw = draws[i];
            const history = draws.slice(0, i);
            if (history.length < 5) continue;

            const prediction = await sys.generateTop10(history as any, true);
            const actual = typeof currentDraw.numbers === 'string'
                ? JSON.parse(currentDraw.numbers)
                : (Array.isArray(currentDraw.numbers) ? currentDraw.numbers : []);
            const hits = calculateNumberHits(prediction, actual);

            if (hits[hitKey] === maxHits) {
                jackpots++;
            }

            records.push({
                drawId: currentDraw.id,
                game,
                systemName,
                prediction: JSON.stringify(prediction),
                calculatedAt: new Date(),
                domain: 'NUMBERS',
                cutoff: maxNum,
                ...hits
            });
        }

        console.log(`⏱️ ${game}: ${records.length} previsões calculadas em ${((Date.now() - t0) / 1000).toFixed(1)}s (Jackpots: ${jackpots}).`);
        console.log(`💾 A gravar na VPS PostgreSQL em batches...`);
        const tInsert = Date.now();
        await batchUpsertPredictions(client, records);
        console.log(`✅ ${game}: gravados ${records.length} registos na VPS em ${((Date.now() - tInsert) / 1000).toFixed(1)}s.`);
    }

    await client.end();
}

backfillGeometriaAllVPS().catch(console.error);
