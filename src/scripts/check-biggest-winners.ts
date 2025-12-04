
import { prisma } from '@/lib/prisma';

async function main() {
    console.log("🏆 Analyzing Biggest Winners (Last 100 Draws)...");

    // 1. Analyze Number Systems (5 Hits)
    console.log("\n🔢 Number Systems (5 Hits - Jackpot):");
    const numberSystems = await prisma.rankedSystem.findMany({ where: { isActive: true } });

    for (const sys of numberSystems) {
        const hits5 = await prisma.systemPerformance.count({
            where: {
                systemName: sys.name,
                hits: 5
            }
        });

        const hits4 = await prisma.systemPerformance.count({
            where: {
                systemName: sys.name,
                hits: 4
            }
        });

        if (hits5 > 0 || hits4 > 0) {
            console.log(`   - ${sys.name}: ${hits5} Jackpots (5 hits) | ${hits4} Near Misses (4 hits)`);
        }
    }

    // 2. Analyze Star Systems (2 Hits)
    console.log("\n⭐ Star Systems (2 Hits - Jackpot):");
    const starSystems = await prisma.starSystemRanking.findMany();

    for (const sys of starSystems) {
        const hits2 = await prisma.starSystemPerformance.count({
            where: {
                systemName: sys.systemName,
                hits: 2
            }
        });

        console.log(`   - ${sys.systemName}: ${hits2} Jackpots (2 stars)`);
    }
}

main();
