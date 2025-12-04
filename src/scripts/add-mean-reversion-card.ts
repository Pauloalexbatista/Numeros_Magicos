import { prisma } from '../lib/prisma';

async function main() {
    console.log('Adding Mean Reversion Card...');

    await prisma.dashboardCard.create({
        data: {
            title: 'Regressão à Média',
            description: 'Analise a força da média e a tensão elástica entre as casas.',
            componentKey: 'MeanReversionCard',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 2, // Wider card
            order: 1, // High priority
            icon: 'TrendingUp',
            isActive: true,
            isNew: true
        }
    });

    console.log('✅ Card added successfully!');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
