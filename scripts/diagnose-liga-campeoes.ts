
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
    console.log('🔍 Diagnosing Liga dos Campeões Data (2026)...');

    const start2026 = new Date('2026-01-01T00:00:00.000Z');
    const end2026 = new Date('2026-12-31T23:59:59.999Z');

    // 1. Check Draws
    const draws2026 = await prisma.draw.findMany({
        where: {
            date: {
                gte: start2026,
                lte: end2026
            }
        },
        orderBy: { date: 'desc' },
        select: { id: true, date: true, game: true, numbers: true, stars: true }
    });

    console.log(`\n📅 Draws in 2026: ${draws2026.length}`);
    draws2026.forEach(d => console.log(` - [${d.game}] ${d.date.toISOString().split('T')[0]} ID:${d.id} Numbers:${d.numbers}`));

    if (draws2026.length === 0) {
        console.error('❌ No draws found for 2026!');
        return;
    }

    // 2. Check System Performance for these draws
    const drawIds = draws2026.map(d => d.id);
    const performances = await prisma.systemPerformance.findMany({
        where: {
            drawId: { in: drawIds }
        },
        select: {
            systemName: true,
            drawId: true,
            hits: true,
            predictedNumbers: true
        }
    });

    console.log(`\n📊 System Performance Records in 2026: ${performances.length}`);

    if (performances.length === 0) {
        console.error('❌ No performance records found for 2026 draws!');
        return;
    }

    // 3. Check specific systems
    const targetSystems = ['Sist Média + 3 Otimizado', 'Clustering', 'Markov Chain'];

    console.log('\n🕵️ Specific System Check:');
    for (const sysName of targetSystems) {
        const sysPerfs = performances.filter(p => p.systemName === sysName);
        console.log(`\nSystem: ${sysName} (${sysPerfs.length} records)`);

        sysPerfs.forEach(p => {
            const draw = draws2026.find(d => d.id === p.drawId);
            console.log(` - Draw ${draw?.date.toISOString().split('T')[0]}: ${p.hits} hits (Predicted: ${p.predictedNumbers})`);
        });
    }

    // 4. Check for any High Prizes (4 or 5 hits)
    const highPrizes = performances.filter(p => p.hits >= 4);
    console.log(`\n🏆 High Prizes (4+ hits) in 2026: ${highPrizes.length}`);
    highPrizes.forEach(p => console.log(` - ${p.systemName}: ${p.hits} hits`));
}

diagnose()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
