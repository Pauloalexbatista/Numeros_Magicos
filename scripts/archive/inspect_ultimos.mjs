import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function inspect() {
  const preds = await p.systemPrediction.findMany({
    where: { game: 'TOTOLOTO', systemName: 'Últimos a Sair', domain: 'NUMBERS' },
    select: { prediction: true, draw: { select: { date: true } } },
    orderBy: { draw: { date: 'desc' } },
    take: 8
  });
  console.log("Últimos a Sair Sample:");
  for (const x of preds) {
    console.log(x.draw.date.toISOString().split('T')[0], x.prediction.slice(0, 50));
  }
}
inspect().finally(() => p.$disconnect());
