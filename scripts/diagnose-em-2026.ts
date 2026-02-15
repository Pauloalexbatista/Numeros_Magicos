
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseEuromillions2026() {
    console.log('🔍 Diagnosing EUROMILLIONS 2026 Data...');

    const start2026 = new Date('2026-01-01T00:00:00.000Z');
    const end2026 = new Date('2026-12-31T23:59:59.999Z');

    // 1. Get EuroMillions Draws 2026
    const draws2026 = await prisma.draw.findMany({
        where: {
            game: 'EUROMILLIONS',
            date: {
                gte: start2026,
                lte: end2026
            }
        },
        select: { id: true, date: true, numbers: true }
    });

    console.log(`\n📅 EuroMillions Draws in 2026: ${draws2026.length}`);
    const drawIds = draws2026.map(d => d.id);

    // 2. Check System Performance for "Sist Média + 3 Otimizado"
    const systemName = 'Sist Média + 3 Otimizado';
    const perfs = await prisma.systemPerformance.findMany({
        where: {
            drawId: { in: drawIds },
            systemName: systemName
        },
        select: { hits: true, draw: { select: { date: true } } }
    });

    console.log(`\n📊 Performance for ${systemName}:`);
    perfs.forEach(p => {
        console.log(` - ${p.draw.date.toISOString().split('T')[0]}: ${p.hits} hits`);
    });

    const maxHits = perfs.reduce((max, p) => Math.max(max, p.hits), 0);
    console.log(`\n✅ Max Hits for ${systemName} in 2026: ${maxHits}`);

    // 3. Check globally if ANY system has > 3 hits in Euromillions in 2026
    const bestPerfs = await prisma.systemPerformance.findMany({
        where: {
            drawId: { in: drawIds },
            hits: { gte: 4 }
        },
        select: { systemName: true, hits: true, draw: { select: { date: true } } }
    });

    console.log(`\n🏆 Any System with 4+ hits in EuroMillions 2026?`);
    if (bestPerfs.length === 0) {
        console.log('❌ NO. Highest outcome for all systems is 3 or less.');
    } else {
        bestPerfs.forEach(p => console.log(` - ${p.systemName} (${p.draw.date.toISOString().split('T')[0]}): ${p.hits} hits`));
    }
}

diagnoseEuromillions2026()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
