import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

export async function batchUpsertPredictions(client: Client, records: any[]) {
    if (records.length === 0) return;
    const CHUNK_SIZE = 50;

    for (let c = 0; c < records.length; c += CHUNK_SIZE) {
        const chunk = records.slice(c, c + CHUNK_SIZE);
        const valueClauses: string[] = [];
        const params: any[] = [];

        chunk.forEach((r, idx) => {
            const b = idx * 25;
            valueClauses.push(`(
                $${b+1}::int, $${b+2}::text, $${b+3}::text, $${b+4}::text, $${b+5}::timestamp, $${b+6}::text, $${b+7}::int,
                $${b+8}::int, $${b+9}::int, $${b+10}::int, $${b+11}::int, $${b+12}::int,
                $${b+13}::int, $${b+14}::int, $${b+15}::int, $${b+16}::int, $${b+17}::int, $${b+18}::int, $${b+19}::int,
                $${b+20}::int, $${b+21}::int, $${b+22}::int, $${b+23}::int, $${b+24}::int, $${b+25}::int
            )`);

            params.push(
                r.drawId, r.game, r.systemName, r.prediction, r.calculatedAt, r.domain, r.cutoff,
                r.num_hits_5 ?? null, r.num_hits_10 ?? null, r.num_hits_15 ?? null, r.num_hits_20 ?? null, r.num_hits_25 ?? null,
                r.num_hits_30 ?? null, r.num_hits_35 ?? null, r.num_hits_40 ?? null, r.num_hits_45 ?? null, r.num_hits_50 ?? null, r.num_hits_55 ?? null, r.num_hits_60 ?? null,
                r.star_hits_2 ?? null, r.star_hits_4 ?? null, r.star_hits_6 ?? null, r.star_hits_8 ?? null, r.star_hits_10 ?? null, r.star_hits_12 ?? null
            );
        });

        const sql = `
            INSERT INTO "SystemPrediction" (
                "drawId", game, "systemName", prediction, "calculatedAt", domain, cutoff,
                num_hits_5, num_hits_10, num_hits_15, num_hits_20, num_hits_25,
                num_hits_30, num_hits_35, num_hits_40, num_hits_45, num_hits_50, num_hits_55, num_hits_60,
                star_hits_2, star_hits_4, star_hits_6, star_hits_8, star_hits_10, star_hits_12
            ) VALUES ${valueClauses.join(', ')}
            ON CONFLICT ("drawId", "systemName", game, domain) DO UPDATE SET
                prediction = EXCLUDED.prediction,
                "calculatedAt" = EXCLUDED."calculatedAt",
                cutoff = EXCLUDED.cutoff,
                num_hits_5 = EXCLUDED.num_hits_5,
                num_hits_10 = EXCLUDED.num_hits_10,
                num_hits_15 = EXCLUDED.num_hits_15,
                num_hits_20 = EXCLUDED.num_hits_20,
                num_hits_25 = EXCLUDED.num_hits_25,
                num_hits_30 = EXCLUDED.num_hits_30,
                num_hits_35 = EXCLUDED.num_hits_35,
                num_hits_40 = EXCLUDED.num_hits_40,
                num_hits_45 = EXCLUDED.num_hits_45,
                num_hits_50 = EXCLUDED.num_hits_50,
                num_hits_55 = EXCLUDED.num_hits_55,
                num_hits_60 = EXCLUDED.num_hits_60,
                star_hits_2 = EXCLUDED.star_hits_2,
                star_hits_4 = EXCLUDED.star_hits_4,
                star_hits_6 = EXCLUDED.star_hits_6,
                star_hits_8 = EXCLUDED.star_hits_8,
                star_hits_10 = EXCLUDED.star_hits_10,
                star_hits_12 = EXCLUDED.star_hits_12
        `;

        await client.query(sql, params);
    }
}
