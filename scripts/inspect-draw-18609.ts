import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const preds = await prisma.systemPrediction.findMany({
    where: { drawId: 18609 },
    select: { systemName: true, num_hits_25: true }
  });

  console.log(`Predictions for Draw #18609 (${preds.length} found):`);
  preds.forEach(p => console.log(`  ${p.systemName}: ${p.num_hits_25}/5 acertos`));
}

main().finally(() => prisma.$disconnect());
