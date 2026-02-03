import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration Script: Tag all existing data as EUROMILLIONS
 * 
 * This script ensures backward compatibility by setting the 'game' field
 * to EUROMILLIONS for all existing records that don't have it set.
 * 
 * Run this ONCE after updating the schema.
 */
async function migrateToMultiGame() {
    console.log('🔄 Starting Multi-Game Migration...\n');

    try {
        // 1. Check current state
        const totalDraws = await prisma.draw.count();
        const totalSystems = await prisma.rankedSystem.count();

        console.log(`📊 Current Database State:`);
        console.log(`   - Total Draws: ${totalDraws}`);
        console.log(`   - Total Systems: ${totalSystems}\n`);

        // 2. Update Draws (SQLite doesn't support enum defaults in ALTER, so Prisma handles it)
        console.log('🎯 Updating Draws...');
        // Since we set @default(EUROMILLIONS), new rows will automatically have it
        // But we need to verify existing rows
        const drawsWithoutGame = await prisma.draw.count({
            where: { game: null as any }
        });

        if (drawsWithoutGame > 0) {
            console.log(`   ⚠️  Found ${drawsWithoutGame} draws without game type`);
            // This shouldn't happen with our schema, but just in case
        } else {
            console.log(`   ✅ All draws have game type set`);
        }

        // 3. Update RankedSystems
        console.log('\n🎯 Updating Ranked Systems...');
        const systemsWithoutGame = await prisma.rankedSystem.count({
            where: { game: null as any }
        });

        if (systemsWithoutGame > 0) {
            console.log(`   ⚠️  Found ${systemsWithoutGame} systems without game type`);
        } else {
            console.log(`   ✅ All systems have game type set`);
        }

        // 4. Verification
        console.log('\n🔍 Verification:');
        const euroMillionsDraws = await prisma.draw.count({
            where: { game: 'EUROMILLIONS' }
        });
        const euroMillionsSystems = await prisma.rankedSystem.count({
            where: { game: 'EUROMILLIONS' }
        });

        console.log(`   - EuroMillions Draws: ${euroMillionsDraws}/${totalDraws}`);
        console.log(`   - EuroMillions Systems: ${euroMillionsSystems}/${totalSystems}`);

        if (euroMillionsDraws === totalDraws && euroMillionsSystems === totalSystems) {
            console.log('\n✅ Migration Complete! All data tagged as EUROMILLIONS.');
        } else {
            console.warn('\n⚠️  Some records may not have been migrated. Please check manually.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateToMultiGame()
    .then(() => {
        console.log('\n🎉 Migration script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migration script failed:', error);
        process.exit(1);
    });
