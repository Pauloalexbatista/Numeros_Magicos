
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

const STATIC_DIR = path.join(process.cwd(), 'src/data/static');

async function ensureDir() {
    try {
        await fs.access(STATIC_DIR);
    } catch {
        await fs.mkdir(STATIC_DIR, { recursive: true });
    }
}

// --- LOGIC FROM ranking/actions.ts ---

async function calculateRankingMetrics() {
    console.log('📊 Calculating Advanced Ranking Metrics...');
    const lastDraw = await prisma.draw.findFirst({ orderBy: { id: 'desc' } });
    if (!lastDraw) return [];

    const startDrawId = Math.max(1, lastDraw.id - 100);

    const performances = await prisma.systemPerformance.findMany({
        where: { drawId: { gte: startDrawId } },
        select: {
            systemName: true,
            hits: true,
            accuracy: true,
            system: { select: { description: true } }
        }
    });

    const stats: Record<string, any> = {};

    performances.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = {
                name: p.systemName,
                description: p.system?.description || '',
                hits3: 0, hits4: 0, hits5: 0,
                totalPreds: 0, sumAccuracy: 0
            };
        }

        const s = stats[p.systemName];
        s.totalPreds++;
        s.sumAccuracy += p.accuracy;

        if (p.hits === 3) s.hits3++;
        if (p.hits === 4) s.hits4++;
        if (p.hits === 5) s.hits5++;
    });

    const ranking = Object.values(stats).map(s => {
        // Scoring: 3hits=1pt, 4hits=10pts, 5hits=100pts
        const qualityScore = (s.hits3 * 1) + (s.hits4 * 10) + (s.hits5 * 100);
        const totalWins = s.hits3 + s.hits4 + s.hits5;
        const winRate = s.totalPreds > 0 ? (totalWins / s.totalPreds) * 100 : 0;
        const oldAccuracy = s.totalPreds > 0 ? s.sumAccuracy / s.totalPreds : 0;

        return {
            systemName: s.name,
            description: s.description,
            accuracy: oldAccuracy,
            winRate: winRate,
            qualityScore: qualityScore,
            hits3: s.hits3,
            hits4: s.hits4,
            hits5: s.hits5,
            totalPredictions: s.totalPreds
        };
    });

    return ranking.sort((a, b) => b.qualityScore - a.qualityScore);
}

async function calculateJackpotLeaders() {
    console.log('🏆 Calculating Jackpot Leaders...');
    const jackpotCounts = await prisma.systemPerformance.groupBy({
        by: ['systemName'],
        where: { hits: 5 },
        _count: { hits: true }
    });

    // Filter only active systems and format
    const activeSystems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        select: { name: true }
    });
    const activeNames = new Set(activeSystems.map(s => s.name));

    return jackpotCounts
        .filter(j => activeNames.has(j.systemName))
        .map(j => ({
            systemName: j.systemName,
            jackpots: j._count.hits
        }))
        .sort((a, b) => b.jackpots - a.jackpots)
        .slice(0, 3);
}

// --- GENERATORS ---

async function generateRankings() {
    console.log('📊 Generating Static Rankings JSON...');

    // 1. Full Metrics (Last 100)
    const metrics = await calculateRankingMetrics();
    await fs.writeFile(path.join(STATIC_DIR, 'rankings-metrics.json'), JSON.stringify(metrics, null, 2));

    // 2. Jackpot Leaders
    const leaders = await calculateJackpotLeaders();
    await fs.writeFile(path.join(STATIC_DIR, 'jackpot-leaders.json'), JSON.stringify(leaders, null, 2));

    // 3. Raw Table (Backup)
    const rawRankings = await prisma.systemRanking.findMany({
        include: { system: true },
        orderBy: { avgAccuracy: 'desc' }
    });
    await fs.writeFile(path.join(STATIC_DIR, 'rankings-raw.json'), JSON.stringify({
        updatedAt: new Date().toISOString(),
        rankings: rawRankings
    }, null, 2));

    console.log(`✅ Saved rankings.`);
}

