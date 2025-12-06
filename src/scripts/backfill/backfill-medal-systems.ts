import { backfillRankings } from '../../services/ranking';
import { prisma } from '../../lib/prisma';

async function main() {
    console.log('🏅 Starting Medal Systems Backfill...');
    console.log('This process will calculate rankings for all systems based on the last 100 draws.');
    console.log('It uses batch processing to avoid blocking the system.');

    try {
        // Run backfill for last 100 draws (more robust history for medals)
        await backfillRankings(100);
        console.log('✅ Medal Systems Backfill complete!');
    } catch (error) {
        console.error('❌ Error backfilling medal systems:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
