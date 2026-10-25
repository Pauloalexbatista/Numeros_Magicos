import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
  const systems = await p.rankedSystem.findMany({
    where: { domain: 'NUMBERS' },
    select: { name: true }
  });
  console.log("Registered Systems in DB:");
  for (const s of systems) {
    const preds = await p.systemPrediction.findMany({
      where: { game: 'TOTOLOTO', systemName: s.name, domain: 'NUMBERS' },
      orderBy: { draw: { date: 'desc' } },
      take: 5
    });
    const unique = new Set(preds.map(x => x.prediction)).size;
    console.log(`- ${s.name}: ${preds.length} recent, ${unique} unique in last 5`);
  }
}
run().finally(() => p.$disconnect());
