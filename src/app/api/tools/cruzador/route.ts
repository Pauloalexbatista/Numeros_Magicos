import { NextRequest, NextResponse } from 'next/server';
import { 
    calculateSystemPolarity, 
    getPolarityRanking, 
    SYSTEMS_META 
} from '@/services/polarity-compass';
import { calculateMatrizCorte } from '@/services/matriz-corte-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const gameParam = (searchParams.get('game') || 'EUROMILLIONS').toUpperCase();
        const systemParam = searchParams.get('system') || 'mais_quentes';
        const modeParam = searchParams.get('mode') as 'DIRECT' | 'MIRROR' | null;
        const thresholdParam = searchParams.get('threshold');

        const game = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA'].includes(gameParam) ? gameParam : 'EUROMILLIONS';
        const systemSlug = SYSTEMS_META[systemParam] ? systemParam : 'mais_quentes';

        // 1. Calcular a Bússola de Polaridade para o sistema selecionado
        const polarity = await calculateSystemPolarity(game, systemSlug);

        // 2. Obter ranking de polaridade de todos os sistemas para o Seletor
        const systemsRanking = await getPolarityRanking(game);

        // 3. Obter a Matriz de Corte V2 para o jogo
        const matrizCorte = await calculateMatrizCorte(game);

        // Determinar o modo ativo (se não especificado, segue a recomendação da bússola)
        const activeMode = modeParam || (polarity.recommendation === 'MIRROR' ? 'MIRROR' : 'DIRECT');
        const activePool = activeMode === 'MIRROR' ? polarity.mirrorNumbers : polarity.directNumbers;

        // Determinar fasquia do slider
        const threshold = thresholdParam !== null && !isNaN(parseFloat(thresholdParam))
            ? parseFloat(thresholdParam)
            : matrizCorte.exact25CutoffPct;

        // Filtrar as bolas ativas contra a Matriz de Corte V2
        const cutBallNumbers = new Set(
            matrizCorte.balls
                .filter(b => b.maxProximityPct >= threshold)
                .map(b => b.ball)
        );

        const survivingNumbers = activePool.filter(num => !cutBallNumbers.has(num));
        const eliminatedNumbers = activePool.filter(num => cutBallNumbers.has(num));

        return NextResponse.json({
            success: true,
            data: {
                game,
                systemSlug,
                polarity,
                systemsRanking,
                activeMode,
                threshold,
                activePool,
                survivingNumbers,
                eliminatedNumbers,
                matrizCorte: {
                    totalBalls: matrizCorte.totalBalls,
                    pickSize: matrizCorte.pickSize,
                    exact25CutoffPct: matrizCorte.exact25CutoffPct,
                    euroDreamsPresets: matrizCorte.euroDreamsPresets,
                    balls: matrizCorte.balls
                }
            }
        });
    } catch (error: any) {
        console.error('Erro na API Cruzador:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Erro interno no Cruzador Inteligente' },
            { status: 500 }
        );
    }
}
