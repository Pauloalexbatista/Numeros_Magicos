import { NextRequest, NextResponse } from 'next/server';
import { 
  generateDailyReport, 
  listDailyReports, 
  getDailyReport,
  deleteDailyReport,
  deleteAllDailyReports
} from '@/services/dailyReportService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const game = searchParams.get('game');
    const latest = searchParams.get('latest') === 'true';

    // 1. If requesting a specific report or latest
    if (id) {
      const report = getDailyReport(id);
      if (!report) {
        return NextResponse.json({ success: false, error: 'Relatório não encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: report });
    }

    if (game && latest) {
      let report = getDailyReport(`latest_${game.toUpperCase()}`);

      // Verificar se o relatório em cache é obsoleto (data no passado ou matriz com sequência de fallback corrompida [1, 2, 3, 4, 5])
      let isStale = false;
      if (report) {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (report.nextDrawDate && report.nextDrawDate < todayStr) {
          isStale = true;
        }
        // Verificar se tem matriz com sequência padrão [1, 2, 3, 4, 5] em sistemas algorítmicos normais
        const hasFallbackSequence = report.systemsMatrix?.some(
          s => s.ranks && s.ranks[1] === 1 && s.ranks[2] === 2 && s.ranks[3] === 3 && s.ranks[4] === 4 && s.ranks[5] === 5 && s.name !== 'Matriz de Corte'
        );
        if (hasFallbackSequence) {
          isStale = true;
        }
      }

      if (!report || isStale) {
        // Auto-generate if never generated before or expired/stale
        const generated = await generateDailyReport(game);
        return NextResponse.json({ success: true, data: generated });
      }
      return NextResponse.json({ success: true, data: report });
    }

    // 2. Otherwise list historical reports
    const reportsList = listDailyReports(game || undefined);
    return NextResponse.json({ success: true, data: reportsList });
  } catch (error: any) {
    console.error('Erro na API de Relatórios Diários (GET):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno ao consultar relatórios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const game = (body.game || 'TOTOLOTO').toUpperCase();

    const report = await generateDailyReport(game);

    return NextResponse.json({
      success: true,
      message: `Relatório do ${game} gerado e arquivado com sucesso para ${report.nextDrawDate}!`,
      data: report
    });
  } catch (error: any) {
    console.error('Erro na API de Relatórios Diários (POST):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const game = searchParams.get('game');
    const all = searchParams.get('all') === 'true';

    if (all && game) {
      const count = deleteAllDailyReports(game);
      return NextResponse.json({
        success: true,
        message: `${count} relatórios de ${game} apagados do arquivo histórico.`
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do relatório não especificado' },
        { status: 400 }
      );
    }

    const ok = deleteDailyReport(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Relatório não encontrado para apagar' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Relatório removido com sucesso do arquivo histórico'
    });
  } catch (error: any) {
    console.error('Erro na API de Relatórios Diários (DELETE):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao apagar relatório' },
      { status: 500 }
    );
  }
}
