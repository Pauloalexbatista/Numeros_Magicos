
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking EuroDreams Star Systems...");

    // 1. Count Active
    const count = await prisma.rankedSystem.count({
        where: {
            game: 'EURODREAMS',
            domain: 'STARS',
            isActive: true
        }
    });
    console.log(`Active Count: ${count}`);

    // 2. List All Registered for EuroDreams Stars
    const all = await prisma.rankedSystem.findMany({
        where: {
            game: 'EURODREAMS',
            domain: 'STARS'
        },
        select: { name: true, isActive: true }
    });

    console.log("\n📋 System List:");
    all.forEach(s => console.log(`   ${s.isActive ? '✅' : '❌'} ${s.name}`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
