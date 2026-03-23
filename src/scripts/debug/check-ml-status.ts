import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log('--- SystemPerformance Counts ---');
    const perfCounts = await prisma.systemPerformance.groupBy({
        by: ['systemName', 'game'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
    });
    console.table(perfCounts);

    console.log('\n--- StarSystemPerformance Counts ---');
    const starPerfCounts = await prisma.starSystemPerformance.groupBy({
        by: ['systemName', 'game'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
    });
    console.table(starPerfCounts);

    console.log('\n--- SystemPredictions Counts ---');
    const predCounts = await prisma.systemPrediction.groupBy({
        by: ['systemName', 'game'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
    });
    console.table(predCounts);

    console.log('\n--- MLModelTraining Latest Updates ---');
    const models = await prisma.mLModelTraining.findMany({ select: { modelType: true, lastTrained: true, updatedAt: true } });
    console.table(models);
}

check().catch(console.error).finally(() => prisma.$disconnect());
