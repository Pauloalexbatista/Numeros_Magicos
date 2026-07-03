const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const p1 = await prisma.systemRanking.findFirst({ where: { systemName: 'Diagonais da Matriz', game: 'TOTOLOTO' } });
    console.log('Local TOTOLOTO Diagonais da Matriz:', p1);
}
check().finally(() => prisma.$disconnect());
