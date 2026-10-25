import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function inspectPascal() {
  const preds = await p.systemPrediction.findMany({
    where: { game: 'TOTOLOTO', systemName: 'Pirâmide de Pascal', domain: 'NUMBERS' },
    select: { prediction: true, draw: { select: { date: true } } },
    orderBy: { draw: { date: 'desc' } },
    take: 6
  });
  console.log("Pirâmide de Pascal Sample:");
  for (const x of preds) {
    console.log(x.draw.date.toISOString().split('T')[0], x.prediction.slice(0, 50));
  }
}
inspectPascal().finally(() => p.$disconnect());
