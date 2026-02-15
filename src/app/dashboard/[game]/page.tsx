
import { getHistory } from '@/app/actions';
import { getJackpotLeaders, getRankingMetrics } from '@/app/ranking/actions';
import { getStarJackpotLeaders } from '@/app/analysis/stars/actions';
import LatestDrawWidget from '@/components/dashboard/LatestDrawWidget';
import TopNumberSystemsWidget from '@/components/dashboard/TopNumberSystemsWidget';
import TopStarSystemsWidget from '@/components/dashboard/TopStarSystemsWidget';
import HistoricalBestWidget from '@/components/dashboard/HistoricalBestWidget';
import StarJackpotLeaders from '@/components/dashboard/StarJackpotLeaders';
import LastDrawNumberSystems from '@/components/dashboard/LastDrawNumberSystems';
import LastDrawStarSystems from '@/components/dashboard/LastDrawStarSystems';
import { GameType } from '@/types/game';
import { notFound } from 'next/navigation';

// Map URL param to GameType
const GAME_MAP: Record<string, GameType> = {
    'euromillions': GameType.EUROMILLIONS,
    'totoloto': GameType.TOTOLOTO,
    'eurodreams': GameType.EURODREAMS
};

// Map GameType to Display Name
const GAME_NAMES: Record<GameType, string> = {
    [GameType.EUROMILLIONS]: 'Euromilhões',
    [GameType.TOTOLOTO]: 'Totoloto',
    [GameType.EURODREAMS]: 'EuroDreams'
};

const GAME_FLAGS: Record<GameType, string> = {
    [GameType.EUROMILLIONS]: '🇪🇺',
    [GameType.TOTOLOTO]: '🇵🇹',
    [GameType.EURODREAMS]: '🌙'
};

interface PageProps {
    params: Promise<{
        game: string;
    }>;
}

export default async function GameDashboardPage({ params }: PageProps) {
    const { game } = await params;
    const gameKey = game.toLowerCase();
    console.log('Dashboard Debug:', { game, gameKey });
    const gameType = GAME_MAP[gameKey];

    if (!gameType) {
        notFound();
    }

    const fullHistory = await getHistory();
    const draws = fullHistory.filter(d => d.game === gameType);

    if (draws.length === 0) {
        // Handle case with no data yet
        return <div className="p-8 text-center text-zinc-500">A carregar dados para {GAME_NAMES[gameType]}...</div>;
    }

    const latestDraw = draws[0];

    // Fetch metrics specifically for this game
    const rankings = await getRankingMetrics(gameType);

    const topNumberSystems = rankings
        .filter(r => !['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina'].includes(r.systemName))
        .sort((a, b) => b.qualityScore - a.qualityScore) // Ensure sorted by Quality Score
        .slice(0, 3);

    const jackpotLeaders = await getJackpotLeaders(gameType);
    const starJackpotLeaders = await getStarJackpotLeaders(gameType);

    return (
        <div className="w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{GAME_FLAGS[gameType]}</div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            {GAME_NAMES[gameType]}
                        </h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Análises e previsões para {GAME_NAMES[gameType]}
                        </p>
                    </div>
                </div>

                {/* Latest Draw Widget - Full Width */}
                <LatestDrawWidget latestDraw={latestDraw} game={gameType} />

                {/* Two Column Layout: Numbers (Left) | Stars (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                    {/* LEFT COLUMN: NUMBERS */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                            🔢 Melhores Sistemas de Números
                        </h2>

                        {/* Best System (Last Draw) - Numbers */}
                        <LastDrawNumberSystems game={gameType} />

                        {/* Top Systems (General) - Numbers */}
                        <TopNumberSystemsWidget systems={topNumberSystems} game={gameType} />

                        {/* Historical Best - Numbers */}
                        <HistoricalBestWidget leaders={jackpotLeaders} game={gameType} />
                    </div>

                    {/* RIGHT COLUMN: STARS */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                            ⭐ Melhores Sistemas de Estrelas
                        </h2>

                        {/* Best System (Last Draw) - Stars */}
                        <LastDrawStarSystems game={gameType} />

                        {/* Top Star Systems */}
                        <TopStarSystemsWidget game={gameType} />

                        {/* Historical Best - Stars */}
                        <StarJackpotLeaders leaders={starJackpotLeaders} game={gameType} />
                    </div>
                </div>

            </div>
        </div>
    );
}
