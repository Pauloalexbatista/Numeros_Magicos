import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('[System Stats] Fetching active systems...');

        // Get all active systems
        const systems = await prisma.rankedSystem.findMany({
            where: { isActive: true },
            select: { name: true }
        });

        console.log('[System Stats] Found systems:', systems.length);

        if (systems.length === 0) {
            console.warn('[System Stats] No active systems found in database');
            return NextResponse.json({
                success: true,
                systems: []
            });
        }

        // Get recent performance (last 100 draws) for each system
        const systemStats = await Promise.all(
            systems.map(async (sys) => {
                try {
                    const performances = await prisma.systemPerformance.findMany({
                        where: { systemName: sys.name },
                        orderBy: { drawId: 'desc' },
                        take: 100,
                        select: {
                            hits: true,
                            accuracy: true
                        }
                    });

                    if (performances.length === 0) {
                        console.warn(`[System Stats] No performances for ${sys.name}`);
                        return {
                            name: sys.name,
                            accuracy: 0,
                            jackpots: 0,
                            avgHits: 0
                        };
                    }

                    const totalHits = performances.reduce((sum, p) => sum + p.hits, 0);
                    const avgHits = totalHits / performances.length;
                    const avgAccuracy = performances.reduce((sum, p) => sum + p.accuracy, 0) / performances.length;
                    const jackpots = performances.filter(p => p.hits >= 5).length;

                    return {
                        name: sys.name,
                        accuracy: Math.round(avgAccuracy * 10) / 10,
                        jackpots,
                        avgHits: Math.round(avgHits * 100) / 100
                    };
                } catch (sysError: any) {
                    console.error(`[System Stats] Error loading ${sys.name}:`, sysError.message);
                    return {
                        name: sys.name,
                        accuracy: 0,
                        jackpots: 0,
                        avgHits: 0
                    };
                }
            })
        );

        // Sort by accuracy (best first)
        systemStats.sort((a, b) => b.accuracy - a.accuracy);

        console.log('[System Stats] Returning', systemStats.length, 'systems');

        return NextResponse.json({
            success: true,
            systems: systemStats
        });

    } catch (error: any) {
        console.error('[System Stats Error]:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            details: error.stack
        }, { status: 500 });
    }
}
