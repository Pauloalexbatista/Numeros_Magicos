import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Dashboard Layout (4+2 Split)...');

    // 1. Update Latest Draw to span 4 columns
    await prisma.dashboardCard.updateMany({
        where: { componentKey: 'LatestDrawWidget' },
        data: {
            gridSpan: 4,
            order: 1
        }
    });
    console.log('✅ Latest Draw: Grid Span 4, Order 1');

    // 2. Update Ranking Summary to span 2 columns
    await prisma.dashboardCard.updateMany({
        where: { componentKey: 'RankingSummaryWidget' },
        data: {
            gridSpan: 2,
            order: 2
        }
    });
    console.log('✅ Ranking Summary: Grid Span 2, Order 2');

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
