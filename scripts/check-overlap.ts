import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const p1 = await prisma.systemPrediction.findMany({
    where: { game: 'TOTOLOTO', systemName: 'Supersistema Neuronal' },
    select: { drawId: true }
  });
  const p2 = await prisma.systemPrediction.findMany({
    where: { game: 'TOTOLOTO', systemName: 'SuperSistema Neuronal' },
    select: { drawId: true }
  });

  const ids1 = new Set(p1.map(p => p.drawId));
  const ids2 = new Set(p2.map(p => p.drawId));

  const overlap = [...ids2].filter(id => ids1.has(id));
  console.log(`Supersistema (minúscula): ${ids1.size} sorteios.`);
  console.log(`SuperSistema (maiúscula): ${ids2.size} sorteios.`);
  console.log(`Sobreposição: ${overlap.length} sorteios.`);
}

main().finally(() => prisma.$disconnect());
