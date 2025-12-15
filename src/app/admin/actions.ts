'use server';

import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';
import { revalidatePath } from 'next/cache';

/**
 * Validates which systems are present in the Code but missing in the Database.
 */
export async function getSystemBackfillStatus() {
    // 1. Get all system names from Code
    const codeSystems = rankedSystems.map(s => s.name);

    // 2. Get all system names from Database (Cache or Performance - Performance is safer source of truth)
    const dbSystemsData = await prisma.systemPerformance.groupBy({
        by: ['systemName'],
        _count: {
            drawId: true
        }
    });

    const dbSystemsMap = new Map(dbSystemsData.map(s => [s.systemName, s._count.drawId]));

    // 3. Compare
    const status = codeSystems.map(name => {
        const count = dbSystemsMap.get(name) || 0;
        // Arbitrary threshold: If less than 100 draws, it's likely "New/Empty"
        const isBackfilled = count > 100;

        return {
            name,
            isBackfilled,
            drawCount: count,
            status: isBackfilled ? 'OK' : 'MISSING'
        };
    });

    // Also find "Zombie" systems (In DB but not in Code)
    const zombieSystems = dbSystemsData
        .filter(s => !codeSystems.includes(s.systemName))
        .map(s => ({
            name: s.systemName,
            isBackfilled: true,
            drawCount: s._count.drawId,
            status: 'ZOMBIE' // Deprecated system
        }));

    return [...status, ...zombieSystems].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Handles the upload of the "ML Pack" (JSON file).
 * updates CachedPrediction and SystemPrediction tables.
 */
export async function uploadPredictionPack(jsonString: string) {
    try {
        const data = JSON.parse(jsonString);

        if (!data.systems || !Array.isArray(data.systems)) {
            throw new Error('Invalid JSON format: missing "systems" array.');
        }

        let processed = 0;

        for (const sys of data.systems) {
            // 1. Update Cache
            if (sys.cache) {
                await prisma.cachedPrediction.upsert({
                    where: { systemName: sys.name },
                    update: {
                        numbers: JSON.stringify(sys.cache.numbers),
                        worstNumbers: JSON.stringify(sys.cache.worstNumbers),
                        updatedAt: new Date() // Force update time
                    },
                    create: {
                        systemName: sys.name,
                        numbers: JSON.stringify(sys.cache.numbers),
                        worstNumbers: JSON.stringify(sys.cache.worstNumbers)
                    }
                });
            }

            // 2. Update Future Prediction (SystemPrediction)
            if (sys.prediction) {
                // Find latest draw to attach prediction to?
                // Ideally the pack tells us the drawId.
                // For simplicity, we might just update the generic SystemPrediction if it stores "Next Draw" info.
                // But SystemPrediction is linked to a DrawId.
                // Let's assume the JSON contains `drawId` or we find the latest open draw.

                const latestDraw = await prisma.draw.findFirst({ orderBy: { date: 'desc' } });

                if (latestDraw) {
                    await prisma.systemPrediction.upsert({
                        where: {
                            drawId_systemName: {
                                drawId: latestDraw.id,
                                systemName: sys.name
                            }
                        },
                        update: {
                            prediction: JSON.stringify(sys.prediction),
                            antiPrediction: JSON.stringify(sys.antiPrediction || []),
                            calculatedAt: new Date()
                        },
                        create: {
                            drawId: latestDraw.id,
                            systemName: sys.name,
                            prediction: JSON.stringify(sys.prediction),
                            antiPrediction: JSON.stringify(sys.antiPrediction || []),
                            hits: 0,
                            antiHits: 0
                        }
                    });
                }
            }
            processed++;
        }

        revalidatePath('/admin');
        return { success: true, message: `Updated ${processed} systems successfully.` };

    } catch (error: any) {
        console.error('Upload failed:', error);
        return { success: false, message: error.message };
    }
}
