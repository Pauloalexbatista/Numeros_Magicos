import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as xlsx from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        if (secret !== 'magia2026') {
            return NextResponse.json({ error: 'Acesso Negado' }, { status: 401 });
        }

        const systems = await prisma.rankedSystem.findMany({
            orderBy: [
                { game: 'asc' },
                { name: 'asc' },
                { domain: 'asc' }
            ]
        });

        // Generate one row per system instance with explicit Jogo
        const data = systems.map(s => ({
            'Jogo': s.game === 'EUROMILLIONS' ? 'EuroMilhões' : s.game === 'EURODREAMS' ? 'EuroDreams' : 'Totoloto',
            'Sistema': s.name,
            'Domínio': s.domain?.toUpperCase() === 'STARS' ? 'Estrelas/Sonhos' : 'Números',
            'Tipo': s.systemType,
            'Descrição': s.description || '',
            'Complexidade (Custo)': `c:${s.complexity}`,
            'Estado Geral': s.isActive ? 'Ativo' : 'Pausado'
        }));

        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sistemas');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="sistemas_BD_${new Date().toISOString().replace(/[:T]/g, '-').substring(0, 19)}.xlsx"`
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
