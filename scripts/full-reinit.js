const { PrismaClient } = require('/app/node_modules/@prisma/client');
const p = new PrismaClient();

async function run() {
    console.log('--- FULL RE-INITIALIZATION (CASCADE) ---');

    // 1. Truncate all tables that depend on RankedSystem
    console.log('Truncating dependent tables...');
    await p.$executeRawUnsafe('TRUNCATE TABLE "system_performance" CASCADE');
    await p.$executeRawUnsafe('TRUNCATE TABLE "star_system_performance" CASCADE');
    await p.$executeRawUnsafe('TRUNCATE TABLE "SystemPrediction" CASCADE');
    await p.$executeRawUnsafe('TRUNCATE TABLE "cached_predictions" CASCADE');
    await p.$executeRawUnsafe('TRUNCATE TABLE "system_ranking" CASCADE');
    await p.$executeRawUnsafe('TRUNCATE TABLE "star_system_ranking" CASCADE');
    await p.$executeRawUnsafe('TRUNCATE TABLE "system_performance_staging" CASCADE');

    // 2. Clear RankedSystem
    await p.rankedSystem.deleteMany({});
    console.log('Cleared RankedSystem table.');

    const numberSystems = [
        'Hot Numbers', 'Recent Numbers', 'Markov Chain', 'Clustering',
        'PyramidPascal', 'PyramidGaps', 'Sist Média 3 Otimizado',
        'média sem as pontas', 'Universal Oscillation v2', 'Late Numbers', 'Monte Carlo'
    ];

    const starSystems = [
        'Hot Stars', 'Recent Stars', 'Late Stars', 'Markov Stars',
        'Clustering Stars', 'PyramidPascal Stars', 'PyramidGaps Stars',
        'Sist Média +3 Otimizado Stars', 'Universal Oscillation V2 Stars',
        'Monte Carlo Stars', 'Vortex Stars', 'Média +1 Stars'
    ];

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`Creating systems for ${game}...`);

        // Numbers
        for (const name of numberSystems) {
            let finalName = name;
            if (game === 'TOTOLOTO') finalName = `${name}_TOTOLOTO`;
            if (game === 'EURODREAMS') finalName = `${name} (EuroDreams)`;

            await p.rankedSystem.create({
                data: { name: finalName, game, isActive: true, domain: 'NUMBERS', systemType: 'BASE' }
            });
        }

        // Stars
        for (const name of starSystems) {
            let finalName = name;
            if (game === 'TOTOLOTO') finalName = `${name}_TOTOLOTO`;
            if (game === 'EURODREAMS') finalName = `${name} (EuroDreams)`;

            await p.rankedSystem.create({
                data: { name: finalName, game, isActive: true, domain: 'STARS', systemType: 'BASE' }
            });
        }
    }

    console.log('✅ 69 System definitions initialized successfully.');
}

run().catch(console.error).finally(() => p.$disconnect());
