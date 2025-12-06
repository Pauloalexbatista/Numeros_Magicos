
import { prisma } from '@/lib/prisma';

async function main() {
    console.log("📐 Reordering Dashboard Layout...");

    // 1. Define the desired layout
    // Row 1: Latest Draw (Left) + Recommended Bet (Right)
    // Row 2: Top Systems (Left) + Top Star Systems (Center) + Star Predictions (Right)

    const updates = [
        { key: 'LatestDrawWidget', order: 1, span: 3 },
        { key: 'RecommendedBetWidget', order: 2, span: 3 },
        { key: 'RankingSummaryWidget', order: 3, span: 2 },
        { key: 'TopStarSystemsWidget', order: 4, span: 2 },
        { key: 'StarPredictionWidget', order: 5, span: 2 }
    ];

    // 2. Apply specific updates
    for (const update of updates) {
        // Check if exists first
        const existing = await prisma.dashboardCard.findFirst({
            where: { componentKey: update.key }
        });

        if (existing) {
            await prisma.dashboardCard.update({
                where: { id: existing.id },
                data: {
                    order: update.order,
                    gridSpan: update.span
                }
            });
            console.log(`✅ Updated ${update.key}: Order ${update.order}, Span ${update.span}`);
        } else {
            // If TopStarSystemsWidget doesn't exist yet (it shouldn't), create it
            if (update.key === 'TopStarSystemsWidget') {
                await prisma.dashboardCard.create({
                    data: {
                        componentKey: 'TopStarSystemsWidget',
                        title: 'Top Sistemas Estrelas',
                        description: 'Ranking dos melhores sistemas de estrelas.',
                        icon: '🏆',
                        type: 'FREE',
                        minRole: 'USER',
                        gridSpan: update.span,
                        order: update.order,
                        isActive: true,
                        isNew: true
                    }
                });
                console.log(`✅ Created ${update.key}: Order ${update.order}, Span ${update.span}`);
            } else {
                console.warn(`⚠️ Widget ${update.key} not found to update.`);
            }
        }
    }

    // 3. Shift everything else down
    // Find all active cards that are NOT in our specific list
    const specificKeys = updates.map(u => u.key);
    const otherCards = await prisma.dashboardCard.findMany({
        where: {
            componentKey: { notIn: specificKeys },
            isActive: true
        },
        orderBy: { order: 'asc' }
    });

    // Start ordering from 6
    let nextOrder = 6;
    for (const card of otherCards) {
        await prisma.dashboardCard.update({
            where: { id: card.id },
            data: { order: nextOrder }
        });
        nextOrder++;
    }

    console.log(`✅ Reordered ${otherCards.length} other cards starting from order 6.`);
    console.log("🎉 Dashboard layout updated successfully!");
}

main();
