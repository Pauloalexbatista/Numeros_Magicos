import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const POSTGRES_URL = "postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

async function syncToProduction() {
    console.log('🚀 Starting production sync...\n');

    // Step 1: Export from local
    console.log('[1/3] 📤 Exporting from local SQLite...');
    const localPrisma = new PrismaClient({
        datasources: { db: { url: 'file:./prisma/dev.db' } }
    });

    const [performances, starPerformances, rankings, starRankings] = await Promise.all([
        localPrisma.systemPerformance.findMany(),
        localPrisma.starSystemPerformance.findMany(),
        localPrisma.systemRanking.findMany(),
        localPrisma.starSystemRanking.findMany(),
    ]);

    await localPrisma.$disconnect();

    console.log(`✅ Exported:`);
    console.log(`   - ${performances.length} system performances`);
    console.log(`   - ${starPerformances.length} star performances`);
    console.log(`   - ${rankings.length} system rankings`);
    console.log(`   - ${starRankings.length} star rankings\n`);

    // Step 2: Connect to production and clean
    console.log('[2/3] 🧹 Cleaning production tables...');
    const prodPrisma = new PrismaClient({
        datasources: { db: { url: POSTGRES_URL } }
    });

    await Promise.all([
        prodPrisma.systemPerformance.deleteMany(),
        prodPrisma.starSystemPerformance.deleteMany(),
        prodPrisma.systemRanking.deleteMany(),
        prodPrisma.starSystemRanking.deleteMany(),
    ]);

    console.log('✅ Tables cleaned\n');

    // Step 3: Import to production
    console.log('[3/3] 📥 Importing to production...');

    // Import in batches to avoid timeouts
    const batchSize = 1000;

    // System Performance
    for (let i = 0; i < performances.length; i += batchSize) {
        const batch = performances.slice(i, i + batchSize);
        await prodPrisma.systemPerformance.createMany({ data: batch });
        process.stdout.write('.');
    }
    console.log(`\n✅ Imported ${performances.length} system performances`);

    // Star Performance
    await prodPrisma.starSystemPerformance.createMany({ data: starPerformances });
    console.log(`✅ Imported ${starPerformances.length} star performances`);

    // System Rankings
    await prodPrisma.systemRanking.createMany({ data: rankings });
    console.log(`✅ Imported ${rankings.length} system rankings`);

    // Star Rankings
    await prodPrisma.starSystemRanking.createMany({ data: starRankings });
    console.log(`✅ Imported ${starRankings.length} star rankings`);

    await prodPrisma.$disconnect();

    console.log('\n========================================');
    console.log('✅ SYNC COMPLETO!');
    console.log('========================================');
    console.log('\nQuarteto Complementar agora está online! 🚀\n');
}

syncToProduction()
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
