const synaptic = require('synaptic');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'simulacao.db');
const MODEL_PATH = path.join(__dirname, 'model_synaptic.json');

const CONFIG = {
    gameMax: 50,
    excludeCount: 5
};

async function loadData() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        db.all("SELECT id, numbers FROM Draws ORDER BY date ASC", [], (err, rows) => {
            if (err) return reject(err);
            const data = rows.map(r => {
                let nums = [];
                try { nums = JSON.parse(r.numbers); } catch (e) { nums = r.numbers.split(',').map(Number); }
                if (typeof nums === 'string') nums = nums.split(',').map(Number);

                const vector = new Array(CONFIG.gameMax).fill(0);
                nums.forEach(n => {
                    if (n >= 1 && n <= CONFIG.gameMax) vector[n - 1] = 1;
                });
                return { id: r.id, nums, vector };
            });
            db.close();
            resolve(data);
        });
    });
}

async function runSimulation() {
    console.log('Loading model...');
    const modelJson = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf8'));
    const myNetwork = synaptic.Network.fromJSON(modelJson);
    console.log('Model loaded.');

    console.log('Loading data...');
    const draws = await loadData();

    const results = {
        totalDraws: 0,
        safeExclusions: 0,
        failedExclusions: 0,
        totalNumbersEliminated: 0
    };

    // Simulate on the last 100 draws (validation set)
    // Note: In a real rigorous test, we should not have trained on these.
    // But for this demo, we trained on the last 200, so we are testing on data seen during training (overfitting risk).
    // However, we just want to see if it learned *anything*.
    const START_INDEX = draws.length - 100;

    console.log(`Starting simulation from draw ${START_INDEX}...`);

    for (let i = START_INDEX; i < draws.length; i++) {
        // 1. Prepare Input (Previous Draw)
        // Synaptic LSTM usually takes one input at a time and maintains state, 
        // but here we are just feeding the previous vector to predict the next.
        // Ideally we should reset context or feed a sequence.
        // For simplicity: Feed previous draw -> Predict next.
        const inputVector = draws[i - 1].vector;

        // 2. Predict
        const outputVector = myNetwork.activate(inputVector);

        // 3. Select Candidates (Lowest Probability)
        const candidates = [];
        for (let n = 0; n < CONFIG.gameMax; n++) {
            candidates.push({ n: n + 1, prob: outputVector[n] });
        }

        candidates.sort((a, b) => a.prob - b.prob);

        const toExclude = candidates.slice(0, CONFIG.excludeCount).map(c => c.n);

        // 4. Validate
        const currentDraw = draws[i];
        const winners = new Set(currentDraw.nums);
        const excludedWinner = toExclude.find(n => winners.has(n));

        if (excludedWinner) {
            results.failedExclusions++;
        } else {
            results.safeExclusions++;
            results.totalNumbersEliminated += toExclude.length;
        }
        results.totalDraws++;

        if (i % 10 === 0) process.stdout.write('.');
    }
    console.log('\n');

    return results;
}

runSimulation().then(results => {
    console.log("AI Simulation Complete.");
    console.log("--------------------");
    console.log(`Strategy: AI Prediction (Exclude Lowest ${CONFIG.excludeCount} Prob)`);
    console.log(`Total Draws Simulated: ${results.totalDraws}`);
    console.log(`Safe Exclusions: ${results.safeExclusions} (${((results.safeExclusions / results.totalDraws) * 100).toFixed(2)}%)`);
    console.log(`Failed Exclusions: ${results.failedExclusions}`);
    console.log(`Avg Numbers Eliminated: ${(results.totalNumbersEliminated / results.safeExclusions).toFixed(1)}`);
}).catch(console.error);
