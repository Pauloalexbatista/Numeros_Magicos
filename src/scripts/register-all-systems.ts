
import { PrismaClient } from '@prisma/client';
import { BASE_NUMBER_SYSTEMS, BASE_STAR_SYSTEMS, getSystemNameForGame } from '../services/system-registry';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 REGISTERING ALL SYSTEMS FOR ALL GAMES...");

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n🎮 Processing ${game}...`);

        // 1. Register Number Systems
        console.log(`   🔢 Number Systems (${BASE_NUMBER_SYSTEMS.length}):`);
        for (const sys of BASE_NUMBER_SYSTEMS) {
            const finalName = getSystemNameForGame(sys.name, game);

            try {
                await prisma.rankedSystem.upsert({
                    where: { name: finalName },
                    update: {
                        description: sys.description,
                        isActive: true,
                        game: game,
                        domain: 'NUMBERS'
                    },
                    create: {
                        name: finalName,
                        description: sys.description,
                        isActive: true,
                        game: game,
                        domain: 'NUMBERS',
                        systemType: 'BASE'
                    }
                });
                console.log(`      ✅ ${finalName}`);
            } catch (error) {
                console.error(`      ❌ Error ${finalName}:`, error.message);
            }
        }

        // 2. Register Star Systems
        console.log(`   ⭐ Star Systems (${BASE_STAR_SYSTEMS.length}):`);
        for (const sys of BASE_STAR_SYSTEMS) {
            const finalName = getSystemNameForGame(sys.name, game);

            try {
                await prisma.rankedSystem.upsert({
                    where: { name: finalName },
                    update: {
                        description: sys.description,
                        isActive: true,
                        game: game,
                        domain: 'STARS'
                    },
                    create: {
                        name: finalName,
                        description: sys.description,
                        isActive: true,
                        game: game,
                        domain: 'STARS',
                        systemType: 'BASE'
                    }
                });
                console.log(`      ✅ ${finalName}`);
            } catch (error) {
                console.error(`      ❌ Error ${finalName}:`, error.message);
            }
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
