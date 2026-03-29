
import Database from 'better-sqlite3';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const SQLITE_PATH = './prisma/dev.db';
const POSTGRES_URL = process.env.DATABASE_URL;

async function migrate() {
  console.log('🚀 NÚMEROS MÁGICOS: Migração "Turbo-Resilient" Iniciada');
  
  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  let pgClient = new Client({ connectionString: POSTGRES_URL });

  const connectPG = async () => {
    try {
      if (pgClient) await pgClient.end().catch(() => {});
      pgClient = new Client({ connectionString: POSTGRES_URL });
      await pgClient.connect();
      pgClient.on('error', async (err) => {
        console.error('⚠️  Erro de ligação PG:', err.message);
      });
      return true;
    } catch (e) {
      console.error('❌ Falha ao ligar à VPS. O túnel está aberto?');
      return false;
    }
  };

  if (!(await connectPG())) return;
  console.log('🔗 Ligação à VPS estabelecida.');

  const migrateTable = async (tableName: string, pgTableName: string, columns: string[], conflictTarget: string) => {
    console.log(`\n📦 Processando ${tableName}...`);
    const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all() as any[];
    if (rows.length === 0) return;

    // Atalho Inteligente: Se já sincronizado, salta (Exceto IA)
    try {
      const { rows: pgRows } = await pgClient.query(`SELECT count(*) FROM "${pgTableName}"`);
      const pgCount = parseInt(pgRows[0].count);
      if (pgCount >= rows.length && tableName !== 'ml_model_training') {
        console.log(`✅ ${tableName} já sincronizada (${pgCount} registos). A saltar...`);
        return;
      }
    } catch (e) {}

    const quotedColumns = columns.map(c => c.includes('"') ? c : `"${c}"`).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const updateSet = columns.map(c => {
      const qc = c.includes('"') ? c : `"${c}"`;
      return `${qc} = EXCLUDED.${qc}`;
    }).join(', ');
    const quotedConflictTarget = conflictTarget.split(',').map(c => `"${c.trim()}"`).join(', ');
    const query = `INSERT INTO "${pgTableName}" (${quotedColumns}) VALUES (${placeholders}) ON CONFLICT (${quotedConflictTarget}) DO UPDATE SET ${updateSet}`;

    let count = 0;
    for (const r of rows) {
      const values = columns.map(c => {
        const raw = r[c.replace(/"/g, '')];
        if (raw === null || raw === undefined) return null;
        const colLower = c.toLowerCase();
        // Correção das Datas (Trained, Last, At, Date)
        if (colLower.includes('date') || colLower.includes('at') || colLower.includes('trained') || colLower.includes('last')) {
          return new Date(raw);
        }
        return raw;
      });

      try {
        await pgClient.query(query, values);
        count++;
        if (count % 100 === 0) process.stdout.write(`\r✅ Progresso: ${count}/${rows.length}`);
      } catch (e: any) {
        if (e.message.includes('unique constraint')) continue;
        console.error(`\n⚠️ Erro: ${e.message}. A tentar reconectar...`);
        await connectPG();
      }
    }
    console.log(`\r✅ ${tableName} finalizada (${count}/${rows.length}).`);
  };

  try {
    // 1. Sistemas
    await migrateTable('ranked_systems', 'ranked_systems', 
      ['game', 'name', 'isActive', 'description', 'systemType', 'domain', 'dependencies', 'complexity', 'priority', 'createdAt'],
      'name, game'
    );

    // 2. Draws (Manual Loop)
    console.log('\n📦 Sincronizando Draws...');
    const draws = sqlite.prepare('SELECT * FROM Draw').all() as any[];
    const { rows: drawPgRows } = await pgClient.query('SELECT count(*) FROM "Draw"');
    if (parseInt(drawPgRows[0].count) >= draws.length) {
       console.log(`✅ Sorteios sincronizados (${drawPgRows[0].count} registos). A saltar...`);
    } else {
      let drawCount = 0;
      for (const d of draws) {
        try {
          await pgClient.query(
            'INSERT INTO "Draw" (id, game, "sequenceNumber", date, numbers, stars, "numbersDrawOrder", "starsDrawOrder", jackpot, "hasWinner", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (game, date) DO NOTHING',
            [d.id, d.game, d.sequenceNumber, new Date(d.date), d.numbers, d.stars, d.numbersDrawOrder, d.starsDrawOrder, d.jackpot, d.hasWinner ? 1 : 0, new Date(d.createdAt), new Date(d.updatedAt)]
          );
          drawCount++;
          if (drawCount % 100 === 0) process.stdout.write(`\r✅ Sorteios: ${drawCount}/${draws.length}`);
        } catch (e: any) { await connectPG(); }
      }
      console.log(`\r✅ Sorteios sincronizados (${drawCount}/${draws.length}).`);
    }

    // 3. Performance & IA (Turbo Mode: Skips if done)
    const tables = [
      { name: 'system_performance', pg: 'system_performance', cols: ['drawId', 'game', 'systemName', 'predictedNumbers', 'actualNumbers', 'hits', 'accuracy', 'createdAt'], conflict: 'drawId, systemName, game' },
      { name: 'star_system_performance', pg: 'star_system_performance', cols: ['drawId', 'game', 'systemName', 'predictedStars', 'actualStars', 'hits', 'createdAt'], conflict: 'drawId, systemName, game' },
      { name: 'system_ranking', pg: 'system_ranking', cols: ['game', 'systemName', 'avgAccuracy', 'totalPredictions', 'lastUpdated'], conflict: 'systemName, game' },
      { name: 'star_system_ranking', pg: 'star_system_ranking', cols: ['game', 'systemName', 'avgAccuracy', 'totalPredictions', 'totalHits', 'jackpots', 'lastUpdated'], conflict: 'systemName, game' },
      { name: 'SystemPrediction', pg: 'SystemPrediction', cols: ['drawId', 'game', 'systemName', 'prediction', 'calculatedAt'], conflict: 'drawId, systemName, game' },
      { name: 'ml_model_training', pg: 'ml_model_training', cols: ['modelType', 'modelData', 'lastTrained', 'createdAt', 'updatedAt'], conflict: 'modelType' }
    ];

    for (const t of tables) {
      await migrateTable(t.name, t.pg, t.cols, t.conflict);
    }

    console.log('\n✨ INFRAESTRUTURA TOTAL SINCRONIZADA! ✨');
  } finally {
    sqlite.close();
    await pgClient.end().catch(() => {});
  }
}

migrate();
