import { NextRequest, NextResponse } from 'next/server';
import { analyzeSeismicHistory } from '@/services/sismologia-nazare';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || 'euromillions';
    const system = searchParams.get('system') || 'tiro_certeiro';
    const points = parseInt(searchParams.get('points') || '100', 10);

    const result = analyzeSeismicHistory(game, system, points);
    if (!result) {
      return NextResponse.json(
        { error: 'Não foi possível carregar os dados sísmicos para o sistema selecionado.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro na API de Sismologia:', error);
    return NextResponse.json(
      { error: 'Falha ao processar análise sísmica', details: error.message },
      { status: 500 }
    );
  }
}
