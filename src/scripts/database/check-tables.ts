import { prisma } from '../../lib/prisma';

async function check() {
    const tables = await prisma.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.table(tables);
    await prisma.$disconnect();
}
check();
