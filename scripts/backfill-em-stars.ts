
import { PrismaClient, Draw } from '@prisma/client';

const prisma = new PrismaClient();

// Inline star systems logic (without @/ imports)

function getMaxStar(draws: Draw[]): number {
    if (draws.length > 0) {
        if (draws[0].game === 'TOTOLOTO') return 13;
        if (draws[0].game === 'EURODREAMS') return 5;
    }
    return 12;
}

function getPredictionCount(draws: Draw[]): number {
    if (draws.length > 0) {
        if (draws[0].game === 'EURODREAMS') return 3;
        if (draws[0].game === 'TOTOLOTO') return 5;
    }
    return 6;
}

function generateHotStars(history: Draw[]): number[] {
    const recentDraws = history.slice(0, 20);
    const frequency: Record<number, number> = {};
    const predCount = getPredictionCount(history);

    recentDraws.forEach(draw => {
        const stars = JSON.parse(draw.stars) as number[];
        stars.forEach(star => { frequency[star] = (frequency[star] || 0) + 1; });
    });

    return Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, predCount)
        .map(([star]) => parseInt(star));
}

function generateLateStars(history: Draw[]): number[] {
    const lastSeen: Record<number, number> = {};
    const maxStar = getMaxStar(history);
    const predCount = getPredictionCount(history);

    for (let i = 1; i <= maxStar; i++) lastSeen[i] = -1;
    for (let i = 0; i < history.length; i++) {
        const stars = JSON.parse(history[i].stars) as number[];
        stars.forEach(star => { if (lastSeen[star] === -1) lastSeen[star] = i; });
        if (Object.values(lastSeen).every(v => v !== -1)) break;
    }

    return Object.entries(lastSeen)
        .sort(([, a], [, b]) => b - a)
        .slice(0, predCount)
        .map(([star]) => parseInt(star));
}

function generateRecentStars(history: Draw[]): number[] {
    const predCount = getPredictionCount(history);
    const uniqueStars = new Set<number>();
    for (const draw of history) {
        if (uniqueStars.size >= predCount) break;
        const stars = JSON.parse(draw.stars) as number[];
        for (const star of stars) { if (uniqueStars.size < predCount) uniqueStars.add(star); }
    }
    return Array.from(uniqueStars).sort((a, b) => a - b);
}

const starSystemFunctions: { name: string; fn: (h: Draw[]) => number[] }[] = [
    { name: 'Hot Stars', fn: generateHotStars },
    { name: 'Late Stars', fn: generateLateStars },
    { name: 'Recent Stars', fn: generateRecentStars },
];

async function backfillEuroMillionsStars() {
    console.log('⭐ EuroMillions Star Systems Backfill\n');

    // Get recent EM draws
    const draws = await prisma.draw.findMany({
        where: { game: 'EUROMILLIONS' },
        orderBy: { date: 'asc' },  // oldest first for proper history
        select: { id: true, date: true, stars: true }
    });

    console.log(`📅 Found ${draws.length} EuroMillions draws\n`);

    let processed = 0;

    for (const draw of draws) {
        // Check how many star performances exist for this draw
        const existingCount = await prisma.starSystemPerformance.count({
            where: { drawId: draw.id, game: 'EUROMILLIONS' }
        });

        if (existingCount >= starSystemFunctions.length) {
            // Already has evaluations
            continue;
        }

        // Get history BEFORE this draw
        const history = await prisma.draw.findMany({
            where: { game: 'EUROMILLIONS', date: { lt: draw.date } },
            orderBy: { date: 'desc' }
        });

        if (history.length < 5) continue; // Not enough history

        const actualStars = JSON.parse(draw.stars) as number[];
        const totalStars = 2; // EuroMillions has 2 stars

        for (const sys of starSystemFunctions) {
            // Check if this specific system already evaluated this draw
            const exists = await prisma.starSystemPerformance.findFirst({
                where: { drawId: draw.id, systemName: sys.name, game: 'EUROMILLIONS' }
            });
            if (exists) continue;

            try {
                const predicted = sys.fn(history);
                const hits = actualStars.filter(n => predicted.includes(n)).length;

                await prisma.starSystemPerformance.create({
                    data: {
                        drawId: draw.id,
                        game: 'EUROMILLIONS',
                        systemName: sys.name,
                        predictedStars: JSON.stringify(predicted),
                        actualStars: draw.stars,
                        hits
                    }
                });
            } catch (err) {
                // skip
            }
        }

        processed++;
        if (processed % 50 === 0) {
            process.stdout.write(`  Processed ${processed} draws...\r`);
        }
    }

    console.log(`\n✅ Done! Processed ${processed} draws.`);
}

backfillEuroMillionsStars()
    .catch(e => { console.error('❌', e); process.exit(1); })
    .finally(async () => await prisma.$disconnect());
