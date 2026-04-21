import { EuroMillionsService } from '../../services/euroMillionsService';
import { EuroDreamsService } from '../../services/euroDreamsService';
import { TotolotoService } from '../../services/totolotoService';
import { prisma } from '../../lib/prisma';

async function updateAllGames() {
    console.log('='.repeat(60));
    console.log('GLOBAL MULTI-GAME UPDATE (CRON)');
    console.log('='.repeat(60));
    console.log(`🕐 Execution started at: ${new Date().toLocaleString('pt-PT')}`);

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
    console.log(`📅 Current Server Time: ${new Date().toString()}`);
    console.log(`📅 Current Local Time (PT): ${new Date().toLocaleString('pt-PT')}`);
    console.log('📅 Monitoring window: 20:00 - 23:59 (Daily)');

    // 1. Diagnostics: Test DB Connection
    console.log('\n🔍 Testing Database Connection...');
    if (!process.env.DATABASE_URL) {
        console.error('❌ ERROR: DATABASE_URL environment variable is missing!');
        process.exit(1);
    }

    try {
        await prisma.$connect();
        const drawCount = await prisma.draw.count();
        console.log(`✅ DB Connected! Found ${drawCount} total draws in history.`);
    } catch (err: any) {
        console.error('❌ DB CONNECTION FAILED:', err.message);
        console.error('📋 Please check your DATABASE_URL and VPS network configuration.');
        // We don't exit here to allow for temporary DB connection issues, 
        // but it will likely fail during the updateAllGames call.
    }

    console.log('\n🔄 Entering main control loop...');

    while (true) {
        const now = new Date();
        const hour = now.getHours();

        // Window of operation: 20h, 21h, 22h, 23h
        if (hour >= 20 && hour <= 23) {
            console.log(`[${now.toLocaleString('pt-PT')}] 🎯 Window is OPEN. Executing update...`);
            await updateAllGames();
            
            console.log(`[${now.toLocaleString('pt-PT')}] 😴 Execution finished. Sleeping 1 hour.`);
            // Sleep for 1 hour to avoid spamming the same hour
            await new Promise(resolve => setTimeout(resolve, 3600 * 1000));
        } else {
            // Outside window, check every 30 minutes
            console.log(`[${now.toLocaleString('pt-PT')}] 💤 Window is CLOSED (Current Hour: ${hour}). Sleeping 30 minutes.`);
            await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000));
        }
    }
}

startCronManager().catch(err => {
    console.error('💥 CRITICAL CRON ERROR:', err);
    process.exit(1);
});
