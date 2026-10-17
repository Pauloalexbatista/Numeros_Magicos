import { NextRequest, NextResponse } from 'next/server';
import { getNextDrawAllSuggestions } from '@/services/polarity-compass';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const gameParam = (searchParams.get('game') || 'EUROMILLIONS').toUpperCase();
        const game = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA'].includes(gameParam) ? gameParam : 'EUROMILLIONS';

        const suggestions = await getNextDrawAllSuggestions(game);

        return NextResponse.json({
            success: true,
            data: {
                game,
                suggestions
            }
        });
    } catch (error: any) {
        console.error('Erro na API Sugestões Próximo Sorteio:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Erro interno' },
            { status: 500 }
        );
    }
}
