
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseTotoloto2026() {
    console.log('🔍 Diagnosing TOTOLOTO 2026 Data...');

    const start2026 = new Date('2026-01-01T00:00:00.000Z');
    const end2026 = new Date('2026-12-31T23:59:59.999Z');

    // 1. Get Totoloto Draws 2026
    const draws2026 = await prisma.draw.findMany({
        where: {
            game: 'TOTOLOTO',
            date: {
                gte: start2026,
                lte: end2026
            }
        },
        select: { id: true, date: true, numbers: true }
    });

    console.log(`\n📅 Totoloto Draws in 2026: ${draws2026.length}`);
    const drawIds = draws2026.map(d => d.id);

    if (draws2026.length === 0) {
        console.log('❌ No draws found for 2026!');
        return;
    }

    // 2. Check for any High Prizes (4 or 5 hits) in Totoloto 2026
    // In Totoloto: 5 is Jackpot, 4 is 2nd Prize/High Prize (usually, depending on logic used in aggregation)
    // The aggregation logic uses: 5 = Jackpot, 4 = High Prize

    const bestPerfs = await prisma.systemPerformance.findMany({
        where: {
            drawId: { in: drawIds },
            hits: { gte: 4 }
        },
        select: { systemName: true, hits: true, draw: { select: { date: true } } }
    });

    console.log(`\n🏆 Any System with 4+ hits in Totoloto 2026?`);
    if (bestPerfs.length === 0) {
        console.log('❌ NO. Highest outcome for all systems is 3 or less.');

        // Find the absolute max hits
        const allPerfs = await prisma.systemPerformance.findMany({
            where: { drawId: { in: drawIds } },
            select: { hits: true },
            orderBy: { hits: 'desc' },
            take: 1
        });
        if (allPerfs.length > 0) {
            console.log(`ℹ️ Absolute Max Hits in 2026: ${allPerfs[0].hits}`);
        }

    } else {
        bestPerfs.forEach(p => console.log(` - ${p.systemName} (${p.draw.date.toISOString().split('T')[0]}): ${p.hits} hits`));
    }
}

diagnoseTotoloto2026()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
