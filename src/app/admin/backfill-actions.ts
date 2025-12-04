'use server';

import { prisma } from '@/lib/prisma';
import { evaluateDraw, updateRanking, cachePredictions } from '@/services/ranking';

export interface BackfillStatus {
    total: number;
    processed: number;
    remaining: number;
    percentage: number;
}

export async function getBackfillStatus(): Promise<BackfillStatus> {
    const total = await prisma.draw.count();

    // We use 'Sistema Ouro' as the benchmark for "processed"
    const processed = await prisma.systemPerformance.count({
        where: { systemName: 'Sistema Ouro' }
    });

    const remaining = total - processed;
    const percentage = total > 0 ? (processed / total) * 100 : 0;

    return {
        total,
        processed,
        remaining,
        percentage: parseFloat(percentage.toFixed(1))
    };
}

export async function processBackfillBatch(batchSize: number = 10): Promise<{ success: boolean, processed: number, message: string }> {
    try {
        // 1. Find draws missing 'Sistema Ouro'
        // Using raw query for performance as in the script
        const missingDraws = await prisma.$queryRaw<{ id: number, date: string }[]>`
            SELECT d.id, d.date 
            FROM Draw d
            WHERE NOT EXISTS (
                SELECT 1 FROM system_performance sp 
                WHERE sp.drawId = d.id 
                AND sp.systemName = 'Sistema Ouro'
            )
            ORDER BY d.date ASC
            LIMIT ${batchSize}
        `;

        if (missingDraws.length === 0) {
            return { success: true, processed: 0, message: 'All draws are up to date!' };
        }

        // 2. Process each draw
        for (const draw of missingDraws) {
            await evaluateDraw(draw.id);
        }

        // 3. Update Rankings
        // We do this after every batch to keep the UI "live" with accurate data
        await updateRanking();

        // 4. Cache Predictions
        // OPTIMIZATION: Only run this heavy operation if we have finished all backfills.
        // Check if there are any remaining draws to process.
        const remainingRaw = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count
            FROM Draw d
            WHERE NOT EXISTS (
                SELECT 1 FROM system_performance sp 
                WHERE sp.drawId = d.id 
                AND sp.systemName = 'Sistema Ouro'
            )
        `;
        const remaining = Number(remainingRaw[0].count);

        if (remaining === 0) {
            console.log('Backfill complete. Caching future predictions...');
            await cachePredictions();
        }

        return {
            success: true,
            processed: missingDraws.length,
            message: `Successfully processed ${missingDraws.length} draws.`
        };

    } catch (error) {
        console.error('Backfill batch failed:', error);
        return {
            success: false,
            processed: 0,
            message: error instanceof Error ? error.message : 'Unknown error during backfill'
        };
    }
}
