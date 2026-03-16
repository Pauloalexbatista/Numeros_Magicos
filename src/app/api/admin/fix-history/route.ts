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
        
        // 1. Delete all draws after March 3rd 2026
        const cutoffDate = new Date('2026-03-04T00:00:00.000Z');
        const deleteResult = await prisma.draw.deleteMany({
            where: {
                game: 'EUROMILLIONS',
                date: {
                    gt: cutoffDate
                }
            }
        });
        console.log(`Deleted ${deleteResult.count} draws after 03/03/2026.`);

        // 2. Trigger auto-update which finds gaps and evaluates them carefully and sequentially
        const service = new EuroMillionsService();
        await service.updateDatabase();

        return NextResponse.json({
            success: true,
            message: `Deleted ${deleteResult.count} tainted draws. Successfully executed mathematical gap-fill from 03/03 onwards. The missing draws are now restored with clean data.`
        });

    } catch (error) {
        console.error('Error in fix history route:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
