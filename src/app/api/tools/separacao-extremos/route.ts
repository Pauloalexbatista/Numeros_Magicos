import { NextRequest, NextResponse } from 'next/server';
import { getPolarityRanking } from '@/services/polarity-compass';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const gameParam = (searchParams.get('game') || 'EUROMILLIONS').toUpperCase();
        const game = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA', 'LOTOFACIL'].includes(gameParam) ? gameParam : 'EUROMILLIONS';

        const ranking = await getPolarityRanking(game);

        return NextResponse.json({
            success: true,
            data: {
                game,
                ranking
            }
        });
    } catch (error: any) {
        console.error('Erro na API Separação de Extremos:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Erro interno' },
            { status: 500 }
        );
    }
}
