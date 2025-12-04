'use server';

import { scaffoldNewSystem } from '@/utils/system-scaffolder';
import { revalidatePath } from 'next/cache';

export async function createSystemAction(systemName: string) {
    if (!systemName || systemName.length < 3) {
        return { success: false, message: 'Nome do sistema inválido (min 3 chars).' };
    }

    try {
        await scaffoldNewSystem(systemName);
        revalidatePath('/admin/staging');
        return { success: true, message: `Sistema "${systemName}" criado com sucesso! O ficheiro foi gerado.` };
    } catch (error: any) {
        console.error('Error creating system:', error);
        return { success: false, message: `Erro ao criar sistema: ${error.message}` };
    }
}
