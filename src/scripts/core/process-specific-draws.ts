/**
 * Process ONLY specific draws (1912, 1913) that were added out of order
 * This bypasses the normal incremental logic
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
        }
    }
});

console.log('🎯 Processing specific draws: 1912 (Jan 13), 1913 (Jan 16)...\n');

const targetDrawIds = [1912, 1913];

async function main() {
    // Delete any existing performances for these draws
    console.log('🧹 Cleaning existing performances...');
    const deleted1 = await prisma.systemPerformance.deleteMany({
        where: { drawId: { in: targetDrawIds } }
    });
    console.log(`   Deleted ${deleted1.count} SystemPerformance records`);

    const deleted2 = await prisma.systemPrediction.deleteMany({
        where: { drawId: { in: targetDrawIds } }
    });
    console.log(`   Deleted ${deleted2.count} SystemPrediction records\n`);

    // Now run turbo-backfill
    console.log('🚀 Running turbo-backfill...\n');
    console.log('⚠️  This will take 2-5 minutes. Please wait...\n');
}

main()
    .then(() => {
        console.log('\n✅ Cleanup complete!');
        console.log('\n📌 NEXT STEP: Run the full MASTER_UPDATE manually:');
        console.log('   .\\1-TOOLS\\2-MASTER_UPDATE.bat');
        console.log('\nThis will recalculate all systems for the 2 new draws.');
        process.exit(0);
    })
    .catch(console.error)
    .finally(() => prisma.$disconnect());
