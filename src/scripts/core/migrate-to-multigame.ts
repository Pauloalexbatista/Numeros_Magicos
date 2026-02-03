
import { prisma } from '@/lib/prisma';
import { GameType } from '@/types/game';

async function main() {
    console.log("Starting DB migration to EuroMillions...");

    // 1. Update all Draws
    const draws = await prisma.draw.updateMany({
        data: { game: 'EUROMILLIONS' }
    });
    console.log(`Updated ${draws.count} draws to EUROMILLIONS.`);

    // 2. Update RankedSystems
    const systems = await prisma.rankedSystem.updateMany({
        data: { game: 'EUROMILLIONS' }
    });
    console.log(`Updated ${systems.count} systems to EUROMILLIONS.`);

    console.log("Migration complete.");
}

main().catch(console.error);
