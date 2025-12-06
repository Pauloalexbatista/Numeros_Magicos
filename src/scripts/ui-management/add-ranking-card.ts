import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Adding Ranking Summary Card to Dashboard...');

    const existing = await prisma.dashboardCard.findFirst({
        where: { componentKey: 'RankingSummaryWidget' }
    });

    if (existing) {
        console.log('Card already exists.');
        return;
    }

    await prisma.dashboardCard.create({
        data: {
            title: 'Ranking de Sistemas',
            description: 'Top 3 sistemas preditivos em tempo real',
            icon: '🏆',
            componentKey: 'RankingSummaryWidget',
            gridSpan: 1,
            order: 2, // Place it early
            isActive: true,
            minRole: 'USER',
            price: 0,
            config: '{}'
        }
    });

    console.log('Card added successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
