import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting System Consolidation Migration...\n');

    // 1. Get all ranked systems
    const systems = await prisma.rankedSystem.findMany();
    console.log(`Found ${systems.length} systems in RankedSystem table.`);

    for (const sys of systems) {
        let game = 'EUROMILLIONS';
        let cleanName = sys.name;

        if (sys.name.includes('_TOTOLOTO')) {
            game = 'TOTOLOTO';
            cleanName = sys.name.replace('_TOTOLOTO', '');
        } else if (sys.name.includes('_EURODREAMS')) {
            game = 'EURODREAMS';
            cleanName = sys.name.replace('_EURODREAMS', '');
        }

        if (game !== 'EUROMILLIONS' || sys.name !== cleanName) {
            console.log(`📦 Consolidating: "${sys.name}" -> name: "${cleanName}", game: "${game}"`);

            try {
                // We need to be careful with unique constraints.
                // Since name+game is now unique, we can update the existing record.
                await prisma.rankedSystem.update({
                    where: { id: sys.id },
                    data: {
                        name: cleanName,
                        game: game
                    }
                });

                // Update related predictions and rankings
                // Note: In the new schema, these tables also have the 'game' column.
                // We need to update them to match the new system name and game.

                await (prisma as any).cachedPrediction.updateMany({
                    where: { systemName: sys.name },
                    data: {
                        systemName: cleanName,
                        game: game
                    }
                });

                await (prisma as any).systemRanking.updateMany({
                    where: { systemName: sys.name },
                    data: {
                        systemName: cleanName,
                        game: game
                    }
                });

                await (prisma as any).systemPerformance.updateMany({
                    where: { systemName: sys.name },
                    data: {
                        systemName: cleanName,
                        game: game
                    }
                });

                await (prisma as any).systemPerformanceStaging.updateMany({
                    where: { systemName: sys.name },
                    data: {
                        systemName: cleanName,
                        game: game
                    }
                });

                await (prisma as any).starSystemRanking.updateMany({
                    where: { systemName: sys.name },
                    data: {
                        systemName: cleanName,
                        game: game
                    }
                });

                await (prisma as any).starSystemPerformance.updateMany({
                    where: { systemName: sys.name },
                    data: {
                        systemName: cleanName,
                        game: game
                    }
                });

                console.log(`  ✅ Updated related records for ${cleanName} (${game})`);
            } catch (error) {
                console.error(`  ❌ Error updating ${sys.name}:`, error);
            }
        }
    }

    // 2. Fix remaining records that are EUROMILLIONS but were missing the game column data
    // (Prisma default handles this but let's be explicit)
    await (prisma as any).cachedPrediction.updateMany({
        where: { game: { equals: '' } }, // Or whatever condition identifies uninitialized games
        data: { game: 'EUROMILLIONS' }
    });

    await (prisma as any).systemRanking.updateMany({
        where: { game: { equals: '' } },
        data: { game: 'EUROMILLIONS' }
    });

    await (prisma as any).systemPerformance.updateMany({
        where: { game: { equals: '' } },
        data: { game: 'EUROMILLIONS' }
    });

    await (prisma as any).systemPerformanceStaging.updateMany({
        where: { game: { equals: '' } },
        data: { game: 'EUROMILLIONS' }
    });

    await (prisma as any).starSystemRanking.updateMany({
        where: { game: { equals: '' } },
        data: { game: 'EUROMILLIONS' }
    });

    await (prisma as any).starSystemPerformance.updateMany({
        where: { game: { equals: '' } },
        data: { game: 'EUROMILLIONS' }
    });

    console.log('\n✅ Migration complete!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
