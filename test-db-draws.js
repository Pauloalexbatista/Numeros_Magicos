const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.draw.count({
    where: { game: 'MEGASENA' },
  });
  console.log(`Mega-Sena draws in DB: ${count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
