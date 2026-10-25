import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
  const r = await p.systemPrediction.findMany({
    where: { game: 'TOTOLOTO', systemName: { contains: 'Média' } },
    select: { systemName: true, prediction: true, draw: { select: { sequenceNumber: true, date: true } } },
    orderBy: { draw: { date: 'desc' } },
    take: 10
  });
  console.log(JSON.stringify(r, null, 2));
  await p.$disconnect();
}
run();
