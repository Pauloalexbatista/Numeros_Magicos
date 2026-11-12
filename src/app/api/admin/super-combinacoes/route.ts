import { NextRequest, NextResponse } from 'next/server';
import {
  CHAMPION_FORMULAS_BY_GAME,
  GAME_SPECS,
  SYSTEM_LABELS,
  evaluateSuperCombination,
  SupportedGame,
  FusionMethod,
  SystemComponent,
} from '@/services/super-combinacoes';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameParam = (searchParams.get('game') || 'EUROMILLIONS').toUpperCase() as SupportedGame;
    const game = GAME_SPECS[gameParam] ? gameParam : 'EUROMILLIONS';
    const gamePresets = CHAMPION_FORMULAS_BY_GAME[game] || CHAMPION_FORMULAS_BY_GAME.EUROMILLIONS;

    const presetId = searchParams.get('presetId');
    const preset = gamePresets.find((f) => f.id === presetId) || gamePresets[0];

    const evaluation = await evaluateSuperCombination(preset.components, preset.method, game);

    return NextResponse.json({
      success: true,
      game,
      gameSpecs: GAME_SPECS,
      presets: gamePresets,
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
    const gameParam = (body.game || 'EUROMILLIONS').toUpperCase() as SupportedGame;
    const game = GAME_SPECS[gameParam] ? gameParam : 'EUROMILLIONS';

    const components: SystemComponent[] = body.components || [];
    const method: FusionMethod = body.method === 'BORDA' ? 'BORDA' : 'INTERCALADO';

    if (!Array.isArray(components) || components.length === 0 || components.length > 6) {
      return NextResponse.json(
        { success: false, error: 'Selecione entre 1 e 5 sistemas para simular.' },
        { status: 400 }
      );
    }

    const evaluation = await evaluateSuperCombination(components, method, game);

    return NextResponse.json({
      success: true,
      game,
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
