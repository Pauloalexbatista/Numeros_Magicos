import { NextRequest, NextResponse } from 'next/server';
import { calculateMatrizCorte, GAME_CONFIGS } from '@/services/matriz-corte-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const gameParam = (searchParams.get('game') || 'EUROMILLIONS').toUpperCase();
        const drawIndexParam = searchParams.get('drawIndex');

        const game = GAME_CONFIGS[gameParam] ? gameParam : 'EUROMILLIONS';
        const drawIndex = drawIndexParam ? parseInt(drawIndexParam, 10) : undefined;

        const result = await calculateMatrizCorte(game, isNaN(drawIndex as number) ? undefined : drawIndex);

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Erro na API Matriz de Corte:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Erro interno ao calcular Matriz de Corte' },
            { status: 500 }
        );
    }
}
