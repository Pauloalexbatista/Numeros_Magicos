import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.POSTGRES_URL_PROD;

async function checkLatestTotoloto() {
  const client = new Client({ connectionString });
  await client.connect();

  const drawsRes = await client.query(`
    SELECT id, date, numbers 
    FROM "Draw" 
    WHERE game = 'TOTOLOTO' 
    ORDER BY date DESC 
    LIMIT 5
  `);
  console.log("Latest Totoloto draws:", drawsRes.rows);

  const drawIds = drawsRes.rows.map(d => d.id);
  const predsRes = await client.query(`
    SELECT "drawId", "systemName", num_hits_25 
    FROM "SystemPrediction" 
    WHERE "drawId" = ANY($1) 
      AND "systemName" IN ('Tiro Certeiro', 'Transições de Markov', 'Separação das Águas')
    ORDER BY "drawId" DESC, "systemName" ASC
  `, [drawIds]);

  console.log("Latest preds for top systems:", predsRes.rows);

  await client.end();
}

checkLatestTotoloto().catch(console.error);
