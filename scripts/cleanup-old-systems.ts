/**
 * Cleanup Old Systems
 * 
 * Removes all old/disabled systems from the database:
 * - Anti-systems
 * - Ensemble systems (Medalhas, Quarteto, Consensus)
 * - ML systems (LSTM, Random Forest, etc.)
 * 
 * Keeps only the 24 active base systems (12 numbers + 12 stars)
 */

import { PrismaClient } from '@prisma/client';
import { numberBaseSystems } from '../src/services/ranked-systems';
import { starBaseSystems } from '../src/services/star-systems';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning up old systems...\n');

    // Get list of current active systems
    const activeSystems = [
        ...numberBaseSystems.map(s => s.name),
        ...starBaseSystems.map(s => s.name)
    ];

    console.log(`✅ Active systems (${activeSystems.length}):`);
    activeSystems.forEach(name => console.log(`  - ${name}`));

    // Find all systems in database
    const allCached = await prisma.cachedPrediction.findMany({ select: { systemName: true } });
    const allRankings = await prisma.systemRanking.findMany({ select: { systemName: true } });
    const allPredictions = await prisma.systemPrediction.findMany({
        select: { systemName: true },
        distinct: ['systemName']
    });

    const allSystemNames = new Set([
        ...allCached.map(c => c.systemName),
        ...allRankings.map(r => r.systemName),
        ...allPredictions.map(p => p.systemName)
    ]);

    // Find systems to delete
    const toDelete = Array.from(allSystemNames).filter(name => !activeSystems.includes(name));

    if (toDelete.length === 0) {
        console.log('\n✅ No old systems to delete!');
        return;
    }

    console.log(`\n❌ Old systems to delete (${toDelete.length}):`);
    toDelete.forEach(name => console.log(`  - ${name}`));

    console.log('\n🗑️  Deleting...');

    // Delete from all tables
    const deletedPredictions = await prisma.systemPrediction.deleteMany({
        where: { systemName: { in: toDelete } }
    });

    const deletedCached = await prisma.cachedPrediction.deleteMany({
        where: { systemName: { in: toDelete } }
    });

    const deletedRankings = await prisma.systemRanking.deleteMany({
        where: { systemName: { in: toDelete } }
    });

    console.log(`\n✅ Cleanup complete!`);
    console.log(`  - SystemPrediction: ${deletedPredictions.count} deleted`);
    console.log(`  - CachedPrediction: ${deletedCached.count} deleted`);
    console.log(`  - SystemRanking: ${deletedRankings.count} deleted`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
