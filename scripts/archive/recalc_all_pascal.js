const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

const WEIGHTS = [
    { 0: 5.0 },
    { 0: 4.0, 1: 3.0 },
    { 0: 3.0, 1: 2.0, 2: 1.0 },
    { 0: 2.0, 1: 1.5, 2: 1.0, 3: 0.5 },
    { 0: 1.0, 1: 0.8, 2: 0.6, 3: 0.4, 4: 0.2 }
];

function calculatePyramidPascal(chronDraws, maxNum) {
    if (!chronDraws || chronDraws.length === 0) return [];
    if (chronDraws.length >= 2) {
        const d0 = new Date(chronDraws[0].date).getTime();
        const d1 = new Date(chronDraws[1].date).getTime();
        if (d0 < d1) chronDraws = [...chronDraws].reverse();
    }

    const recentHistory = chronDraws.slice(0, 5).map(d => {
        let nums = typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers;
        return new Set(nums);
    });

    const wrapCol = (k) => (((k - 1) % maxNum) + maxNum) % maxNum + 1;

    const candidates = [];

    for (let n = 1; n <= maxNum; n++) {
        let totalScore = 0;
        let recentScore = 0;

        for (let lvl = 0; lvl < recentHistory.length; lvl++) {
            const drawSet = recentHistory[lvl];
            const weightsMap = WEIGHTS[lvl];
            const maxOffset = lvl;

            for (let offset = 0; offset <= maxOffset; offset++) {
                const weight = weightsMap[offset] || 0;
                if (offset === 0) {
                    if (drawSet.has(n)) {
                        totalScore += weight;
                        if (lvl === 0) recentScore += weight * 10;
                        else if (lvl === 1) recentScore += weight * 5;
                    }
                } else {
                    const leftCol = wrapCol(n - offset);
                    const rightCol = wrapCol(n + offset);

                    if (drawSet.has(leftCol)) {
                        totalScore += weight;
                        if (lvl <= 1) recentScore += weight;
                    }
                    if (drawSet.has(rightCol)) {
                        totalScore += weight;
                        if (lvl <= 1) recentScore += weight;
                    }
                }
            }
        }

        candidates.push({ num: n, score: totalScore, recentScore });
    }

    candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.recentScore !== a.recentScore) return b.recentScore - a.recentScore;
        return a.num - b.num;
    });

    return candidates.map(c => c.num);
}

const calculateNumberHits = (prediction, actual) => {
    const hits = {};
    for (let cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
        const top = prediction.slice(0, cut);
        hits[`num_hits_${cut}`] = top.filter((n) => actual.includes(n)).length;
    }
    return hits;
};

async function processGame(game, maxNum) {
    console.log(`\n============================================================`);
    console.log(`🚀 PROCESSING ${game} (maxNum: ${maxNum}) - Pirâmide de Pascal`);
    console.log(`============================================================`);

    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' }
    });

    console.log(`Total draws found: ${draws.length}`);
    const startTime = Date.now();
    let processed = 0;
    const systemName = 'Pirâmide de Pascal';

    for (let i = 0; i < draws.length; i++) {
        const currentDraw = draws[i];
        const history = draws.slice(i + 1);

        // Require at least 5 prior draws to form the 5 levels (T-1 to T-5)
        if (history.length < 5) continue;

        const prediction = calculatePyramidPascal(history, maxNum);
        const actual = typeof currentDraw.numbers === 'string' ? JSON.parse(currentDraw.numbers) : currentDraw.numbers;
        const hits = calculateNumberHits(prediction, actual);

        const existing = await prisma.systemPrediction.findFirst({
            where: {
                systemName,
                drawId: currentDraw.id,
                domain: 'NUMBERS'
            }
        });

        const data = {
            prediction: JSON.stringify(prediction),
            cutoff: maxNum,
            ...hits,
            calculatedAt: new Date()
        };

        if (existing) {
            await prisma.systemPrediction.update({
                where: { id: existing.id },
                data
            });
        } else {
            await prisma.systemPrediction.create({
                data: {
                    systemName,
                    drawId: currentDraw.id,
                    game,
                    domain: 'NUMBERS',
                    ...data
                }
            });
        }

        processed++;
        if (processed % 500 === 0 || i === draws.length - 6) {
            console.log(`  Processed ${processed} draws...`);
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ ${game} Pirâmide de Pascal completed in ${elapsed}s (${processed} draws).`);

    // Update SystemRanking
    const performances = await prisma.systemPrediction.findMany({
        where: { systemName, game, domain: 'NUMBERS' },
        orderBy: { draw: { date: 'desc' } },
        take: 100
    });

    if (performances.length > 0) {
        const maxHits = (game === 'EURODREAMS' || game === 'MEGASENA') ? 6 : 5;
        const predCut = (game === 'EURODREAMS') ? 'num_hits_20' : (game === 'MEGASENA') ? 'num_hits_30' : 'num_hits_25';
        const totalAccuracy = performances.reduce((sum, p) => sum + (((p[predCut] ?? p.num_hits_25 ?? 0) / maxHits) * 100), 0);
        const avgAccuracy = totalAccuracy / performances.length;

        await prisma.systemRanking.upsert({
            where: {
                systemName_game: {
                    systemName,
                    game
                }
            },
            update: {
                avgAccuracy,
                totalPredictions: performances.length,
                lastUpdated: new Date()
            },
            create: {
                game,
                systemName,
                avgAccuracy,
                totalPredictions: performances.length
            }
        });
        console.log(`📊 [${game}] Ranking updated: avgAccuracy = ${avgAccuracy.toFixed(2)}%`);
    }

    // Export consolidated file
    const allRecords = await prisma.systemPrediction.findMany({
        where: { game, systemName, domain: 'NUMBERS' },
        orderBy: { draw: { date: 'asc' } },
        select: {
            drawId: true,
            prediction: true,
            cutoff: true,
            num_hits_5: true,
            num_hits_10: true,
            num_hits_15: true,
            num_hits_20: true,
            num_hits_25: true,
            num_hits_30: true,
            num_hits_35: true,
            num_hits_40: true,
            num_hits_45: true,
            num_hits_50: true,
            num_hits_55: true,
            num_hits_60: true,
            draw: { select: { date: true, numbers: true } }
        }
    });

    const exportPath = `/tmp/piramide_pascal_${game.toLowerCase()}.json`;
    fs.writeFileSync(exportPath, JSON.stringify(allRecords, null, 2));
    console.log(`📦 Consolidated vault export saved to ${exportPath} (${allRecords.length} records)`);
}

async function main() {
    await processGame('TOTOLOTO', 49);
    await processGame('EURODREAMS', 40);
    await processGame('EUROMILLIONS', 50);
    await processGame('MEGASENA', 60);
    console.log('\n🎉 ALL 4 GAMES COMPLETED AND EXPORTED FOR PIRÂMIDE DE PASCAL!');
}

main().finally(() => prisma.$disconnect());
