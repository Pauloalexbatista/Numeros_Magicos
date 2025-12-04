'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function purchaseCard(cardId: string) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: 'Precisa de estar logado para comprar.' };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return { error: 'Utilizador não encontrado.' };
    }

    const card = await prisma.dashboardCard.findUnique({
        where: { id: cardId }
    });

    if (!card) {
        return { error: 'Carta não encontrada.' };
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
        return { error: 'Já possui esta carta.' };
    }

    // SIMULATED PAYMENT
    // In a real scenario, we would verify Stripe payment here.
    // For now, we just grant access.

    try {
        await prisma.userPurchase.create({
            data: {
                userId: user.id,
                cardId: card.id,
                amount: card.price || 0
            }
        });

        revalidatePath('/'); // Refresh dashboard to show unlocked card
        return { success: true };
    } catch (error) {
        console.error('Purchase error:', error);
        return { error: 'Erro ao processar a compra.' };
    }
}
