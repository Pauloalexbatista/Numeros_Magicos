const sqlite3 = require('better-sqlite3');

console.log('🔍 Checking lab.db for duplicates...\n');

try {
    const db = new sqlite3('./laboratory/prisma/lab.db', { readonly: true });

    // Check duplicate draws
    console.log('📊 DUPLICATE DRAWS:');
    const dupDraws = db.prepare(`
        SELECT date, COUNT(*) as count
        FROM Draw
        GROUP BY date
        HAVING COUNT(*) > 1
    `).all();

    console.log(`   Found: ${dupDraws.length} duplicate dates`);
    if (dupDraws.length > 0) {
        console.log('   Examples:');
        dupDraws.slice(0, 5).forEach(d => {
            console.log(`      ${d.date}: ${d.count} times`);
        });
    }
    console.log('');

    // Check duplicate performance
    console.log('🎯 DUPLICATE PERFORMANCE (Anti-Vortex Pyramid):');
    const dupPerf = db.prepare(`
        SELECT drawId, systemName, COUNT(*) as count
        FROM SystemPerformance
        WHERE systemName = 'Anti-Vortex Pyramid'
        GROUP BY drawId, systemName
        HAVING COUNT(*) > 1
    `).all();

    console.log(`   Found: ${dupPerf.length} duplicate performance records`);
    if (dupPerf.length > 0) {
        console.log('   Examples:');
        dupPerf.slice(0, 5).forEach(d => {
            console.log(`      Draw ${d.drawId}: ${d.count} times`);
        });
    }
    console.log('');

    // Count total Anti-Vortex Pyramid records
    console.log('📈 ANTI-VORTEX PYRAMID STATS:');
    const totalPerf = db.prepare(`
        SELECT COUNT(*) as count
        FROM SystemPerformance
        WHERE systemName = 'Anti-Vortex Pyramid'
    `).get();

    const totalDraws = db.prepare('SELECT COUNT(*) as count FROM Draw').get();

    console.log(`   Total Performance Records: ${totalPerf.count}`);
    console.log(`   Total Draws: ${totalDraws.count}`);
    console.log(`   Expected: ${totalDraws.count} (1 per draw)`);
    console.log(`   Difference: ${totalPerf.count - totalDraws.count} ${totalPerf.count > totalDraws.count ? '⚠️ DUPLICATES!' : '✅'}`);
    console.log('');

    // Count jackpots
    const jackpots = db.prepare(`
        SELECT COUNT(*) as count
        FROM SystemPerformance
        WHERE systemName = 'Anti-Vortex Pyramid' AND jackpot = 1
    `).get();

    console.log(`   Jackpots: ${jackpots.count}`);

    // Count unique jackpots (by drawId)
    const uniqueJackpots = db.prepare(`
        SELECT COUNT(DISTINCT drawId) as count
        FROM SystemPerformance
        WHERE systemName = 'Anti-Vortex Pyramid' AND jackpot = 1
    `).get();

    console.log(`   Unique Jackpots (by draw): ${uniqueJackpots.count}`);
    console.log(`   Duplicate Jackpots: ${jackpots.count - uniqueJackpots.count} ${jackpots.count > uniqueJackpots.count ? '❌' : '✅'}`);

    db.close();

    console.log('\n========================================');
    if (dupDraws.length > 0 || dupPerf.length > 0) {
        console.log('❌ LAB.DB HAS DUPLICATES!');
        console.log('   This explains the inflated performance numbers.');
    } else {
        console.log('✅ No duplicates found.');
    }

} catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTrying with Prisma instead...');

    // Fallback: use Prisma
    require('./check-lab-duplicates-prisma.js');
}
