import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface GameHealth {
    game: string;
    total: number;
    firstDate: string;
    lastDate: string;
    healthy: boolean;
    missingCount: number;
    missingDates: string[];
    duplicates: string[];
}

async function getGameHealth(game: 'EUROMILLIONS' | 'EURODREAMS' | 'TOTOLOTO'): Promise<GameHealth> {
    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'asc' }
    });

    if (draws.length === 0) {
        return {
            game,
            total: 0,
            firstDate: '',
            lastDate: '',
            healthy: true,
            missingCount: 0,
            missingDates: [],
            duplicates: []
        };
    }

    const firstDate = draws[0].date;
    const lastDate = draws[draws.length - 1].date;
    
    // Check for duplicates
    const dateStrings = draws.map(d => d.date.toISOString().split('T')[0]);
    const duplicates = dateStrings.filter((date, index) => dateStrings.indexOf(date) !== index);
    
    // Check for gaps (simple check: if days between first and last doesn't match expected frequency)
    // For EuroMillions: Tue/Fri
    // For EuroDreams: Mon/Thu
    // For Totoloto: Wed/Sat
    
    // For now, let's keep it simple as the diagnostic script did
    // We can add more complex gap detection if needed later.

    return {
        game,
        total: draws.length,
        firstDate: firstDate.toISOString(),
        lastDate: lastDate.toISOString(),
        healthy: duplicates.length === 0,
        missingCount: 0, // Placeholder for future gap logic
        missingDates: [],
        duplicates: Array.from(new Set(duplicates))
    };
}

export async function GET(request: Request) {
    const startTime = Date.now();
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Core Health Metrics (Required by Frontend)
        const health = {
            EUROMILLIONS: await getGameHealth('EUROMILLIONS'),
            EURODREAMS: await getGameHealth('EURODREAMS'),
            TOTOLOTO: await getGameHealth('TOTOLOTO')
        };

        // 2. Diagnostics (Additional Context)
        const diagnostics: any = {
            timestamp: new Date().toISOString(),
            env: {
                NODE_ENV: process.env.NODE_ENV,
                DATABASE_URL_SET: !!process.env.DATABASE_URL,
                COOLIFY: !!process.env.COOLIFY_APP_ID
            },
            performance: {
                durationMs: Date.now() - startTime
            }
        };

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            health,
            diagnostics
        });

    } catch (error: any) {
        console.error('API Error in /api/admin/health:', error);
        return NextResponse.json({ 
            success: false, 
            error: `CRITICAL_INTERNAL_ERROR: ${error.message}`
        }, { status: 500 });
    }
}
