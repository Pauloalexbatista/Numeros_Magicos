import { NextRequest, NextResponse } from 'next/server';
import {
  CHAMPION_FORMULAS,
  SYSTEM_LABELS,
  evaluateSuperCombination,
  FusionMethod,
  SystemComponent,
} from '@/services/super-combinacoes';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const presetId = searchParams.get('presetId') || '20b_jackpot_5s';
    const preset = CHAMPION_FORMULAS.find((f) => f.id === presetId) || CHAMPION_FORMULAS[0];

    const evaluation = await evaluateSuperCombination(preset.components, preset.method);

    return NextResponse.json({
      success: true,
      presets: CHAMPION_FORMULAS,
      systemLabels: SYSTEM_LABELS,
      activePreset: preset,
      evaluation,
    });
  } catch (err: any) {
    console.error('Erro em GET /api/admin/super-combinacoes:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao calcular super-combinação' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const components: SystemComponent[] = body.components || [];
    const method: FusionMethod = body.method === 'BORDA' ? 'BORDA' : 'INTERCALADO';

    if (!Array.isArray(components) || components.length === 0 || components.length > 6) {
      return NextResponse.json(
        { success: false, error: 'Selecione entre 1 e 5 sistemas para simular.' },
        { status: 400 }
      );
    }

    const evaluation = await evaluateSuperCombination(components, method);

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (err: any) {
    console.error('Erro em POST /api/admin/super-combinacoes:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao simular combinação personalizada' },
      { status: 500 }
    );
  }
}
