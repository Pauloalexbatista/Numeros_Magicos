const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

function getRoot(num) {
    return (((num - 1) % 9) + 1);
}

function calculateOscilacaoV2(chronHistory, maxNum) {
    if (!chronHistory || chronHistory.length === 0) return [];
    if (chronHistory.length >= 2) {
        const d0 = new Date(chronHistory[0].date).getTime();
        const d1 = new Date(chronHistory[1].date).getTime();
        if (d0 < d1) chronHistory = [...chronHistory].reverse();
    }

    const recentHistory = chronHistory.slice(0, 1000);

    const lastDraw = chronHistory[0];
    let lastNumbers = typeof lastDraw.numbers === 'string' ? JSON.parse(lastDraw.numbers) : lastDraw.numbers;

    const rootCount = {};
    for (let i = 1; i <= 9; i++) rootCount[i] = 0;

    lastNumbers.forEach((n) => {
        const root = getRoot(n);
        if (rootCount[root] !== undefined) rootCount[root]++;
    });

    const maxCount = Math.max(...Object.values(rootCount));
    const dominantRoots = new Set();
    if (maxCount > 0) {
        Object.entries(rootCount).forEach(([rootStr, count]) => {
            if (count === maxCount) dominantRoots.add(Number(rootStr));
        });
    }

    const globalFreq = {};
    const freq20 = {};
    for (let i = 1; i <= maxNum; i++) {
        globalFreq[i] = 0;
        freq20[i] = 0;
    }

    recentHistory.forEach((draw, idx) => {
        let nums = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers;
        nums.forEach(n => {
            if (globalFreq[n] !== undefined) globalFreq[n]++;
            if (idx < 20 && freq20[n] !== undefined) freq20[n]++;
        });
    });

    const candidates = [];
    for (let n = 1; n <= maxNum; n++) {
        const root = getRoot(n);
        let score = globalFreq[n];

        if (!dominantRoots.has(root)) {
            score *= 1.5;
        } else {
            score *= 0.5;
        }

        candidates.push({ num: n, score, freq20: freq20[n] });
    }

    candidates.sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (Math.abs(scoreDiff) > 0.001) return scoreDiff;

        const freqDiff = b.freq20 - a.freq20;
        if (freqDiff !== 0) return freqDiff;

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
    console.log(`🚀 PROCESSING ${game} (maxNum: ${maxNum}) - Sistema Oscilação Universal V2`);
    console.log(`============================================================`);

    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' }
    });

    console.log(`Total draws found: ${draws.length}`);
    const startTime = Date.now();
    let processed = 0;
    const systemName = 'Sistema Oscilação Universal V2';

    for (let i = 0; i < draws.length; i++) {
        const currentDraw = draws[i];
        const history = draws.slice(i + 1);

        if (history.length < 1) continue;

        const prediction = calculateOscilacaoV2(history, maxNum);
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
        if (processed % 500 === 0 || i === draws.length - 2) {
            console.log(`  Processed ${processed} draws...`);
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ ${game} Oscilação Universal V2 completed in ${elapsed}s (${processed} draws).`);

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

    const exportPath = `/tmp/oscilacao_universal_${game.toLowerCase()}.json`;
    fs.writeFileSync(exportPath, JSON.stringify(allRecords, null, 2));
    console.log(`📦 Consolidated vault export saved to ${exportPath} (${allRecords.length} records)`);
}

async function main() {
    await processGame('TOTOLOTO', 49);
    await processGame('EURODREAMS', 40);
    await processGame('EUROMILLIONS', 50);
    await processGame('MEGASENA', 60);
    console.log('\n🎉 ALL 4 GAMES COMPLETED AND EXPORTED FOR SISTEMA OSCILAÇÃO UNIVERSAL V2!');
}

main().finally(() => prisma.$disconnect());
