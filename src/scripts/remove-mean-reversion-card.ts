import { prisma } from '../lib/prisma';

async function main() {
    console.log('Removing Mean Reversion Card...');

    await prisma.dashboardCard.deleteMany({
        where: {
            componentKey: 'MeanReversionCard'
        }
    });

    console.log('✅ Card removed successfully!');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
