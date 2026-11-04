import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.POSTGRES_URL_PROD;

async function checkJackpots() {
  const client = new Client({ connectionString });
  await client.connect();

  const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA', 'LOTOFACIL'];

  for (const game of games) {
    const isLotofacil = game === 'LOTOFACIL';
    const targetHits = (game === 'EURODREAMS' || game === 'MEGASENA') ? 6 : (isLotofacil ? 15 : 5);
    const hitCol = (game === 'EURODREAMS' || isLotofacil) ? 'num_hits_20' : (game === 'MEGASENA' ? 'num_hits_30' : 'num_hits_25');

    console.log(`\n=== Jackpots in DB for ${game} (col: ${hitCol} = ${targetHits}) ===`);
    const res = await client.query(`
      SELECT "systemName", count(DISTINCT "drawId") as jackpots
      FROM "SystemPrediction"
      WHERE game = $1 AND domain = 'NUMBERS' AND ${hitCol} = $2
      GROUP BY "systemName"
      ORDER BY jackpots DESC
      LIMIT 10;
    `, [game, targetHits]);

    console.log(res.rows);
  }

  await client.end();
}

checkJackpots().catch(console.error);
