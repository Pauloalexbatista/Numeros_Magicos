import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSystems() {
    const systemNames = [
        'média sem as pontas',
        'Consensus Auto (Vortex + Camadas + Media3)',
        'Quarteto de Impacto',
        'Quarteto de Impacto (Hot + Pascal + Elastic + Random)',
        'Consensus Auto (Vortex + LSTM + Media3)'
    ];

    console.log('=== SYSTEM RANKINGS ===\n');
    const rankings = await prisma.systemRanking.findMany({
        where: { systemName: { in: systemNames } },
        orderBy: { systemName: 'asc' }
    });
    console.log(JSON.stringify(rankings, null, 2));

    console.log('\n=== SYSTEM PERFORMANCE (Last 10 draws) ===\n');
    const performances = await prisma.systemPerformance.findMany({
        where: { systemName: { in: systemNames } },
        orderBy: [{ systemName: 'asc' }, { drawId: 'desc' }],
        take: 50
    });

    // Group by system
    const grouped = performances.reduce((acc, perf) => {
        if (!acc[perf.systemName]) acc[perf.systemName] = [];
        acc[perf.systemName].push(perf);
        return acc;
    }, {} as Record<string, typeof performances>);

    for (const [name, perfs] of Object.entries(grouped)) {
        console.log(`\n${name}:`);
        console.log(`  Total records: ${perfs.length}`);
        console.log(`  Latest draw: ${perfs[0]?.drawId}`);
        console.log(`  Total 3+ hits: ${perfs.reduce((sum, p) => sum + p.hits3 + p.hits4 + p.hits5, 0)}`);
    }

    await prisma.$disconnect();
}

checkSystems().catch(console.error);
