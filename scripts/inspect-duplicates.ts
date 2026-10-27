import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ranked = await prisma.rankedSystem.findMany({
    select: { name: true, game: true, isActive: true }
  });
  console.log('=== RANKED SYSTEMS IN DB ===');
  const groupedByName: Record<string, string[]> = {};
  ranked.forEach(r => {
    if (!groupedByName[r.name]) groupedByName[r.name] = [];
    groupedByName[r.name].push(r.game);
  });
  for (const [name, games] of Object.entries(groupedByName)) {
    console.log(`"${name}" -> Games: ${games.join(', ')}`);
  }

  console.log('\n=== DISTINCT SYSTEM NAMES IN SYSTEMPREDICTION ===');
  const distinct = await prisma.systemPrediction.groupBy({
    by: ['systemName', 'game'],
    _count: { id: true }
  });

  distinct.forEach(d => {
    if (d.systemName.toLowerCase().includes('super') || d.systemName.toLowerCase().includes('neuronal') || d.systemName.toLowerCase().includes('forest')) {
      console.log(`Game: ${d.game} | "${d.systemName}" -> count: ${d._count.id}`);
    }
  });
}

main().finally(() => prisma.$disconnect());
