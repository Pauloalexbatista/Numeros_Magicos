const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'simulacao.db');
const TOTAL_NUMBERS = 60; // Assuming 1-60 range (Mega Sena style? Or EuroMillions 1-50? Let's check data first, but usually 60 for Brazil)
// Wait, user mentioned "Numeros Magicos", usually 1-60. I should verify the range from the data.
// I'll add a dynamic check or assume 60 for now based on typical lottery.
// Actually, let's make it robust: find max number in history.

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('Error opening DB:', err.message);
});

function getMissingNumbers(drawnNumbers, maxNumber) {
    const allNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
    const drawnSet = new Set(drawnNumbers);
    return allNumbers.filter(n => !drawnSet.has(n));
}

db.serialize(() => {
    // 1. Get all draws
    db.all("SELECT id, numbers FROM Draws ORDER BY date ASC", [], (err, rows) => {
        if (err) {
            console.error('Error reading draws:', err);
            return;
        }

        console.log(`Analyzing ${rows.length} draws...`);

        // Determine Max Number dynamically to be safe
        let maxNum = 0;
        const parsedRows = rows.map(r => {
            let nums = [];
            try {
                nums = JSON.parse(r.numbers);
                // Handle if it's a string of numbers "1, 2, 3" or array [1, 2, 3]
                if (typeof nums === 'string') nums = nums.split(',').map(Number);
            } catch (e) {
                // Fallback if not JSON
                nums = r.numbers.split(',').map(Number);
            }

            nums.forEach(n => {
                if (n > maxNum) maxNum = n;
            });

            return { id: r.id, nums };
        });

        // Round up to nearest 10 or just use maxNum? 
        // Lotteries are usually 50, 60, 80.
        // If max is 60, use 60. If 50, use 50.
        const GAME_MAX = maxNum <= 50 ? 50 : (maxNum <= 60 ? 60 : 80);
        console.log(`Detected Max Number: ${maxNum}. Using Game Max: ${GAME_MAX}`);

        const stmt = db.prepare("INSERT OR REPLACE INTO MissingNumbers (drawId, numbers, count) VALUES (?, ?, ?)");

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            parsedRows.forEach((row) => {
                const missing = getMissingNumbers(row.nums, GAME_MAX);
                stmt.run(row.id, JSON.stringify(missing), missing.length);
            });
            db.run("COMMIT", () => {
                console.log('Analysis complete. Missing numbers stored.');
                db.close();
            });
        });
    });
});
