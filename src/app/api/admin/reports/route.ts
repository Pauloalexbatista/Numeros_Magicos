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
      const report = getDailyReport(`latest_${game.toUpperCase()}`);
      if (!report) {
        // Auto-generate if never generated before
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
