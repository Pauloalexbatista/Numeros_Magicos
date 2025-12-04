import { runStagingBackfill } from '../services/staging-backfill';
import { prisma } from '../lib/prisma';

async function main() {
    const args = process.argv.slice(2);
    const systemName = args[0];
    const limit = args[1] ? parseInt(args[1]) : undefined;

    if (!systemName) {
        console.error('❌ Please provide a system name.');
        console.error('Usage: npx tsx src/scripts/backfill-staging.ts "System Name" [limit]');
        process.exit(1);
    }

    try {
        await runStagingBackfill(systemName, limit);
    } catch (error) {
        console.error('❌ Error during staging backfill:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
