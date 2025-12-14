'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function promoteToAdmin(formData: FormData) {
    const email = formData.get('email') as string;
    const secret = formData.get('secret') as string;

    // Código secreto hardcoded para facilitar (pode ser removido depois)
    const SECRET_CODE = "MAGO_SUPREMO";

    if (secret !== SECRET_CODE) {
        return { error: 'Código de segurança incorreto.' };
    }

    if (!email) {
        return { error: 'Email é obrigatório.' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { error: 'Utilizador não encontrado. O utilizador tem de criar conta primeiro.' };
        }

        await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });

        revalidatePath('/');
        return { success: `Sucesso! O utilizador ${email} agora é ADMIN.` };
    } catch (error) {
        console.error('Erro ao promover admin:', error);
        return { error: 'Erro interno ao atualizar a base de dados.' };
    }
}
