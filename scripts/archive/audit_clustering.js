const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateClustering(chronDraws, maxNum) {
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
    const recent50 = chronDraws.slice(0, 50);
    const numClusters = Math.ceil(maxNum / 10);
    const clusterActivity = {};
    const freq50 = {};
    const globalFreq = {};
    for (let i = 1; i <= numClusters; i++) clusterActivity[i] = 0;
    for (let i = 1; i <= maxNum; i++) {
        freq50[i] = 0;
        globalFreq[i] = 0;
    }
    chronDraws.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            if (globalFreq[num] !== undefined) globalFreq[num]++;
        });
    });
    recent50.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            const cId = Math.ceil(num / 10);
            if (clusterActivity[cId] !== undefined) clusterActivity[cId]++;
            if (freq50[num] !== undefined) freq50[num]++;
        });
    });
    const sortedClusters = Object.entries(clusterActivity)
        .map(([id, count]) => ({ id: Number(id), count }))
        .sort((a, b) => b.count - a.count || a.id - b.id);
    const candidates = [];
    sortedClusters.forEach(cluster => {
        const startNum = (cluster.id - 1) * 10 + 1;
        const endNum = Math.min(cluster.id * 10, maxNum);
        const numsInCluster = [];
        for (let n = startNum; n <= endNum; n++) numsInCluster.push(n);
        numsInCluster.sort((a, b) => {
            const diff50 = freq50[b] - freq50[a];
            if (diff50 !== 0) return diff50;
            const diffGlobal = globalFreq[b] - globalFreq[a];
            if (diffGlobal !== 0) return diffGlobal;
            return a - b;
        });
        candidates.push(...numsInCluster);
    });
    return candidates;
}

async function auditGame(game, maxNum) {
    console.log(`\n============================================================`);
    console.log(`🔍 AUDITING: ${game} - Agrupamento de Padrões (Clustering)`);
    console.log(`============================================================`);

    const records = await prisma.systemPrediction.findMany({
        where: { game, systemName: 'Agrupamento de Padrões (Clustering)', domain: 'NUMBERS' },
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
        console.log(`   ℹ️ Previsões únicas: ${uniqueCount}/${records.length} (comportamento de densidade de 50 sorteios)`);
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

        if (priorHistory.length < 50) {
            console.log(`   ⏭️ Sorteio [${drawDate}]: Histórico menor que 50`);
            continue;
        }

        const freshPred = calculateClustering(priorHistory, maxNum);
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
    console.log(`🐕 WATCHDOG AUDIT: Agrupamento de Padrões (Clustering)`);
    await auditGame('TOTOLOTO', 49);
    await auditGame('EURODREAMS', 40);
    await auditGame('EUROMILLIONS', 50);
    await auditGame('MEGASENA', 60);
}

main().finally(() => prisma.$disconnect());
