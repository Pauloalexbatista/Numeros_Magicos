
import Database from 'better-sqlite3';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const SQLITE_PATH = './prisma/dev.db';
const POSTGRES_URL = process.env.DATABASE_URL;

async function migrate() {
  console.log('🧠 NÚMEROS MÁGICOS: Migração "BRAIN-ONLY" Iniciada');
  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  const pgClient = new Client({ connectionString: POSTGRES_URL });

  try {
    await pgClient.connect();
    console.log('🔗 Ligação à VPS estabelecida.');

    const migrateTable = async (tableName: string, pgTableName: string, columns: string[], conflictTarget: string) => {
      console.log(`📦 Processando ${tableName}...`);
      const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all() as any[];
      if (rows.length === 0) return;

      const quotedColumns = columns.map(c => c.includes('"') ? c : `"${c}"`).join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const updateSet = columns.map(c => {
        const qc = c.includes('"') ? c : `"${c}"`;
        return `${qc} = EXCLUDED.${qc}`;
      }).join(', ');
      const qConflict = conflictTarget.split(',').map(c => `"${c.trim()}"`).join(', ');
      const query = `INSERT INTO "${pgTableName}" (${quotedColumns}) VALUES (${placeholders}) ON CONFLICT (${qConflict}) DO UPDATE SET ${updateSet}`;

      for (const r of rows) {
        const values = columns.map(c => {
          const raw = r[c.replace(/"/g, '')];
          if (raw === null || raw === undefined) return null;
          const colLower = c.toLowerCase();
          if (colLower.includes('date') || colLower.includes('at') || colLower.includes('trained') || colLower.includes('last')) {
            return new Date(raw);
          }
          return raw;
        });
        await pgClient.query(query, values);
      }
      console.log(`✅ ${tableName} finalizada (${rows.length}/${rows.length}).`);
    };

    // Focar APENAS no que falta
    await migrateTable('ml_model_training', 'ml_model_training', ['modelType', 'modelData', 'lastTrained', 'createdAt', 'updatedAt'], 'modelType');
    await migrateTable('system_ranking', 'system_ranking', ['game', 'systemName', 'avgAccuracy', 'totalPredictions', 'lastUpdated'], 'systemName, game');
    await migrateTable('star_system_ranking', 'star_system_ranking', ['game', 'systemName', 'avgAccuracy', 'totalPredictions', 'totalHits', 'jackpots', 'lastUpdated'], 'systemName, game');
    await migrateTable('SystemPrediction', 'SystemPrediction', ['drawId', 'game', 'systemName', 'prediction', 'calculatedAt'], 'drawId, systemName, game');

    console.log('\n✨ CÉREBRO E RANKINGS SINCRONIZADOS COM SUCESSO! ✨');
  } catch (e: any) {
    console.error('❌ Erro na migração minimalista:', e.message);
  } finally {
    sqlite.close();
    await pgClient.end().catch(() => {});
  }
}

migrate();
