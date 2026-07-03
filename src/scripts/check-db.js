const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const draws = await prisma.draw.count();
    console.log('Draws:', draws);
    const pool = await prisma.systemPerformanceFullPool.count();
    console.log('SystemPerformanceFullPool:', pool);
    
    // Check missing logic from sync
    const prodPrisma = new PrismaClient({
        datasources: { db: { url: process.env.POSTGRES_URL_PROD || 'postgresql://admin_magico:UmaSenhaForte123@172.16.16.6:5432/numeros_magicos_prod' } }
    });
    
    try {
        const prodDraws = await prodPrisma.draw.count();
        console.log('Prod Draws:', prodDraws);
        
        const latestProdDraw = await prodPrisma.draw.findFirst({
            where: { game: 'EUROMILHOES' },
            orderBy: { date: 'desc' }
        });
        
        const minDate = latestProdDraw ? latestProdDraw.date : new Date('2000-01-01');
        const missingDraws = await prisma.draw.findMany({
            where: {
                game: 'EUROMILHOES',
                date: { gt: minDate }
            }
        });
        console.log('Missing EuroMillions draws to sync:', missingDraws.length);
    } catch (e) {
        console.log('Prod connection failed:', e.message);
    }
}
check().finally(() => prisma.$disconnect());
