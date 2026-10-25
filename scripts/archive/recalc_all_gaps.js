const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

function calculatePyramidGaps(chronDraws, maxNum) {
    if (!chronDraws || chronDraws.length === 0) return [];
    if (chronDraws.length >= 2) {
        const d0 = new Date(chronDraws[0].date).getTime();
        const d1 = new Date(chronDraws[1].date).getTime();
        if (d0 < d1) chronDraws = [...chronDraws].reverse();
    }

    const lastDraw = chronDraws[0];
    let lastNumbers = typeof lastDraw.numbers === 'string' ? JSON.parse(lastDraw.numbers) : lastDraw.numbers;
    const sortedDraw = [...lastNumbers].sort((a, b) => a - b);
    if (sortedDraw.length < 2) {
        return Array.from({ length: maxNum }, (_, i) => i + 1);
    }

    const pyramidLayers = [];
    let currentLayer = [...sortedDraw];

    while (currentLayer.length > 1) {
        const nextLayer = [];
        for (let i = 0; i < currentLayer.length - 1; i++) {
            nextLayer.push(Math.abs(currentLayer[i + 1] - currentLayer[i]));
        }
        pyramidLayers.push(nextLayer);
        currentLayer = nextLayer;
    }

    const totalLevels = pyramidLayers.length;
    const levelWeights = pyramidLayers.map((_, idx) => 1.5 + (idx / Math.max(1, totalLevels - 1)) * 3.5);
    const wrap = (k) => (((k - 1) % maxNum) + maxNum) % maxNum + 1;

    const scores = {};
    for (let i = 1; i <= maxNum; i++) scores[i] = 0;

    sortedDraw.forEach(b => {
        pyramidLayers.forEach((layer, lvlIdx) => {
            const w = levelWeights[lvlIdx];
            layer.forEach(gap => {
                if (gap > 0) {
                    scores[wrap(b + gap)] += w;
                    scores[wrap(b - gap)] += w;
                }
            });
        });
    });

    const freq20 = {};
    for (let i = 1; i <= maxNum; i++) freq20[i] = 0;

    const recent20 = chronDraws.slice(0, 20);
    recent20.forEach(d => {
        let nums = typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers;
        nums.forEach(n => {
            if (freq20[n] !== undefined) freq20[n]++;
        });
    });

    const candidates = Array.from({ length: maxNum }, (_, i) => i + 1);
    candidates.sort((a, b) => {
        const scoreDiff = scores[b] - scores[a];
        if (Math.abs(scoreDiff) > 0.001) return scoreDiff;
        const freqDiff = freq20[b] - freq20[a];
        if (freqDiff !== 0) return freqDiff;
        return a - b;
    });

    return candidates;
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
    console.log(`🚀 PROCESSING ${game} (maxNum: ${maxNum}) - Pirâmide de Intervalos`);
    console.log(`============================================================`);

    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' }
    });

    console.log(`Total draws found: ${draws.length}`);
    const startTime = Date.now();
    let processed = 0;
    const systemName = 'Pirâmide de Intervalos';

    for (let i = 0; i < draws.length; i++) {
        const currentDraw = draws[i];
        const history = draws.slice(i + 1);

        if (history.length < 1) continue;

        const prediction = calculatePyramidGaps(history, maxNum);
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
    console.log(`✅ ${game} Pirâmide de Intervalos completed in ${elapsed}s (${processed} draws).`);

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

    const exportPath = `/tmp/piramide_intervalos_${game.toLowerCase()}.json`;
    fs.writeFileSync(exportPath, JSON.stringify(allRecords, null, 2));
    console.log(`📦 Consolidated vault export saved to ${exportPath} (${allRecords.length} records)`);
}

async function main() {
    await processGame('TOTOLOTO', 49);
    await processGame('EURODREAMS', 40);
    await processGame('EUROMILLIONS', 50);
    await processGame('MEGASENA', 60);
    console.log('\n🎉 ALL 4 GAMES COMPLETED AND EXPORTED FOR PIRÂMIDE DE INTERVALOS!');
}

main().finally(() => prisma.$disconnect());
