const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const p1 = await prisma.systemPerformanceFullPool.count({ where: { systemName: 'Diagonais da Matriz' } });
    const p2 = await prisma.systemPerformanceFullPool.count({ where: { systemName: 'Diagonais da Matriz 3D' } });
    
    console.log('Diagonais da Matriz count:', p1);
    console.log('Diagonais da Matriz 3D count:', p2);

    const first = await prisma.systemPerformanceFullPool.findFirst({ where: { systemName: 'Diagonais da Matriz' }});
    console.log('First record date:', first ? first.date : 'none');
}
check().finally(() => prisma.$disconnect());
