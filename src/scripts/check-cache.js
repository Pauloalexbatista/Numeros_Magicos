require('dotenv').config();
const { PrismaClient } = require('@prisma/client-prod');

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
});

async function check() {
    const cached = await prisma.cachedPrediction.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { systemName: true, numbers: true, updatedAt: true }
    });
    
    for (const c of cached) {
        const nums = JSON.parse(c.numbers);
        console.log(`${c.systemName}: [${nums.slice(0,10).join(',')}...] (${nums.length} total) - updated: ${c.updatedAt.toISOString().split('T')[0]}`);
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
