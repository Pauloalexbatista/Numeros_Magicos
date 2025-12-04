import { commitStagingToProduction } from '../services/staging-backfill';
import { prisma } from '../lib/prisma';

async function main() {
    const args = process.argv.slice(2);
    const systemName = args[0];

    if (!systemName) {
        console.error('❌ Please provide a system name.');
        console.error('Usage: npx tsx src/scripts/commit-staging.ts "System Name"');
        process.exit(1);
    }

    try {
        await commitStagingToProduction(systemName);
    } catch (error) {
        console.error('❌ Error during commit:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
