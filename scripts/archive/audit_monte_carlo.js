const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SeededRNG {
    constructor(seed) {
        this.m = 0x80000000;
        this.a = 1103515245;
        this.c = 12345;
        let h = 0;
        for (let i = 0; i < seed.length; i++) {
            h = (h << 5) - h + seed.charCodeAt(i);
            h |= 0;
        }
        this.state = (h < 0 ? ~h + 1 : h) % this.m;
    }
    next() {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state / (this.m - 1);
    }
}

function calculateMonteCarlo(chronDraws, maxNum) {
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

    const frequency = {};
    const freq20 = {};
    for (let i = 1; i <= maxNum; i++) {
        frequency[i] = 0;
        freq20[i] = 0;
    }

    chronDraws.forEach((draw, idx) => {
        const numbers = parseNumbers(draw);
        numbers.forEach(num => {
            if (frequency[num] !== undefined) frequency[num]++;
            if (idx < 20 && freq20[num] !== undefined) freq20[num]++;
        });
    });

    const totalBalls = Object.values(frequency).reduce((a, b) => a + b, 0) || 1;
    const probabilities = {};
    for (let i = 1; i <= maxNum; i++) {
        probabilities[i] = Math.max(0.01, frequency[i] / totalBalls);
    }

    const sampleNums = parseNumbers(chronDraws[0]);
    const ballsPerDraw = sampleNums.length >= 6 ? 6 : 5;

    const lastDraw = chronDraws[0];
    const seedStr = lastDraw ? `${lastDraw.id}-${lastDraw.date}` : 'monte-carlo-seed';
    const rng = new SeededRNG(seedStr);

    const simulations = 1000;
    const simulationResults = {};
    for (let i = 1; i <= maxNum; i++) simulationResults[i] = 0;

    for (let i = 0; i < simulations; i++) {
        const simDraw = [];
        const available = Array.from({ length: maxNum }, (_, idx) => idx + 1);

        while (simDraw.length < ballsPerDraw) {
            const weights = available.map(n => probabilities[n]);
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = rng.next() * totalWeight;

            for (let j = 0; j < available.length; j++) {
                random -= weights[j];
                if (random <= 0) {
                    const selected = available[j];
                    simDraw.push(selected);
                    available.splice(j, 1);
                    break;
                }
            }
        }

        simDraw.forEach(num => {
            simulationResults[num]++;
        });
    }

    const candidates = Array.from({ length: maxNum }, (_, i) => i + 1);
    candidates.sort((a, b) => {
        const diffSim = simulationResults[b] - simulationResults[a];
        if (diffSim !== 0) return diffSim;

        const diff20 = freq20[b] - freq20[a];
        if (diff20 !== 0) return diff20;

        return a - b;
    });

    return candidates;
}

async function auditGame(game, maxNum) {
    console.log(`\n============================================================`);
    console.log(`🔍 AUDITING: ${game} - Monte Carlo`);
    console.log(`============================================================`);

    const records = await prisma.systemPrediction.findMany({
        where: { game, systemName: 'Monte Carlo', domain: 'NUMBERS' },
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

        const freshPred = calculateMonteCarlo(priorHistory, maxNum);
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
    console.log(`🐕 WATCHDOG AUDIT: Monte Carlo`);
    await auditGame('TOTOLOTO', 49);
    await auditGame('EURODREAMS', 40);
    await auditGame('EUROMILLIONS', 50);
    await auditGame('MEGASENA', 60);
}

main().finally(() => prisma.$disconnect());
