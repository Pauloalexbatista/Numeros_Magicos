
import { backfillService } from '../services/backfill-service';
import { prisma } from '../lib/prisma';

async function testBatch() {
    console.log('🧪 TESTING BackfillService Locally...');

    // 1. Get Total
    const total = await backfillService.getTotalDraws();
    console.log(`📚 Total Draws: ${total}`);

    if (total < 50) {
        console.warn('⚠️ Warning: Not enough draws to test batching properly.');
    }

    // 2. Run a small batch (Last 10 draws)
    // We use skip = total - 10
    const skip = Math.max(0, total - 10);
    const take = 10;

    console.log(`🚀 Running batch: Skip ${skip}, Take ${take}`);
    const result = await backfillService.processBatch(skip, take);

    console.log('\n✅ Result:', result);

    // 3. Verify DB
    const minId = Math.min(result.startId, result.endId);
    const maxId = Math.max(result.startId, result.endId);

    const verification = await prisma.systemPerformance.findMany({
        where: {
            drawId: { gte: minId, lte: maxId }
        },
        select: { drawId: true, systemName: true }
    });

    console.log(`\n🔎 Verification: Found ${verification.length} performance records in DB for these draws.`);

    if (verification.length > 0) {
        console.log('✅ TEST PASSED: Data was saved.');
    } else {
        console.error('❌ TEST FAILED: No data saved.');
        process.exit(1);
    }
}

testBatch()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
