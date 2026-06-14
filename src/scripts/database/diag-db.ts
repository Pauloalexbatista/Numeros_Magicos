import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- TABLES ---');
  const tables = await prisma.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
  console.log(tables);

  console.log('--- COLUMNS (ranked_systems) ---');
  try {
    const cols = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'ranked_systems'`);
    console.log(cols);
  } catch (e) {
    console.log('Error checking ranked_systems');
  }

  await prisma.$disconnect();
}

main();
