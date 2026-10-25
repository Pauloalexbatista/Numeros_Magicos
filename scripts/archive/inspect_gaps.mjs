import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function inspectGaps() {
  const preds = await p.systemPrediction.findMany({
    where: { game: 'TOTOLOTO', systemName: 'Pirâmide de Intervalos', domain: 'NUMBERS' },
    select: { prediction: true, draw: { select: { date: true } } },
    orderBy: { draw: { date: 'desc' } },
    take: 6
  });
  console.log("Pirâmide de Intervalos Sample:");
  for (const x of preds) {
    console.log(x.draw.date.toISOString().split('T')[0], x.prediction.slice(0, 50));
  }
}
inspectGaps().finally(() => p.$disconnect());
