import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function inspectMarkov() {
  const preds = await p.systemPrediction.findMany({
    where: { game: 'TOTOLOTO', systemName: { contains: 'Markov' }, domain: 'NUMBERS' },
    select: { prediction: true, draw: { select: { date: true } } },
    orderBy: { draw: { date: 'desc' } },
    take: 8
  });
  console.log("Transições de Markov Sample:");
  for (const x of preds) {
    console.log(x.draw.date.toISOString().split('T')[0], x.prediction.slice(0, 50));
  }
}
inspectMarkov().finally(() => p.$disconnect());
