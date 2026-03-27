import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as xlsx from 'xlsx';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        if (secret !== 'magia2026') {
            return NextResponse.json({ error: 'Acesso Negado' }, { status: 401 });
        }

        const draws = await prisma.draw.findMany({
            orderBy: [{ game: 'asc' }, { date: 'desc' }]
        });

        const data = draws.map(draw => {
            let numbers = [];
            let stars = [];
            try { numbers = typeof draw.numbers === 'string' ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers) : draw.numbers; } catch(e){}
            try { stars = typeof draw.stars === 'string' ? (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars) : draw.stars; } catch(e){}
            
            const row: any = {
                'Jogo': draw.game,
                'Concurso': draw.sequenceNumber || '',
                'Data': new Date(draw.date).toLocaleDateString('pt-PT'),
            };

            for (let i = 0; i < 6; i++) {
                row[`N${i+1}`] = numbers[i] !== undefined ? numbers[i] : '';
            }
            for (let i = 0; i < 2; i++) {
                row[`E${i+1}`] = stars[i] !== undefined ? stars[i] : '';
            }

            return row;
        });

        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sorteios');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="calendario_BD_Sorteios_${new Date().toISOString().replace(/[:T]/g, '-').substring(0, 19)}.xlsx"`
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
