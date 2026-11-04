import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { rankedSystems } from '../src/services/ranked-systems';
import { totolotoRankedSystems, totolotoStarSystems } from '../src/services/totoloto-systems';
import { euroDreamsRankedSystems, euroDreamsStarSystems } from '../src/services/ranking';
import { starSystems } from '../src/services/star-systems';
import { TiroCerteiro, TIRO_CERTEIRO_SPECIALISTS } from '../src/services/tiro-certeiro';
import { SeparacaoAguas, SEPARACAO_AGUAS_SPECIALISTS } from '../src/services/separacao-aguas';
import { SuperSistemaNeuronal, SUPER_SISTEMA_SPECIALISTS } from '../src/services/supersistema-neuronal';

dotenv.config();

const connectionString = process.env.POSTGRES_URL_PROD;

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA', 'LOTOFACIL'];

  for (const game of games) {
    console.log(`\n=== Generating next predictions for ${game} on VPS ===`);
    const drawsRes = await client.query(`
      SELECT id, date, numbers, stars 
      FROM "Draw" 
      WHERE game = $1 
      ORDER BY date DESC
    `, [game]);
    const history = drawsRes.rows.map(r => ({
      id: r.id,
      date: r.date,
      numbers: typeof r.numbers === 'string' ? JSON.parse(r.numbers) : r.numbers,
      stars: r.stars ? (typeof r.stars === 'string' ? JSON.parse(r.stars) : r.stars) : []
    }));

    if (history.length === 0) continue;

    const maxNum = game === 'EUROMILLIONS' ? 50 : game === 'TOTOLOTO' ? 49 : game === 'EURODREAMS' ? 40 : game === 'LOTOFACIL' ? 25 : 60;
    const halfPoint = game === 'EURODREAMS' ? 20 : game === 'MEGASENA' ? 30 : game === 'LOTOFACIL' ? 20 : 25;

    let baseSystems: any[] = rankedSystems;
    if (game === 'TOTOLOTO') baseSystems = totolotoRankedSystems;
    if (game === 'EURODREAMS') baseSystems = euroDreamsRankedSystems;

    const savedPreds: Record<string, number[]> = {};

    for (const sys of baseSystems) {
      try {
        let res: number[] = [];
        if (typeof sys.generatePrediction === 'function') {
          res = await sys.generatePrediction(history, true);
        } else if (typeof sys.generateTop10 === 'function') {
          res = await sys.generateTop10(history, true);
        }
        const valid = (res || []).filter((n: number) => n >= 1 && n <= maxNum);
        const missing: number[] = [];
        for (let i = 1; i <= maxNum; i++) {
          if (!valid.includes(i)) missing.push(i);
        }
        const fullPool = [...valid, ...missing];
        const topNumbers = fullPool.slice(0, halfPoint);
        const worstNumbers = fullPool.slice(halfPoint);

        await client.query(`
          INSERT INTO "cached_predictions" ("systemName", game, numbers, "worstNumbers", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT ("systemName", game) DO UPDATE SET
            numbers = EXCLUDED.numbers,
            "worstNumbers" = EXCLUDED."worstNumbers",
            "updatedAt" = NOW()
        `, [sys.name, game, JSON.stringify(topNumbers), JSON.stringify(worstNumbers)]);

        savedPreds[norm(sys.name)] = fullPool;
      } catch (err) {
        console.error(`Error generating base ${sys.name}:`, err);
      }
    }

    // Meta-Systems
    try {
      // Tiro Certeiro
      const tcNames = TIRO_CERTEIRO_SPECIALISTS[game] || [];
      const tcSpecs = tcNames.map(name => savedPreds[norm(name)]).filter(Boolean);
      if (tcSpecs.length > 0) {
        const combined = new TiroCerteiro().combineSpecialists(tcSpecs, maxNum, halfPoint, game);
        await client.query(`
          INSERT INTO "cached_predictions" ("systemName", game, numbers, "worstNumbers", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT ("systemName", game) DO UPDATE SET
            numbers = EXCLUDED.numbers,
            "worstNumbers" = EXCLUDED."worstNumbers",
            "updatedAt" = NOW()
        `, ['Tiro Certeiro', game, JSON.stringify(combined.slice(0, halfPoint)), JSON.stringify(combined.slice(halfPoint))]);
      }

      // Separação das Águas
      const saNames = SEPARACAO_AGUAS_SPECIALISTS[game] || [];
      const saSpecs = saNames.map(name => savedPreds[norm(name)]).filter(Boolean);
      if (saSpecs.length > 0) {
        const combined = new SeparacaoAguas().combineSpecialists(saSpecs, maxNum, halfPoint);
        await client.query(`
          INSERT INTO "cached_predictions" ("systemName", game, numbers, "worstNumbers", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT ("systemName", game) DO UPDATE SET
            numbers = EXCLUDED.numbers,
            "worstNumbers" = EXCLUDED."worstNumbers",
            "updatedAt" = NOW()
        `, ['Separação das Águas', game, JSON.stringify(combined.slice(0, halfPoint)), JSON.stringify(combined.slice(halfPoint))]);
      }

      // SuperSistema Neuronal
      const ssNames = SUPER_SISTEMA_SPECIALISTS[game] || [];
      const ssSpecs = ssNames.map(name => savedPreds[norm(name)]).filter(Boolean);
      if (ssSpecs.length > 0) {
        const combined = new SuperSistemaNeuronal().combineSpecialists(ssSpecs, maxNum, halfPoint);
        await client.query(`
          INSERT INTO "cached_predictions" ("systemName", game, numbers, "worstNumbers", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT ("systemName", game) DO UPDATE SET
            numbers = EXCLUDED.numbers,
            "worstNumbers" = EXCLUDED."worstNumbers",
            "updatedAt" = NOW()
        `, ['SuperSistema Neuronal', game, JSON.stringify(combined.slice(0, halfPoint)), JSON.stringify(combined.slice(halfPoint))]);
      }
    } catch (err) {
      console.error(`Error generating meta-systems for ${game}:`, err);
    }

    // Stars
    if (game === 'EUROMILLIONS' || game === 'TOTOLOTO' || game === 'EURODREAMS') {
      const maxStar = game === 'EUROMILLIONS' ? 12 : game === 'TOTOLOTO' ? 13 : 5;
      const suggestedCount = game === 'EUROMILLIONS' ? 4 : 2;
      let starList: any[] = starSystems;
      if (game === 'TOTOLOTO') starList = totolotoStarSystems;
      if (game === 'EURODREAMS') starList = euroDreamsStarSystems;

      for (const sSys of starList) {
        try {
          let pred: number[] = [];
          if (typeof sSys.generatePrediction === 'function') {
            pred = await sSys.generatePrediction(history, true);
          }
          const valid = (pred || []).filter((n: number) => n >= 1 && n <= maxStar);
          const missing: number[] = [];
          for (let i = 1; i <= maxStar; i++) {
            if (!valid.includes(i)) missing.push(i);
          }
          const fullPool = [...valid, ...missing];
          await client.query(`
            INSERT INTO "cached_predictions" ("systemName", game, numbers, "worstNumbers", "updatedAt")
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT ("systemName", game) DO UPDATE SET
              numbers = EXCLUDED.numbers,
              "worstNumbers" = EXCLUDED."worstNumbers",
              "updatedAt" = NOW()
          `, [sSys.name, game, JSON.stringify(fullPool.slice(0, suggestedCount)), JSON.stringify(fullPool.slice(suggestedCount))]);
        } catch (err) {
          console.error(`Error generating stars ${sSys.name}:`, err);
        }
      }
    }

    console.log(`✅ Cached predictions sealed for ${game}`);
  }

  await client.end();
  console.log("\n🎉 All next predictions updated successfully on VPS PostgreSQL!");
}

run().catch(console.error);
