const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const systems = await prisma.systemPerformance.groupBy({
        by: ['systemName'],
        where: { game: 'TOTOLOTO', hits: 5 },
        _count: { hits: true }
    });
    console.log(systems);
}
check().finally(() => prisma.$disconnect());
