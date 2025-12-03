import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔒 Locking Premium Cards...');

    // List of titles to lock
    const premiumTitles = [
        'Laboratório ML',
        'Simulador ROI',
        'Desdobramentos',
        'Análise Posicional',
        'Monte Carlo',
        'Cadeias Markov',
        'Clustering',
        'Detecção Padrões',
        'Matrix Binária',
        'Vortex Pyramid',
        'LSTM Neural Net',
        'Random Forest'
    ];

    for (const title of premiumTitles) {
        const result = await prisma.dashboardCard.updateMany({
            where: { title },
            data: {
                price: 9.99,
                minRole: 'USER', // Ensure they are visible to users but locked
                type: 'PREMIUM_PURCHASE'
            }
        });
        console.log(`   Updated ${title}: ${result.count} cards locked.`);
    }

    console.log('✅ Premium cards locked (Price set to 9.99).');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
