import { prisma } from '../lib/prisma';

async function main() {
    console.log('🌟 Adding Star LSTM Card to Dashboard...');

    const existing = await prisma.dashboardCard.findFirst({
        where: { componentKey: 'StarLSTMClient' }
    });

    if (existing) {
        console.log('Update existing card...');
        await prisma.dashboardCard.update({
            where: { id: existing.id },
            data: {
                title: 'Rede Neuronal (Estrelas)',
                description: 'Previsão de estrelas baseada em Deep Learning (LSTM)',
                icon: 'FaBrain',
                gridSpan: 2,
                type: 'FREE',
                isActive: true
            }
        });
        console.log(`✅ Card updated with ID: ${existing.id}`);
    } else {
        console.log('Creating new card...');
        const newCard = await prisma.dashboardCard.create({
            data: {
                componentKey: 'StarLSTMClient',
                title: 'Rede Neuronal (Estrelas)',
                description: 'Previsão de estrelas baseada em Deep Learning (LSTM)',
                icon: 'FaBrain',
                gridSpan: 2,
                type: 'FREE',
                isActive: true
            }
        });
        console.log(`✅ Card created with ID: ${newCard.id}`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
