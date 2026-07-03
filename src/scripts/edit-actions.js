const fs = require('fs');

let content = fs.readFileSync('src/app/ranking/actions.ts', 'utf8');

// We need to import getGameConfig to get predCount if it's not imported
if (!content.includes('getGameConfig')) {
    content = content.replace(
        "import { unstable_noStore as noStore } from 'next/cache';",
        "import { unstable_noStore as noStore } from 'next/cache';\nimport { getGameConfig } from '@/services/game-config';"
    );
}

// 1. getTopSystemsYearlyAnalysis
content = content.replace(
    /const data = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?\}\);/,
    `const dbData = await prisma.systemPerformanceFullPool.findMany({
        where: {
            systemName: { in: allSystems },
            game // Filter by game
        },
        include: { draw: { select: { date: true } } }
    });

    const config = getGameConfig([{ game } as any]);
    const predCount = config.predCount;

    const data = dbData.map(p => {
        const pred = JSON.parse(p.predictedNumbers).slice(0, predCount);
        const actual = typeof p.actualNumbers === 'string' ? JSON.parse(p.actualNumbers) : p.actualNumbers;
        const hits = actual.filter((n: number) => pred.includes(n)).length;
        return {
            systemName: p.systemName,
            draw: p.draw,
            hits
        };
    });`
);
content = content.replace(
    /const recentWinners = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?select: \{ systemName: true \},[\s\S]*?distinct: \['systemName'\][\s\S]*?\}\);/g,
    `// Fetch all and filter in memory since we can't filter hits in DB anymore
    const allRecent = await prisma.systemPerformanceFullPool.findMany({
        where: { draw: { game, date: { gte: startOfYear } } }
    });
    const configWins = getGameConfig([{ game } as any]);
    const pCount = configWins.predCount;
    const winnerNamesSet = new Set<string>();
    
    for (const p of allRecent) {
        const pred = JSON.parse(p.predictedNumbers).slice(0, pCount);
        const actual = typeof p.actualNumbers === 'string' ? JSON.parse(p.actualNumbers) : p.actualNumbers;
        const hits = actual.filter((n: number) => pred.includes(n)).length;
        if (hits >= minHits) {
            winnerNamesSet.add(p.systemName);
        }
    }
    const winnerNames = Array.from(winnerNamesSet);`
);
// remove the old mapping since we mapped it above
content = content.replace(`const winnerNames = recentWinners.map(w => w.systemName);`, ``);


// 2. getJackpotLeaders
content = content.replace(
    /const performances = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?where: \{ game \},[\s\S]*?select: \{[\s\S]*?systemName: true,[\s\S]*?hits: true,[\s\S]*?drawId: true[\s\S]*?\}[\s\S]*?\}\);/g,
    `const dbPerf = await prisma.systemPerformanceFullPool.findMany({
        where: { game }
    });
    const configJackpot = getGameConfig([{ game } as any]);
    const pCountJackpot = configJackpot.predCount;
    
    const performances = dbPerf.map(p => {
        const pred = JSON.parse(p.predictedNumbers).slice(0, pCountJackpot);
        const actual = typeof p.actualNumbers === 'string' ? JSON.parse(p.actualNumbers) : p.actualNumbers;
        const hits = actual.filter((n: number) => pred.includes(n)).length;
        return {
            systemName: p.systemName,
            drawId: p.drawId,
            hits
        };
    });`
);

// 3. getRankingMetrics
content = content.replace(
    /const performances = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?where: \{[\s\S]*?drawId: \{ in: drawIds \},[\s\S]*?game,[\s\S]*?system: \{ domain: 'NUMBERS' \}[\s\S]*?\},[\s\S]*?select: \{[\s\S]*?systemName: true,[\s\S]*?drawId: true,[\s\S]*?hits: true,[\s\S]*?accuracy: true,[\s\S]*?system: \{ select: \{ description: true \} \}[\s\S]*?\}[\s\S]*?\}\);/g,
    `const dbPerfRanking = await prisma.systemPerformanceFullPool.findMany({
        where: {
            drawId: { in: drawIds },
            game,
            system: { domain: 'NUMBERS' }
        },
        include: { system: { select: { description: true } } }
    });
    
    const configRanking = getGameConfig([{ game } as any]);
    const pCountRanking = configRanking.predCount;

    const performances = dbPerfRanking.map(p => {
        const pred = JSON.parse(p.predictedNumbers).slice(0, pCountRanking);
        const actual = typeof p.actualNumbers === 'string' ? JSON.parse(p.actualNumbers) : p.actualNumbers;
        const hits = actual.filter((n: number) => pred.includes(n)).length;
        const accuracy = (hits / actual.length) * 100;
        return {
            systemName: p.systemName,
            drawId: p.drawId,
            hits,
            accuracy,
            system: p.system
        };
    });`
);

// 4. getAllTimeRankingMetrics
content = content.replace(
    /const performances = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?select: \{[\s\S]*?systemName: true,[\s\S]*?drawId: true,[\s\S]*?hits: true,[\s\S]*?accuracy: true[\s\S]*?\}[\s\S]*?\}\);/g,
    `const dbPerfAll = await prisma.systemPerformanceFullPool.findMany();
    // Since we don't have game parameter, we assume EUROMILLIONS for default or dynamically fetch.
    // Let's map by game properly:
    const performances = dbPerfAll.map(p => {
        const c = getGameConfig([{ game: p.game } as any]);
        const pred = JSON.parse(p.predictedNumbers).slice(0, c.predCount);
        const actual = typeof p.actualNumbers === 'string' ? JSON.parse(p.actualNumbers) : p.actualNumbers;
        const hits = actual.filter((n: number) => pred.includes(n)).length;
        const accuracy = (hits / actual.length) * 100;
        return {
            systemName: p.systemName,
            drawId: p.drawId,
            hits,
            accuracy,
            game: p.game
        };
    });`
);

// 5. getHotRankingMetrics
content = content.replace(
    /const performances = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?where: \{[\s\S]*?drawId: \{ in: drawIds \},[\s\S]*?game[\s\S]*?\},[\s\S]*?select: \{[\s\S]*?systemName: true,[\s\S]*?drawId: true,[\s\S]*?hits: true,[\s\S]*?accuracy: true,[\s\S]*?system: \{ select: \{ description: true \} \}[\s\S]*?\},[\s\S]*?orderBy: \{[\s\S]*?id: 'desc'[\s\S]*?\}[\s\S]*?\}\);/g,
    `const dbPerfHot = await prisma.systemPerformanceFullPool.findMany({
        where: {
            drawId: { in: drawIds },
            game
        },
        include: { system: { select: { description: true } } },
        orderBy: { id: 'desc' }
    });
    const configHot = getGameConfig([{ game } as any]);
    const pCountHot = configHot.predCount;

    const performances = dbPerfHot.map(p => {
        const pred = JSON.parse(p.predictedNumbers).slice(0, pCountHot);
        const actual = typeof p.actualNumbers === 'string' ? JSON.parse(p.actualNumbers) : p.actualNumbers;
        const hits = actual.filter((n: number) => pred.includes(n)).length;
        const accuracy = (hits / actual.length) * 100;
        return {
            systemName: p.systemName,
            drawId: p.drawId,
            hits,
            accuracy,
            system: p.system
        };
    });`
);

fs.writeFileSync('src/app/ranking/actions.ts', content, 'utf8');
console.log('actions.ts updated successfully.');
