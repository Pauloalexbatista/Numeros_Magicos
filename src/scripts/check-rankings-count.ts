
import { prisma } from '@/lib/prisma';

async function checkCounts() {
    const systems = await prisma.systemRanking.count();
    const starSystems = await prisma.starSystemRanking.count();
    const draws = await prisma.draw.count();

    console.log('📊 Estado da Base de Dados:');
    console.log(`- Sorteios (Draws): ${draws}`);
    console.log(`- Ranking de Números: ${systems}`);
    console.log(`- Ranking de Estrelas: ${starSystems}`);
}

checkCounts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
