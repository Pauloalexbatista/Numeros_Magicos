
import { prisma } from './src/lib/prisma';

async function checkDuplicates() {
    console.log("Checking for duplicates in SystemPerformance...");

    const duplicates = await prisma.$queryRaw`
        SELECT "drawId", "systemName", COUNT(*) as count
        FROM "system_performance"
        GROUP BY "drawId", "systemName"
        HAVING COUNT(*) > 1
        LIMIT 10;
    `;

    console.log("Duplicate samples:", duplicates);

    const totalStats = await prisma.systemPerformance.count();
    console.log(`Total records: ${totalStats}`);
}

checkDuplicates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
