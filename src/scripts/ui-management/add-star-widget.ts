
import { prisma } from '@/lib/prisma';

async function main() {
    console.log("⭐ Adding Star Prediction Widget...");

    const existing = await prisma.dashboardCard.findFirst({
        where: { componentKey: 'StarPredictionWidget' }
    });

    if (existing) {
        console.log("✅ Widget already exists.");
        return;
    }

    // Find the minimum order to place it at the top
    const minOrder = await prisma.dashboardCard.findFirst({
        orderBy: { order: 'asc' }
    });

    const newOrder = (minOrder?.order || 0) - 1;

    await prisma.dashboardCard.create({
        data: {
            componentKey: 'StarPredictionWidget',
            title: 'Previsões de Estrelas',
            description: 'Sugestões de Ouro, Momento e Racional.',
            icon: '⭐',
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
