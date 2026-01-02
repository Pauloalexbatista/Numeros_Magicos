
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Get recent draws
        const draws = await prisma.draw.findMany({
            orderBy: { date: 'desc' },
            take: 100 // Analyze last 100
        });

        // 2. Frequency Analysis
        const frequency = new Map<number, number>();
        // Initialize 1-50
        for (let i = 1; i <= 50; i++) frequency.set(i, 0);

        draws.forEach(d => {
            const nums = d.numbers.split(',').map(n => parseInt(n));
            nums.forEach(n => frequency.set(n, (frequency.get(n) || 0) + 1));
        });

        // 3. Find Coldest (Exclusion Candidates)
        const sorted = Array.from(frequency.entries())
            .sort((a, b) => a[1] - b[1]); // Ascending frequency (0 hits first)

        const topExclusion = sorted.slice(0, 10).map(([num, count]) => ({
            number: num,
            hits: count,
            probability: 'Very Low'
        }));

        return NextResponse.json({
            candidates: topExclusion,
            analyzedDraws: draws.length,
            method: "Frequency Analysis (Coldest)"
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