async function generateDraws() {
    console.log('🎱 Generating Static Draw JSON...');
    try {
        const lastDraw = await prisma.draw.findFirst({
            orderBy: { id: 'desc' }
        });

        if (!lastDraw) return;

        const processedDraw = {
            ...lastDraw,
            numbers: (typeof lastDraw.numbers === "string" ? JSON.parse(lastDraw.numbers) : lastDraw.numbers),
            stars: (typeof lastDraw.stars === "string" ? JSON.parse(lastDraw.stars) : lastDraw.stars),
        };

        await fs.writeFile(
            path.join(STATIC_DIR, 'last-draw.json'),
            JSON.stringify({
                updatedAt: new Date().toISOString(),
                lastDraw: processedDraw
            }, null, 2)
        );
    } catch (e) {
        console.warn('⚠️ Failed to generate draw JSON, skipping:', e);
    }
    console.log(`✅ Saved last draw.`);
}

async function generateStats() {
    console.log('📈 Generating Static Statistics JSON...');
    const keys = await prisma.statisticsCache.findMany({ select: { key: true } });

    for (const { key } of keys) {
        const record = await prisma.statisticsCache.findUnique({ where: { key } });
        if (record) {
            await fs.writeFile(
                path.join(STATIC_DIR, `stats-${key}.json`),
                record.data
            );
        }
    }
    console.log(`✅ Saved ${keys.length} stat files.`);
}

async function generatePredictions() {
    console.log('🔮 Generating Static Predictions JSON...');
    const predictions = await prisma.cachedPrediction.findMany({
        include: { system: true }
    });

    const data = {
        updatedAt: new Date().toISOString(),
        predictions: predictions.map(p => ({
            ...p,
            numbers: JSON.parse(p.numbers),
            worstNumbers: p.worstNumbers ? JSON.parse(p.worstNumbers) : []
        }))
    };

    await fs.writeFile(
        path.join(STATIC_DIR, 'predictions.json'),
        JSON.stringify(data, null, 2)
    );
    console.log(`✅ Saved ${predictions.length} predictions.`);
}


async function generateSystemDetails() {
    console.log('🔍 Generating Individual System Details JSON...');

    // Get all systems and their latest predictions
    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true }
    });

    for (const system of systems) {
        // console.log(`   > Processing ${system.name}...`);

        // 1. Get History (Last 500 from SystemPerformance - The Source of Truth)
        const predictions = await prisma.systemPerformance.findMany({
            where: { systemName: system.name },
            orderBy: { draw: { date: 'desc' } },
            // take: 500, // REMOVED to allow full history sync
            include: { draw: { select: { date: true } } }
        });

        // 2. Get Full Stats (Aggregated from SystemPerformance)
        const hitStats = await prisma.systemPerformance.groupBy({
            by: ['hits'],
            where: { systemName: system.name },
            _count: { hits: true }
        });

        const fullHitCounts = [0, 0, 0, 0, 0, 0];
        let totalFullPredictions = 0;
        let totalHitsSum = 0;

        hitStats.forEach(stat => {
            if (stat.hits >= 0 && stat.hits <= 5) {
                fullHitCounts[stat.hits] = stat._count.hits;
                totalFullPredictions += stat._count.hits;
                totalHitsSum += (stat.hits * stat._count.hits);
            }
        });

        const accuracy = totalFullPredictions > 0
            ? ((totalHitsSum / totalFullPredictions) / 5) * 100
            : 0;

        // 3. Get Next Prediction
        const nextPred = await prisma.cachedPrediction.findFirst({
            where: { systemName: system.name }
        });

        const data = {
            metadata: system,
            stats: {
                accuracy,
                totalPredictions: totalFullPredictions,
                distribution: fullHitCounts
            },
            nextPrediction: nextPred ? JSON.parse(nextPred.numbers) : [],
            history: predictions.map(p => ({
                id: p.id,
                date: p.draw.date,
                drawNumbers: JSON.parse(p.actualNumbers),
                predictedNumbers: JSON.parse(p.predictedNumbers),
                hits: p.hits
            }))
        };

        // Sanitize filename
        const safeName = system.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        await fs.writeFile(
            path.join(STATIC_DIR, `system-detail-${safeName}.json`),
            JSON.stringify(data, null, 2)
        );
    }
    console.log(`✅ Saved ${systems.length} system detail files.`);
}

async function main() {
    await ensureDir();
    await generateDraws();
    await generateRankings();
    await generateSystemDetails(); // New step
    await generatePredictions();
    await generateStats();
    console.log('✨ Static Generation Complete!');
}


main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
