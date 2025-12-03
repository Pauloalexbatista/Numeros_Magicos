import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const cards = await prisma.dashboardCard.findMany({
        select: {
            title: true,
            type: true,
            isActive: true,
            minRole: true
        }
    });

    console.log('--- Active Cards Check ---');
    console.table(cards);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
