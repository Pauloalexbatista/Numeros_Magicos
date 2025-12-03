
import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';

async function checkMissing() {
    // 1. Get all expected system names from code
    const expectedSystems = rankedSystems.map(s => s.name);
    console.log(`Total Active Systems in Code: ${expectedSystems.length}`);

    // 2. Get all cached system names from DB
    const cached = await prisma.cachedPrediction.findMany({
        select: { systemName: true, numbers: true }
    });
    const cachedNames = cached.map(c => c.systemName);
    console.log(`Total Cached Predictions: ${cached.length}`);

    // 3. Find missing
    const missing = expectedSystems.filter(name => !cachedNames.includes(name));

    if (missing.length === 0) {
        console.log('✅ ALL systems have predictions!');
    } else {
        console.log(`❌ Missing predictions for ${missing.length} systems:`);
        missing.forEach(name => console.log(` - ${name}`));
    }

    // 4. Verify 25 numbers count
    console.log('\nChecking prediction sizes...');
    let badCount = 0;
    cached.forEach(c => {
        try {
            const nums = JSON.parse(c.numbers);
            if (nums.length !== 25) {
                console.log(`⚠️  ${c.systemName}: Has ${nums.length} numbers (Expected 25)`);
                badCount++;
            }
        } catch (e) {
            console.log(`❌ ${c.systemName}: Invalid JSON`);
            badCount++;
        }
    });

    if (badCount === 0) console.log('✅ All cached predictions have exactly 25 numbers.');
}

checkMissing()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
