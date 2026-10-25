const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

function calculateMedia3Otimizado(history, maxNum) {
    if (!history || history.length < 50) return [];

    // Reverse guard: ensure history[0] is most recent (T-1)
    if (history.length >= 2) {
        const d0 = new Date(history[0].date).getTime();
        const d1 = new Date(history[1].date).getTime();
        if (d0 < d1) history = [...history].reverse();
    }

    // 1. Obter os ultimos 50 sorteios
    const recentDraws = history.slice(0, 50).map(d => {
        let nums = [];
        if (typeof d.numbers === 'string') {
            nums = JSON.parse(d.numbers);
        } else if (Array.isArray(d.numbers)) {
            nums = d.numbers;
        }
        return [...nums].sort((a, b) => a - b);
    });

    const numCasas = recentDraws[0].length;
    const means = [];

    for (let c = 0; c < numCasas; c++) {
        const valuesInCasa = recentDraws.map(d => d[c]).filter(n => typeof n === 'number' && !isNaN(n));
        if (valuesInCasa.length === 0) continue;
        const sum = valuesInCasa.reduce((acc, v) => acc + v, 0);
        const avg = sum / valuesInCasa.length;
        means.push(Math.round(avg));
    }

    const selectedNumbers = [];
    const seen = new Set();

    const addNumber = (num) => {
        if (num >= 1 && num <= maxNum && !seen.has(num)) {
            seen.add(num);
            selectedNumbers.push(num);
        }
    };

    // Tier 0: Medias de cada casa
    for (let c = 0; c < numCasas; c++) {
        addNumber(means[c]);
    }

    // Tiers superiores concentricos (+/- dist)
    for (let dist = 1; dist <= maxNum; dist++) {
        for (let c = 0; c < numCasas; c++) {
            addNumber(means[c] - dist);
            addNumber(means[c] + dist);
        }
        if (selectedNumbers.length >= maxNum) break;
    }

    // Fallback garantido
    for (let k = 1; k <= maxNum; k++) {
        addNumber(k);
    }

    return selectedNumbers;
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
    console.log(`🚀 PROCESSING ${game} (maxNum: ${maxNum}) - Sistema Média +3 Otimizado`);
    console.log(`============================================================`);

    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' }
    });

    console.log(`Total draws found: ${draws.length}`);
    const startTime = Date.now();
    let processed = 0;
    const systemName = 'Sistema Média +3 Otimizado';

    for (let i = 0; i < draws.length; i++) {
        const currentDraw = draws[i];
        const history = draws.slice(i + 1);

        // Require minimum history of 50 draws
        if (history.length < 50) continue;

        const prediction = calculateMedia3Otimizado(history, maxNum);
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
        if (processed % 500 === 0 || i === draws.length - 51) {
            console.log(`  Processed ${processed} draws...`);
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ ${game} Média +3 Otimizado completed in ${elapsed}s (${processed} draws).`);

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

    const exportPath = `/tmp/media_3_otimizado_${game.toLowerCase()}.json`;
    fs.writeFileSync(exportPath, JSON.stringify(allRecords, null, 2));
    console.log(`📦 Consolidated vault export saved to ${exportPath} (${allRecords.length} records)`);
}

async function main() {
    await processGame('TOTOLOTO', 49);
    await processGame('EURODREAMS', 40);
    await processGame('EUROMILLIONS', 50);
    await processGame('MEGASENA', 60);
    console.log('\n🎉 ALL 4 GAMES COMPLETED AND EXPORTED FOR SISTEMA MÉDIA +3 OTIMIZADO!');
}

main().finally(() => prisma.$disconnect());
