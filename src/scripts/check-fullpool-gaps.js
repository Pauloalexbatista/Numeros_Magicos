require('dotenv').config();
const { PrismaClient } = require('@prisma/client-prod');

const prodUrl = process.env.POSTGRES_URL_PROD || 'postgresql://admin_magico:UmaSenhaForte123@172.16.16.6:5432/numeros_magicos_prod';

const prisma = new PrismaClient({
    datasources: { db: { url: prodUrl } }
});

async function check() {
    const games = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO', 'MEGASENA'];
    for (const game of games) {
        const draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'desc' },
            take: 5,
            select: { id: true, date: true }
        });
        if (!draws.length) { console.log(game + ': No draws'); continue; }
        for (const d of draws) {
            const cnt = await prisma.systemPerformanceFullPool.count({ where: { drawId: d.id } });
            console.log(game + ' | ' + d.date.toISOString().split('T')[0] + ' | drawId=' + d.id + ' | fullPoolCount=' + cnt);
        }
    }
}

check().catch(console.error).finally(() => prisma.disconnect());
