'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateCard(id: string, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const icon = formData.get('icon') as string;
    const price = parseFloat(formData.get('price') as string) || 0;
    const minRole = formData.get('minRole') as string;
    const order = parseInt(formData.get('order') as string) || 0;
    const configStr = formData.get('config') as string;

    // Validate JSON config
    try {
        if (configStr) JSON.parse(configStr);
    } catch (e) {
        throw new Error('Invalid JSON Config');
    }

    await prisma.dashboardCard.update({
        where: { id },
        data: {
            title,
            description,
            icon,
            price,
            minRole,
            order,
            config: configStr
        }
    });

    revalidatePath('/admin/cards');
    revalidatePath('/');
    redirect('/admin/cards');
}

export async function updateUserRole(userId: string, newRole: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    revalidatePath('/admin/users');
}
