import { prisma } from '../lib/prisma';

async function main() {
    console.log('🌟 Adding Star LSTM Card to Dashboard...');

    const card = await prisma.dashboardCard.upsert({
        where: { componentKey: 'StarLSTMClient' },
        update: {
            title: 'Rede Neuronal (Estrelas)',
            description: 'Previsão de estrelas baseada em Deep Learning (LSTM)',
            isActive: true,
            minRole: 'ADMIN', // Restricted to ADMIN as requested
            order: 5
        },
        create: {
            title: 'Rede Neuronal (Estrelas)',
            description: 'Previsão de estrelas baseada em Deep Learning (LSTM)',
            componentKey: 'StarLSTMClient',
            isActive: true,
            minRole: 'ADMIN', // Restricted to ADMIN as requested
            order: 5
        }
    });

    console.log(`✅ Card '${card.title}' added/updated with ID: ${card.id}`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
