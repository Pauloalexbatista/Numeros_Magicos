const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const p1 = await prisma.systemPerformance.findFirst({ where: { systemName: 'Diagonais da Matriz' } });
    console.log(p1);
    
    const p2 = await prisma.systemPerformance.findFirst({ where: { systemName: 'Clustering' } });
    console.log(p2);
}
check().finally(() => prisma.$disconnect());
