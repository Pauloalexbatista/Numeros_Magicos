import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
    console.log('🧹 Starting cleanup of duplicate SystemPerformance entries...');

    try {
        // 1. Find all duplicates
        // We want to group by drawId and systemName and find counts > 1
        const performances = await prisma.systemPerformance.findMany({
            orderBy: { createdAt: 'desc' } // Newest first
        });

        const seen = new Set<string>();
        const toDelete: number[] = [];

        for (const perf of performances) {
            const key = `${perf.drawId}-${perf.systemName}`;
            if (seen.has(key)) {
                // Already seen a newer one, so this is a duplicate (older)
                toDelete.push(perf.id);
            } else {
                seen.add(key);
            }
        }

        console.log(`Found ${toDelete.length} duplicate entries to delete.`);

        if (toDelete.length > 0) {
            // 2. Delete duplicates
            const result = await prisma.systemPerformance.deleteMany({
                where: {
                    id: { in: toDelete }
                }
            });
            console.log(`✅ Deleted ${result.count} duplicates.`);
        } else {
            console.log('✨ No duplicates found.');
        }

    } catch (error) {
        console.error('❌ Error cleaning up duplicates:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupDuplicates();
