import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSystemHits() {
    const systemNames = [
        'Consensus Auto (Vortex + Camadas + Media3)',
        'Quarteto de Impacto',
        'Quarteto de Impacto (Hot + Pascal + Elastic + Random)',
        'Consensus Auto (Vortex + LSTM + Media3)'
    ];

    console.log('=== CHECKING HITS DISTRIBUTION ===\n');

    for (const name of systemNames) {
        const perfs = await prisma.systemPerformance.findMany({
            where: { systemName: name },
            orderBy: { drawId: 'desc' },
            take: 100
        });

        const hits0 = perfs.filter(p => p.hits === 0).length;
        const hits1 = perfs.filter(p => p.hits === 1).length;
        const hits2 = perfs.filter(p => p.hits === 2).length;
        const hits3 = perfs.filter(p => p.hits === 3).length;
        const hits4 = perfs.filter(p => p.hits === 4).length;
        const hits5 = perfs.filter(p => p.hits === 5).length;

        const totalWins = hits3 + hits4 + hits5;
        const winRate = perfs.length > 0 ? (totalWins / perfs.length) * 100 : 0;

        console.log(`\n${name}:`);
        console.log(`  Total records (last 100): ${perfs.length}`);
        console.log(`  Hits distribution:`);
        console.log(`    0 hits: ${hits0}`);
        console.log(`    1 hit:  ${hits1}`);
        console.log(`    2 hits: ${hits2}`);
        console.log(`    3 hits: ${hits3} ⭐`);
        console.log(`    4 hits: ${hits4} ⭐⭐`);
        console.log(`    5 hits: ${hits5} ⭐⭐⭐`);
        console.log(`  Total wins (3+): ${totalWins}`);
        console.log(`  Win Rate: ${winRate.toFixed(2)}%`);
    }

    await prisma.$disconnect();
}

checkSystemHits().catch(console.error);
