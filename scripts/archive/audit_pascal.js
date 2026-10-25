const { PrismaClient } = require('@prisma/client');
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

async function auditGame(game, maxNum) {
    console.log(`\n============================================================`);
    console.log(`🔍 AUDITING: ${game} - Pirâmide de Pascal`);
    console.log(`============================================================`);

    const records = await prisma.systemPrediction.findMany({
        where: { game, systemName: 'Pirâmide de Pascal', domain: 'NUMBERS' },
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

        if (priorHistory.length < 5) {
            console.log(`   ⏭️ Sorteio [${drawDate}]: Histórico menor que 5 (ignorado)`);
            continue;
        }

        const freshPred = calculatePyramidPascal(priorHistory, maxNum);
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
    console.log(`🐕 WATCHDOG AUDIT: Pirâmide de Pascal`);
    await auditGame('TOTOLOTO', 49);
    await auditGame('EURODREAMS', 40);
    await auditGame('EUROMILLIONS', 50);
    await auditGame('MEGASENA', 60);
}

main().finally(() => prisma.$disconnect());
