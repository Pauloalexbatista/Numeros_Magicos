import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Adding Latest Draw Card to Dashboard...');

    const existing = await prisma.dashboardCard.findFirst({
        where: { componentKey: 'LatestDrawWidget' }
    });

    if (existing) {
        console.log('Card already exists.');
        // Update order to be 1
        await prisma.dashboardCard.update({
            where: { id: existing.id },
            data: { order: 1, isActive: true }
        });
        console.log('Updated order to 1.');
        return;
    }

    await prisma.dashboardCard.create({
        data: {
            title: 'Último Sorteio',
            description: 'Resultados do sorteio mais recente',
            icon: '🎰',
            componentKey: 'LatestDrawWidget',
            gridSpan: 1,
            order: 1, // First position
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
