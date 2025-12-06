import { prisma } from '../../lib/prisma';
import { rankedSystems } from '../../services/ranked-systems';

async function main() {
    console.log('🕵️ Starting Final System Verification...');
    console.log('========================================');

    // 1. Fetch History
    const history = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });
    console.log(`📚 Loaded ${history.length} draws from database.`);
    console.log('----------------------------------------');

    let errors = 0;
    let warnings = 0;

    // 2. Test Each System
    for (const system of rankedSystems) {
        process.stdout.write(`Testing ${system.name.padEnd(35)} ... `);

        const start = performance.now();
        try {
            const prediction = await system.generateTop10(history);
            const end = performance.now();
            const duration = (end - start).toFixed(2);

            // Validation Checks
            const count = prediction.length;
            const unique = new Set(prediction).size;
            const hasDuplicates = count !== unique;
            const isValidCount = count === 25;

            if (!isValidCount) {
                console.log(`❌ FAIL`);
                console.log(`   -> Expected 25 numbers, got ${count}`);
                errors++;
            } else if (hasDuplicates) {
                console.log(`⚠️ WARN`);
                console.log(`   -> Contains duplicates! (Unique: ${unique})`);
                warnings++;
            } else {
                // Speed Check
                let speedStatus = '✅';
                if (Number(duration) > 1000) speedStatus = '🐢'; // Slow (>1s)
                if (Number(duration) > 5000) speedStatus = '🐌'; // Very Slow (>5s)

                console.log(`${speedStatus} OK (${duration}ms)`);
            }

        } catch (error) {
            console.log(`❌ CRASH`);
            console.error(`   -> Error:`, error);
            errors++;
        }
    }

    console.log('========================================');
    console.log(`🏁 Verification Complete.`);
    console.log(`Errors: ${errors}`);
    console.log(`Warnings: ${warnings}`);

    if (errors === 0) {
        console.log('✨ SYSTEM STATUS: GREEN (Ready for Launch)');
    } else {
        console.log('🚨 SYSTEM STATUS: RED (Fix required)');
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
