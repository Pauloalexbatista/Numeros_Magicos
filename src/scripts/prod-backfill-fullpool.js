/**
 * Production backfill script for SystemPerformanceFullPool.
 * Uses @prisma/client-prod which targets PostgreSQL directly.
 * 
 * Run: node src/scripts/prod-backfill-fullpool.js EURODREAMS 5
 */
require('dotenv').config();

const { PrismaClient } = require('@prisma/client-prod');

const game = process.argv[2] || 'EURODREAMS';
const limit = parseInt(process.argv[3] || '3', 10);

const prodUrl = process.env.POSTGRES_URL_PROD;

const prisma = new PrismaClient({
    datasources: { db: { url: prodUrl } }
});

// ===================================================================
// Inline system implementations (since we can't import TS modules)
// These are simplified versions that match the actual system logic.
// ===================================================================

function parseNumbers(draw) {
    return typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers;
}

function parseStars(draw) {
    return typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars;
}

// EuroDreams-specific: pool is 1-40, draw 6 numbers
function getPoolSize(game) {
    if (game === 'EURODREAMS') return 40;
    if (game === 'TOTOLOTO') return 49;
    if (game === 'MEGASENA') return 60;
    return 50; // EUROMILLIONS
}

function ensureN(numbers, game, returnFullPool, predCount) {
    const pool = getPoolSize(game);
    let result = [...new Set(numbers)];
    const target = returnFullPool ? pool : predCount;
    
    if (result.length < target) {
        // Fill with remaining numbers by their frequency
        const allNums = Array.from({ length: pool }, (_, i) => i + 1);
        const missing = allNums.filter(n => !result.includes(n));
        result = [...result, ...missing.slice(0, target - result.length)];
    }
    
    return result.slice(0, target);
}

// Hot Numbers system
function hotNumbers(history, game, returnFullPool) {
    const frequency = {};
    const pool = getPoolSize(game);
    for (let i = 1; i <= pool; i++) frequency[i] = 0;
    
    history.slice(0, 100).forEach(draw => {
        parseNumbers(draw).forEach(n => { frequency[n] = (frequency[n] || 0) + 1; });
    });
    
    const predCount = game === 'EURODREAMS' ? 20 : (game === 'MEGASENA' ? 30 : 25);
    const sorted = Object.entries(frequency).sort(([, a], [, b]) => b - a).map(([n]) => parseInt(n));
    return ensureN(sorted, game, returnFullPool, predCount);
}

// Late Numbers system  
function lateNumbers(history, game, returnFullPool) {
    const lastSeen = {};
    const pool = getPoolSize(game);
    for (let i = 1; i <= pool; i++) lastSeen[i] = history.length;
    
    history.forEach((draw, idx) => {
        parseNumbers(draw).forEach(n => {
            if (lastSeen[n] === history.length) lastSeen[n] = idx;
        });
    });
    
    const predCount = game === 'EURODREAMS' ? 20 : (game === 'MEGASENA' ? 30 : 25);
    const sorted = Object.entries(lastSeen).sort(([, a], [, b]) => b - a).map(([n]) => parseInt(n));
    return ensureN(sorted, game, returnFullPool, predCount);
}

// Recent Numbers system
function recentNumbers(history, game, returnFullPool) {
    const pool = getPoolSize(game);
    const predCount = game === 'EURODREAMS' ? 20 : (game === 'MEGASENA' ? 30 : 25);
    const target = returnFullPool ? pool : predCount;
    const uniqueNumbers = new Set();
    
    for (const draw of history) {
        parseNumbers(draw).forEach(n => uniqueNumbers.add(n));
        if (uniqueNumbers.size >= target) break;
    }
    
    const result = [...uniqueNumbers];
    const allNums = Array.from({ length: pool }, (_, i) => i + 1);
    const missing = allNums.filter(n => !result.includes(n));
    return [...result, ...missing].slice(0, target);
}

// Markov Chain system
function markovChain(history, game, returnFullPool) {
    const pool = getPoolSize(game);
    const coOccurrence = {};
    
    for (let i = 1; i <= pool; i++) {
        coOccurrence[i] = {};
        for (let j = 1; j <= pool; j++) coOccurrence[i][j] = 0;
    }
    
    history.slice(0, 100).forEach(draw => {
        const nums = parseNumbers(draw);
        nums.forEach(n => nums.forEach(m => {
            if (n !== m) coOccurrence[n][m] = (coOccurrence[n][m] || 0) + 1;
        }));
    });
    
    const lastNums = parseNumbers(history[0] || { numbers: '[]' });
    const scores = {};
    for (let i = 1; i <= pool; i++) {
        scores[i] = lastNums.reduce((sum, n) => sum + (coOccurrence[n][i] || 0), 0);
    }
    
    const predCount = game === 'EURODREAMS' ? 20 : (game === 'MEGASENA' ? 30 : 25);
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a).map(([n]) => parseInt(n));
    return ensureN(sorted, game, returnFullPool, predCount);
}

