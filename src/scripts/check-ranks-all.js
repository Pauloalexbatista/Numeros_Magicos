const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const systems = await prisma.systemRanking.findMany({ where: { game: 'TOTOLOTO' }, orderBy: { avgAccuracy: 'desc' } });
    console.log(systems);
}
check().finally(() => prisma.$disconnect());
