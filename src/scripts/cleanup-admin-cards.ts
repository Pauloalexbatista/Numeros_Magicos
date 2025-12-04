import { prisma } from '../lib/prisma';

async function main() {
    console.log('🧹 Cleaning up Admin Cards from Dashboard...');

    const cardsToHide = [
        'Debug Database',
        'Gestão de Cartões',
        'Admin Dashboard' // The card link, not the page
    ];

    const result = await prisma.dashboardCard.updateMany({
        where: {
            title: { in: cardsToHide }
        },
        data: {
            isActive: false
        }
    });

    console.log(`Hidden ${result.count} admin cards.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
