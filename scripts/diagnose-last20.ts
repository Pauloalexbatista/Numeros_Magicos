
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseLast20EuroDreams() {
    console.log('🔍 Diagnosing EuroDreams Last 20 Draws Performance...');

    // 1. Get Last 20 Draws IDs
    const last20Draws = await prisma.draw.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'desc' },
        take: 20,
        select: { id: true, date: true }
    });

    if (last20Draws.length === 0) {
        console.error('❌ No EuroDreams draws found!');
        return;
    }

    const drawIds = last20Draws.map(d => d.id);
    const dateRange = `${last20Draws[last20Draws.length - 1].date.toISOString().split('T')[0]} to ${last20Draws[0].date.toISOString().split('T')[0]}`;
    console.log(`\n📅 Date Range: ${dateRange} (${drawIds.length} draws)`);

    // 2. Analyze Specific Systems from User Screenshot
    const targetSystems = ['Hot Numbers (EuroDreams)', 'Clustering (EuroDreams)', 'Sistema Oscilação Universal V2 (EuroDreams)'];

    for (const sysName of targetSystems) {
        console.log(`\n📊 Analyzing: ${sysName}`);

        const perfs = await prisma.systemPerformance.findMany({
            where: {
                systemName: sysName,
                drawId: { in: drawIds }
            },
            include: { draw: { select: { date: true } } }
        });

        console.log(`   Items found: ${perfs.length}`);

        if (perfs.length === 0) continue;

        let score = 0;
        let hits3Plus = 0;
        const distribution = { 3: 0, 4: 0, 5: 0, 6: 0 };

        perfs.forEach(p => {
            // EuroDreams Calculation Rules (from screenshot context/presumed logic)
            // 6 hits = 100 pts
            // 5 hits = 10 pts
            // 4 hits = 1 pt (Wait, screenshot says 4 Acertos = 10 pts, 3 Acertos = 1 pt for EM/TL usually. Let's check code logic later. 
            // For now, let's just dump the hits)

            if (p.hits >= 3) {
                hits3Plus++;
                if (p.hits === 3) distribution[3]++;
                if (p.hits === 4) distribution[4]++;
                if (p.hits === 5) distribution[5]++;
                if (p.hits === 6) distribution[6]++;
            }

            // Standard Score Calculation (to verify standard logic)
            // If EuroDreams follows EM logic: 5/6=100, 4/5=10, 3/4=1
            // Actually, usually it's: Jackpot=100, High=10, Medium=1
        });

        const winRate = (hits3Plus / perfs.length) * 100;

        console.log(`   Hits Distribution: 3★:${distribution[3]}, 4★:${distribution[4]}, 5★:${distribution[5]}, 6★:${distribution[6]}`);
        console.log(`   Total 3+ Hits: ${hits3Plus}`);
        console.log(`   Calculated Win Rate (3+): ${winRate.toFixed(1)}%`);
        console.log(`   Raw Hits Stream: ${perfs.map(p => p.hits).join(', ')}`);
    }

}

diagnoseLast20EuroDreams()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