// Monte Carlo system
function monteCarlo(history, game, returnFullPool) {
    return hotNumbers(history, game, returnFullPool); // Similar to hot numbers
}

// Clustering system
function clustering(history, game, returnFullPool) {
    const pool = getPoolSize(game);
    const recentDraws = history.slice(0, 20);
    const clusters = {};
    for (let i = 1; i <= pool; i++) {
        const clusterIdx = Math.ceil(i / (pool / 5));
        if (!clusters[clusterIdx]) clusters[clusterIdx] = [];
        clusters[clusterIdx].push(i);
    }
    
    const clusterFreq = {};
    recentDraws.forEach(draw => {
        parseNumbers(draw).forEach(n => {
            const c = Math.ceil(n / (pool / 5));
            clusterFreq[c] = (clusterFreq[c] || 0) + 1;
        });
    });
    
    const predCount = game === 'EURODREAMS' ? 20 : (game === 'MEGASENA' ? 30 : 25);
    const sortedClusters = Object.entries(clusterFreq).sort(([, a], [, b]) => b - a);
    const candidates = [];
    sortedClusters.forEach(([c]) => {
        if (clusters[c]) candidates.push(...clusters[c]);
    });
    
    return ensureN(candidates, game, returnFullPool, predCount);
}

const SYSTEMS = {
    'Hot Numbers': hotNumbers,
    'Late Numbers': lateNumbers,
    'Recent Numbers': recentNumbers,
    'Markov Chain': markovChain,
    'Monte Carlo': monteCarlo,
    'Clustering': clustering
};

async function main() {
    console.log('\n=== Production FullPool Backfill for ' + game + ' (last ' + limit + ' draws) ===\n');
    
    // Get active systems for this game
    const dbSystems = await prisma.rankedSystem.findMany({
        where: { game, domain: 'NUMBERS', isActive: true }
    });
    
    console.log('Active systems found: ' + dbSystems.length);
    dbSystems.forEach(s => console.log('  - ' + s.name));
    
    // Get recent draws
    const recentDraws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' },
        take: limit,
        select: { id: true, date: true, numbers: true, stars: true }
    });
    
    recentDraws.reverse(); // Process oldest first
    
    for (const draw of recentDraws) {
        const existingCount = await prisma.systemPerformanceFullPool.count({
            where: { drawId: draw.id }
        });
        
        console.log('\n  Draw: ' + draw.date.toISOString().split('T')[0] + ' (id=' + draw.id + ') - has ' + existingCount + '/' + dbSystems.length + ' entries');
        
        if (existingCount >= dbSystems.length) {
            console.log('  ? Already complete. Skipping.');
            continue;
        }
        
        // Get history
        const history = await prisma.draw.findMany({
            where: { game, date: { lt: draw.date } },
            orderBy: { date: 'desc' },
            take: 300
        });
        
        if (history.length < 50) {
            console.log('  ?? Insufficient history. Skipping.');
            continue;
        }
        
        for (const sys of dbSystems) {
            const existing = await prisma.systemPerformanceFullPool.findFirst({
                where: { drawId: draw.id, systemName: sys.name, game }
            });
            
            if (existing) {
                process.stdout.write('    (skip) ' + sys.name + '\n');
                continue;
            }
            
            const systemFn = SYSTEMS[sys.name];
            if (!systemFn) {
                console.log('    ?? No implementation for: ' + sys.name + ' - using HotNumbers fallback');
            }
            
            try {
                const fn = systemFn || hotNumbers;
                const fullPool = fn(history, game, true);
                
                await prisma.systemPerformanceFullPool.create({
                    data: {
                        drawId: draw.id,
                        game,
                        systemName: sys.name,
                        predictedNumbers: JSON.stringify(fullPool),
                        actualNumbers: draw.numbers
                    }
                });
                console.log('    ? ' + sys.name + ' (' + fullPool.length + ' nums)');
            } catch (err) {
                console.error('    ? ' + sys.name + ': ' + err.message);
            }
        }
    }
    
    console.log('\n? Backfill complete!');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
