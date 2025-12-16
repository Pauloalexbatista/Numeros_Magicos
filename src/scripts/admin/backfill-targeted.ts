
import { backfillService } from '../../services/backfill-service';
import { prisma } from '../../lib/prisma';

// Target system to backfill
const TARGET_SYSTEM = 'Consensus Auto (Vortex + Camadas + Media3)';

async function runTargetedBackfill() {
    console.log(`🎯 STARTING TARGETED BACKFILL FOR: [${TARGET_SYSTEM}]`);
    console.log('═'.repeat(60));

    const totalDraws = await backfillService.getTotalDraws();
    console.log(`Total Draws to process: ${totalDraws}`);

    const BATCH_SIZE = 50;
    let processed = 0;

    // Process all draws in batches
    for (let skip = 0; skip < totalDraws; skip += BATCH_SIZE) {
        // Calculate dynamic take for last batch
        const take = Math.min(BATCH_SIZE, totalDraws - skip);

        console.log(`\n📦 Processing batch ${skip} to ${skip + take}...`);

        const result = await backfillService.processBatch(skip, take, TARGET_SYSTEM);

        if (result.savedPerformances > 0) {
            console.log(`   ✅ Saved ${result.savedPerformances} predictions.`);
        } else {
            console.log(`   ⚠️  No predictions saved (System might not be found or error).`);
            if (result.message) console.log(`      Msg: ${result.message}`);
        }

        processed += result.processed;
        console.log(`   Progress: ${Math.round((processed / totalDraws) * 100)}%`);
    }

    console.log('\n✅ BACKFILL COMPLETE!');
}

runTargetedBackfill()
    .catch(e => {
        console.error('❌ FATAL ERROR:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
