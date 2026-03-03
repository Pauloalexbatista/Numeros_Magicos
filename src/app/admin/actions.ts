'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Syncs prediction data from the offline calculation engine to the online database.
 * Updates CachedPrediction for each system and ensures RankedSystem exists.
 */
export async function uploadPredictionPack(jsonString: string) {
    try {
        // Accept both JSON string and Object (depending on how it's called)
        const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        const { systems } = data;

        if (!Array.isArray(systems)) {
            return { success: false, message: 'Invalid data format: systems array missing' };
        }

        console.log(`📥 Syncing ${systems.length} systems to database...`);

        for (const sys of systems) {
            // 1. Ensure the system exists in RankedSystem
            await prisma.rankedSystem.upsert({
                where: { name: sys.name },
                update: {
                    // Update metadata if needed
                    description: sys.description || undefined,
                },
                create: {
                    name: sys.name,
                    description: sys.description || '',
                    isActive: true,
                    systemType: 'BASE',
                    domain: 'NUMBERS',
                },
            });

            // 2. Update CachedPrediction (The one used for real-time display)
            await prisma.cachedPrediction.upsert({
                where: { systemName: sys.name },
                update: {
                    numbers: JSON.stringify(sys.prediction),
                    worstNumbers: JSON.stringify(sys.antiPrediction),
                    updatedAt: new Date(),
                },
                create: {
                    systemName: sys.name,
                    numbers: JSON.stringify(sys.prediction),
                    worstNumbers: JSON.stringify(sys.antiPrediction),
                },
            });
        }

        // Revalidate relevant pages
        revalidatePath('/');
        revalidatePath('/admin/systems');
        revalidatePath('/ranking');

        return { success: true, message: `Successfully synced ${systems.length} systems.` };
    } catch (error: any) {
        console.error('Failed to upload prediction pack:', error);
        return { success: false, message: `Error: ${error.message}` };
    }
}
