
import { prisma } from '@/lib/prisma';

async function main() {
    console.log("🍀 Adding Recommended Bet Widget...");

    const existing = await prisma.dashboardCard.findFirst({
        where: { componentKey: 'RecommendedBetWidget' }
    });

    if (existing) {
        console.log("✅ Widget already exists.");
        // Optional: Update position to be at the very top
        await prisma.dashboardCard.update({
            where: { id: existing.id },
            data: { order: -2 } // Ensure it's above everything else
        });
        console.log("✅ Position updated to top.");
        return;
    }

    // Find the minimum order to place it at the top
    const minOrder = await prisma.dashboardCard.findFirst({
        orderBy: { order: 'asc' }
    });

    const newOrder = (minOrder?.order || 0) - 2; // Make it the absolute first

    await prisma.dashboardCard.create({
        data: {
            componentKey: 'RecommendedBetWidget',
            title: 'Aposta Recomendada',
            description: 'Sugestão completa para o próximo sorteio.',
            icon: '🍀',
            type: 'FREE',
            minRole: 'USER',
            gridSpan: 2,
            order: newOrder,
            isActive: true,
            isNew: true
        }
    });

    console.log("✅ Widget created successfully!");
}

main();
