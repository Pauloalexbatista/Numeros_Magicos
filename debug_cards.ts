
import { prisma } from './src/lib/prisma';

async function main() {
    const cards = await prisma.dashboardCard.findMany({
        orderBy: { order: 'asc' }
    });
    console.log('Total Cards:', cards.length);
    console.table(cards.map(c => ({
        id: c.id,
        title: c.title,
        key: c.componentKey,
        active: c.isActive,
        role: c.minRole
    })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
