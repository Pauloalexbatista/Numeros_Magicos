import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🛠️ Adding columns to ranked_systems...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "ranked_systems" ADD COLUMN "concept" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "ranked_systems" ADD COLUMN "logic" TEXT;`);
    console.log('✅ Done.');
  } catch (e) {
    console.error('❌ Error:', e);
  }
  await prisma.$disconnect();
}

main();
