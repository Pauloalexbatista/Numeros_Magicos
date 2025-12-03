import { prisma } from '../lib/prisma';

async function main() {
    console.log('💰 Setting Card Price...');

    // Update Star LSTM to be a paid card for USERS
    const card = await prisma.dashboardCard.updateMany({
        where: { componentKey: 'StarLSTMClient' },
        data: {
            minRole: 'USER', // Allow users to see it (but locked)
            price: 4.99,      // Set price
            type: 'PREMIUM_PURCHASE'
        }
    });

    console.log(`Updated ${card.count} cards.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
