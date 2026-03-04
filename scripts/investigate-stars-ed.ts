import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const lastED = await prisma.draw.findFirst({ where: { game: 'EURODREAMS' }, orderBy: { date: 'desc' } });
    if (!lastED) return;

    console.log("=== STARS CHECK ===");
    const starPerfs = await prisma.starSystemPerformance.findMany({ where: { drawId: lastED.id } });
    console.log("Star Perfs count:", starPerfs.length);
    if (starPerfs.length > 0) {
        starPerfs.slice(0, 3).forEach(p => console.log(`${p.systemName}: ${p.hits} hits (Expected: ${p.actualNumbers})`));
    } else {
        console.log("NO STAR PERFORMANCES FOUND FOR LAST EURODREAMS DRAW.");
        // How about other draws?
        const total = await prisma.starSystemPerformance.count({ where: { game: 'EURODREAMS' } });
        console.log("Total EuroDreams Star System Performances:", total);
    }
}
main().finally(() => prisma.$disconnect());
