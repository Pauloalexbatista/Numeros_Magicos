import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log("🔍 Checking for orphaned records...");

    const systems = await prisma.rankedSystem.findMany({ select: { name: true } });
    const systemNames = new Set(systems.map(s => s.name));

    const preds = await prisma.cachedPrediction.findMany({ select: { systemName: true } });
    const orphanPreds = preds.filter(p => !systemNames.has(p.systemName));

    const rankings = await prisma.systemRanking.findMany({ select: { systemName: true } });
    const orphanRankings = rankings.filter(r => !systemNames.has(r.systemName));

    console.log(`Total Systems Active: ${systems.length}`);
    console.log(`Total Cached Predictions: ${preds.length}`);
    console.log(`Orphan Predictions: ${orphanPreds.length}`);
    if (orphanPreds.length > 0) {
        console.log("Sample Orphan Preds:", orphanPreds.slice(0, 5).map(o => o.systemName));
    }

    console.log(`Total Rankings: ${rankings.length}`);
    console.log(`Orphan Rankings: ${orphanRankings.length}`);
    if (orphanRankings.length > 0) {
        console.log("Sample Orphan Rankings:", orphanRankings.slice(0, 5).map(o => o.systemName));
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
