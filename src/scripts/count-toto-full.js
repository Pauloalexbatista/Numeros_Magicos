const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const count = await prisma.systemPerformanceFullPool.count({ where: { systemName: 'Clustering', game: 'TOTOLOTO' } });
    console.log('Clustering Totoloto FullPool:', count);
}
check().finally(() => prisma.$disconnect());
