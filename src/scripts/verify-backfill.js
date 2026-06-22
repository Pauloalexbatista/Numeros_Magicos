require('dotenv').config();
const { PrismaClient } = require('@prisma/client-prod');

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
});

async function check() {
    // Check new entries for Jun 22 EuroDreams
    const perfs = await prisma.systemPerformanceFullPool.findMany({
        where: { game: 'EURODREAMS', drawId: 6583 },
        select: { systemName: true, predictedNumbers: true, actualNumbers: true }
    });
    
    console.log('Jun 22 EuroDreams (drawId=6583) entries:');
    for (const p of perfs) {
        const pred = JSON.parse(p.predictedNumbers);
        const actual = JSON.parse(p.actualNumbers);
        const top20 = pred.slice(0, 20);
        const hits = actual.filter(n => top20.includes(n)).length;
        console.log(p.systemName + ': ' + pred.length + ' total nums, top20 hits=' + hits + ' | actual=[' + actual.join(',') + '] | pred[0:5]=[' + pred.slice(0,5).join(',') + ']');
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
