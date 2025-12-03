import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Dashboard Layout...');

    // 1. Update Latest Draw to span 4 columns and be first
    await prisma.dashboardCard.updateMany({
        where: { componentKey: 'LatestDrawWidget' },
        data: {
            gridSpan: 4,
            order: 1
        }
    });
    console.log('✅ Latest Draw: Grid Span 4, Order 1');

    // 2. Update Ranking Summary to be second
    // Keeping gridSpan as 1 (or 2 if it needs more space, but 1 is standard for lists)
    // If the user wants them "both at the top", and Latest Draw is full width, 
    // Ranking will naturally fall to the next row, first position.
    await prisma.dashboardCard.updateMany({
        where: { componentKey: 'RankingSummaryWidget' },
        data: {
            order: 2
        }
    });
    console.log('✅ Ranking Summary: Order 2');

    console.log('Layout updated successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
