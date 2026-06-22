require('dotenv').config();
const { PrismaClient } = require('@prisma/client-prod');

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
});

async function check() {
    const total = await prisma.cachedPrediction.count();
    console.log('Total cachedPredictions:', total);
    
    const byGame = await prisma.cachedPrediction.groupBy({
        by: ['game'],
        _count: true
    });
    console.log('By game:', JSON.stringify(byGame));
    
    // Show all EM number predictions (not star systems)
    const emPreds = await prisma.cachedPrediction.findMany({
        where: { game: 'EUROMILLIONS' },
        select: { systemName: true, numbers: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' }
    });
    
    console.log('\n=== ALL EUROMILLIONS CACHED ===');
    for (const c of emPreds) {
        const nums = JSON.parse(c.numbers);
        console.log(c.systemName + ' (' + nums.length + ' nums): [' + nums.slice(0,5).join(',') + '...]');
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
