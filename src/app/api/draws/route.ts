import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const draws = await prisma.draw.findMany({
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
