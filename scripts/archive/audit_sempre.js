const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateHotNumbers(chronDraws, maxNum) {
    if (!chronDraws || chronDraws.length === 0) return [];
    if (chronDraws.length >= 2) {
        const d0 = new Date(chronDraws[0].date).getTime();
        const d1 = new Date(chronDraws[1].date).getTime();
        if (d0 < d1) chronDraws = [...chronDraws].reverse();
    }
    const parseNumbers = (draw) => {
        if (!draw || !draw.numbers) return [];
        return typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers;
    };
    const totalFreq = {};
    const freq20 = {};
    for (let i = 1; i <= maxNum; i++) {
        totalFreq[i] = 0;
        freq20[i] = 0;
    }
    chronDraws.forEach((draw, idx) => {
        const nums = parseNumbers(draw);
        nums.forEach(n => {
            if (totalFreq[n] !== undefined) totalFreq[n]++;
            if (idx < 20 && freq20[n] !== undefined) freq20[n]++;
        });
    });
    const candidates = Array.from({ length: maxNum }, (_, i) => i + 1);
    candidates.sort((a, b) => {
        const diffTotal = totalFreq[b] - totalFreq[a];
        if (diffTotal !== 0) return diffTotal;
        const diff20 = freq20[b] - freq20[a];
        if (diff20 !== 0) return diff20;
        return a - b;
    });
    return candidates;
}

async function auditGame(game, maxNum) {
    console.log(`\n============================================================`);
    console.log(`🔍 AUDITING: ${game} - Mais Sorteadas de Sempre`);
    console.log(`============================================================`);

    const records = await prisma.systemPrediction.findMany({
        where: { game, systemName: 'Mais Sorteadas de Sempre', domain: 'NUMBERS' },
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
        console.log(`   ℹ️ Previsões únicas: ${uniqueCount}/${records.length} (comportamento de inércia cumulativa global)`);
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

        const freshPred = calculateHotNumbers(priorHistory, maxNum);
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
    console.log(`🐕 WATCHDOG AUDIT: Mais Sorteadas de Sempre`);
    await auditGame('TOTOLOTO', 49);
    await auditGame('EURODREAMS', 40);
    await auditGame('EUROMILLIONS', 50);
    await auditGame('MEGASENA', 60);
}

main().finally(() => prisma.$disconnect());
