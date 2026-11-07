import { NextResponse } from 'next/server';
import { SYSTEM_CATALOG, getSystemPredictionForGame } from '@/services/systems-catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const games = ['euromillions', 'totoloto', 'eurodreams', 'megasena', 'lotofacil'];

        const cards = SYSTEM_CATALOG.map(sys => {
            const predictionsByGame: Record<string, number[]> = {};
            for (const g of games) {
                predictionsByGame[g] = getSystemPredictionForGame(sys.slug, g);
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
                predictions: predictionsByGame
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
