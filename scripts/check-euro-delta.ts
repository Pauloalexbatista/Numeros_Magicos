import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const euroDraws = await prisma.draw.findMany({
    where: { game: 'EUROMILLIONS' },
    orderBy: { date: 'asc' },
    select: { id: true, date: true, numbers: true }
  });

  console.log('Total Euromillions draws in DB:', euroDraws.length);
  const fileContent = JSON.parse(require('fs').readFileSync('data/consolidated/separacao_aguas_v2_euromillions.json', 'utf-8'));
  console.log('separacao_aguas_v2_euromillions.json length:', fileContent.length);
}

main().finally(() => prisma.$disconnect());
