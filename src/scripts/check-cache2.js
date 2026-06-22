require('dotenv').config();
const { PrismaClient } = require('@prisma/client-prod');

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
});

async function check() {
    const games = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO', 'MEGASENA'];
    for (const game of games) {
        const cached = await prisma.cachedPrediction.findMany({
            where: { game },
            orderBy: { updatedAt: 'desc' },
            take: 3,
            select: { systemName: true, numbers: true, updatedAt: true }
        });
        
        console.log('\n=== ' + game + ' NUMBER PREDICTIONS ===');
        for (const c of cached) {
            const nums = JSON.parse(c.numbers);
            console.log(c.systemName + ': [' + nums.slice(0,8).join(',') + '...] (' + nums.length + ' total) - updated: ' + c.updatedAt.toISOString());
        }
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
