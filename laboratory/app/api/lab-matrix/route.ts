
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        // Fetch last N draws with their system performances
        const draws = await prisma.draw.findMany({
            take: limit,
            orderBy: { id: 'desc' },
            include: {
                systemPerformances: {
                    select: {
                        systemName: true,
                        hits: true
                    }
                }
            }
        });

        // Transform for client optimization
        const matrix = draws.map(draw => {
            const systemHits: Record<string, number> = {};
            draw.systemPerformances.forEach(p => {
                systemHits[p.systemName] = p.hits;
            });

            return {
                id: draw.id,
                date: draw.date.toISOString(),
                numbers: draw.numbers, // String or JSON? Schema says String.
                systems: systemHits
            };
        });

        // Also fetch list of all active systems for the selector
        const systems = await prisma.rankedSystem.findMany({
            where: { isActive: true },
            select: { name: true },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({
            success: true,
            draws: matrix,
            availableSystems: systems.map(s => s.name)
        });

    } catch (error: any) {
        console.error('[API] Matrix Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
