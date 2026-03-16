import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GameType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const expectedDays: Record<string, number[]> = {
    EUROMILLIONS: [2, 5],
    EURODREAMS: [1, 4],
    TOTOLOTO: [3, 6],
};

async function getGameHealth(game: string) {
    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'asc' },
    });

    if (draws.length === 0) {
        return { game, total: 0, healthy: false, missingCount: 0, missingDates: [], duplicates: [] };
    }

    const firstDrawDate = draws[0].date;
    const lastDrawDate = draws[draws.length - 1].date;

    const missingDates: string[] = [];
    const duplicateDates: string[] = [];
    const drawDates = new Set<string>();

    for (const draw of draws) {
        const dateStr = draw.date.toISOString().split('T')[0];
        if (drawDates.has(dateStr)) duplicateDates.push(dateStr);
        drawDates.add(dateStr);
    }

    let currentDate = new Date(firstDrawDate);
    const targetDays = expectedDays[game];

    // Check every day up to the last draw date
    while (currentDate <= lastDrawDate) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toISOString().split('T')[0];

        if (targetDays.includes(dayOfWeek)) {
            if (!drawDates.has(dateStr)) {
                missingDates.push(dateStr);
            }
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // Ignore missing draws for Euromillions before 2011-05-10 where it only played on Fridays
    // Actually, Euromillions started Tuesday draws on May 10, 2011.
    let filteredMissingDates = missingDates;
    if (game === 'EUROMILLIONS') {
        filteredMissingDates = missingDates.filter(d => {
            const dateObj = new Date(d);
            // If it's a Tuesday (day 2) and before May 10, 2011, it's expected to be missing
            if (dateObj.getDay() === 2 && dateObj < new Date('2011-05-10')) {
                return false;
            }
            return true;
        });
    }

    return {
        game,
        total: draws.length,
        firstDate: firstDrawDate.toISOString().split('T')[0],
        lastDate: lastDrawDate.toISOString().split('T')[0],
        healthy: filteredMissingDates.length === 0 && duplicateDates.length === 0,
        missingCount: filteredMissingDates.length,
        missingDates: filteredMissingDates.slice(0, 10), // only send a few to UI to avoid huge payloads
        duplicates: duplicateDates
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const euromillions = await getGameHealth('EUROMILLIONS');
        const eurodreams = await getGameHealth('EURODREAMS');
        const totoloto = await getGameHealth('TOTOLOTO');

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            health: {
                EUROMILLIONS: euromillions,
                EURODREAMS: eurodreams,
                TOTOLOTO: totoloto
            }
        });
    } catch (error) {
        console.error('API Error in /admin/health:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
