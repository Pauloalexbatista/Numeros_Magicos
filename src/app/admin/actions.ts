'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Check if running in production
const isProduction = process.env.NODE_ENV === 'production';

export async function runFlashUpdate() {
    try {
        // Prevent execution in production (serverless environments don't support long-running processes)
        if (isProduction) {
            return {
                success: false,
                message: 'Esta funcionalidade não está disponível em produção. Execute manualmente via SSH ou configure um Cron Job.'
            };
        }

        const projectRoot = process.cwd();

        console.log(`⚡ Admin triggered Flash Update`);

        // Execute scripts directly (works in Docker)
        const script1 = path.join(projectRoot, 'src', 'scripts', 'core', 'turbo-backfill.ts');
        const script2 = path.join(projectRoot, 'src', 'scripts', 'core', 'turbo-medals.ts');
        const script3 = path.join(projectRoot, 'src', 'scripts', 'core', 'turbo-stars.ts');

        // Run in background
        execAsync(`npx tsx "${script1}" && npx tsx "${script2}" && npx tsx "${script3}"`)
            .then(() => console.log('✅ Flash Update completed'))
            .catch(err => console.error('❌ Flash Update error:', err));

        return { success: true, message: 'Atualização Flash iniciada em background! Pode demorar alguns minutos.' };
    } catch (error) {
        console.error('Failed to run Flash Update:', error);
        return { success: false, message: 'Erro ao iniciar atualização.' };
    }
}

// function definition placeholder to avoid error implementation
export async function runMLUpdate() {
    try {
        console.log(`🧠 Admin triggered ML Update (In-Process)`);

        // Dynamically import to ensure server-side execution
        const { runFullMLPipeline } = await import('@/scripts/core/turbo-ml');

        // Run directly (Awaited)
        // Note: Vercel has a timeout (10s-60s). If this takes longer, it might crash.
        // However, this is the only way to run it 'serverless' without external workers.
        await runFullMLPipeline();

        return { success: true, message: 'Atualização AI concluída com sucesso!' };
    } catch (error) {
        console.error('Failed to run ML Update:', error);
        return { success: false, message: 'Erro ao executar atualização AI.' };
    }
}
