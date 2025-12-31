import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deepInvestigation() {
    console.log('=== DEEP INVESTIGATION: ENSEMBLE SYSTEMS ===\n');

    // 1. Check base systems that compose the ensembles
    const baseSystems = [
        'Vortex Pyramid',
        'Sistema Média Camadas',
        'Sist Combinado Media+3',
        'LSTM Neural Net',
        'Hot Numbers',
        'PyramidPascal',
        'Sistema Elástico',
        'Random Generator'
    ];

    console.log('1. BASE SYSTEMS PERFORMANCE (Last 100 draws):\n');
    for (const name of baseSystems) {
        const perfs = await prisma.systemPerformance.findMany({
            where: { systemName: name },
            orderBy: { drawId: 'desc' },
            take: 100
        });

        if (perfs.length === 0) {
            console.log(`  ${name}: NO DATA`);
            continue;
        }

        const hits3 = perfs.filter(p => p.hits === 3).length;
        const hits4 = perfs.filter(p => p.hits === 4).length;
        const hits5 = perfs.filter(p => p.hits === 5).length;
        const totalWins = hits3 + hits4 + hits5;
        const winRate = (totalWins / perfs.length) * 100;

        console.log(`  ${name}:`);
        console.log(`    Win Rate: ${winRate.toFixed(1)}% (${totalWins}/100)`);
    }

    // 2. Check ensemble systems AND their anti-systems
    const ensembleSystems = [
        'Consensus Auto (Vortex + Camadas + Media3)',
        'Anti-Consensus Auto (Vortex + Camadas + Media3)',
        'Quarteto de Impacto',
        'Anti-Quarteto de Impacto',
        'Quarteto de Impacto (Hot + Pascal + Elastic + Random)',
        'Anti-Quarteto de Impacto (Hot + Pascal + Elastic + Random)',
        'Consensus Auto (Vortex + LSTM + Media3)',
        'Anti-Consensus Auto (Vortex + LSTM + Media3)'
    ];

    console.log('\n2. ENSEMBLE SYSTEMS vs ANTI-SYSTEMS (Last 100 draws):\n');
    for (const name of ensembleSystems) {
        const perfs = await prisma.systemPerformance.findMany({
            where: { systemName: name },
            orderBy: { drawId: 'desc' },
            take: 100
        });

        if (perfs.length === 0) {
            console.log(`  ${name}: NO DATA ❌`);
            continue;
        }

        const hits3 = perfs.filter(p => p.hits === 3).length;
        const hits4 = perfs.filter(p => p.hits === 4).length;
        const hits5 = perfs.filter(p => p.hits === 5).length;
        const totalWins = hits3 + hits4 + hits5;
        const winRate = (totalWins / perfs.length) * 100;

        const isAnti = name.startsWith('Anti-');
        const marker = isAnti ? '🔄' : '✨';

        console.log(`  ${marker} ${name}:`);
        console.log(`    Win Rate: ${winRate.toFixed(1)}% (${totalWins}/100)`);
        console.log(`    Distribution: 3★=${hits3}, 4★=${hits4}, 5★=${hits5}`);
    }

    // 3. Check if there's a pattern in the data
    console.log('\n3. CHECKING DATA INTEGRITY:\n');

    const testSystem = 'Consensus Auto (Vortex + Camadas + Media3)';
    const recentPerfs = await prisma.systemPerformance.findMany({
        where: { systemName: testSystem },
        orderBy: { drawId: 'desc' },
        take: 10,
        include: { draw: { select: { id: true, numbers: true } } }
    });

    console.log(`  Last 10 performances for "${testSystem}":\n`);
    for (const perf of recentPerfs) {
        console.log(`    Draw #${perf.drawId}: ${perf.hits} hits (accuracy: ${perf.accuracy.toFixed(1)}%)`);
        console.log(`      Winning numbers: ${perf.draw.numbers}`);
    }

    // 4. Check SystemPrediction to see what was predicted
    console.log('\n4. CHECKING PREDICTIONS:\n');
    const predictions = await prisma.systemPrediction.findMany({
        where: { systemName: testSystem },
        orderBy: { drawId: 'desc' },
        take: 5
    });

    for (const pred of predictions) {
        console.log(`    Draw #${pred.drawId}:`);
        console.log(`      Predicted: ${pred.numbers}`);
    }

    await prisma.$disconnect();
}

deepInvestigation().catch(console.error);
