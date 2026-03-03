import { EuroMillionsService } from '../services/euroMillionsService';
import { EuroDreamsService } from '../services/euroDreamsService';
import { TotolotoService } from '../services/totolotoService';

async function smartUpdate() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    console.log('='.repeat(60));
    console.log('SMART MULTI-GAME UPDATE (Scheduled)');
    console.log('='.repeat(60));
    console.log(`🕐 Started at: ${now.toLocaleString('pt-PT')}`);
    console.log(`📅 Day of Week: ${day}`);

    if (day === 0) {
        console.log('😴 Sunday: No draws today. Skipping updates.');
        return;
    }

    try {
        // Monday (1) & Thursday (4)
        if (day === 1 || day === 4) {
            console.log('\n🌙 [EURODREAMS]');
            const edService = new EuroDreamsService();
            await edService.updateDatabase();
        }

        // Tuesday (2) & Friday (5)
        if (day === 2 || day === 5) {
            console.log('\n💎 [EUROMILLIONS]');
            const emService = new EuroMillionsService();
            await emService.updateDatabase();
        }

        // Wednesday (3) & Saturday (6)
        if (day === 3 || day === 6) {
            console.log('\n🎲 [TOTOLOTO]');
            const ttService = new TotolotoService();
            await ttService.updateDatabase();
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Smart Update Complete!');
        console.log('='.repeat(60));
    } catch (error) {
        console.error('\n❌ Smart Update Failed:', error);
        process.exit(1);
    }
}

smartUpdate();
