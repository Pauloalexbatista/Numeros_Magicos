import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EuroMillionsService } from '@/services/euroMillionsService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const secret = url.searchParams.get('secret');

        // Simple protection to prevent random people from triggering it
        if (secret !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('--- MANUALLY TRIGGERING HISTORY FIX ---');
        
        // 1. Find draws to delete
        const cutoffDate = new Date('2026-03-04T00:00:00.000Z');
        const drawsToDelete = await prisma.draw.findMany({
            where: { game: 'EUROMILLIONS', date: { gt: cutoffDate } },
            select: { id: true }
        });
        
        const drawIds = drawsToDelete.map(d => d.id);
        
        if (drawIds.length > 0) {
            console.log(`Found ${drawIds.length} tainted draws: ${drawIds.join(', ')}. Removing constrained records first...`);
            
            // 2. Delete constrained records manually because Prisma SQLite schema lacks onDelete: Cascade
            await prisma.systemPrediction.deleteMany({ where: { drawId: { in: drawIds } } });
            await prisma.systemPerformance.deleteMany({ where: { drawId: { in: drawIds } } });
            await prisma.starSystemPerformance.deleteMany({ where: { drawId: { in: drawIds } } });
            await prisma.systemPerformanceStaging.deleteMany({ where: { drawId: { in: drawIds } } });
            await prisma.exclusionPerformance.deleteMany({ where: { drawId: { in: drawIds } } });
            
            // 3. Delete the actual draws
            const deleteResult = await prisma.draw.deleteMany({
                where: { id: { in: drawIds } }
            });
            console.log(`Deleted ${deleteResult.count} draws after 03/03/2026.`);
        } else {
            console.log(`No draws found after 03/03/2026.`);
        }

        // 4. Manually inject the hardcoded missing draws since VPS IP is blocked from scraping archive
        const missingDraws = [
            { date: '2026-03-06T00:00:00.000Z', numbers: '[15,16,19,28,37]', stars: '[4,5]', jackpot: 0, hasWinner: false },
            { date: '2026-03-10T00:00:00.000Z', numbers: '[12,14,27,44,50]', stars: '[2,5]', jackpot: 0, hasWinner: false },
            { date: '2026-03-13T00:00:00.000Z', numbers: '[13,17,26,41,48]', stars: '[1,2]', jackpot: 0, hasWinner: false }
        ];

        let injectedCount = 0;
        const { evaluateDraw, evaluateDrawStars, updateRanking, cachePredictions } = require('@/services/ranking');
        const { updateAllStatisticsCache } = require('@/services/cache/statisticsCache');

        for (const draw of missingDraws) {
            const newDraw = await prisma.draw.create({
                data: {
                    game: 'EUROMILLIONS',
                    date: new Date(draw.date),
                    numbers: draw.numbers,
                    stars: draw.stars,
                    jackpot: draw.jackpot,
                    hasWinner: draw.hasWinner
                }
            });
            injectedCount++;
        }

        // 5. Fire evaluation in the background so the HTTP request doesn't timeout!
        // Cloudflare/Nginx will drop the connection if this takes > 60s, which evaluating 24 systems for 3 draws will do.
        Promise.resolve().then(async () => {
            console.log('Background Processing Started: Evaluating Draws...');
            try {
                // Find all the injected draws again in case IDs changed, though we rely on order here 
                for (const draw of missingDraws) {
                    const dbDraw = await prisma.draw.findFirst({ where: { date: new Date(draw.date) } });
                    if (dbDraw) {
                        console.log(`Evaluating background draw: ${draw.date}`);
                        await evaluateDraw(dbDraw.id);
                        await evaluateDrawStars(dbDraw.id);
                    }
                }
                
                console.log('Updating global rankings and cache background...');
                await updateRanking();
                await cachePredictions();
                await updateAllStatisticsCache();
                console.log('✅ Background Database Fix Completed Successfully! ✅');
            } catch (err) {
                console.error('❌ Background Evaluation Error:', err);
            }
        });

        return NextResponse.json({
            success: true,
            message: `[IN OPERATION] Deleted ${drawIds.length} tainted draws. Injected ${injectedCount} correct draws. The heavy mathematical evaluation has now started running safely in the background on the server! Please check the ranking tables in 2-3 minutes.`
        });

    } catch (error) {
        console.error('Error in fix history route:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
