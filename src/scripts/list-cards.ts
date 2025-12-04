import { prisma } from '../lib/prisma';

async function main() {
    const cards = await prisma.dashboardCard.findMany({
        orderBy: { order: 'asc' }
    });

    console.log('--- Dashboard Cards ---');
    cards.forEach(c => {
        console.log(`[${c.minRole}] ${c.title} (Key: ${c.componentKey}) - Active: ${c.isActive}`);
    });
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
