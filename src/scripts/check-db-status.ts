import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const res = await prisma.draw.groupBy({
    by: ['game'],
    _max: { date: true },
    _count: { id: true }
  });
  console.log('Database Status (Local):');
  console.log(res);

  // Check last update logs or status
  const totalDraws = await prisma.draw.count();
  console.log('Total draws:', totalDraws);
}

main().catch(console.error);
