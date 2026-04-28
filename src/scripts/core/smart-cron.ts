import { EuroMillionsService } from '../../services/euroMillionsService';
import { EuroDreamsService } from '../../services/euroDreamsService';
import { TotolotoService } from '../../services/totolotoService';
import { prisma } from '../../lib/prisma';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname is not available in ESM/tsx context, so we derive it manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function backupDatabase() {
    console.log(`[CRON] 📦 Domingo detetado! A iniciar backup da BD...`);
    const backupScript = path.join(__dirname, 'backup-draws.ts');
    
    return new Promise<void>((resolve, reject) => {
        exec(`npx tsx ${backupScript}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Erro no backup: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) console.error(`[Backup Stderr]: ${stderr}`);
            console.log(`[Backup Stdout]:\n${stdout}`);
            resolve();
        });
    });
}

async function startSmartCron() {
    console.log('🚀 Starting Smart Cron Daemon (Zero-Duplicate Architecture)...');
    console.log(`📅 Current Server Time (UTC): ${new Date().toISOString()}`);
    console.log(`📅 Current Local Time (PT): ${new Date().toLocaleString('pt-PT')}`);
    
    // Test Database
    try {
        await prisma.$connect();
        const drawCount = await prisma.draw.count();
        console.log(`✅ DB Connected! Found ${drawCount} total draws in history.`);
    } catch (err: any) {
        console.error('❌ DB CONNECTION FAILED:', err.message);
    }

    console.log('\n🔄 Entering robust control loop...');

    while (true) {
        try {
            const now = new Date();
            const hour = now.getHours();
            const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday

            // Window of operation: 20:00, 21:00, 22:00, 23:00
            if (hour >= 20 && hour <= 23) {
                console.log(`\n[${now.toLocaleString('pt-PT')}] 🎯 Window is OPEN. Day of week: ${dayOfWeek}`);

                if (dayOfWeek === 0) {
                    // SUNDAY: Backup DB at 20:00
                    if (hour === 20) {
                        await backupDatabase();
                    } else {
                        console.log(`[CRON] Domingo (Descanso). Dormindo...`);
                    }
                } 
                else if (dayOfWeek === 1 || dayOfWeek === 4) {
                    // MONDAY & THURSDAY -> EuroDreams
                    console.log(`[CRON] Hoje é dia de EuroDreams. Procurando o sorteio de hoje...`);
                    const edService = new EuroDreamsService();
                    await edService.updateDatabase(); // fetchLatest inside
                }
                else if (dayOfWeek === 2 || dayOfWeek === 5) {
                    // TUESDAY & FRIDAY -> EuroMillions
                    console.log(`[CRON] Hoje é dia de EuroMilhões. Procurando o sorteio de hoje...`);
                    const emService = new EuroMillionsService();
                    await emService.updateDatabase(); // fetchLatest inside
                }
                else if (dayOfWeek === 3 || dayOfWeek === 6) {
                    // WEDNESDAY & SATURDAY -> Totoloto
                    console.log(`[CRON] Hoje é dia de Totoloto. Procurando o sorteio de hoje...`);
                    const ttService = new TotolotoService();
                    await ttService.updateDatabase(); // fetchLatest inside
                }

                console.log(`[${new Date().toLocaleString('pt-PT')}] 😴 Atualização do dia concluída. A dormir por 1 hora.`);
                await new Promise(resolve => setTimeout(resolve, 3600 * 1000)); // Sleep 1 Hour
            } else {
                // Outside window
                console.log(`[${now.toLocaleString('pt-PT')}] 💤 Fora da janela (Hora: ${hour}). A dormir 30 minutos.`);
                await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000)); // Sleep 30 Mins
            }
        } catch (loopError) {
            console.error('❌ ERRO NO CICLO CRON. A recuperar em 5 minutos...', loopError);
            await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
        }
    }
}

startSmartCron().catch(err => {
    console.error('💥 CRITICAL CRON ERROR:', err);
    process.exit(1);
});
