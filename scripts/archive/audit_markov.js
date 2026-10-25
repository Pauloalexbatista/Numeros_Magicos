const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateMarkovChain(chronDraws, maxNum) {
    if (!chronDraws || chronDraws.length === 0) return [];
    if (chronDraws.length >= 2) {
        const d0 = new Date(chronDraws[0].date).getTime();
        const d1 = new Date(chronDraws[1].date).getTime();
        if (d0 < d1) chronDraws = [...chronDraws].reverse();
    }
    if (chronDraws.length < 2) return Array.from({ length: maxNum }, (_, i) => i + 1);

    const parseNumbers = (draw) => {
        if (!draw || !draw.numbers) return [];
        return typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers;
    };

    const transitions = {};
    for (let i = 1; i <= maxNum; i++) transitions[i] = {};

    for (let k = 0; k < chronDraws.length - 1; k++) {
        const prevDrawNums = parseNumbers(chronDraws[k + 1]);
        const nextDrawNums = parseNumbers(chronDraws[k]);

        prevDrawNums.forEach(prev => {
            if (transitions[prev] !== undefined) {
                nextDrawNums.forEach(next => {
                    transitions[prev][next] = (transitions[prev][next] || 0) + 1;
                });
            }
        });
    }

    const lastNumbers = parseNumbers(chronDraws[0]);
    const scores = {};
    for (let i = 1; i <= maxNum; i++) scores[i] = 0;

    lastNumbers.forEach(prev => {
        if (transitions[prev]) {
            Object.entries(transitions[prev]).forEach(([nextStr, count]) => {
                const next = Number(nextStr);
                if (scores[next] !== undefined) scores[next] += count;
            });
        }
    });

    const freq20 = {};
    for (let i = 1; i <= maxNum; i++) freq20[i] = 0;
    const recent20 = chronDraws.slice(0, 20);
    recent20.forEach(d => {
        parseNumbers(d).forEach(n => {
            if (freq20[n] !== undefined) freq20[n]++;
        });
    });

    const candidates = Array.from({ length: maxNum }, (_, i) => i + 1);
    candidates.sort((a, b) => {
        const diffScore = scores[b] - scores[a];
        if (diffScore !== 0) return diffScore;
        const diffFreq = freq20[b] - freq20[a];
        if (diffFreq !== 0) return diffFreq;
        return a - b;
    });

    return candidates;
}

async function auditGame(game, maxNum) {
    console.log(`\n============================================================`);
    console.log(`🔍 AUDITING: ${game} - Transições de Markov`);
    console.log(`============================================================`);

    const records = await prisma.systemPrediction.findMany({
        where: { game, systemName: 'Transições de Markov', domain: 'NUMBERS' },
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

        if (priorHistory.length < 2) {
            console.log(`   ⏭️ Sorteio [${drawDate}]: Histórico menor que 2`);
            continue;
        }

        const freshPred = calculateMarkovChain(priorHistory, maxNum);
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
    console.log(`🐕 WATCHDOG AUDIT: Transições de Markov`);
    await auditGame('TOTOLOTO', 49);
    await auditGame('EURODREAMS', 40);
    await auditGame('EUROMILLIONS', 50);
    await auditGame('MEGASENA', 60);
}

main().finally(() => prisma.$disconnect());
