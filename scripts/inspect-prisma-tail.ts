import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const draws = await prisma.draw.findMany({
    where: { game: 'TOTOLOTO' },
    orderBy: { date: 'asc' },
    select: { id: true, date: true, numbers: true }
  });

  console.log('Total draws in DB for Totoloto:', draws.length);
  const tail = draws.slice(1550);
  tail.forEach((d, idx) => {
    console.log(`[${1550 + idx + 1}] ID: ${d.id}, Date: ${d.date.toISOString().slice(0, 10)}, Numbers: ${d.numbers}`);
  });
}

main().finally(() => prisma.$disconnect());
