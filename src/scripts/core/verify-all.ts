
import { PrismaClient } from '@prisma/client';
import { SystemRegistry } from '../../systems';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
        }
    }
});

async function main() {
    console.log(`🧪 STARTING SYSTEM VERIFICATION...`);

    // 1. Load some history
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 200 // Enough for ML
    });
    console.log(`📦 Loaded ${history.length} draws from DB.`);

    if (history.length === 0) {
        console.error('❌ No history found to test!');
        return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const system of SystemRegistry) {
        const name = system.metadata.name;
        process.stdout.write(`👉 Testing [${name}]... `);

        try {
            const start = performance.now();
            const result = await system.predict(history);
            const end = performance.now();

            if (!result.numbers || result.numbers.length === 0) {
                console.log(`❌ FAILED (Empty result)`);
                failCount++;
            } else if (result.numbers.length !== 25) {
                console.log(`⚠️  WARNING (Returned ${result.numbers.length} numbers, expected 25)`);
                // We count this as success but warn
                successCount++;
            } else {
                console.log(`✅ OK (${(end - start).toFixed(0)}ms)`);
                successCount++;
            }

        } catch (error: any) {
            console.log(`❌ ERROR: ${error.message}`);
            failCount++;
        }
    }

    console.log(`\n========================================`);
    console.log(`📊 SUMMARY: ${successCount} Passed / ${failCount} Failed.`);
    console.log(`========================================`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
