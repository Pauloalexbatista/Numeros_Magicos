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
    try {
        const { searchParams } = new URL(request.url);
        if (searchParams.get('secret') !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const first_EM_Tue = await getFirstDraw('EUROMILLIONS', 2);
        const first_EM_Fri = await getFirstDraw('EUROMILLIONS', 5);
        const first_TT_Wed = await getFirstDraw('TOTOLOTO', 3);
        const first_TT_Sat = await getFirstDraw('TOTOLOTO', 6);
        const first_ED_Mon = await getFirstDraw('EURODREAMS', 1);
        const first_ED_Thu = await getFirstDraw('EURODREAMS', 4);

        const allDraws = await prisma.draw.findMany({ orderBy: { date: 'asc' } });
        const dbMap: { [dateStr: string]: string[] } = {};
        
        const counts = { EUROMILLIONS: 0, EURODREAMS: 0, TOTOLOTO: 0 };
        const missingDates: { [game: string]: string[] } = { EUROMILLIONS: [], EURODREAMS: [], TOTOLOTO: [] };
        const duplicates: { [game: string]: string[] } = { EUROMILLIONS: [], EURODREAMS: [], TOTOLOTO: [] };
        
        for (const draw of allDraws) {
            counts[draw.game as 'EUROMILLIONS'|'EURODREAMS'|'TOTOLOTO']++;
            const dStr = draw.date.toISOString().split('T')[0];
            if (!dbMap[dStr]) dbMap[dStr] = [];
            
            if (dbMap[dStr].includes(draw.game)) {
                duplicates[draw.game].push(dStr);
            }
            dbMap[dStr].push(draw.game);
        }

        let currentDate = new Date('2004-02-13T12:00:00Z');
        const today = new Date();
        today.setUTCHours(12, 0, 0, 0);
        // Se a chamada for feita antes do sorteio / processamento diário (~22:30), o sorteio de "hoje" ainda não é 'Falta'
        if (new Date().getUTCHours() < 22) {
            today.setUTCDate(today.getUTCDate() - 1);
        }

        while (currentDate <= today) {
            const iso = currentDate.toISOString().split('T')[0];
            const day = currentDate.getUTCDay();

            const expected: string[] = [];
            if (day === 2 && first_EM_Tue && currentDate >= first_EM_Tue) expected.push('EUROMILLIONS');
            if (day === 5 && first_EM_Fri && currentDate >= first_EM_Fri) expected.push('EUROMILLIONS');
            if (day === 3 && first_TT_Wed && currentDate >= first_TT_Wed) expected.push('TOTOLOTO');
            if (day === 6 && first_TT_Sat && currentDate >= first_TT_Sat) expected.push('TOTOLOTO');
            if (day === 1 && first_ED_Mon && currentDate >= first_ED_Mon) expected.push('EURODREAMS');
            if (day === 4 && first_ED_Thu && currentDate >= first_ED_Thu) expected.push('EURODREAMS');

            const found = dbMap[iso] || [];

            for (const exp of expected) {
                if (!found.includes(exp)) {
                    missingDates[exp].push(iso);
                }
            }
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        const buildGamePayload = (game: 'EUROMILLIONS'|'EURODREAMS'|'TOTOLOTO') => {
            const gameMissing = missingDates[game].reverse(); // Recentes primeiro
            const missingSince2020 = gameMissing.filter(d => new Date(d) >= new Date('2020-01-01'));
            
            // Healthy se não houver faltas recentes (nos últimos 14 dias)
            let isHealthy = true;
            if (gameMissing.length > 0) {
                const daysSinceLatestMiss = (new Date().getTime() - new Date(gameMissing[0]).getTime()) / (1000 * 3600 * 24);
                if (daysSinceLatestMiss < 14) isHealthy = false;
            }

            const targetDraws = allDraws.filter(d => d.game === game);
            
            return {
                game,
                total: counts[game],
                firstDate: targetDraws.length > 0 ? targetDraws[0].date.toISOString().split('T')[0] : 'N/A',
                lastDate: targetDraws.length > 0 ? targetDraws[targetDraws.length - 1].date.toISOString().split('T')[0] : 'N/A',
                healthy: isHealthy,
                missingCount: gameMissing.length,
                missingDates: gameMissing.slice(0, 10),
                duplicates: duplicates[game],
                missingSince2020
            };
        };

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            health: {
                EUROMILLIONS: buildGamePayload('EUROMILLIONS'),
                EURODREAMS: buildGamePayload('EURODREAMS'),
                TOTOLOTO: buildGamePayload('TOTOLOTO')
            }
        });

    } catch (error) {
        console.error('API Error in /admin/health:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
