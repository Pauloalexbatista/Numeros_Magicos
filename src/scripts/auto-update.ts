import { EuroMillionsService } from '../services/euroMillionsService';
// import { backfillRankings } from '../services/ranking';

async function autoUpdate() {
    console.log('='.repeat(60));
    console.log('EUROMILLIONS AUTO-UPDATE');
    console.log('='.repeat(60));
    console.log();
    console.log(`🕐 Started at: ${new Date().toLocaleString('pt-PT')}`);
    console.log();

    try {
        const service = new EuroMillionsService();

        console.log('🔍 Checking for new draws...');
        await service.updateDatabase();

        // console.log('📊 Updating System Rankings...');
        // Auto-update is now handled inside EuroMillionsService
        // await backfillRankings(5);

        console.log();
        console.log('✅ Update complete!');
        console.log('='.repeat(60));
    } catch (error) {
        console.error('❌ Update failed:', error);
        console.log('='.repeat(60));
        process.exit(1);
    }
}

autoUpdate();
