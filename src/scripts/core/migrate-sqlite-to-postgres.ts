
import Database from 'better-sqlite3';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const SQLITE_PATH = './prisma/dev.db';
const POSTGRES_URL = process.env.DATABASE_URL;

async function migrate() {
  console.log('🚀 NÚMEROS MÁGICOS: Migração "Direct-Engine" Iniciada');
  
  const sqlite = new Database(SQLITE_PATH);
  const pgClient = new Client({ connectionString: POSTGRES_URL });

  try {
    await pgClient.connect();
    console.log('🔗 Conectado à VPS PostgreSQL.');

    // 1. Migrar RankedSystems
    console.log('📦 Migrando RankedSystems...');
    const systems = sqlite.prepare('SELECT * FROM ranked_systems').all() as any[];
    for (const s of systems) {
      await pgClient.query(
        'INSERT INTO ranked_systems (id, game, name, "isActive", description, "systemType", domain, dependencies, complexity, priority, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (name, game) DO UPDATE SET description = EXCLUDED.description',
        [s.id, s.game, s.name, s.isActive ? 1 : 0, s.description, s.systemType, s.domain, s.dependencies, s.complexity, s.priority, new Date(s.createdAt)]
      );
    }
    console.log(`✅ ${systems.length} Sistemas migrados.`);

    // 2. Migrar Draws
    console.log('📦 Migrando Draws...');
    const draws = sqlite.prepare('SELECT * FROM Draw').all() as any[];
    for (const d of draws) {
       await pgClient.query(
        'INSERT INTO "Draw" (id, game, "sequenceNumber", date, numbers, stars, "numbersDrawOrder", "starsDrawOrder", jackpot, "hasWinner", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (game, date) DO NOTHING',
        [d.id, d.game, d.sequenceNumber, new Date(d.date), d.numbers, d.stars, d.numbersDrawOrder, d.starsDrawOrder, d.jackpot, d.hasWinner ? 1 : 0, new Date(d.createdAt), new Date(d.updatedAt)]
      );
    }
    console.log(`✅ ${draws.length} Sorteios migrados.`);

    // 3. Migrar MLModelTraining (O Cérebro)
    console.log('📦 Migrando MLModelTraining...');
    try {
      const models = sqlite.prepare('SELECT * FROM ml_model_training').all() as any[];
      for (const m of models) {
        await pgClient.query(
          'INSERT INTO ml_model_training (id, "modelType", "modelData", "lastTrained", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT ("modelType") DO UPDATE SET "modelData" = EXCLUDED."modelData"',
          [m.id, m.modelType, m.modelData, new Date(m.lastTrained), new Date(m.createdAt), new Date(m.updatedAt)]
        );
      }
      console.log(`✅ ${models.length} Modelos de IA migrados.`);
    } catch (e) {
      console.log('⚠️ Tabela ml_model_training não encontrada ou vazia no SQLite.');
    }


    console.log('\n✨ MIGRAÇÃO DIRECTA CONCLUÍDA! ✨');

  } catch (err) {
    console.error('❌ Erro Fatal na Migração:', err);
  } finally {
    sqlite.close();
    await pgClient.end();
  }
}

migrate().catch(console.error);

