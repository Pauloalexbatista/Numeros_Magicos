const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateMedia3Otimizado(history, maxNum) {
    if (!history || history.length < 50) return [];
    if (history.length >= 2) {
        const d0 = new Date(history[0].date).getTime();
        const d1 = new Date(history[1].date).getTime();
        if (d0 < d1) history = [...history].reverse();
    }
    const recentDraws = history.slice(0, 50).map(d => {
        let nums = typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers;
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

    for (let c = 0; c < numCasas; c++) addNumber(means[c]);
    for (let dist = 1; dist <= maxNum; dist++) {
        for (let c = 0; c < numCasas; c++) {
            addNumber(means[c] - dist);
            addNumber(means[c] + dist);
        }
        if (selectedNumbers.length >= maxNum) break;
    }
    for (let k = 1; k <= maxNum; k++) addNumber(k);
    return selectedNumbers;
}

async function auditGame(game, maxNum) {
    console.log(`\n============================================================`);
    console.log(`🔍 AUDITING: ${game} - Sistema Média +3 Otimizado`);
    console.log(`============================================================`);

    const records = await prisma.systemPrediction.findMany({
        where: { game, systemName: 'Sistema Média +3 Otimizado', domain: 'NUMBERS' },
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
        console.log(`   ⚠️ ALERTA: Existem previsões repetidas no histórico!`);
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
            orderBy: { date: 'desc' },
            take: 50
        });

        if (priorHistory.length < 50) {
            console.log(`   ⏭️ Sorteio [${drawDate}]: Histórico menor que 50 (ignorado)`);
            continue;
        }

        const freshPred = calculateMedia3Otimizado(priorHistory, maxNum);
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
    console.log(`🐕 WATCHDOG AUDIT: Sistema Média +3 Otimizado`);
    await auditGame('TOTOLOTO', 49);
    await auditGame('EURODREAMS', 40);
    await auditGame('EUROMILLIONS', 50);
    await auditGame('MEGASENA', 60);
}

main().finally(() => prisma.$disconnect());
