
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCounts() {
    const draws = await prisma.draw.count();
    const rankings = await prisma.systemRanking.count();
    const starRankings = await prisma.starSystemRanking.count();
    const performance = await prisma.systemPerformance.count();
    const starPerformance = await prisma.starSystemPerformance.count();
    const cachedPredictions = await prisma.cachedPrediction.count();
    const activeSystems = await prisma.rankedSystem.count({ where: { isActive: true } });

    console.log(`\n📊 DATABASE STATUS:`);
    console.log(`   - Draws (History): ${draws}`);
    console.log(`   - Active Systems: ${activeSystems}`);
    console.log(`   - Rankings (Numbers): ${rankings}`);
    console.log(`   - Rankings (Stars): ${starRankings}`);
    console.log(`   - Performance (Numbers): ${performance}`);
    console.log(`   - Performance (Stars): ${starPerformance}`);
    console.log(`   - Cached Predictions: ${cachedPredictions}`);
}

checkCounts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
