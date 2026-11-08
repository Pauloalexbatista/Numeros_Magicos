import { NextResponse } from 'next/server';
import { 
    SYSTEM_CATALOG, 
    getSystemPredictionForGame, 
    getSystemStatsForGame, 
    getSystemJackCyclesForGame,
    SystemJackCycles 
} from '@/services/systems-catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const games = ['euromillions', 'totoloto', 'eurodreams', 'megasena', 'lotofacil'];

        const cards = SYSTEM_CATALOG.map(sys => {
            const predictionsByGame: Record<string, number[]> = {};
            const statsByGame: Record<string, { avgAccuracy: number; totalDraws: number; highHits: number }> = {};
            const jackCyclesByGame: Record<string, SystemJackCycles | null> = {};

            for (const g of games) {
                predictionsByGame[g] = getSystemPredictionForGame(sys.slug, g);
                statsByGame[g] = getSystemStatsForGame(sys.slug, g);
                jackCyclesByGame[g] = getSystemJackCyclesForGame(sys.slug, g);
            }

            return {
                slug: sys.slug,
                name: sys.name,
                dbName: sys.dbName,
                family: sys.family,
                familyName: sys.familyName,
                familyIcon: sys.familyIcon,
                description: sys.description,
                howItCalculates: sys.howItCalculates,
                advice: sys.advice,
                predictions: predictionsByGame,
                stats: statsByGame,
                jackCycles: jackCyclesByGame
            };
        });

        return NextResponse.json({
            success: true,
            systems: cards
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Erro ao carregar catálogo' },
            { status: 500 }
        );
    }
}
