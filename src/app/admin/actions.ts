'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function runFlashUpdate() {
    try {
        const projectRoot = process.cwd();
        const batFile = path.join(projectRoot, 'ATUALIZACAO_FLASH.bat');

        console.log(`⚡ Admin triggered Flash Update: ${batFile}`);

        // We use 'start' to open a new window so the user can see progress
        // Or we can run it in background. User said "window opens".
        // "start cmd /c ..." opens a new window.
        await execAsync(`start cmd /c "${batFile}"`);

        return { success: true, message: 'Atualização Flash iniciada! Verifique a janela preta.' };
    } catch (error) {
        console.error('Failed to run Flash Update:', error);
        return { success: false, message: 'Erro ao iniciar atualização.' };
    }
}

export async function runMLUpdate() {
    try {
        const projectRoot = process.cwd();
        const batFile = path.join(projectRoot, 'ML_UPDATE.bat');

        console.log(`🧠 Admin triggered ML Update: ${batFile}`);

        await execAsync(`start cmd /c "${batFile}"`);

        return { success: true, message: 'Atualização AI iniciada! O treino pode demorar 1-2 minutos.' };
    } catch (error) {
        console.error('Failed to run ML Update:', error);
        return { success: false, message: 'Erro ao iniciar atualização AI.' };
    }
}
