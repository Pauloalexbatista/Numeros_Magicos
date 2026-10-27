import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rankedSystems = await prisma.rankedSystem.findMany({
    where: { game: 'TOTOLOTO', domain: 'NUMBERS' },
    select: { name: true, isActive: true }
  });

  console.log(`RankedSystems in DB for Totoloto (${rankedSystems.length} found):`);
  rankedSystems.forEach(s => console.log(`  ${s.name} (isActive: ${s.isActive})`));
}

main().finally(() => prisma.$disconnect());
