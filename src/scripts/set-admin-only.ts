import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔒 Restricting Cards to ADMIN...');

    const cardsToUpdate = [
        'RecommendedBetWidget', // Aposta Recomendada
        'LSTMClient'            // Rede Neural (Números)
    ];

    for (const key of cardsToUpdate) {
        const result = await prisma.dashboardCard.updateMany({
            where: { componentKey: key },
            data: { minRole: 'ADMIN' }
        });
        console.log(`Updated ${key}: ${result.count} cards set to ADMIN.`);
    }

    console.log('✅ Permissions updated.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
