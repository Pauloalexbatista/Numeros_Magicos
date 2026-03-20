import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
const DAYS_PT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

async function getFirstDraw(game: 'EUROMILLIONS'|'EURODREAMS'|'TOTOLOTO', dayOfWeek: number): Promise<Date | null> {
    const draws = await prisma.draw.findMany({ where: { game }, orderBy: { date: 'asc' } });
    for (const d of draws) {
        if (d.date.getUTCDay() === dayOfWeek) return d.date;
    }
    return null;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        if (searchParams.get('secret') !== 'magia2026') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const first_EM_Tue = await getFirstDraw('EUROMILLIONS', 2);
        const first_EM_Fri = await getFirstDraw('EUROMILLIONS', 5);
        const first_TT_Wed = await getFirstDraw('TOTOLOTO', 3);
        const first_TT_Sat = await getFirstDraw('TOTOLOTO', 6);
        const first_ED_Mon = await getFirstDraw('EURODREAMS', 1);
        const first_ED_Thu = await getFirstDraw('EURODREAMS', 4);

        const allStarts = [first_EM_Tue, first_EM_Fri, first_TT_Wed, first_TT_Sat, first_ED_Mon, first_ED_Thu].filter(d => d !== null) as Date[];
        const globalStartDate = new Date(Math.min(...allStarts.map(d => d.getTime())));

        const allDraws = await prisma.draw.findMany();
        const dbMap: { [dateStr: string]: string[] } = {};
        for (const draw of allDraws) {
            const dStr = draw.date.toISOString().split('T')[0];
            if (!dbMap[dStr]) dbMap[dStr] = [];
            dbMap[dStr].push(draw.game);
        }

        const today = new Date();
        today.setUTCHours(12, 0, 0, 0);

        let currentDate = new Date(globalStartDate);
        currentDate.setUTCHours(12, 0, 0, 0);

        const lines = [];
        lines.push('DATA;DIA DA SEMANA;JOGOS ESPERADOS (TEORIA);JOGOS NA BD (REALIDADE);ESTADO AUDITORIA;OBSERVACOES OBRIGATORIAS');

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
            let obs = [];
            let estado = 'OK';

            for (const exp of expected) {
                if (!found.includes(exp)) obs.push(`FALTA SORTEIO: ${exp}`);
            }
            for (const fnd of found) {
                if (!expected.includes(fnd)) obs.push(`ERRO GRAVE: SORTEIO EXTRA DA BD (${fnd})`);
            }

            if (obs.length > 0) {
                if (obs.some(o => o.includes('FALTA'))) estado = 'FALTA';
                if (obs.some(o => o.includes('ERRO GRAVE'))) estado = 'ERRO_GRAVE';
            } else {
                estado = expected.length === 0 ? 'CALMO (Nenhum Jogo)' : 'TUDO PRESENTE E BEM DATADO';
            }

            const d = String(currentDate.getUTCDate()).padStart(2, '0');
            const m = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
            const y = currentDate.getUTCFullYear();
            const ptDate = `${d}/${m}/${y}`;

            const row = [
                ptDate,
                DAYS_PT[day],
                expected.length > 0 ? expected.join(', ') : 'NENHUM',
                found.length > 0 ? found.join(', ') : 'NENHUM',
                estado,
                obs.join(' | ')
            ];
            lines.push(row.join(';'));
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        const csvContent = '\ufeff' + lines.join('\n');
        
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="Auditoria_BaseDados_Master.csv"'
            }
        });

    } catch (error) {
        console.error('Export Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
