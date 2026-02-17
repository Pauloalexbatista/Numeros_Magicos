const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');

function fixSchema() {
    console.log("🛠️ Fixing local dev.db schema...");

    const tables = {
        Draw: [
            { name: 'game', type: 'TEXT DEFAULT "EUROMILLIONS"' },
            { name: 'sequenceNumber', type: 'INTEGER' }
        ],
        ranked_systems: [
            { name: 'systemType', type: 'TEXT DEFAULT "BASE"' },
            { name: 'domain', type: 'TEXT DEFAULT "NUMBERS"' },
            { name: 'dependencies', type: 'TEXT' },
            { name: 'complexity', type: 'INTEGER DEFAULT 1' },
            { name: 'priority', type: 'INTEGER DEFAULT 50' }
        ],
        cached_predictions: [
            { name: 'worstNumbers', type: 'TEXT' }
        ]
    };

    for (const [table, columns] of Object.entries(tables)) {
        console.log(`Checking table: ${table}`);
        const info = db.prepare(`PRAGMA table_info(${table})`).all();
        const existing = info.map(c => c.name);

        for (const col of columns) {
            if (!existing.includes(col.name)) {
                try {
                    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.type}`).run();
                    console.log(` ✅ Column ${col.name} added to ${table}`);
                } catch (e) {
                    console.error(` ❌ Failed to add ${col.name} to ${table}:`, e.message);
                }
            } else {
                console.log(` ℹ️ Column ${col.name} already exists in ${table}`);
            }
        }
    }

    console.log("\n✨ Schema fixed!");
}

fixSchema();
db.close();
