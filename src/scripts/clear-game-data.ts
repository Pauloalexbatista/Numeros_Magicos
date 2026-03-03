
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const GAME = args[0]?.toUpperCase();

    if (!GAME) {
        console.error("Please provide a game name (EUROMILLIONS, TOTOLOTO, EURODREAMS)");
        process.exit(1);
    }

    console.log(`🗑️  Clearing data for ${GAME}...`);

    // Delete System Predictions
    const { count: predCount } = await prisma.systemPrediction.deleteMany({
        where: { draw: { game: GAME } }
    });
    console.log(`Deleted ${predCount} SystemPredictions.`);

    // Delete System Performance
    const { count: perfCount } = await prisma.systemPerformance.deleteMany({
        where: { draw: { game: GAME } }
    });
    console.log(`Deleted ${perfCount} SystemPerformances.`);

    // Delete System Rankings (associated with this game)
    // Rankings don't have a game field directly on the model in some versions, 
    // but they link to RankedSystem which has 'game'.
    // Let's check schema. SystemRanking -> RankedSystem.

    // We can delete SystemRanking where system.game = GAME
    const rankings = await prisma.systemRanking.findMany({
        where: { system: { game: GAME } },
        select: { id: true }
    });

    if (rankings.length > 0) {
        const { count: rankCount } = await prisma.systemRanking.deleteMany({
            where: { id: { in: rankings.map(r => r.id) } }
        });
        console.log(`Deleted ${rankCount} SystemRankings.`);
    }

    // Reset RankedSystems? Optional.
    // If we delete RankedSystems, we lose 'isActive' status or descriptions if manual.
    // But turbo-backfill recreates them.
    // Let's keep them but maybe reset their state if needed? 
    // Actually, simply deleting performance/predictions is enough to force backfill.

    console.log(`✅ Data cleared for ${GAME}. Ready for backfill.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
