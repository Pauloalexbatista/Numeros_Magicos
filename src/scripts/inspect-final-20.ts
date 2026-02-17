
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function inspect() {
    console.log('--- DB INSPECTION (20-NUMBER UPDATE) ---');

    // Check Cached Predictions
    const preds = await prisma.cachedPrediction.findMany({
        take: 15,
        include: { system: true }
    });

    console.log('\nSample Predictions (CachedPrediction):');
    preds.forEach(p => {
        const nums = JSON.parse(p.numbers);
        console.log(`[${p.system.game}] System: ${p.systemName} (${p.system.domain})`);
        console.log(`  Count: ${nums.length} | Items: ${nums.slice(0, 5).join(', ')}...`);
    });

    // Check Numbers Performance
    const performances = await prisma.systemPerformance.findMany({
        take: 5,
        include: { system: true, draw: true }
    });

    console.log('\nSystem Performance Samples (Numbers):');
    performances.forEach(s => {
        const pNums = JSON.parse(s.predictedNumbers);
        console.log(`[${s.system.game}] ${s.systemName} | Hits: ${s.hits} | PredCount: ${pNums.length} | Date: ${s.draw.date.toISOString().split('T')[0]}`);
    });

    // Check Star Performance
    const starPerformances = await prisma.starSystemPerformance.findMany({
        take: 10,
        include: { draw: true }
    });

    console.log('\nStar System Performance Samples:');
    starPerformances.forEach(s => {
        const pStars = JSON.parse(s.predictedStars);
        console.log(`[${s.draw.game}] ${s.systemName} | Hits: ${s.hits} | StarCount: ${pStars.length} | Date: ${s.draw.date.toISOString().split('T')[0]}`);
    });

    // Check if EuroDreams Numbers has data
    const edPerfCount = await prisma.systemPerformance.count({
        where: { system: { game: 'EURODREAMS' } }
    });
    console.log(`\nEuroDreams Numbers Performance Count: ${edPerfCount}`);

    const ttPerfCount = await prisma.systemPerformance.count({
        where: { system: { game: 'TOTOLOTO' } }
    });
    console.log(`Totoloto Numbers Performance Count: ${ttPerfCount}`);

}

inspect().finally(() => prisma.$disconnect());
