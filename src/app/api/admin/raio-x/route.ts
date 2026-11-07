import { NextRequest, NextResponse } from 'next/server';
import { getRecentDraws, getDrawAudit, GAME_SPECS } from '@/services/raio-x-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameParam = (searchParams.get('game') || 'EUROMILLIONS').toUpperCase();
    const game = GAME_SPECS[gameParam] ? gameParam : 'EUROMILLIONS';
    const drawIdParam = searchParams.get('drawId');

    // 1. Obter lista de sorteios recentes para o seletor
    const draws = await getRecentDraws(game, 100);

    if (draws.length === 0) {
      return NextResponse.json({
        success: true,
        game,
        draws: [],
        audit: null
      });
    }

    // 2. Determinar qual o sorteio a auditar
    const targetDrawId = drawIdParam ? parseInt(drawIdParam, 10) : draws[0].id;
    const audit = await getDrawAudit(targetDrawId);

    return NextResponse.json({
      success: true,
      game,
      draws,
      audit
    });
  } catch (error: any) {
    console.error('Erro na API Raio-X:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno ao processar Raio-X' },
      { status: 500 }
    );
  }
}
