import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function inspectOscilacao() {
  const preds = await p.systemPrediction.findMany({
    where: { game: 'TOTOLOTO', systemName: { contains: 'Oscilação' }, domain: 'NUMBERS' },
    select: { systemName: true, prediction: true, draw: { select: { date: true } } },
    orderBy: { draw: { date: 'desc' } },
    take: 8
  });
  console.log("Oscilação Universal Sample:");
  for (const x of preds) {
    console.log(x.draw.date.toISOString().split('T')[0], x.systemName, x.prediction.slice(0, 40));
  }
}
inspectOscilacao().finally(() => p.$disconnect());
