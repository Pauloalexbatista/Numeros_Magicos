const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const SOURCE_DB_PATH = path.join(__dirname, '../numeros/prisma/dev.db');
const TARGET_DB_PATH = path.join(__dirname, 'simulacao.db');

const sourceDb = new sqlite3.Database(SOURCE_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
    if (err) console.error('Error opening source DB:', err.message);
    else console.log('Connected to source DB.');
});

const targetDb = new sqlite3.Database(TARGET_DB_PATH, (err) => {
    if (err) console.error('Error opening target DB:', err.message);
    else console.log('Connected to target DB.');
});

targetDb.serialize(() => {
    // 1. Create Draws table
    targetDb.run(`
        CREATE TABLE IF NOT EXISTS Draws (
            id INTEGER PRIMARY KEY,
            date TEXT,
            numbers TEXT
        )
    `);

    // 2. Create MissingNumbers table (for the next step)
    targetDb.run(`
        CREATE TABLE IF NOT EXISTS MissingNumbers (
            drawId INTEGER PRIMARY KEY,
            numbers TEXT,
            count INTEGER,
            FOREIGN KEY(drawId) REFERENCES Draws(id)
        )
    `);

    console.log('Tables created/verified.');

    // 3. Import Data
    sourceDb.all("SELECT id, date, numbers FROM Draw ORDER BY date ASC", [], (err, rows) => {
        if (err) {
            console.error('Error reading source:', err);
            return;
        }

        console.log(`Found ${rows.length} draws in source.`);

        const stmt = targetDb.prepare("INSERT OR REPLACE INTO Draws (id, date, numbers) VALUES (?, ?, ?)");

        targetDb.serialize(() => {
            targetDb.run("BEGIN TRANSACTION");
            rows.forEach((row) => {
                // Ensure date is string
                const dateStr = new Date(row.date).toISOString();
                stmt.run(row.id, dateStr, row.numbers);
            });
            targetDb.run("COMMIT", () => {
                console.log('Import completed successfully.');
                sourceDb.close();
                targetDb.close();
            });
        });
    });
});
