const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const systems = ['Clustering', 'Diagonais da Matriz', 'PyramidPascal', 'Hot Numbers'];
    for (const s of systems) {
        const count = await prisma.systemPerformance.count({ where: { systemName: s, game: 'TOTOLOTO' } });
        console.log(s, count);
    }
}
check().finally(() => prisma.$disconnect());
