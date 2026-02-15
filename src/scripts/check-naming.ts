
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking System Naming Conventions...");

    const games = ['TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n🎮 ${game} Systems:`);
        const systems = await prisma.rankedSystem.findMany({
            where: { game, isActive: true },
            select: { name: true, domain: true }
        });
        systems.forEach(s => console.log(`   - [${s.domain}] ${s.name}`));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
