const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const count = await prisma.draw.count({ where: { game: 'TOTOLOTO' } });
    console.log('Total draws Totoloto:', count);
}
check().finally(() => prisma.$disconnect());
