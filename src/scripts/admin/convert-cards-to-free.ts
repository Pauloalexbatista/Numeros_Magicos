// Script to convert all PRO cards to FREE (except ADMIN cards)
// Run with: npx tsx src/scripts/admin/convert-cards-to-free.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function convertCardsToFree() {
    console.log('🔄 Converting PRO cards to FREE...\n');

    // Update all PRO cards to FREE, keeping ADMIN cards unchanged
    const result = await prisma.dashboardCard.updateMany({
        where: {
            type: 'PRO'
        },
        data: {
            type: 'FREE',
            minRole: 'USER'
        }
    });

    console.log(`✅ Converted ${result.count} cards from PRO to FREE\n`);

    // Show summary
    const summary = await prisma.dashboardCard.groupBy({
        by: ['type'],
        _count: true
    });

    console.log('📊 Current card distribution:');
    summary.forEach(group => {
        console.log(`  ${group.type}: ${group._count} cards`);
    });

    console.log('\n✅ Migration complete!');
}

convertCardsToFree()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
