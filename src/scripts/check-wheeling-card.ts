import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCard() {
    const card = await prisma.dashboardCard.findFirst({
        where: {
            title: 'Desdobramentos'
        }
    });

    console.log('Card found:', card);

    if (card) {
        console.log('\n✅ Card exists in database');
        console.log('- isActive:', card.isActive);
        console.log('- type:', card.type);
        console.log('- minRole:', card.minRole);
        console.log('- order:', card.order);
    } else {
        console.log('\n❌ Card NOT found in database');
        console.log('Need to run seed script');
    }

    await prisma.$disconnect();
}

checkCard();
