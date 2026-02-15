
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("📊 Counting Active Systems per Game...");

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];
    const domains = ['NUMBERS', 'STARS'];

    for (const game of games) {
        console.log(`\n🎮 ${game}:`);
        for (const domain of domains) {
            const count = await prisma.rankedSystem.count({
                where: {
                    isActive: true, // Only active ones
                    game: game,
                    domain: domain
                }
            });
            console.log(`   - ${domain}: ${count} systems`);

            if (count > 0) {
                const systems = await prisma.rankedSystem.findMany({
                    where: { isActive: true, game, domain },
                    select: { name: true }
                });
                // console.log(systems.map(s => s.name)); // Optional: verify names
            }
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
