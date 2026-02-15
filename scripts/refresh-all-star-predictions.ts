
import { PrismaClient } from '@prisma/client';
import { getStarPrediction } from '../src/app/analysis/stars/actions';

const prisma = new PrismaClient();

async function refreshAllStarPredictions() {
    console.log('🔄 Refreshing ALL Star System Predictions...');

    // 1. Get all Star Systems
    const starSystems = await prisma.starSystemRanking.findMany({
        select: { systemName: true }
    });

    const starSystemNames = starSystems.map(s => s.systemName);
    console.log(`Found ${starSystemNames.length} star systems.`);

    // 2. Clear Cache for these systems
    const deleted = await prisma.cachedPrediction.deleteMany({
        where: { systemName: { in: starSystemNames } }
    });
    console.log(`🗑️  Cleared ${deleted.count} cached predictions.`);

    // 3. Regenerate and Verify
    console.log('\n🚀 Regenerating & Verifying...');

    const errors: string[] = [];
    const results: Record<string, number> = {};

    for (const name of starSystemNames) {
        process.stdout.write(`   Processing ${name}... `);
        try {
            const pred = await getStarPrediction(name);
            const count = pred.length;
            results[name] = count;

            // Validation Logic
            let expected = 6; // Default (EM & Totoloto)
            if (name.includes('(EuroDreams)')) expected = 3;

            if (count === expected) {
                console.log(`✅ OK (${count})`);
            } else {
                console.log(`❌ ERROR (Got ${count}, Expected ${expected})`);
                errors.push(`${name}: Got ${count}, Expected ${expected}`);
            }
        } catch (e) {
            console.log(`❌ FAILED: ${e}`);
            errors.push(`${name}: Exception ${e}`);
        }
    }

    console.log('\n📊 Summary:');
    if (errors.length === 0) {
        console.log('✅ All systems validated successfully!');
    } else {
        console.log('❌ Found errors:');
        errors.forEach(e => console.log(`   - ${e}`));
    }
}

refreshAllStarPredictions()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
