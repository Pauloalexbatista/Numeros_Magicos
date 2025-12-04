'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function purchaseCard(cardId: string) {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, message: 'User not authenticated' };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    const card = await prisma.dashboardCard.findUnique({
        where: { id: cardId }
    });

    if (!card) {
        return { success: false, message: 'Card not found' };
    }

    // Check if already purchased
    const existingPurchase = await prisma.userPurchase.findUnique({
        where: {
            userId_cardId: {
                userId: user.id,
                cardId: card.id
            }
        }
    });

    if (existingPurchase) {
        return { success: false, message: 'Already purchased' };
    }

    // Mock Payment Processing
    // In a real app, we would integrate Stripe here.
    // For now, we just record the purchase.

    await prisma.userPurchase.create({
        data: {
            userId: user.id,
            cardId: card.id,
            amount: card.price || 0
        }
    });

    revalidatePath('/');
    revalidatePath('/store');

    return { success: true, message: 'Purchase successful' };
}
