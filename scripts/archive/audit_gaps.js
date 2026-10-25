const { PrismaClient } = require('@prisma/client');
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
    if (sortedDraw.length < 2) return Array.from({ length: maxNum }, (_, i) => i + 1);

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

async function auditGame(game, maxNum) {
    console.log(`\n============================================================`);
    console.log(`🔍 AUDITING: ${game} - Pirâmide de Intervalos`);
    console.log(`============================================================`);

    const records = await prisma.systemPrediction.findMany({
        where: { game, systemName: 'Pirâmide de Intervalos', domain: 'NUMBERS' },
        orderBy: { draw: { date: 'desc' } },
        take: 50,
        include: { draw: true }
    });

    if (records.length === 0) {
        console.log(`❌ Nenhum registo encontrado para ${game}`);
        return;
    }

    const predStrings = records.map(r => r.prediction);
    const uniqueCount = new Set(predStrings).size;
    let consecutiveIdentical = 0;
    for (let i = 0; i < predStrings.length - 1; i++) {
        if (predStrings[i] === predStrings[i + 1]) consecutiveIdentical++;
    }

    console.log(`📊 Últimos 50 Sorteios:`);
    console.log(`   • Previsões Únicas: ${uniqueCount} / ${records.length}`);
    console.log(`   • Repetições Consecutivas: ${consecutiveIdentical}`);

    if (uniqueCount === records.length) {
        console.log(`   ✅ SUCESSO: Todas as 50 previsões são 100% orgânicas e distintas!`);
    } else {
        console.log(`   ⚠️ ALERTA: Repetições detectadas!`);
    }

    console.log(`\n🧪 Verificação Pontual de Integridade (Recálculo puro):`);
    const testIndices = [0, Math.floor(records.length / 2), records.length - 1];

    for (const idx of testIndices) {
        const rec = records[idx];
        const drawDate = rec.draw.date.toISOString().split('T')[0];

        const priorHistory = await prisma.draw.findMany({
            where: {
                game,
                date: { lt: rec.draw.date }
            },
            orderBy: { date: 'desc' }
        });

        if (priorHistory.length === 0) {
            console.log(`   ⏭️ Sorteio [${drawDate}]: Sem histórico`);
            continue;
        }

        const freshPred = calculatePyramidGaps(priorHistory, maxNum);
        const storedPred = JSON.parse(rec.prediction);

        const isMatch = JSON.stringify(freshPred) === JSON.stringify(storedPred);
        if (isMatch) {
            console.log(`   ✅ Sorteio [${drawDate}]: Match 100% exato (${freshPred.length} números verificados)`);
        } else {
            console.log(`   ❌ Sorteio [${drawDate}]: Divergência detectada!`);
        }
    }
}

async function main() {
    console.log(`🐕 WATCHDOG AUDIT: Pirâmide de Intervalos`);
    await auditGame('TOTOLOTO', 49);
    await auditGame('EURODREAMS', 40);
    await auditGame('EUROMILLIONS', 50);
    await auditGame('MEGASENA', 60);
}

main().finally(() => prisma.$disconnect());
