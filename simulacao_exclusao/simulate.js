const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'simulacao.db');
const db = new sqlite3.Database(DB_PATH);

// Strategy Configuration
const STRATEGY = {
    name: "Exclude Coldest Numbers",
    excludeCount: 10, // Try to exclude the 10 numbers that have been missing for the longest time
    minDormancy: 5    // Only exclude if they haven't appeared in at least 5 draws
};

// Helper to calculate dormancy for all numbers up to a specific draw index
// This is expensive if done naively. Optimized approach:
// Maintain a "last seen" map.
function getDormancyMap(history, currentDrawIndex, maxNumber) {
    const dormancy = {};
    for (let n = 1; n <= maxNumber; n++) {
        dormancy[n] = -1; // Never seen
    }

    // Look backwards from currentDrawIndex - 1
    // Or better: maintain state as we iterate forward in the main loop.
    return dormancy;
}

async function runSimulation() {
    return new Promise((resolve, reject) => {
        db.all("SELECT d.id, d.date, d.numbers FROM Draws d ORDER BY d.date ASC", [], (err, rows) => {
            if (err) return reject(err);

            const results = {
                totalDraws: 0,
                safeExclusions: 0,
                failedExclusions: 0,
                totalNumbersEliminated: 0,
                history: []
            };

            // Parse all numbers first
            const draws = rows.map(r => {
                let nums = [];
                try { nums = JSON.parse(r.numbers); } catch (e) { nums = r.numbers.split(',').map(Number); }
                if (typeof nums === 'string') nums = nums.split(',').map(Number);
                return { ...r, nums };
            });

            // Determine Max Number
            let maxNum = 0;
            draws.forEach(d => d.nums.forEach(n => { if (n > maxNum) maxNum = n; }));
            const GAME_MAX = maxNum <= 50 ? 50 : (maxNum <= 60 ? 60 : 80);

            // State for dormancy: Number -> Last Draw Index it appeared
            const lastSeenIndex = new Array(GAME_MAX + 1).fill(-1);

            // Start simulation from draw 50 to have some history
            const START_INDEX = 50;

            for (let i = 0; i < draws.length; i++) {
                const currentDraw = draws[i];

                // 1. PREDICT (Before seeing the result of currentDraw)
                if (i >= START_INDEX) {
                    // Identify candidates for exclusion based on history (0 to i-1)
                    const candidates = [];

                    for (let n = 1; n <= GAME_MAX; n++) {
                        const lastIdx = lastSeenIndex[n];
                        const dormancy = lastIdx === -1 ? i : (i - lastIdx - 1);

                        if (dormancy >= STRATEGY.minDormancy) {
                            candidates.push({ n, dormancy });
                        }
                    }

                    // Sort by dormancy descending (coldest first)
                    candidates.sort((a, b) => b.dormancy - a.dormancy);

                    // Select top N to exclude
                    const toExclude = candidates.slice(0, STRATEGY.excludeCount).map(c => c.n);

                    // 2. VALIDATE (Did we exclude a winner?)
                    const winners = new Set(currentDraw.nums);
                    const excludedWinner = toExclude.find(n => winners.has(n));

                    if (excludedWinner) {
                        results.failedExclusions++;
                        // console.log(`[FAIL] Draw ${currentDraw.id}: Excluded winner ${excludedWinner}. Excluded: ${toExclude.join(',')}`);
                    } else {
                        results.safeExclusions++;
                        results.totalNumbersEliminated += toExclude.length;
                    }
                    results.totalDraws++;
                }

                // 3. UPDATE STATE (After seeing result)
                currentDraw.nums.forEach(n => {
                    lastSeenIndex[n] = i;
                });
            }

            resolve(results);
        });
    });
}

runSimulation().then(results => {
    console.log("Simulation Complete.");
    console.log("--------------------");
    console.log(`Strategy: ${STRATEGY.name} (Exclude Top ${STRATEGY.excludeCount}, Min Dormancy ${STRATEGY.minDormancy})`);
    console.log(`Total Draws Simulated: ${results.totalDraws}`);
    console.log(`Safe Exclusions: ${results.safeExclusions} (${((results.safeExclusions / results.totalDraws) * 100).toFixed(2)}%)`);
    console.log(`Failed Exclusions: ${results.failedExclusions}`);
    console.log(`Avg Numbers Eliminated: ${(results.totalNumbersEliminated / results.safeExclusions).toFixed(1)}`);
    db.close();
}).catch(err => console.error(err));
