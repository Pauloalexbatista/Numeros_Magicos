
import Database from 'better-sqlite3';
const sqlite = new Database('./prisma/dev.db', { readonly: true });
try {
  const row = sqlite.prepare('SELECT lastTrained, createdAt, updatedAt FROM ml_model_training LIMIT 1').get();
  console.log('Result:', JSON.stringify(row, null, 2));
  console.log('Type of lastTrained:', typeof row.lastTrained);
} catch (e) {
  console.error(e);
} finally {
  sqlite.close();
}
