
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
    console.log("🔍 Checking for duplicates in StarSystemPerformance...\n");

    const games = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO'];

    for (const game of games) {
        console.log(`\n📊 Game: ${game}`);
        const duplicates = await prisma.$queryRaw`
            SELECT drawId, systemName, COUNT(*) as count
            FROM star_system_performance
            JOIN Draw ON star_system_performance.drawId = Draw.id
            WHERE Draw.game = ${game}
            GROUP BY drawId, systemName
            HAVING count > 1
            LIMIT 10
        `;

        console.log(`   - Found duplicate groups: ${(duplicates as any[]).length} (showing top 10)`);
        console.table(duplicates);
    }

    await prisma.$disconnect();
}

checkDuplicates().catch(console.error);
