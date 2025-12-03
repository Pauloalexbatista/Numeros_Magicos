
import { prisma } from '@/lib/prisma';

async function main() {
    console.log("📐 Updating Dashboard Layout Sizes...");

    // Row 1: Latest Draw (4) + Recommended Bet (2) = 6
    await prisma.dashboardCard.updateMany({
        where: { componentKey: 'LatestDrawWidget' },
        data: { gridSpan: 4 }
    });

    await prisma.dashboardCard.updateMany({
        where: { componentKey: 'RecommendedBetWidget' },
        data: { gridSpan: 2 }
    });

    console.log("✅ Layout sizes updated: Draw (4), Bet (2).");
}

main();
