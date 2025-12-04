'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { updateRanking, backfillRankings } from '@/services/ranking';

export async function toggleSystemStatus(systemName: string, isActive: boolean) {
    await prisma.rankedSystem.update({
        where: { name: systemName },
        data: { isActive }
    });

    // If deactivated, maybe remove from ranking? 
    // For now just toggle.

    revalidatePath('/admin/ranking');
    revalidatePath('/ranking');
}

export async function triggerManualUpdate() {
    try {
        // Update ranking stats based on existing performance data
        await updateRanking();
        revalidatePath('/admin/ranking');
        revalidatePath('/ranking');
        return { success: true, message: 'Rankings updated successfully' };
    } catch (error) {
        console.error('Update failed:', error);
        return { success: false, message: 'Failed to update rankings' };
    }
}

export async function triggerBackfill() {
    try {
        // Run a small backfill (e.g. last 5 draws) to catch up
        await backfillRankings(5);
        revalidatePath('/admin/ranking');
        revalidatePath('/ranking');
        return { success: true, message: 'Backfill completed successfully' };
    } catch (error) {
        console.error('Backfill failed:', error);
        return { success: false, message: 'Failed to run backfill' };
    }
}
