import { NextRequest, NextResponse } from 'next/server';
import { 
  loadStrategies, 
  scanAndSyncStrategies, 
  computeMetrics 
} from '@/services/strategy-tracker';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game')?.toUpperCase();
    const status = searchParams.get('status')?.toUpperCase();

    let list = loadStrategies();

    // Se estiver vazio na primeira chamada, fazer scan automático
    if (list.length === 0) {
      await scanAndSyncStrategies();
      list = loadStrategies();
    }

    if (game && ['TOTOLOTO', 'EUROMILLIONS', 'EURODREAMS', 'MEGASENA'].includes(game)) {
      list = list.filter(s => s.game === game);
    }

    if (status && ['ATIVA', 'CONCRETIZADA', 'EXPIRADA_SEM_PREMIO'].includes(status)) {
      list = list.filter(s => s.status === status);
    }

    const metrics = computeMetrics(list);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        strategies: list
      }
    });
  } catch (error: any) {
    console.error('Erro na API de Estratégias:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'scan';

    if (action === 'scan') {
      const syncResult = await scanAndSyncStrategies(['TOTOLOTO', 'EUROMILLIONS', 'EURODREAMS', 'MEGASENA']);
      const list = loadStrategies();
      const metrics = computeMetrics(list);

      return NextResponse.json({
        success: true,
        data: {
          syncResult,
          metrics,
          strategies: list
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Ação não suportada' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erro no POST da API de Estratégias:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
