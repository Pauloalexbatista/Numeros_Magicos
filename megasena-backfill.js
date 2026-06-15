/**
 * MEGASENA - Historical Backfill
 * Calculates system predictions for all 3018 draws and stores performance data.
 * Uses the rankedSystems from ranked-systems.ts adapted for 60 numbers / predict 30.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Inline system implementations (pure JS, no TypeScript compilation needed) ──

function parseNumbers(draw) {
    if (typeof draw.numbers === 'string') return JSON.parse(draw.numbers);
    return draw.numbers;
}

const MAX_NUM = 60;
const PRED_COUNT = 30;
const DRAWN_COUNT = 6;
const MIN_HISTORY = 50;

// Return top PRED_COUNT most frequent numbers
function hotNumbers(history) {
    const freq = {};
    for (let i = 1; i <= MAX_NUM; i++) freq[i] = 0;
    history.forEach(d => parseNumbers(d).forEach(n => { freq[n] = (freq[n] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([n]) => parseInt(n)).slice(0, PRED_COUNT);
}

// Return PRED_COUNT numbers that haven't appeared in the longest time
function lateNumbers(history) {
    const last = {};
    for (let i = 1; i <= MAX_NUM; i++) last[i] = history.length;
    history.forEach((d, idx) => parseNumbers(d).forEach(n => { if (last[n] === history.length) last[n] = idx; }));
    return Object.entries(last).sort((a, b) => b[1] - a[1]).map(([n]) => parseInt(n)).slice(0, PRED_COUNT);
}

// Return PRED_COUNT most recent numbers (last 20 draws)
function recentNumbers(history) {
    const recent = history.slice(0, 20);
    const freq = {};
    recent.forEach(d => parseNumbers(d).forEach(n => { freq[n] = (freq[n] || 0) + 1; }));
    const all = [];
    for (let i = 1; i <= MAX_NUM; i++) all.push({ n: i, f: freq[i] || 0 });
    return all.sort((a, b) => b.f - a.f).map(x => x.n).slice(0, PRED_COUNT);
}

// Markov chain - pick numbers that tend to follow the last draw
function markovChain(history) {
    const transitions = {};
    for (let i = 0; i < history.length - 1; i++) {
        const curr = parseNumbers(history[i]);
        const next = parseNumbers(history[i + 1]);
        curr.forEach(c => next.forEach(n => {
            if (!transitions[c]) transitions[c] = {};
            transitions[c][n] = (transitions[c][n] || 0) + 1;
        }));
    }
    const lastNums = parseNumbers(history[0]);
    const scores = {};
    for (let i = 1; i <= MAX_NUM; i++) scores[i] = 0;
    lastNums.forEach(n => {
        if (transitions[n]) Object.entries(transitions[n]).forEach(([k, v]) => { scores[parseInt(k)] = (scores[parseInt(k)] || 0) + v; });
    });
    return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([n]) => parseInt(n)).slice(0, PRED_COUNT);
}

// Monte Carlo - simulate draws and pick most common
function monteCarlo(history, simulations = 500) {
    const freq = {};
    for (let i = 1; i <= MAX_NUM; i++) freq[i] = 0;
    const pool = [];
    history.forEach(d => parseNumbers(d).forEach(n => { for (let w = 0; w < 3; w++) pool.push(n); }));
    for (let i = 1; i <= MAX_NUM; i++) pool.push(i);
    for (let s = 0; s < simulations; s++) {
        const drawn = new Set();
        while (drawn.size < DRAWN_COUNT) drawn.add(pool[Math.floor(Math.random() * pool.length)]);
        drawn.forEach(n => { freq[n]++; });
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([n]) => parseInt(n)).slice(0, PRED_COUNT);
}

// Clustering - group numbers by co-occurrence, pick top clusters
function clustering(history) {
    const coOcc = {};
    for (let i = 1; i <= MAX_NUM; i++) { coOcc[i] = {}; for (let j = 1; j <= MAX_NUM; j++) coOcc[i][j] = 0; }
    history.forEach(d => {
        const nums = parseNumbers(d);
        for (let a = 0; a < nums.length; a++) for (let b = a + 1; b < nums.length; b++) {
            coOcc[nums[a]][nums[b]]++;
            coOcc[nums[b]][nums[a]]++;
        }
    });
    const scores = {};
    for (let i = 1; i <= MAX_NUM; i++) scores[i] = Object.values(coOcc[i]).reduce((s, v) => s + v, 0);
    return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([n]) => parseInt(n)).slice(0, PRED_COUNT);
}

// PyramidGaps - predict based on gap patterns
function pyramidGaps(history) {
    const gaps = {};
    for (let i = 1; i <= MAX_NUM; i++) gaps[i] = [];
    history.forEach((d, idx) => {
        parseNumbers(d).forEach(n => {
            // Find last occurrence
            for (let j = idx + 1; j < history.length; j++) {
                if (parseNumbers(history[j]).includes(n)) { gaps[n].push(j - idx); break; }
            }
        });
    });
    const avgGap = {};
    for (let i = 1; i <= MAX_NUM; i++) avgGap[i] = gaps[i].length ? gaps[i].reduce((s, v) => s + v, 0) / gaps[i].length : MAX_NUM;
    const curGap = {};
    for (let i = 1; i <= MAX_NUM; i++) {
        curGap[i] = history.findIndex(d => parseNumbers(d).includes(i));
        if (curGap[i] === -1) curGap[i] = history.length;
    }
    const scores = {};
    for (let i = 1; i <= MAX_NUM; i++) scores[i] = curGap[i] / (avgGap[i] || 1);
    return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([n]) => parseInt(n)).slice(0, PRED_COUNT);
}

// PyramidPascal - Pascal triangle weights on number positions
function pyramidPascal(history) {
    const freq = {};
    for (let i = 1; i <= MAX_NUM; i++) freq[i] = 0;
    history.forEach((d, idx) => {
        const weight = 1 / (idx + 1);
        parseNumbers(d).forEach(n => { freq[n] += weight; });
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([n]) => parseInt(n)).slice(0, PRED_COUNT);
}

// Sist Média + 3 - mean + 3 optimized
function sistMedia3(history) {
    const freq = {};
    for (let i = 1; i <= MAX_NUM; i++) freq[i] = 0;
    history.forEach(d => parseNumbers(d).forEach(n => { freq[n]++; }));
    const avg = history.length * DRAWN_COUNT / MAX_NUM;
    const scores = {};
    for (let i = 1; i <= MAX_NUM; i++) scores[i] = Math.abs(freq[i] - avg);
    return Object.entries(scores).sort((a, b) => a[1] - b[1]).map(([n]) => parseInt(n)).slice(0, PRED_COUNT);
}

// Sistema Oscilação Universal V2 - oscillation patterns
function oscillationV2(history) {
    const freq = {};
    const recent = {};
    for (let i = 1; i <= MAX_NUM; i++) { freq[i] = 0; recent[i] = 0; }
    history.forEach((d, idx) => {
        const w = idx < 20 ? 3 : idx < 50 ? 2 : 1;
        parseNumbers(d).forEach(n => {
            freq[n] += 1;
            if (idx < 20) recent[n] += w;
        });
    });
    const scores = {};
    for (let i = 1; i <= MAX_NUM; i++) {
        const avgF = history.length * DRAWN_COUNT / MAX_NUM;
        scores[i] = (recent[i] * 2) + (avgF - freq[i]);
    }
    return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([n]) => parseInt(n)).slice(0, PRED_COUNT);
}

const SYSTEMS = [
    { name: 'Hot Numbers',                fn: hotNumbers },
    { name: 'Late Numbers',               fn: lateNumbers },
    { name: 'Recent Numbers',             fn: recentNumbers },
    { name: 'Markov Chain',               fn: markovChain },
    { name: 'Monte Carlo',                fn: monteCarlo },
    { name: 'Clustering',                 fn: clustering },
    { name: 'PyramidGaps',                fn: pyramidGaps },
    { name: 'PyramidPascal',              fn: pyramidPascal },
    { name: 'Sist Média + 3 Otimizado',   fn: sistMedia3 },
    { name: 'Sistema Oscilação Universal V2', fn: oscillationV2 },
];

async function main() {
    console.log('=== MEGA SENA BACKFILL HISTÓRICO ===');
    console.log('Configuração: maxNum=60, predCount=30, drawnCount=6\n');

    // Load all draws oldest-first
    const allDraws = await prisma.draw.findMany({
        where: { game: 'MEGASENA' },
        orderBy: { date: 'asc' },
        select: { id: true, date: true, numbers: true, game: true }
    });
    console.log('Total sorteios MEGASENA:', allDraws.length);

    // Get system IDs
    const sysRecords = await prisma.rankedSystem.findMany({
        where: { game: 'MEGASENA', isActive: true, domain: 'NUMBERS' },
        select: { id: true, name: true }
    });
    console.log('Sistemas activos:', sysRecords.map(s => s.name).join(', '));

    // Clear existing performance data for MEGASENA
    const deleted = await prisma.systemPerformance.deleteMany({ where: { game: 'MEGASENA' } });
    console.log('Performance anterior eliminada:', deleted.count, 'registos\n');

    const totalToProcess = allDraws.length - MIN_HISTORY;
    console.log('Sorteios a processar:', totalToProcess, '(de', MIN_HISTORY, 'em diante)\n');

    let totalInserted = 0;

    for (const sys of SYSTEMS) {
        const sysRec = sysRecords.find(s => s.name === sys.name);
        if (!sysRec) { console.log('Sistema não encontrado na BD:', sys.name); continue; }

        console.log('A calcular:', sys.name);
        const batch = [];

        for (let i = MIN_HISTORY; i < allDraws.length; i++) {
            const history = allDraws.slice(i - MIN_HISTORY, i).reverse(); // last N draws, newest first
            const targetDraw = allDraws[i];
            const actualNums = parseNumbers(targetDraw);

            let predicted;
            try { predicted = sys.fn(history); }
            catch (e) { console.error('  Erro em', sys.name, 'idx', i, e.message); continue; }

            const hits = actualNums.filter(n => predicted.includes(n)).length;
            const accuracy = hits / DRAWN_COUNT;

            batch.push({
                drawId: targetDraw.id,
                game: 'MEGASENA',
                systemName: sys.name,
                predictedNumbers: JSON.stringify(predicted),
                actualNumbers: JSON.stringify(actualNums),
                hits,
                accuracy
            });
        }

        // Insert in chunks of 500
        for (let c = 0; c < batch.length; c += 500) {
            await prisma.systemPerformance.createMany({
                data: batch.slice(c, c + 500)
            });
        }
        totalInserted += batch.length;
        const avgHits = batch.reduce((s, r) => s + r.hits, 0) / batch.length;
        const jackpots = batch.filter(r => r.hits === DRAWN_COUNT).length;
        console.log('  ✓ ' + batch.length + ' registos | média hits: ' + avgHits.toFixed(3) + ' | jackpots: ' + jackpots);
    }

    console.log('\n=== TOTAL INSERIDO:', totalInserted, '===\n');

    // Recalculate SystemRanking for MEGASENA
    console.log('A recalcular SystemRanking MEGASENA...');
    for (const sys of SYSTEMS) {
        const sysRec = sysRecords.find(s => s.name === sys.name);
        if (!sysRec) continue;

        const perfs = await prisma.systemPerformance.findMany({
            where: { game: 'MEGASENA', systemName: sys.name },
            select: { hits: true, accuracy: true }
        });
        if (perfs.length === 0) continue;

        const totalHits = perfs.reduce((s, p) => s + p.hits, 0);
        const avgAcc = perfs.reduce((s, p) => s + p.accuracy, 0) / perfs.length;
        const jackpots = perfs.filter(p => p.hits === DRAWN_COUNT).length;

        await prisma.systemRanking.upsert({
            where: { systemName_game: { systemName: sys.name, game: 'MEGASENA' } },
            update: { avgAccuracy: avgAcc, totalPredictions: perfs.length, lastUpdated: new Date() },
            create: { game: 'MEGASENA', systemName: sys.name, avgAccuracy: avgAcc, totalPredictions: perfs.length }
        });
        console.log('  ' + sys.name + ': avgAcc=' + (avgAcc * 100).toFixed(2) + '% jackpots=' + jackpots + '/' + perfs.length);
    }

    console.log('\n✅ Backfill MEGA SENA concluído!');
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

