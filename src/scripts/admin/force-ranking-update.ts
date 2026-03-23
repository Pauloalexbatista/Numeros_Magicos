import { updateRanking } from '../../services/ranking-evaluator';
import { prisma } from '@/lib/prisma';

async function run() {
    console.log('Forcing Ranking Recalculation for all games...');
    
    await updateRanking('EUROMILLIONS');
    await updateRanking('TOTOLOTO');
    await updateRanking('EURODREAMS');
    
    console.log('Done.');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
