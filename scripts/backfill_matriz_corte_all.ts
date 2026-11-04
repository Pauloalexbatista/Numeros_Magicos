import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { MatrizCorteSystem } from '../src/services/custom/MatrizCorteSystem';
import { MatrizCorteStarsSystem } from '../src/services/star-systems';
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

const calculateStarHits = (prediction: number[], actual: number[]) => {
    const hits: Record<string, number> = {};
    for (const cut of [2, 4, 6, 8, 10, 12]) {
        const top = prediction.slice(0, cut);
        hits[`star_hits_${cut}`] = top.filter(s => actual.includes(s)).length;
    }
    return hits;
};

const GAME_CONFIGS: Record<string, { maxNum: number, predCut: number, maxHits: number, maxStar: number }> = {
    EUROMILLIONS: { maxNum: 50, predCut: 25, maxHits: 5, maxStar: 12 },
    TOTOLOTO: { maxNum: 49, predCut: 25, maxHits: 5, maxStar: 13 },
    EURODREAMS: { maxNum: 40, predCut: 20, maxHits: 6, maxStar: 5 },
    MEGASENA: { maxNum: 60, predCut: 30, maxHits: 6, maxStar: 0 }
};

async function backfillMatrizCorteAll() {
    const client = new Client({ connectionString: process.env.POSTGRES_URL_PROD });
    await client.connect();

    const games = ['EURODREAMS', 'TOTOLOTO', 'EUROMILLIONS', 'MEGASENA'];
    const numSys = new MatrizCorteSystem();
    const starSys = new MatrizCorteStarsSystem();

    for (const game of games) {
        console.log(`\n======================================================`);
        console.log(`🚀 PROCESSING FULL HISTORY: ${game} - Matriz de Corte (Numbers & Stars)`);
        console.log(`======================================================`);

        const res = await client.query(`
            SELECT id, game, numbers, stars, date
            FROM "Draw"
            WHERE game = $1
            ORDER BY date ASC
        `, [game]);

        const draws = res.rows.map(d => ({
            ...d,
            date: new Date(d.date)
        }));

        console.log(`📊 Loaded ${draws.length} draws for ${game}.`);
        const { maxNum, predCut, maxHits, maxStar } = GAME_CONFIGS[game];
        const hitKey = `num_hits_${predCut}`;

        // 1. NUMBERS
        const numberRecords: any[] = [];
        let numJackpots = 0;
        let numHighPrizes = 0;
        const targetHighPrize = (game === 'EURODREAMS' || game === 'MEGASENA') ? 5 : 4;
        const t0 = Date.now();

        for (let i = 0; i < draws.length; i++) {
            const currentDraw = draws[i];
            const history = draws.slice(0, i);
            if (history.length < 15) continue;

            const prediction = await numSys.generateTop10(history as any, true);
            const actual = typeof currentDraw.numbers === 'string'
                ? JSON.parse(currentDraw.numbers)
                : (Array.isArray(currentDraw.numbers) ? currentDraw.numbers : []);
            const hits = calculateNumberHits(prediction, actual);

            if (hits[hitKey] === maxHits) numJackpots++;
            if (hits[hitKey] === targetHighPrize) numHighPrizes++;

            numberRecords.push({
                drawId: currentDraw.id,
                game,
                systemName: 'Matriz de Corte',
                prediction: JSON.stringify(prediction),
                calculatedAt: new Date(),
                domain: 'NUMBERS',
                cutoff: maxNum,
                ...hits
            });

            if (numberRecords.length % 500 === 0) {
                console.log(`  Numbers: calculated ${numberRecords.length}/${draws.length - 15}...`);
            }
        }

        console.log(`⏱️ ${game} Numbers: ${numberRecords.length} calculated in ${((Date.now() - t0) / 1000).toFixed(1)}s (Jackpots: ${numJackpots}, High Prizes: ${numHighPrizes}).`);
        console.log(`💾 Saving Numbers to VPS...`);
        const tNumSave = Date.now();
        await batchUpsertPredictions(client, numberRecords);
        console.log(`✅ ${game} Numbers saved in ${((Date.now() - tNumSave) / 1000).toFixed(1)}s.`);

        // 2. STARS
        if (maxStar > 0) {
            const starRecords: any[] = [];
            const tStar0 = Date.now();

            for (let i = 0; i < draws.length; i++) {
                const currentDraw = draws[i];
                const history = draws.slice(0, i);
                if (history.length < 15) continue;

                const prediction = starSys.generatePrediction(history as any, true);
                const actual = typeof currentDraw.stars === 'string'
                    ? JSON.parse(currentDraw.stars)
                    : (Array.isArray(currentDraw.stars) ? currentDraw.stars : []);
                const hits = calculateStarHits(prediction, actual);

                starRecords.push({
                    drawId: currentDraw.id,
                    game,
                    systemName: 'Matriz de Corte Estrelas',
                    prediction: JSON.stringify(prediction),
                    calculatedAt: new Date(),
                    domain: 'STARS',
                    cutoff: maxStar,
                    ...hits
                });
            }

            console.log(`⏱️ ${game} Stars: ${starRecords.length} calculated in ${((Date.now() - tStar0) / 1000).toFixed(1)}s.`);
            console.log(`💾 Saving Stars to VPS...`);
            const tStarSave = Date.now();
            await batchUpsertPredictions(client, starRecords);
            console.log(`✅ ${game} Stars saved in ${((Date.now() - tStarSave) / 1000).toFixed(1)}s.`);
        }
    }

    await client.end();
    console.log(`\n🎉 ALL MATRIZ DE CORTE HISTORICAL BACKFILLS COMPLETED SUCCESSFULLY!`);
}

backfillMatrizCorteAll().catch(console.error);
