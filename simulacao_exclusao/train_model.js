const synaptic = require('synaptic');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'simulacao.db');
const MODEL_PATH = path.join(__dirname, 'model_synaptic.json');

const CONFIG = {
    windowSize: 3, // Keep window small for Synaptic performance (it's pure JS and slower)
    hiddenNeurons: 20,
    learningRate: 0.1,
    iterations: 100, // Low iterations for demo speed
    gameMax: 50
};

async function loadData() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        db.all("SELECT numbers FROM Draws ORDER BY date ASC", [], (err, rows) => {
            if (err) return reject(err);

            const data = rows.map(r => {
                let nums = [];
                try { nums = JSON.parse(r.numbers); } catch (e) { nums = r.numbers.split(',').map(Number); }
                if (typeof nums === 'string') nums = nums.split(',').map(Number);

                const vector = new Array(CONFIG.gameMax).fill(0);
                nums.forEach(n => {
                    if (n >= 1 && n <= CONFIG.gameMax) vector[n - 1] = 1;
                });
                return vector;
            });

            db.close();
            resolve(data);
        });
    });
}

async function train() {
    console.log('Loading data...');
    const rawData = await loadData();
    console.log(`Loaded ${rawData.length} draws.`);

    // Create LSTM Network
    // Input: 50 (vector size)
    // Hidden: 20
    // Output: 50
    const inputLayer = new synaptic.Layer(CONFIG.gameMax);
    const hiddenLayer = new synaptic.Layer(CONFIG.hiddenNeurons);
    const outputLayer = new synaptic.Layer(CONFIG.gameMax);

    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    const myNetwork = new synaptic.Network({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });

    // Prepare Training Set
    // Use last 200 draws for training to be reasonable
    const TRAIN_SIZE = 200;
    const START_IDX = Math.max(0, rawData.length - TRAIN_SIZE);

    console.log(`Training on last ${TRAIN_SIZE} draws...`);

    const learningRate = CONFIG.learningRate;

    for (let iter = 0; iter < CONFIG.iterations; iter++) {
        let error = 0;
        for (let i = START_IDX; i < rawData.length - 1; i++) {
            const input = rawData[i];
            const target = rawData[i + 1];

            myNetwork.activate(input);
            myNetwork.propagate(learningRate, target);
            // Calculate error manually or trust propagation
        }
        if (iter % 10 === 0) console.log(`Iteration ${iter}`);
    }

    console.log('Training complete.');

    const json = myNetwork.toJSON();
    fs.writeFileSync(MODEL_PATH, JSON.stringify(json));
    console.log('Model saved to model_synaptic.json');
}

train().catch(console.error);
