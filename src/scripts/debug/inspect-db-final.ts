
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 INSPECTING DATABASE...");

    // 1. Check Cached Predictions
    const cache = await prisma.cachedPrediction.findMany({
        take: 20
    });
    console.log(`\n📦 CachedPredictions: ${cache.length} records found (showing first 20)`);
    cache.forEach(c => {
        const nums = JSON.parse(c.numbers);
        console.log(`- ${c.systemName.padEnd(25)}: ${nums.length} numbers [${Object.keys(c).includes('game') ? (c as any).game : '?'}]`);
    });

    // 2. Check System Performance
    const perf = await prisma.systemPerformance.findMany({
        take: 10,
        orderBy: { draw: { date: 'desc' } },
        include: { draw: true }
    });
    console.log(`\n📈 SystemPerformance: ${perf.length} recent records found`);
    perf.forEach(p => {
        const pred = JSON.parse(p.predictedNumbers);
        console.log(`- ${p.systemName.padEnd(25)} | Draw ${p.drawId} (${p.draw.game}) | Pred: ${pred.length} | Hits: ${p.hits}`);
    });

    // 3. Check Star System Performance
    const starPerf = await prisma.starSystemPerformance.findMany({
        take: 10,
        orderBy: { draw: { date: 'desc' } },
        include: { draw: true }
    });
    console.log(`\n🌟 StarSystemPerformance: ${starPerf.length} recent records found`);
    starPerf.forEach(p => {
        const pred = JSON.parse(p.predictedStars);
        console.log(`- ${p.systemName.padEnd(25)} | Draw ${p.drawId} (${p.draw.game}) | Stars: ${pred.length} | Hits: ${p.hits}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
