import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.POSTGRES_URL_PROD;

async function checkMarkov() {
  const client = new Client({ connectionString });
  await client.connect();

  const res = await client.query(`
    SELECT "drawId", num_hits_25
    FROM "SystemPrediction"
    WHERE game = 'TOTOLOTO' 
      AND "systemName" = 'Transições de Markov'
      AND num_hits_25 = 5
    ORDER BY "drawId" ASC
  `);
  console.log("VPS PG Markov Totoloto 5-hits count:", res.rows.length);

  const file = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/consolidated/markov_totoloto.json'), 'utf-8'));
  const file5Hits = file.filter(r => r.num_hits_25 === 5);
  console.log("markov_totoloto.json 5-hits count:", file5Hits.length);

  await client.end();
}

checkMarkov().catch(console.error);
