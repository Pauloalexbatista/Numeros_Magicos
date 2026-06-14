const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const draws = await p.draw.findMany({ where: { game: 'EUROMILLIONS' }, orderBy: { date: 'desc' }, take: 100, select: { id: true } });
  const ids = draws.map(d => d.id);
  const perfs = await p.systemPerformance.findMany({ where: { drawId: { in: ids }, game: 'EUROMILLIONS', system: { domain: 'NUMBERS' } }, take: 5, select: { systemName: true, hits: true } });
  console.log('With domain filter:', perfs.length);
  const perfs2 = await p.systemPerformance.findMany({ where: { drawId: { in: ids }, game: 'EUROMILLIONS' }, take: 3, select: { systemName: true, hits: true, system: { select: { domain: true } } } });
  console.log('System domains sample:', JSON.stringify(perfs2));
}
main().catch(console.error).finally(() => process.exit());