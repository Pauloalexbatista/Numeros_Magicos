import { backfillRankings } from '../../services/ranking';
import { prisma } from '../../lib/prisma';

async function main() {
    console.log('🌱 Seeding Ranked Systems and Backfilling Performance...');

    try {
        // Run backfill for last 50 draws
        await backfillRankings(50);
        console.log('✅ Seeding complete!');
    } catch (error) {
        console.error('❌ Error seeding ranking:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
