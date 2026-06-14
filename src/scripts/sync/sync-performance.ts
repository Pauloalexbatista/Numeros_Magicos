import { PrismaClient as LocalClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const localPrisma = new LocalClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
});

let prodPrisma: any;
try {
    const { PrismaClient: ProdClient } = require('@prisma/client-prod');
    const prodUrl = process.env.POSTGRES_URL_PROD + (process.env.POSTGRES_URL_PROD?.includes('?') ? '&' : '?') + 'connection_limit=1';
    prodPrisma = new ProdClient({
        datasources: { db: { url: prodUrl } }
    });
} catch (e) {
    prodPrisma = new LocalClient({
        datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
    });
}

async function main() {
    console.log('🚀 Starting Performance Metrics Migration (Local SQLite -> Production PostgreSQL)...');

    // 1. Build Draw ID mapping (since SQLite IDs might differ from PostgreSQL IDs)
    console.log('📦 Fetching Draws for ID mapping...');
    const localDraws = await localPrisma.draw.findMany({ select: { id: true, game: true, date: true } });
    const prodDraws = await prodPrisma.draw.findMany({ select: { id: true, game: true, date: true } });

    console.log(`   Found ${localDraws.length} local draws and ${prodDraws.length} production draws.`);

    const keyToProdId = new Map<string, number>();
    for (const d of prodDraws) {
        keyToProdId.set(`${d.game}_${d.date.getTime()}`, d.id);
    }

    const localToProdId = new Map<number, number>();
    let mappedCount = 0;
    for (const d of localDraws) {
        const key = `${d.game}_${d.date.getTime()}`;
        const prodId = keyToProdId.get(key);
        if (prodId) {
            localToProdId.set(d.id, prodId);
            mappedCount++;
        }
    }
    console.log(`   Mapped ${mappedCount} draws successfully.`);

    // 2. Migrate SystemPerformance
    console.log('\n📊 Migrating SystemPerformance records...');
    const localPerformance = await localPrisma.systemPerformance.findMany();
    console.log(`   Found ${localPerformance.length} local records.`);

    const mappedPerformance = localPerformance
        .map(p => {
            const prodDrawId = localToProdId.get(p.drawId);
            if (!prodDrawId) return null;
            return {
                drawId: prodDrawId,
                game: p.game,
                systemName: p.systemName,
                predictedNumbers: p.predictedNumbers,
                actualNumbers: p.actualNumbers,
                hits: p.hits,
                accuracy: p.accuracy,
                createdAt: p.createdAt
            };
        })
        .filter(Boolean) as any[];

    console.log(`   Mapped ${mappedPerformance.length} records to production draws.`);

    // Chunked batch insertion (1000 records at a time)
    const chunkSize = 1000;
    for (let i = 0; i < mappedPerformance.length; i += chunkSize) {
        const chunk = mappedPerformance.slice(i, i + chunkSize);
        await prodPrisma.systemPerformance.createMany({
            data: chunk,
            skipDuplicates: true
        });
        process.stdout.write('.');
    }
    console.log(`\n   ✅ SystemPerformance migration complete!`);

    // 3. Migrate StarSystemPerformance
    console.log('\n⭐ Migrating StarSystemPerformance records...');
    const localStarPerformance = await localPrisma.starSystemPerformance.findMany();
    console.log(`   Found ${localStarPerformance.length} local records.`);

    const mappedStarPerformance = localStarPerformance
        .map(p => {
            const prodDrawId = localToProdId.get(p.drawId);
            if (!prodDrawId) return null;
            return {
                drawId: prodDrawId,
                game: p.game,
                systemName: p.systemName,
                predictedStars: p.predictedStars,
                actualStars: p.actualStars,
                hits: p.hits,
                createdAt: p.createdAt
            };
        })
        .filter(Boolean) as any[];

    console.log(`   Mapped ${mappedStarPerformance.length} records to production draws.`);

    for (let i = 0; i < mappedStarPerformance.length; i += chunkSize) {
        const chunk = mappedStarPerformance.slice(i, i + chunkSize);
        await prodPrisma.starSystemPerformance.createMany({
            data: chunk,
            skipDuplicates: true
        });
        process.stdout.write('.');
    }
    console.log(`\n   ✅ StarSystemPerformance migration complete!`);

    console.log('\n🏆 ALL PERFORMANCE METRICS SYNCED TO PRODUCTION POSTGRESQL!');
}

main()
    .catch(e => {
        console.error('\n❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await localPrisma.$disconnect();
        await prodPrisma.$disconnect();
    });
