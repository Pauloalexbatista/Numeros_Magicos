const { PrismaClient } = require('@prisma/client');
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
        if (!dominantRoots.has(root)) score *= 1.5;
        else score *= 0.5;
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

async function auditGame(game, maxNum) {
    console.log(`\n============================================================`);
    console.log(`🔍 AUDITING: ${game} - Sistema Oscilação Universal V2`);
    console.log(`============================================================`);

    const records = await prisma.systemPrediction.findMany({
        where: { game, systemName: 'Sistema Oscilação Universal V2', domain: 'NUMBERS' },
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

        const freshPred = calculateOscilacaoV2(priorHistory, maxNum);
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
    console.log(`🐕 WATCHDOG AUDIT: Sistema Oscilação Universal V2`);
    await auditGame('TOTOLOTO', 49);
    await auditGame('EURODREAMS', 40);
    await auditGame('EUROMILLIONS', 50);
    await auditGame('MEGASENA', 60);
}

main().finally(() => prisma.$disconnect());
