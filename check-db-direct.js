const sqlite3 = require('better-sqlite3');
const db = sqlite3('./prisma/dev.db');

console.log('🔍 VERIFICANDO BD PRINCIPAL DIRETAMENTE\n');

try {
    // List tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📋 Tabelas:', tables.map(t => t.name).join(', '));

    // Check if Draw table exists
    const drawTable = tables.find(t => t.name === 'Draw');
    if (drawTable) {
        const count = db.prepare('SELECT COUNT(*) as count FROM Draw').get();
        console.log(`\n✅ Tabela Draw existe: ${count.count} registos`);

        if (count.count > 0) {
            const first = db.prepare('SELECT * FROM Draw ORDER BY date ASC LIMIT 1').get();
            console.log('\n📊 PRIMEIRO SORTEIO:');
            console.log('   Data:', first.date);
            console.log('   Números:', first.numbers);
            console.log('   Estrelas:', first.stars);
        }
    } else {
        console.log('\n❌ Tabela Draw NÃO existe');
    }
} catch (error) {
    console.error('❌ Erro:', error.message);
}

db.close();
