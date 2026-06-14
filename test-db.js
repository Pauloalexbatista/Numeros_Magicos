const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rankings = await prisma.systemRanking.findMany({
    where: { game: 'MEGASENA' },
  });
  console.log('Mega-Sena Rankings:', rankings);
}

main().catch(console.error).finally(() => prisma.$disconnect());
