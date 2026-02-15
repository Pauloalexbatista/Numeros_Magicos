/**
 * Cleanup RankedSystem Table
 * 
 * Removes all old/disabled systems from RankedSystem table
 * Keeps only the 24 active base systems for each game
 */

import { PrismaClient } from '@prisma/client';
import { numberBaseSystems } from '../src/services/ranked-systems';
import { starBaseSystems } from '../src/services/star-systems';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning up RankedSystem table...\n');

    // Active system names (without game suffix)
    const activeBaseNames = [
        ...numberBaseSystems.map(s => s.name),
        ...starBaseSystems.map(s => s.name)
    ];

    console.log(`✅ Active base systems (${activeBaseNames.length}):`);
    activeBaseNames.forEach(name => console.log(`  - ${name}`));

    // Get all systems from database
    const allSystems = await prisma.rankedSystem.findMany({
        select: { name: true, game: true }
    });

    console.log(`\n📊 Total systems in database: ${allSystems.length}`);

    // Determine which to keep and which to delete
    const toKeep: string[] = [];
    const toDelete: string[] = [];

    for (const sys of allSystems) {
        // Extract base name (remove game suffix like "_TOTOLOTO")
        const baseName = sys.name
            .replace(/_TOTOLOTO$/, '')
            .replace(/_EUROMILLIONS$/, '')
            .replace(/_EURODREAMS$/, '')
            .replace(/ \(EuroDreams\)$/, '')
            .replace(/ \(EUROMILLIONS\)$/, '')
            .replace(/ \(TOTOLOTO\)$/, '');

        // Check if it's an active system (not Anti-, not Quarteto, not Consensus, etc.)
        const isActive = activeBaseNames.includes(baseName) &&
            !sys.name.startsWith('Anti-') &&
            !sys.name.includes('Quarteto') &&
            !sys.name.includes('Consensus') &&
            !sys.name.includes('Platinum') &&
            !sys.name.includes('Gold') &&
            !sys.name.includes('Silver') &&
            !sys.name.includes('LSTM') &&
            !sys.name.includes('Machine Learning');

        if (isActive) {
            toKeep.push(sys.name);
        } else {
            toDelete.push(sys.name);
        }
    }

    console.log(`\n✅ Systems to KEEP (${toKeep.length}):`);
    toKeep.slice(0, 10).forEach(name => console.log(`  - ${name}`));
    if (toKeep.length > 10) console.log(`  ... and ${toKeep.length - 10} more`);

    console.log(`\n❌ Systems to DELETE (${toDelete.length}):`);
    toDelete.slice(0, 20).forEach(name => console.log(`  - ${name}`));
    if (toDelete.length > 20) console.log(`  ... and ${toDelete.length - 20} more`);

    if (toDelete.length === 0) {
        console.log('\n✅ No systems to delete!');
        return;
    }

    console.log('\n🗑️  Deleting from dependent tables first...');

    // Delete from SystemPerformance
    const deletedPerformance = await prisma.systemPerformance.deleteMany({
        where: { systemName: { in: toDelete } }
    });
    console.log(`  - SystemPerformance: ${deletedPerformance.count} deleted`);

    // Delete from SystemRanking
    const deletedRanking = await prisma.systemRanking.deleteMany({
        where: { systemName: { in: toDelete } }
    });
    console.log(`  - SystemRanking: ${deletedRanking.count} deleted`);

    // Delete from CachedPrediction
    const deletedCached = await prisma.cachedPrediction.deleteMany({
        where: { systemName: { in: toDelete } }
    });
    console.log(`  - CachedPrediction: ${deletedCached.count} deleted`);

    // Delete from SystemPrediction
    const deletedPredictions = await prisma.systemPrediction.deleteMany({
        where: { systemName: { in: toDelete } }
    });
    console.log(`  - SystemPrediction: ${deletedPredictions.count} deleted`);

    console.log('\n🗑️  Deleting from RankedSystem...');

    const deleted = await prisma.rankedSystem.deleteMany({
        where: { name: { in: toDelete } }
    });

    console.log(`\n✅ Cleanup complete!`);
    console.log(`  - RankedSystem deleted: ${deleted.count} systems`);
    console.log(`  - Remaining: ${toKeep.length} systems`);

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
