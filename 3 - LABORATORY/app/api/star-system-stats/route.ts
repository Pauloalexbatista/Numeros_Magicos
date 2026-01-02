import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const systems = await prisma.starSystemRanking.findMany({
            orderBy: { avgAccuracy: 'desc' },
        });

        const stats = systems.map(s => ({
            name: s.systemName,
            accuracy: parseFloat(s.avgAccuracy.toFixed(2)),
            jackpots: s.jackpots,
            avgHits: parseFloat((s.totalHits / (s.totalPredictions || 1)).toFixed(2)),
        }));

        return NextResponse.json({ success: true, systems: stats });
    } catch (error: any) {
        console.error('[Star System Stats Error]:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            systems: []
        }, { status: 500 });
    }
}
