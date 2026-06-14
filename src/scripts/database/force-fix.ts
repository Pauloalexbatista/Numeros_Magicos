import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tables = ['ranked_systems', 'system_ranking', 'star_system_ranking'];
  
  for (const table of tables) {
    console.log(`🛠️ Fixing table: ${table}`);
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS concept TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS logic TEXT;`);
      console.log(`✅ Table ${table} updated.`);
    } catch (e) {
      console.error(`❌ Error updating ${table}:`, e);
    }
  }

  await prisma.$disconnect();
}

main();
