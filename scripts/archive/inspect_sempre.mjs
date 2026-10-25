import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function inspectSempre() {
  const preds = await p.systemPrediction.findMany({
    where: { game: 'TOTOLOTO', systemName: 'Mais Sorteadas de Sempre', domain: 'NUMBERS' },
    select: { prediction: true, draw: { select: { date: true } } },
    orderBy: { draw: { date: 'desc' } },
    take: 6
  });
  console.log("Mais Sorteadas de Sempre Sample:");
  for (const x of preds) {
    console.log(x.draw.date.toISOString().split('T')[0], x.prediction.slice(0, 50));
  }
}
inspectSempre().finally(() => p.$disconnect());
