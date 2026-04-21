import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDuplicates() {
    console.log('🚀 Starting Duplicate Cleanup Process...');

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n🔍 Analyzing duplicates for ${game}...`);

        // Find groups of draws with exactly the same numbers and stars
        // We use these as the "fingerprint" of a unique draw
        const duplicateGroups = await prisma.draw.groupBy({
            by: ['game', 'numbers', 'stars'],
            where: { game },
            _count: { id: true },
            having: {
                id: { _count: { gt: 1 } }
            }
        });

        console.log(`   Found ${duplicateGroups.length} duplicate groups.`);

        for (const group of duplicateGroups) {
            const draws = await prisma.draw.findMany({
                where: {
                    game: group.game,
                    numbers: group.numbers,
                    stars: group.stars
                },
                orderBy: {
                    date: 'desc' // Keep newest or standardized one
                }
            });

            // Strategy: Keep the one that has the standard 12:00:00Z time if it exists
            // Otherwise keep the first one
            let survivor = draws.find(d => d.date.toISOString().endsWith('T12:00:00.000Z')) || draws[0];
            const toDelete = draws.filter(d => d.id !== survivor.id);

            console.log(`   [${game}] Merging ${toDelete.length} duplicates into Draw ID ${survivor.id} (Date: ${survivor.date.toISOString()})`);

            for (const dup of toDelete) {
                console.log(`     -> Processing duplicate ID ${dup.id}...`);

                // 1. Move/Delete SystemPredictions
                const dupPredictions = await prisma.systemPrediction.findMany({ where: { drawId: dup.id } });
                for (const p of dupPredictions) {
                    const exists = await prisma.systemPrediction.findFirst({
                        where: { drawId: survivor.id, systemName: p.systemName, game: p.game }
                    });
                    if (exists) {
                        await prisma.systemPrediction.delete({ where: { id: p.id } });
                    } else {
                        await prisma.systemPrediction.update({ where: { id: p.id }, data: { drawId: survivor.id } });
                    }
                }

                // 2. Move/Delete SystemPerformances
                const dupPerformances = await prisma.systemPerformance.findMany({ where: { drawId: dup.id } });
                for (const p of dupPerformances) {
                    const exists = await prisma.systemPerformance.findFirst({
                        where: { drawId: survivor.id, systemName: p.systemName, game: p.game }
                    });
                    if (exists) {
                        await prisma.systemPerformance.delete({ where: { id: p.id } });
                    } else {
                        await prisma.systemPerformance.update({ where: { id: p.id }, data: { drawId: survivor.id } });
                    }
                }

                // 3. Move/Delete StarSystemPerformances
                const dupStars = await prisma.starSystemPerformance.findMany({ where: { drawId: dup.id } });
                for (const p of dupStars) {
                    const exists = await prisma.starSystemPerformance.findFirst({
                        where: { drawId: survivor.id, systemName: p.systemName, game: p.game }
                    });
                    if (exists) {
                        await prisma.starSystemPerformance.delete({ where: { id: p.id } });
                    } else {
                        await prisma.starSystemPerformance.update({ where: { id: p.id }, data: { drawId: survivor.id } });
                    }
                }

                // 4. Staging (No unique constraint usually, but let's be safe)
                await prisma.systemPerformanceStaging.deleteMany({ where: { drawId: dup.id } });

                // 5. Delete the duplicate draw
                await prisma.draw.delete({
                    where: { id: dup.id }
                });
            }
        }
    }

    console.log('\n✅ Cleanup complete!');
}

cleanDuplicates()
    .catch(e => {
        console.error('💥 Cleanup failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
