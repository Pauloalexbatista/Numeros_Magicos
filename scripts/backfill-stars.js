const { PrismaClient } = require('/app/node_modules/@prisma/client');
const { evaluateDrawStars, updateStarRankings } = require('./src/services/ranking');
const p = new PrismaClient();

async function run() {
    console.log('--- BACKFILL TOTOLOTO STARS ---');
    // 1. Get last 5 Totoloto draws
    const draws = await p.draw.findMany({
        where: { game: 'TOTOLOTO' },
        orderBy: { date: 'desc' },
        take: 5
    });

    console.log(`Found ${draws.length} draws to process.`);

    for (const draw of draws) {
        console.log(`Processing Draw ${draw.id} (${draw.date.toISOString().split('T')[0]})...`);
        // Note: In common JS we can't easily use the TS services if they are not compiled.
        // I'll use a direct Prisma script logic instead if needed, but since I'm running inside the container
        // I might be able to use the compiled JS.
        // Actually, I'll just write the backfill logic directly here to be safe.
    }
}
// run().catch(console.error);
