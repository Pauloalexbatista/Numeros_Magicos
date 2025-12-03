import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Dashboard Layout (3+1 Split)...');

    // 1. Update Latest Draw to span 3 columns
    await prisma.dashboardCard.updateMany({
        where: { componentKey: 'LatestDrawWidget' },
        data: {
            gridSpan: 3,
            order: 1
        }
    });
    console.log('✅ Latest Draw: Grid Span 3, Order 1');

    // 2. Update Ranking Summary to span 1 column
    await prisma.dashboardCard.updateMany({
        where: { componentKey: 'RankingSummaryWidget' },
        data: {
            gridSpan: 1,
            order: 2
        }
    });
    console.log('✅ Ranking Summary: Grid Span 1, Order 2');

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
