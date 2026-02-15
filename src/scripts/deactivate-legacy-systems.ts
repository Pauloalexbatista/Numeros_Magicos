
import { PrismaClient } from '@prisma/client';
import { BASE_NUMBER_SYSTEMS, BASE_STAR_SYSTEMS, getSystemNameForGame } from '../services/system-registry';

const prisma = new PrismaClient();

async function cleanup() {
    console.log("🧹 CLEANING UP LEGACY SYSTEMS...");

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];
    const activeNames: string[] = [];

    // 1. Build list of ALL valid system names
    for (const game of games) {
        // Numbers
        for (const sys of BASE_NUMBER_SYSTEMS) {
            activeNames.push(getSystemNameForGame(sys.name, game));
        }
        // Stars
        for (const sys of BASE_STAR_SYSTEMS) {
            activeNames.push(getSystemNameForGame(sys.name, game));
        }
    }

    console.log(`📋 Official Allowed List: ${activeNames.length} systems`);

    // 2. Deactivate anything NOT in the list
    const result = await prisma.rankedSystem.updateMany({
        where: {
            name: {
                notIn: activeNames
            },
            isActive: true
        },
        data: {
            isActive: false
        }
    });

    console.log(`🚫 Deactivated ${result.count} legacy systems.`);

    // 3. Verify final count
    const finalCount = await prisma.rankedSystem.count({ where: { isActive: true } });
    console.log(`✅ Active Systems Remaining: ${finalCount} (Should be 54)`);
}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
