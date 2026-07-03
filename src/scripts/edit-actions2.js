const fs = require('fs');
let content = fs.readFileSync('src/app/ranking/actions.ts', 'utf8');

// Imports
content = content.replace(
    `import { unstable_noStore as noStore } from 'next/cache';`,
    `import { unstable_noStore as noStore } from 'next/cache';\nimport { fetchSystemPerformances } from '@/services/system-performance-adapter';`
);

// getTopSystemsYearlyAnalysis
content = content.replace(
    /const recentWinners = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?distinct: \['systemName'\]\n    \}\);/,
    `const dbWinners = await fetchSystemPerformances({
        where: { draw: { game, date: { gte: startOfYear } } }
    });
    // @ts-ignore
    const recentWinners = dbWinners.filter(w => w.hits >= minHits);`
);

content = content.replace(
    /const data = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?include: \{ draw: \{ select: \{ date: true \} \} \}\n    \}\);/,
    `const data = await fetchSystemPerformances({
        where: { systemName: { in: allSystems }, draw: { game } },
        include: { draw: { select: { date: true } } }
    });`
);

// getRankingMetrics
content = content.replace(
    /const performances = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?system: \{ select: \{ description: true \} \}\n        \}\n    \}\);/,
    `const performances = await fetchSystemPerformances({
        where: { drawId: { in: drawIds }, game, system: { domain: 'NUMBERS' } },
        include: { system: { select: { description: true } } }
    });`
);

// getAllTimeRankingMetrics
content = content.replace(
    /const performances = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?accuracy: true\n        \}\n    \}\);/,
    `const performances = await fetchSystemPerformances({});`
);

// getHotRankingMetrics
content = content.replace(
    /const performances = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?orderBy: \{\n            id: 'desc' \/\/ Newest records first for deduplication preference\n        \}\n    \}\);/,
    `const performances = await fetchSystemPerformances({
        where: { drawId: { in: drawIds }, game },
        include: { system: { select: { description: true } } },
        orderBy: { id: 'desc' }
    });`
);

// getJackpotLeaders
content = content.replace(
    /const performances = await prisma\.systemPerformance\.findMany\(\{[\s\S]*?drawId: true\n        \}\n    \}\);/,
    `const performances = await fetchSystemPerformances({ where: { game } });`
);

fs.writeFileSync('src/app/ranking/actions.ts', content, 'utf8');
