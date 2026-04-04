import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getFirstDraw(game: 'EUROMILLIONS'|'EURODREAMS'|'TOTOLOTO', dayOfWeek: number): Promise<Date | null> {
    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'asc' }
    });
    for (const d of draws) {
        if (d.date.getUTCDay() === dayOfWeek) return d.date;
    }
    return null;
}

export async function GET(request: Request) {
    const startTime = Date.now();
    try {
        const { searchParams } = new URL(request.url);
        // Using a simpler secret or checking env for security
        if (searchParams.get('secret') !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const diagnostics: any = {
            timestamp: new Date().toISOString(),
            env: {
                NODE_ENV: process.env.NODE_ENV,
                DATABASE_URL_SET: !!process.env.DATABASE_URL,
                VERCEL: process.env.VERCEL,
                COOLIFY: !!process.env.COOLIFY_APP_ID,
                DATABASE_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'NONE'
            },
            prisma: {
                status: 'unknown'
            }
        };

        // 1. Test basic connection
        try {
            await prisma.$connect();
            diagnostics.prisma.status = 'connected';
        } catch (dbError: any) {
            console.error('❌ DB Connection Failed:', dbError);
            return NextResponse.json({ 
                success: false, 
                diagnostics,
                error: `DB_CONNECTION_ERROR: ${dbError.message}`,
                stack: dbError.stack,
                code: dbError.code
            }, { status: 500 });
        }

        // 2. Test a simple non-date query to rule out data corruption first
        try {
            const userCount = await prisma.user.count();
            diagnostics.prisma.userCount = userCount;
        } catch (e: any) {
            diagnostics.prisma.userQueryError = e.message;
        }

        // 3. Test the "Draw" query which is the most likely to fail if dates are bad
        try {
            const lastDraw = await prisma.draw.findFirst({
                orderBy: { date: 'desc' }
            });
            diagnostics.prisma.lastDraw = lastDraw ? {
                id: lastDraw.id,
                date: lastDraw.date,
                dateType: typeof lastDraw.date
            } : 'none';
        } catch (e: any) {
            console.error('❌ Draw Query Failed:', e);
            diagnostics.prisma.drawQueryError = {
                message: e.message,
                code: e.code,
                meta: e.meta
            };
        }

        return NextResponse.json({
            success: true,
            duration: `${Date.now() - startTime}ms`,
            diagnostics
        });

    } catch (error: any) {
        console.error('API Error in /admin/health:', error);
        return NextResponse.json({ 
            success: false, 
            error: `CRITICAL_INTERNAL_ERROR: ${error.message}`,
            stack: error.stack
        }, { status: 500 });
    }
}
