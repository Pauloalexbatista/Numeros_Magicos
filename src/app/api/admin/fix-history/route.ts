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

        // 2. Trigger auto-update which finds gaps and evaluates them carefully and sequentially
        const service = new EuroMillionsService();
        await service.updateDatabase();

        return NextResponse.json({
            success: true,
            message: `Deleted ${drawIds.length} tainted draws and their dependent records. Successfully executed mathematical gap-fill from 03/03 onwards. The missing draws are now restored with clean data.`
        });

    } catch (error) {
        console.error('Error in fix history route:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
