import { prisma } from '../lib/prisma';

async function main() {
    console.log('🧠 Adding LSTM Card to Dashboard...');

    // 1. Check if already exists
    const existing = await prisma.dashboardCard.findFirst({
        where: { componentKey: 'LSTMClient' }
    });

    if (existing) {
        console.log('⚠️ Card already exists.');
        return;
    }

    // 2. Determine Order (Last)
    const lastCard = await prisma.dashboardCard.findFirst({
        orderBy: { order: 'desc' }
    });
    const newOrder = (lastCard?.order || 0) + 1;

    // 3. Create Card
    await prisma.dashboardCard.create({
        data: {
            title: 'Rede Neuronal (LSTM)',
            description: 'Previsão baseada em Deep Learning e memória temporal.',
            componentKey: 'LSTMClient',
            icon: 'Brain',
            gridSpan: 2, // Take 2 columns
            order: newOrder,
            isActive: true,
            minRole: 'PRO', // Premium feature
            price: 0,
            config: JSON.stringify({ variant: 'dark' })
        }
    });

    console.log('✅ LSTM Card added successfully!');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
