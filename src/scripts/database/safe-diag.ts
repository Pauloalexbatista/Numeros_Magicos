import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tables = ['ranked_systems', 'system_ranking', 'star_system_ranking'];
  
  for (const table of tables) {
    console.log(`--- COLUMNS (${table}) ---`);
    try {
      const cols = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
      console.log(cols);
    } catch (e) {
      console.log(`Error checking ${table}`);
    }
  }

  await prisma.$disconnect();
}

main();
