import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const latestDraw = await prisma.draw.findFirst({
    where: { game: 'EUROMILLIONS' },
    orderBy: { date: 'desc' }
  });
  if (!latestDraw) return;
  console.log('Latest Draw date:', latestDraw.date);

  const p = await prisma.systemPerformanceFullPool.findFirst({
    where: { game: 'EUROMILLIONS', systemName: 'Markov Chain', drawId: latestDraw.id }
  });
  if (p) {
    console.log('perf drawId:', p.drawId, 'latestDraw id:', latestDraw.id);
    console.log('predicted numbers length:', JSON.parse(p.predictedNumbers).length);
  } else {
    console.log('No performance record for latest draw');
  }
}

main().catch(console.error);
