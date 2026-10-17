import dotenv from 'dotenv';
dotenv.config();
import { Client } from 'pg';
import { RandomForestAISystem, RandomForestAIStarSystem } from '../src/services/random-forest-ai';
import { SuperSistemaNeuronal, SUPER_SISTEMA_SPECIALISTS } from '../src/services/supersistema-neuronal';
import { SeparacaoAguas, SEPARACAO_AGUAS_SPECIALISTS } from '../src/services/separacao-aguas';

const connString = process.env.POSTGRES_URL_PROD || process.env.DATABASE_URL;

if (!connString) {
    console.error('❌ Nenhuma string de conexão para a base de dados encontrada (POSTGRES_URL_PROD ou DATABASE_URL).');
    process.exit(1);
}

const client = new Client({
    connectionString: connString,
    connectionTimeoutMillis: 10000
});

function calculateNumberHits(prediction: number[], actual: number[]) {
    const hits: Record<string, number> = {};
    for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
        const top = prediction.slice(0, cut);
        hits[`num_hits_${cut}`] = top.filter(n => actual.includes(n)).length;
    }
    return hits;
}

function calculateStarHits(prediction: number[], actual: number[]) {
    const hits: Record<string, number> = {};
    for (const cut of [2, 4, 6, 8, 10, 12]) {
        const top = prediction.slice(0, cut);
        hits[`star_hits_${cut}`] = top.filter(n => actual.includes(n)).length;
    }
    return hits;
}

function getMaxNumber(game: string): number {
    const g = game?.toUpperCase();
    if (g === 'TOTOLOTO') return 49;
    if (g === 'EURODREAMS') return 40;
    if (g === 'MEGASENA') return 60;
    return 50;
}

function getHalfPoint(game: string): number {
    const g = game?.toUpperCase();
    if (g === 'TOTOLOTO') return 25;
    if (g === 'EURODREAMS') return 20;
    if (g === 'MEGASENA') return 30;
    return 25;
}

async function upsertPrediction(
    drawId: number,
    game: string,
    domain: 'NUMBERS' | 'STARS',
    systemName: string,
    prediction: number[],
    cutoff: number,
    hits: Record<string, number>
) {
    const query = `
        INSERT INTO "SystemPrediction" (
            "drawId", "game", "domain", "systemName", "prediction", "cutoff",
            "num_hits_5", "num_hits_10", "num_hits_15", "num_hits_20", "num_hits_25",
            "num_hits_30", "num_hits_35", "num_hits_40", "num_hits_45", "num_hits_50",
            "num_hits_55", "num_hits_60", "star_hits_2", "star_hits_4", "star_hits_6",
            "star_hits_8", "star_hits_10", "star_hits_12", "calculatedAt"
        ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11,
            $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21,
            $22, $23, $24, NOW()
        )
        ON CONFLICT ("drawId", "systemName", "game", "domain") DO UPDATE SET
            "prediction" = EXCLUDED."prediction",
            "cutoff" = EXCLUDED."cutoff",
            "num_hits_5" = EXCLUDED."num_hits_5",
            "num_hits_10" = EXCLUDED."num_hits_10",
            "num_hits_15" = EXCLUDED."num_hits_15",
            "num_hits_20" = EXCLUDED."num_hits_20",
            "num_hits_25" = EXCLUDED."num_hits_25",
            "num_hits_30" = EXCLUDED."num_hits_30",
            "num_hits_35" = EXCLUDED."num_hits_35",
            "num_hits_40" = EXCLUDED."num_hits_40",
            "num_hits_45" = EXCLUDED."num_hits_45",
            "num_hits_50" = EXCLUDED."num_hits_50",
            "num_hits_55" = EXCLUDED."num_hits_55",
            "num_hits_60" = EXCLUDED."num_hits_60",
            "star_hits_2" = EXCLUDED."star_hits_2",
            "star_hits_4" = EXCLUDED."star_hits_4",
            "star_hits_6" = EXCLUDED."star_hits_6",
            "star_hits_8" = EXCLUDED."star_hits_8",
            "star_hits_10" = EXCLUDED."star_hits_10",
            "star_hits_12" = EXCLUDED."star_hits_12",
            "calculatedAt" = NOW();
    `;

    const values = [
        drawId,
        game,
        domain,
        systemName,
        JSON.stringify(prediction),
        cutoff,
        hits.num_hits_5 ?? null,
        hits.num_hits_10 ?? null,
        hits.num_hits_15 ?? null,
        hits.num_hits_20 ?? null,
        hits.num_hits_25 ?? null,
        hits.num_hits_30 ?? null,
        hits.num_hits_35 ?? null,
        hits.num_hits_40 ?? null,
        hits.num_hits_45 ?? null,
        hits.num_hits_50 ?? null,
        hits.num_hits_55 ?? null,
        hits.num_hits_60 ?? null,
        hits.star_hits_2 ?? null,
        hits.star_hits_4 ?? null,
        hits.star_hits_6 ?? null,
        hits.star_hits_8 ?? null,
        hits.star_hits_10 ?? null,
        hits.star_hits_12 ?? null
    ];

    await client.query(query, values);
}

