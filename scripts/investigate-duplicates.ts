import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    console.log("=== DUPLICATES CHECK ===");
    const lastED = await prisma.draw.findFirst({ where: { game: 'EURODREAMS' }, orderBy: { date: 'desc' } });
    if (lastED) {
        console.log("Last Draw EuroDreams:", lastED.drawNumber);
        const perfs = await prisma.systemPerformance.findMany({ where: { drawId: lastED.id } });

        const counts: Record<string, number> = {};
        for (const p of perfs) counts[p.systemName] = (counts[p.systemName] || 0) + 1;

        Object.entries(counts).forEach(([name, c]) => { if (c > 1) console.log(`${name}: ${c} occurrences!`) });
    }
}
main().finally(() => prisma.$disconnect());
