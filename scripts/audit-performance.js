const { PrismaClient } = require('/app/node_modules/@prisma/client');
const p = new PrismaClient();

async function run() {
    console.log('--- DETAILED PERFORMANCE AUDIT ---');

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n=== GAME: ${game} ===`);

        // Numbers Performance
        const numStats = await p.systemPerformance.groupBy({
            by: ['systemName'],
            where: { game },
            _count: { _all: true },
            orderBy: { _count: { systemName: 'desc' } }
        });

        console.log('\n[NUMBERS] Prediction Counts per System:');
        if (numStats.length === 0) console.log('  (No records found)');
        numStats.forEach(s => {
            console.log(`  - ${s.systemName.padEnd(35)} : ${s._count._all} draws`);
        });

        // Stars Performance
        const starStats = await p.starSystemPerformance.groupBy({
            by: ['systemName'],
            where: { game },
            _count: { _all: true },
            orderBy: { _count: { systemName: 'desc' } }
        });

        console.log('\n[STARS] Prediction Counts per System:');
        if (starStats.length === 0) console.log('  (No records found)');
        starStats.forEach(s => {
            console.log(`  - ${s.systemName.padEnd(35)} : ${s._count._all} draws`);
        });
    }
}

run().catch(console.error).finally(() => p.$disconnect());