async function catchupGame(game: string) {
    console.log(`\n===============================================================`);
    console.log(`🎮 PROCESSANDO JOGO: ${game}`);
    console.log(`===============================================================`);

    const maxVal = getMaxNumber(game);
    const halfPoint = getHalfPoint(game);

    // Carregar todos os sorteios ordenados cronologicamente
    const allDraws = (await client.query('SELECT * FROM "Draw" WHERE game = $1 ORDER BY date ASC;', [game])).rows;
    console.log(`Total de sorteios registados na BD: ${allDraws.length}`);

    // Carregar drawIds existentes para os sistemas alvo
    const existingRfRows = (await client.query(
        'SELECT "drawId" FROM "SystemPrediction" WHERE game = $1 AND "domain" = $2 AND "systemName" = $3;',
        [game, 'NUMBERS', 'Random Forest AI']
    )).rows;
    const existingRfIds = new Set(existingRfRows.map(r => r.drawId));

    const existingSsnRows = (await client.query(
        'SELECT "drawId" FROM "SystemPrediction" WHERE game = $1 AND "domain" = $2 AND "systemName" = $3;',
        [game, 'NUMBERS', 'SuperSistema Neuronal']
    )).rows;
    const existingSsnIds = new Set(existingSsnRows.map(r => r.drawId));

    const existingSdaRows = (await client.query(
        'SELECT "drawId" FROM "SystemPrediction" WHERE game = $1 AND "domain" = $2 AND "systemName" = $3;',
        [game, 'NUMBERS', 'Separação das Águas']
    )).rows;
    const existingSdaIds = new Set(existingSdaRows.map(r => r.drawId));

    const existingRfStarRows = (await client.query(
        'SELECT "drawId" FROM "SystemPrediction" WHERE game = $1 AND "domain" = $2 AND "systemName" = $3;',
        [game, 'STARS', 'Random Forest Estrelas']
    )).rows;
    const existingRfStarIds = new Set(existingRfStarRows.map(r => r.drawId));

    const rf = new RandomForestAISystem();
    const ssn = new SuperSistemaNeuronal();
    const sda = new SeparacaoAguas();
    const rfStars = new RandomForestAIStarSystem();

    const ssnSpecs = SUPER_SISTEMA_SPECIALISTS[game] || [];
    const sdaSpecs = SEPARACAO_AGUAS_SPECIALISTS[game] || [];

    let rfCount = 0;
    let ssnCount = 0;
    let sdaCount = 0;
    let rfStarCount = 0;

    for (let i = 0; i < allDraws.length; i++) {
        const targetDraw = allDraws[i];
        const drawId = targetDraw.id;
        const history = allDraws.slice(0, i);
        const actualNumbers = typeof targetDraw.numbers === 'string' ? JSON.parse(targetDraw.numbers) : targetDraw.numbers;
        const actualStars = typeof targetDraw.stars === 'string' ? JSON.parse(targetDraw.stars) : targetDraw.stars;
        const dateStr = new Date(targetDraw.date).toISOString().slice(0, 10);

        let rfPredForThisDraw: number[] | null = null;

        // 1. RANDOM FOREST AI (NÚMEROS)
        if (!existingRfIds.has(drawId)) {
            const t0 = Date.now();
            const pred = await rf.generateTop10(history, true);
            rfPredForThisDraw = pred;
            const hits = calculateNumberHits(pred, actualNumbers);
            await upsertPrediction(drawId, game, 'NUMBERS', 'Random Forest AI', pred, maxVal, hits);
            existingRfIds.add(drawId);
            rfCount++;
            console.log(`  [RF AI] Concurso ${drawId} (${dateStr}) calculado e gravado (${Date.now() - t0}ms)`);
        }

        // 2. SUPERSISTEMA NEURONAL (NÚMEROS)
        if (!existingSsnIds.has(drawId)) {
            // Obter predições dos 5 especialistas
            const predsInDb = (await client.query(
                'SELECT "systemName", "prediction" FROM "SystemPrediction" WHERE "drawId" = $1 AND "domain" = $2;',
                [drawId, 'NUMBERS']
            )).rows;

            const predMap = new Map<string, number[]>();
            for (const p of predsInDb) {
                try {
                    const parsed = typeof p.prediction === 'string' ? JSON.parse(p.prediction) : p.prediction;
                    if (Array.isArray(parsed)) predMap.set(p.systemName, parsed);
                } catch {}
            }
            if (rfPredForThisDraw) {
                predMap.set('Random Forest AI', rfPredForThisDraw);
            }

            const validSpecs = ssnSpecs.map(s => predMap.get(s)).filter((s): s is number[] => Array.isArray(s));
            if (validSpecs.length === ssnSpecs.length) {
                const ssnPred = ssn.combineSpecialists(validSpecs, maxVal, halfPoint);
                const ssnHits = calculateNumberHits(ssnPred, actualNumbers);
                await upsertPrediction(drawId, game, 'NUMBERS', 'SuperSistema Neuronal', ssnPred, maxVal, ssnHits);
                existingSsnIds.add(drawId);
                ssnCount++;
                console.log(`  [SSN Neuronal] Concurso ${drawId} (${dateStr}) calculado e gravado`);
            } else {
                console.warn(`  ⚠️ [SSN Neuronal] Concurso ${drawId}: faltam especialistas (${validSpecs.length}/${ssnSpecs.length})`);
            }
        }

        // 3. SEPARAÇÃO DAS ÁGUAS (NÚMEROS)
        if (!existingSdaIds.has(drawId)) {
            const predsInDb = (await client.query(
                'SELECT "systemName", "prediction" FROM "SystemPrediction" WHERE "drawId" = $1 AND "domain" = $2;',
                [drawId, 'NUMBERS']
            )).rows;

            const predMap = new Map<string, number[]>();
            for (const p of predsInDb) {
                try {
                    const parsed = typeof p.prediction === 'string' ? JSON.parse(p.prediction) : p.prediction;
                    if (Array.isArray(parsed)) predMap.set(p.systemName, parsed);
                } catch {}
            }
            if (rfPredForThisDraw) {
                predMap.set('Random Forest AI', rfPredForThisDraw);
            }

            const validSpecs = sdaSpecs.map(s => predMap.get(s)).filter((s): s is number[] => Array.isArray(s));
            if (validSpecs.length === sdaSpecs.length) {
                const sdaPred = sda.combineSpecialists(validSpecs, maxVal, halfPoint);
                const sdaHits = calculateNumberHits(sdaPred, actualNumbers);
                await upsertPrediction(drawId, game, 'NUMBERS', 'Separação das Águas', sdaPred, maxVal, sdaHits);
                existingSdaIds.add(drawId);
                sdaCount++;
                console.log(`  [Separação das Águas] Concurso ${drawId} (${dateStr}) calculado e gravado`);
            } else {
                console.warn(`  ⚠️ [Separação das Águas] Concurso ${drawId}: faltam especialistas (${validSpecs.length}/${sdaSpecs.length})`);
            }
        }

        // 4. RANDOM FOREST ESTRELAS
        if (game !== 'MEGASENA' && !existingRfStarIds.has(drawId)) {
            const pred = rfStars.generatePrediction(history, true);
            const hits = calculateStarHits(pred, actualStars);
            await upsertPrediction(drawId, game, 'STARS', 'Random Forest Estrelas', pred, pred.length, hits);
            existingRfStarIds.add(drawId);
            rfStarCount++;
            console.log(`  [RF Estrelas] Concurso ${drawId} (${dateStr}) calculado e gravado`);
        }
    }

    console.log(`✅ Concluído ${game}: RF AI (+${rfCount}), SSN (+${ssnCount}), SdA (+${sdaCount}), RF Estrelas (+${rfStarCount})`);
}

async function main() {
    const tStart = Date.now();
    await client.connect();

    console.log('🚀 INICIANDO CATCHUP INCREMENTAL (DELTA) NOS 4 JOGOS...');

    for (const g of ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA']) {
        await catchupGame(g);
    }

    const elapsed = ((Date.now() - tStart) / 1000).toFixed(1);
    console.log(`\n🎉 CATCHUP TOTAL CONCLUÍDO EM ${elapsed}s!`);

    await client.end();
}

main().catch(err => {
    console.error('Fatal error during catchup:', err);
    process.exit(1);
});
