import { prisma } from '../lib/prisma';

async function main() {
    console.log('🎨 Updating Dashboard Layout...');

    // 1. Move Recommended Bet to the end
    await prisma.dashboardCard.updateMany({
        where: { componentKey: 'RecommendedBetWidget' },
        data: { order: 99 }
    });
    console.log('✅ Recommended Bet moved to end.');

    // 2. Make Latest Draw full width and top
    await prisma.dashboardCard.updateMany({
        where: { componentKey: 'LatestDrawWidget' },
        data: {
            gridSpan: 6, // Full width (assuming max cols is 6)
            order: 1
        }
    });
    console.log('✅ Latest Draw set to full width and top.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
