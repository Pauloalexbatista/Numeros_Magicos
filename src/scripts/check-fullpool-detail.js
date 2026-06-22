require('dotenv').config();
const { PrismaClient } = require('@prisma/client-prod');

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
});

async function check() {
    // Check EuroDreams "Hot Numbers" last 5 performances
    const perfs = await prisma.systemPerformanceFullPool.findMany({
        where: { systemName: 'Hot Numbers', game: 'EURODREAMS' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { draw: { select: { date: true, numbers: true } } }
    });
    
    console.log('=== EURODREAMS Hot Numbers - Last 5 FullPool entries ===');
    for (const p of perfs) {
        const pred = JSON.parse(p.predictedNumbers).slice(0, 20);
        const actual = JSON.parse(p.draw.numbers);
        const hits = actual.filter(n => pred.includes(n)).length;
        console.log('Draw: ' + p.draw.date.toISOString().split('T')[0] + ' | Pred[0:5]: [' + pred.slice(0,5).join(',') + '] | Actual: [' + actual.join(',') + '] | Hits: ' + hits);
    }
    
    // Also check EuroDreams "Clustering" 
    const perfs2 = await prisma.systemPerformanceFullPool.findMany({
        where: { systemName: 'Clustering', game: 'EURODREAMS' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { draw: { select: { date: true, numbers: true } } }
    });
    
    console.log('\n=== EURODREAMS Clustering - Last 5 FullPool entries ===');
    for (const p of perfs2) {
        const pred = JSON.parse(p.predictedNumbers).slice(0, 20);
        const actual = JSON.parse(p.draw.numbers);
        const hits = actual.filter(n => pred.includes(n)).length;
        console.log('Draw: ' + p.draw.date.toISOString().split('T')[0] + ' | Pred[0:5]: [' + pred.slice(0,5).join(',') + '] | Actual: [' + actual.join(',') + '] | Hits: ' + hits);
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
