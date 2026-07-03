import { PrismaClient } from '@prisma/client';
import { getSystemByName } from '../services/ranked-systems';

const prisma = new PrismaClient();

async function main() {
  const latestDraw = await prisma.draw.findFirst({
    where: { game: 'EUROMILLIONS' },
    orderBy: { date: 'desc' }
  });
  console.log('Latest Draw date:', latestDraw?.date);
  
  const allDraws = await prisma.draw.findMany({
    where: { game: 'EUROMILLIONS' },
    orderBy: { date: 'desc' }
  });
  
  const system = getSystemByName('Markov Chain');
  if (!system) {
    console.error('System not found');
    return;
  }
  const prediction = await system.generateTop10(allDraws);
  
  const cached = await prisma.cachedPrediction.findUnique({
    where: { systemName_game: { systemName: 'Markov Chain', game: 'EUROMILLIONS' } }
  });
  const cachedNumbers = cached ? JSON.parse(cached.numbers) : [];
  
  console.log('fresh prediction (first 25):', prediction.slice(0, 25));
  console.log('cached prediction:', cachedNumbers);
  console.log('matches:', JSON.stringify(prediction.slice(0, 25)) === JSON.stringify(cachedNumbers));
}

main().catch(console.error);
