import { prisma } from '../lib/prisma';

async function main() {
    const cards = await prisma.dashboardCard.findMany({
        where: {
            title: { in: ['Debug Database', 'Gestão de Cartões', 'Admin Dashboard'] }
        }
    });

    console.log('--- Hidden Admin Cards Config ---');
    cards.forEach(c => {
        console.log(`Title: ${c.title}`);
        console.log(`Component: ${c.componentKey}`);
        console.log(`Config: ${c.config}`);
        console.log('---');
    });
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
