import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:c:/Users/paulo/.gemini/antigravity/playground/core-omega/PRJT_Numeros_Magicos/prisma/dev.db'
        }
    }
});

async function main() {
    console.log('--- LOCAL SQLITE METRICS AUDIT ---');
    
    const drawsCount = await prisma.draw.count();
    const rankedSystemsCount = await prisma.rankedSystem.count();
    const systemPerformanceCount = await prisma.systemPerformance.count();
    const systemRankingCount = await prisma.systemRanking.count();
    const cachedPredictionCount = await prisma.cachedPrediction.count();
    const starSystemPerformanceCount = await prisma.starSystemPerformance.count();
    
    console.log(`\n📊 Local SQLite Metrics:`);
    console.log(`- Draw: ${drawsCount} records`);
    console.log(`- RankedSystem: ${rankedSystemsCount} records`);
    console.log(`- SystemPerformance: ${systemPerformanceCount} records`);
    console.log(`- SystemRanking: ${systemRankingCount} records`);
    console.log(`- CachedPrediction: ${cachedPredictionCount} records`);
    console.log(`- StarSystemPerformance: ${starSystemPerformanceCount} records`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
