import { EuroMillionsService } from '../../services/euroMillionsService';
import { EuroDreamsService } from '../../services/euroDreamsService';
import { TotolotoService } from '../../services/totolotoService';

async function updateAllGames() {
    console.log('='.repeat(60));
    console.log('GLOBAL MULTI-GAME UPDATE (CRON)');
    console.log('='.repeat(60));
    console.log(`🕐 Started at: ${new Date().toLocaleString('pt-PT')}`);

    try {
        const emService = new EuroMillionsService();
        const edService = new EuroDreamsService();
        const ttService = new TotolotoService();

        console.log('\n💎 [EUROMILLIONS]');
        await emService.updateDatabase();

        console.log('\n🌙 [EURODREAMS]');
        await edService.updateDatabase();

        console.log('\n🎲 [TOTOLOTO]');
        await ttService.updateDatabase();

        console.log('\n' + '='.repeat(60));
        console.log('✅ Global Update Complete!');
        console.log('='.repeat(60));
    } catch (error) {
        console.error('\n❌ Global Update Failed:', error);
    }
}

async function startCronManager() {
    console.log('🚀 Starting Intelligent Cron Manager...');
    console.log('📅 Monitoring window: 20:00 - 23:59 (Daily)');

    while (true) {
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes();

        // Window of operation: 20h, 21h, 22h, 23h
        if (hour >= 20 && hour <= 23) {
            console.log(`[${now.toLocaleString('pt-PT')}] 🎯 Window is OPEN. Executing update...`);
            await updateAllGames();
            
            console.log(`[${now.toLocaleString('pt-PT')}] 😴 Execution finished. Sleeping 1 hour.`);
            // Sleep for 1 hour to avoid spamming the same hour
            await new Promise(resolve => setTimeout(resolve, 3600 * 1000));
        } else {
            // Outside window, check every 30 minutes
            console.log(`[${now.toLocaleString('pt-PT')}] 💤 Window is CLOSED. Sleeping 30 minutes.`);
            await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000));
        }
    }
}

startCronManager().catch(err => {
    console.error('💥 CRITICAL CRON ERROR:', err);
    process.exit(1);
});
