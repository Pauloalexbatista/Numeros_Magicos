import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { batchUpsertPredictions } from './batch_pg_helper';
dotenv.config();

const prisma = new PrismaClient();

const calculateNumberHits = (prediction: number[], actual: number[]) => {
    const hits: Record<string, number> = {};
    for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
        const top = prediction.slice(0, cut);
        hits[`num_hits_${cut}`] = top.filter(n => actual.includes(n)).length;
    }
    return hits;
};

async function restoreCanonicalTiroCerteiro() {
    console.log('🚀 Restoring canonical Tiro Certeiro (78 Jackpots) for EUROMILLIONS...');

    const oldJson = JSON.parse(execSync('git show 6626f63ed1932f10f63fdc09f7554b7f59a94f86:data/consolidated/tiro_certeiro_euromillions.json', { maxBuffer: 100 * 1024 * 1024 }).toString());
    const currJson = JSON.parse(fs.readFileSync('data/consolidated/tiro_certeiro_euromillions.json', 'utf8'));

    // 1. Get all draws from local SQLite
    const localDraws = await prisma.draw.findMany({
        where: { game: 'EUROMILLIONS' },
        orderBy: { date: 'asc' }
    });

    const oldMap = new Map<number, number[]>();
    oldJson.forEach((d: any) => oldMap.set(d.drawId, d.prediction));

    const updatedConsolidated: any[] = [];
    const localRecordsToUpdate: any[] = [];
    let jCount = 0;

    for (const d of localDraws) {
        let winning: number[] = [];
        try { winning = JSON.parse(d.numbers); } catch {}

        // Use canonical prediction from oldJson if available, otherwise currJson
        const pred = oldMap.get(d.id) || currJson.find((c: any) => c.drawId === d.id)?.prediction;
        if (!pred) continue;

        const hits = calculateNumberHits(pred, winning);
        if (hits.num_hits_25 === 5) jCount++;

        const entry = {
            drawId: d.id,
            prediction: pred,
            hits,
            draw: { id: d.id, date: d.date, numbers: d.numbers }
        };
        updatedConsolidated.push(entry);

        localRecordsToUpdate.push({
            drawId: d.id,
            game: 'EUROMILLIONS',
            systemName: 'Tiro Certeiro',
            domain: 'NUMBERS',
            prediction: JSON.stringify(pred),
            cutoff: 50,
            ...hits,
            calculatedAt: new Date()
        });
    }

    console.log(`Evaluated ${localRecordsToUpdate.length} draws: ${jCount} Jackpots (5/5)!`);

    // 2. Save to data/consolidated/tiro_certeiro_euromillions.json
    fs.writeFileSync('data/consolidated/tiro_certeiro_euromillions.json', JSON.stringify(updatedConsolidated, null, 2));
    console.log('✅ Updated data/consolidated/tiro_certeiro_euromillions.json');

    // 3. Update local SQLite
    console.log('Updating local SQLite...');
    for (const rec of localRecordsToUpdate) {
        const existing = await prisma.systemPrediction.findFirst({
            where: {
                drawId: rec.drawId,
                systemName: 'Tiro Certeiro',
                game: 'EUROMILLIONS',
                domain: 'NUMBERS'
            }
        });

        const data = {
            prediction: rec.prediction,
            cutoff: rec.cutoff,
            calculatedAt: rec.calculatedAt,
            num_hits_5: rec.num_hits_5,
            num_hits_10: rec.num_hits_10,
            num_hits_15: rec.num_hits_15,
            num_hits_20: rec.num_hits_20,
            num_hits_25: rec.num_hits_25,
            num_hits_30: rec.num_hits_30,
            num_hits_35: rec.num_hits_35,
            num_hits_40: rec.num_hits_40,
            num_hits_45: rec.num_hits_45,
            num_hits_50: rec.num_hits_50,
            num_hits_55: rec.num_hits_55,
            num_hits_60: rec.num_hits_60
        };

        if (existing) {
            await prisma.systemPrediction.update({
                where: { id: existing.id },
                data
            });
        } else {
            await prisma.systemPrediction.create({
                data: {
                    drawId: rec.drawId,
                    game: 'EUROMILLIONS',
                    systemName: 'Tiro Certeiro',
                    domain: 'NUMBERS',
                    ...data
                }
            });
        }
    }
    console.log('✅ Local SQLite updated with canonical Tiro Certeiro!');

    // 4. Update VPS PostgreSQL
    console.log('Updating VPS PostgreSQL...');
    const client = new Client({ connectionString: process.env.POSTGRES_URL_PROD });
    await client.connect();

    // Fetch VPS draws to match by date
    const vpsDrawsRes = await client.query('SELECT id, date, numbers FROM "Draw" WHERE game = $1 ORDER BY date ASC', ['EUROMILLIONS']);
    const vpsDraws = vpsDrawsRes.rows;

    const vpsRecords: any[] = [];
    let vpsJackpots = 0;

    for (const vd of vpsDraws) {
        const iso = new Date(vd.date).toISOString().split('T')[0];
        const matchLocal = localDraws.find(ld => new Date(ld.date).toISOString().split('T')[0] === iso);
        if (!matchLocal) continue;

        const pred = oldMap.get(matchLocal.id) || currJson.find((c: any) => c.drawId === matchLocal.id)?.prediction;
        if (!pred) continue;

        let winning: number[] = [];
        try { winning = JSON.parse(vd.numbers); } catch {}
        const hits = calculateNumberHits(pred, winning);
        if (hits.num_hits_25 === 5) vpsJackpots++;

        vpsRecords.push({
            drawId: vd.id,
            game: 'EUROMILLIONS',
            systemName: 'Tiro Certeiro',
            prediction: JSON.stringify(pred),
            calculatedAt: new Date(),
            domain: 'NUMBERS',
            cutoff: 50,
            ...hits
        });
    }

    console.log(`VPS records prepared: ${vpsRecords.length} (Jackpots: ${vpsJackpots})`);
    await batchUpsertPredictions(client, vpsRecords);
    console.log('✅ VPS PostgreSQL updated with canonical Tiro Certeiro (78 Jackpots)!');

    await client.end();
    await prisma.$disconnect();
}

restoreCanonicalTiroCerteiro().catch(console.error);
