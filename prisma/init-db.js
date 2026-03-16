const fs = require('fs');
const path = require('path');

const devDbPath = path.join(__dirname, 'dev.db');
const seedDbPath = path.join(__dirname, 'seed.db');

if (!fs.existsSync(devDbPath)) {
    console.log(`[InitDB] dev.db not found at ${devDbPath}.`);
    if (fs.existsSync(seedDbPath)) {
        console.log(`[InitDB] Copying seed.db to dev.db...`);
        fs.copyFileSync(seedDbPath, devDbPath);
        console.log(`[InitDB] Successfully restored database from seed.db!`);
    } else {
        console.log(`[InitDB] seed.db also not found. Starting with empty database.`);
    }
} else {
    console.log(`[InitDB] dev.db already exists. Skipping seed restoration.`);
}
