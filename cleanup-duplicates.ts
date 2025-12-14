
import { prisma } from './src/lib/prisma';

async function main() {
    console.log('🧹 Cleaning up duplicate SystemPerformance records...');

    // 1. Find duplicates
    // We group by drawId + systemName and count
    const duplicates = await prisma.systemPerformance.groupBy({
        by: ['drawId', 'systemName'],
        _count: {
            id: true
        },
        having: {
            id: {
                _count: {
                    gt: 1
                }
            }
        }
    });

    console.log(`Found ${duplicates.length} combinations with duplicates.`);

    if (duplicates.length === 0) {
        console.log('✅ No duplicates found.');
        return;
    }

    let deletedCount = 0;

    // 2. Delete duplicates
    for (const group of duplicates) {
        const records = await prisma.systemPerformance.findMany({
            where: {
                drawId: group.drawId,
                systemName: group.systemName
            },
            orderBy: { id: 'desc' }, // Keep latest
            select: { id: true }
        });

        // Keep the first one (latest ID), delete the rest
        const toDelete = records.slice(1).map(r => r.id);

        if (toDelete.length > 0) {
            await prisma.systemPerformance.deleteMany({
                where: {
                    id: { in: toDelete }
                }
            });
            deletedCount += toDelete.length;
            process.stdout.write('.');
        }
    }

    console.log(`\n✅ Cleanup complete. Removed ${deletedCount} duplicate records.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
