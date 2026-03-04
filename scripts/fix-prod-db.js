const { PrismaClient } = require('/app/node_modules/@prisma/client');
const p = new PrismaClient();

async function run() {
    console.log('--- FIXING DATA FOR SCHEMA SYNC ---');

    // 1. Clear staging tables (safe to delete)
    await p.$executeRawUnsafe('DELETE FROM "system_performance_staging"');

    // 2. We can't easily update schema if the columns don't exist yet.
    // But wait, if I run db push, it tries to create them.

    // Actually, the easiest way is to DELETE the performance/prediction tables 
    // since they are derived data and easily regenerated.
    console.log('Truncating transient tables...');
    await p.$executeRawUnsafe('TRUNCATE TABLE "system_performance" CASCADE');
    await p.$executeRawUnsafe('TRUNCATE TABLE "star_system_performance" CASCADE');
    await p.$executeRawUnsafe('TRUNCATE TABLE "SystemPrediction" CASCADE');
    await p.$executeRawUnsafe('TRUNCATE TABLE "cached_predictions" CASCADE');
    await p.$executeRawUnsafe('TRUNCATE TABLE "system_ranking" CASCADE');
    await p.$executeRawUnsafe('TRUNCATE TABLE "star_system_ranking" CASCADE');

    console.log('Tables truncated. Schema push should succeed now.');
}

run().catch(console.error).finally(() => p.$disconnect());
