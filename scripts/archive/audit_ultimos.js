const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateUltimosASair(history, maxNum) {
    if (!history || history.length === 0) return [];
    if (history.length >= 2) {
        const d0 = new Date(history[0].date).getTime();
        const d1 = new Date(history[1].date).getTime();
        if (d0 < d1) history = [...history].reverse();
    }
    const uniqueNumbers = new Set();
    for (const draw of history) {
        if (uniqueNumbers.size >= maxNum) break;
        let numbers = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers;
        if (Array.isArray(numbers)) {
            const sorted = [...numbers].sort((a, b) => a - b);
            for (const num of sorted) {
                if (num >= 1 && num <= maxNum && uniqueNumbers.size < maxNum) {
                    uniqueNumbers.add(num);
                }
            }
        }
    }
    for (let i = 1; i <= maxNum; i++) {
        if (uniqueNumbers.size >= maxNum) break;
        uniqueNumbers.add(i);
    }
    return Array.from(uniqueNumbers);
}

async function auditGame(game, maxNum) {
    console.log(`\n============================================================`);
    console.log(`🔍 AUDITING: ${game} - Últimos a Sair`);
    console.log(`============================================================`);

    const records = await prisma.systemPrediction.findMany({
        where: { game, systemName: 'Últimos a Sair', domain: 'NUMBERS' },
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
            orderBy: { date: 'desc' }
        });

        if (priorHistory.length === 0) {
            console.log(`   ⏭️ Sorteio [${drawDate}]: Sem histórico prévio`);
            continue;
        }

        const freshPred = calculateUltimosASair(priorHistory, maxNum);
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
    console.log(`🐕 WATCHDOG AUDIT: Últimos a Sair`);
    await auditGame('TOTOLOTO', 49);
    await auditGame('EURODREAMS', 40);
    await auditGame('EUROMILLIONS', 50);
    await auditGame('MEGASENA', 60);
}

main().finally(() => prisma.$disconnect());
