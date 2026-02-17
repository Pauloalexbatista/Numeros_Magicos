import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const localPrisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
});

// Since we generated the prod client to a specific folder, we should try to use it
let prodPrisma: any;
try {
    const { PrismaClient: ProdClient } = require('@prisma/client-prod');
    prodPrisma = new ProdClient({
        datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
    });
} catch (e) {
    prodPrisma = new PrismaClient({
        datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
    });
}

async function cleanup() {
    console.log("🧹 Cleanup: Removing ghost systems from Production...");

    // 1. Get local system names (Source of Truth)
    const localSystems = await localPrisma.rankedSystem.findMany({ select: { name: true } });
    const localNames = new Set(localSystems.map(s => s.name));
    console.log(`🗺️ Local has ${localNames.size} active systems.`);

    // 2. Get prod systems
    const prodSystems = await prodPrisma.rankedSystem.findMany({ select: { name: true } });
    const ghostSystems = prodSystems.filter(s => !localNames.has(s.name));
    console.log(`👻 Found ${ghostSystems.length} ghost systems in production.`);

    if (ghostSystems.length === 0) {
        console.log("✅ No ghost systems found. Production is clean.");
        return;
    }

    const ghostNames = ghostSystems.map(g => g.name);

    // 3. Delete dependent records first (Cascade might not be set for all)
    console.log("🗑️ Deleting ghost CachedPredictions...");
    const deletedCached = await prodPrisma.cachedPrediction.deleteMany({
        where: { systemName: { in: ghostNames } }
    });
    console.log(`   ✅ Removed ${deletedCached.count} cached predictions.`);

    console.log("🗑️ Deleting ghost SystemRankings...");
    const deletedRankings = await prodPrisma.systemRanking.deleteMany({
        where: { systemName: { in: ghostNames } }
    });
    console.log(`   ✅ Removed ${deletedRankings.count} rankings.`);

    console.log("🗑️ Deleting ghost SystemPredictions...");
    const deletedPreds = await prodPrisma.systemPrediction.deleteMany({
        where: { systemName: { in: ghostNames } }
    });
    console.log(`   ✅ Removed ${deletedPreds.count} predictions.`);

    console.log("🗑️ Deleting ghost SystemPerformances...");
    const deletedPerfs = await prodPrisma.systemPerformance.deleteMany({
        where: { systemName: { in: ghostNames } }
    });
    console.log(`   ✅ Removed ${deletedPerfs.count} performances.`);

    // 4. Finally delete systems
    console.log("🗑️ Deleting ghost RankedSystems...");
    const deletedSystems = await prodPrisma.rankedSystem.deleteMany({
        where: { name: { in: ghostNames } }
    });
    console.log(`   ✅ Removed ${deletedSystems.count} systems.`);

    console.log("\n✨ Cleanup Complete!");
}

cleanup()
    .catch(console.error)
    .finally(async () => {
        await localPrisma.$disconnect();
        await prodPrisma.$disconnect();
    });
