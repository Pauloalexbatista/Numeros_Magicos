
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listSystemNames() {
    console.log('Listing all Star System Names...');
    const systems = await prisma.starSystemRanking.findMany({
        select: { systemName: true }
    });

    const names = systems.map(s => s.systemName).sort();
    console.log(`Found ${names.length} systems:`);
    names.forEach(n => console.log(` - ${n}`));
}

listSystemNames()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
