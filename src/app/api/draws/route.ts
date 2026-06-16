import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const game = searchParams.get('game')?.toUpperCase() || undefined;

        const draws = await prisma.draw.findMany({
            where: game ? { game } : {},
            orderBy: {
                date: 'desc'
            },
            select: {
                id: true,
                date: true,
                numbers: true,
                stars: true
            }
        });

        return NextResponse.json(draws);
    } catch (error) {
        console.error('Error fetching draws:', error);
        return NextResponse.json(
            { error: 'Failed to fetch draws' },
            { status: 500 }
        );
    }
}
