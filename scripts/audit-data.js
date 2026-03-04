const { PrismaClient } = require('/app/node_modules/@prisma/client');
const p = new PrismaClient();

async function run() {
    console.log('--- DATA AUDIT: DRAWS, NUMBERS & STARS ---');

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        const totalDraws = await p.draw.count({ where: { game } });
        const withNumbers = await p.draw.count({
            where: {
                game,
                NOT: { numbers: '[]' }
            }
        });
        const withStars = await p.draw.count({
            where: {
                game,
                NOT: { stars: '[]' }
            }
        });

        const firstDraw = await p.draw.findFirst({
            where: { game },
            orderBy: { date: 'asc' }
        });

        const lastDraw = await p.draw.findFirst({
            where: { game },
            orderBy: { date: 'desc' }
        });

        console.log(`\nGAME: ${game}`);
        console.log(`- Total Draws: ${totalDraws}`);
        console.log(`- Draws with Numbers: ${withNumbers}`);
        console.log(`- Draws with Stars/Supplementary: ${withStars}`);
        if (firstDraw && lastDraw) {
            console.log(`- Sequence: ${firstDraw.sequenceNumber} to ${lastDraw.sequenceNumber}`);
            console.log(`- Date Range: ${firstDraw.date.toISOString().split('T')[0]} to ${lastDraw.date.toISOString().split('T')[0]}`);
        }

        // Deep check for EuroDreams stars
        if (game === 'EURODREAMS') {
            const samples = await p.draw.findMany({
                where: { game },
                orderBy: { date: 'desc' },
                take: 5
            });
            console.log('  Recent EuroDreams Stars Sample:');
            samples.forEach(s => {
                console.log(`  [Draw ${s.id}] ${s.date.toISOString().split('T')[0]}: Numbers=${s.numbers} | Stars=${s.stars}`);
            });
        }
    }
}

run().catch(console.error).finally(() => p.$disconnect());
