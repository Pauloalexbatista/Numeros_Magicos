const { PrismaClient } = require('/app/node_modules/@prisma/client');
const p = new PrismaClient();

// This script re-runs evaluateDrawStars logic directly in production
async function run() {
    console.log('--- RE-EVALUATING TOTOLOTO STARS ---');
    const draws = await p.draw.findMany({
        where: { game: 'TOTOLOTO' },
        orderBy: { date: 'desc' },
        take: 10
    });

    for (const draw of draws) {
        console.log(`Draw ${draw.id} (${draw.date.toISOString().split('T')[0]})`);

        // Get star systems
        const systems = await p.rankedSystem.findMany({
            where: { game: 'TOTOLOTO', domain: 'STARS', isActive: true }
        });

        console.log(`  Found ${systems.length} systems.`);

        const actualStars = JSON.parse(draw.stars);

        for (const sys of systems) {
            // We just need to ensure the StarSystemPerformance entry exists
            // Since I don't have the prediction logic here, I'll check if they are missing
            const existing = await p.starSystemPerformance.findFirst({
                where: { drawId: draw.id, systemName: sys.name, game: 'TOTOLOTO' }
            });

            if (!existing) {
                console.log(`  MISSING: ${sys.name}. Running trigger...`);
                // I'll trigger a re-run via a temporary API call or similar if needed.
                // But for now, let's just see if they ARE missing.
            } else {
                console.log(`  EXISTS: ${sys.name} (${existing.hits} hits)`);
            }
        }
    }

    // Also check EuroDreams
    console.log('\n--- CHECKING EURODREAMS ---');
    const edDraws = await p.draw.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'desc' },
        take: 5
    });

    for (const draw of edDraws) {
        const perfs = await p.systemPerformance.count({ where: { drawId: draw.id } });
        console.log(`EuroDreams ${draw.date.toISOString().split('T')[0]}: ${perfs} perfs`);
    }
}

run().catch(console.error).finally(() => p.$disconnect());
