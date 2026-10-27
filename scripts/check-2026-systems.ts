import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1);

  const distinctNames = await prisma.systemPrediction.groupBy({
    by: ['systemName', 'game'],
    where: {
      draw: { date: { gte: startDate } },
      domain: 'NUMBERS'
    },
    _count: { id: true }
  });

  console.log(`=== DISTINCT SYSTEM NAMES IN 2026 (NUMBERS) ===`);
  const byGame: Record<string, any[]> = {};
  distinctNames.forEach(d => {
    if (!byGame[d.game]) byGame[d.game] = [];
    byGame[d.game].push({ name: d.systemName, count: d._count.id });
  });

  for (const [game, list] of Object.entries(byGame)) {
    console.log(`\n--- ${game} ---`);
    list.sort((a,b) => a.name.localeCompare(b.name)).forEach(item => {
      console.log(`  "${item.name}" (${item.count} records)`);
    });
  }
}

main().finally(() => prisma.$disconnect());
