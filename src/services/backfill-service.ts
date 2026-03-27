
import { PrismaClient, Draw } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { rankedSystems } from './ranked-systems';
import { initializeSystems } from './ranking';
// Import systems logic directly or reuse the logic from turbo-backfill
// Ideally, turbo-backfill should use THIS service.

/**
 * Service to handle partial backfills (batches) safely.
 */
export class BackfillService {

    /**
     * Run a backfill for a specific range of draws.
     * @param skip Number of draws to skip (start index)
     * @param take Number of draws to process
     */
    async processBatch(skip: number, take: number, targetSystemName?: string) {
        console.log(`🔄 Backfill Batch: Skip ${skip}, Take ${take}, Target: ${targetSystemName || 'ALL'}`);

        // 1. Load Draws for this batch
        // We need FULL history for system state depending on the system type?
        // Most systems in ranked-systems.ts (universal-oscillation, etc.) are "stateless" 
        // in the sense that they take `history` as an argument.
        // So we can just load the relevant history for each draw.
        // BUT, generating history for EACH draw in the batch is expensive if we query DB every time.

        // Strategy:
        // Load draws for the batch.
        // For each draw, we need `history` (draws before it).
        // If we process batch 100-150.
        // For draw 100, we need 0-99.
        // For draw 101, we need 0-100.
        // So we should optimize: Load 0-(skip+take).

        const allDraws = await prisma.draw.findMany({
            orderBy: { date: 'asc' }, // Processing chronologically is usually better
            // take: skip + take // Optimization: Load up to the end of this batch
            // Actually, if history is huge (2000), loading 2000 draws is 2000 * 1KB = 2MB. 
            // It's fast enough to load ALL draws once in memory for the batch.
        });

        const batchDraws = allDraws.slice(skip, skip + take);

        if (batchDraws.length === 0) {
            return { processed: 0, message: 'No draws in range' };
        }

        console.log(`Processing ${batchDraws.length} draws from ID ${batchDraws[0].id} to ${batchDraws[batchDraws.length - 1].id}`);

        // 2. Initialize Systems (ensure they are in DB)
        await initializeSystems();

        const systems = rankedSystems; // From registry
        let targetSystems = systems;

        if (targetSystemName) {
            const specific = systems.find(s => s.name === targetSystemName);
            if (specific) {
                targetSystems = [specific];
            } else {
                console.warn(`Target system ${targetSystemName} not found. Aborting.`);
                return {
                    processed: 0,
                    savedPerformances: 0,
                    startId: 0,
                    endId: 0,
                    message: `Target system ${targetSystemName} not found`
                };
            }
        }

        let savedCount = 0;

        // 3. Process Each Draw in Batch
        for (const draw of batchDraws) {
            // History for this draw is everything before it in `allDraws`
            // Since `allDraws` is sorted asc, just take index.
            const drawIndex = allDraws.findIndex(d => d.id === draw.id);
            const history = allDraws.slice(0, drawIndex);

            const actualNumbers = typeof draw.numbers === 'string'
                ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers)
                : draw.numbers as number[];

            for (const system of targetSystems) {
                try {
                    // Check if exists to avoid overwrite? 
                    // Valid "Update" strategy: Delete & Recreate OR Upsert.
                    // Upsert is safer.

                    const prediction = await system.generateTop10(history);

                    const hits = actualNumbers.filter((n: number) => prediction.includes(n)).length;
                    const accuracy = (hits / 5) * 100;

                    // Clean up existing record to ensure idempotency (no unique constraint on SystemPerformance)
                    await prisma.systemPerformance.deleteMany({
                        where: {
                            drawId: draw.id,
                            systemName: system.name
                        }
                    });

                    // Create new record
                    await prisma.systemPerformance.create({
                        data: {
                            drawId: draw.id,
                            systemName: system.name,
                            predictedNumbers: JSON.stringify(prediction),
                            actualNumbers: draw.numbers,
                            hits,
                            accuracy
                        }
                    });

                    // Also save SystemPredictions (for Admin view/Jackpot analysis) if needed?
                    // SystemPerformance is strict "Backtest".
                    // The "SystemPrediction" table is typically for "Future" predictions, 
                    // BUT turbo-backfill.ts populates BOTH.
                    // Let's populate SystemPerformance primarily as it drives Ranking.
                    // If we need "SystemPrediction" (which tracks Potentials/Jackpots separately?),
                    // looking at schema: SystemPrediction has `prediction` and `antiPrediction`.
                    // ranked-systems.ts systems usually don't output an "Anti" version directly here,
                    // unless we wrap them.
                    // For now, let's stick to SystemPerformance which powers the Ranking Page.

                    savedCount++;
                } catch (e) {
                    console.error(`Error processing ${system.name} for draw ${draw.id}`, e);
                }
            }
        }

        return {
            processed: batchDraws.length,
            savedPerformances: savedCount,
            startId: batchDraws[0].id,
            endId: batchDraws[batchDraws.length - 1].id
        };
    }

    async getTotalDraws() {
        return await prisma.draw.count();
    }
}

export const backfillService = new BackfillService();
