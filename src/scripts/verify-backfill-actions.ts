import { getBackfillStatus, processBackfillBatch } from '../app/admin/backfill-actions';

async function main() {
    console.log('🚀 Testing Backfill Actions...');

    try {
        // 1. Test Status
        console.log('📊 Fetching Status...');
        const status = await getBackfillStatus();
        console.log('Status:', status);

        if (status.total === 0) throw new Error('Total draws is 0, something is wrong with DB connection');

        // 2. Test Batch Processing (Dry run logic - we won't commit if we could, but here we actually run it)
        // We'll process a batch of 1 just to see if it runs without error
        if (status.remaining > 0) {
            console.log('⚙️ Processing Batch of 1...');
            const result = await processBackfillBatch(1);
            console.log('Batch Result:', result);
            if (!result.success) throw new Error('Batch processing failed');
        } else {
            console.log('✅ No draws to process, skipping batch test.');
        }

        console.log('✅ Backfill Actions Verified!');

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

main();
