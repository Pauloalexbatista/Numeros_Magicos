'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function saveCardOrder(items: { cardId: string; order: number }[]) {
    const session = await auth();
    if (!session?.user?.email) return { success: false, message: 'Not authenticated' };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, message: 'User not found' };

    // Use a transaction to update all items
    await prisma.$transaction(
        items.map((item) =>
            prisma.userCardSettings.upsert({
                where: {
                    userId_cardId: {
                        userId: user.id,
                        cardId: item.cardId,
                    },
                },
                create: {
                    userId: user.id,
                    cardId: item.cardId,
                    order: item.order,
                },
                update: {
                    order: item.order,
                },
            })
        )
    );

    revalidatePath('/');
    return { success: true };
}

export async function toggleCardVisibility(cardId: string, isVisible: boolean) {
    const session = await auth();
    if (!session?.user?.email) return { success: false, message: 'Not authenticated' };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, message: 'User not found' };

    await prisma.userCardSettings.upsert({
        where: {
            userId_cardId: {
                userId: user.id,
                cardId: cardId,
            },
        },
        create: {
            userId: user.id,
            cardId: cardId,
            isVisible: isVisible,
        },
        update: {
            isVisible: isVisible,
        },
    });

    revalidatePath('/');
    return { success: true };
}
