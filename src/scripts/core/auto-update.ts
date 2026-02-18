
import { EuroMillionsService } from '../../services/euroMillionsService';

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
        const hasNewDraw = await service.updateDatabase();

        if (hasNewDraw) {
            console.log('🧠 New draw detected! Spawning background ML Training...');
            const { startBackgroundTraining } = await import('../ml-training/background-train');
            startBackgroundTraining();
        } else {
            console.log('🧠 No new draw. Skipping ML Training.');
        }

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
