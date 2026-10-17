import { NextRequest, NextResponse } from 'next/server';
import { getSavedMetaSystems, simulateCustomEnsemble } from '@/services/lab-meta-systems';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || 'euromillions';

    const result = getSavedMetaSystems(game);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro na API do Laboratório (GET):', error);
    return NextResponse.json(
      { error: 'Falha ao obter os dados do laboratório', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { game, configs } = body;

    if (!game || !configs || !Array.isArray(configs)) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos: forneça "game" e array "configs".' },
        { status: 400 }
      );
    }

    const result = simulateCustomEnsemble(game, configs);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro na API do Laboratório (POST):', error);
    return NextResponse.json(
      { error: 'Falha ao simular ensemble no laboratório', details: error.message },
      { status: 500 }
    );
  }
}
