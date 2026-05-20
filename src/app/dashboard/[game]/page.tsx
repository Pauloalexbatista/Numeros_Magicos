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

    // Estilos de fundo dinâmicos e ultra-premium por jogo
    const bgStyles = {
        [GameType.EUROMILLIONS]: "bg-gradient-to-br from-blue-50/30 via-slate-50 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-euro-950/10",
        [GameType.TOTOLOTO]: "bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-toto-950/10",
        [GameType.EURODREAMS]: "bg-gradient-to-br from-purple-50/30 via-slate-50 to-pink-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-dream-950/10"
    };
    const textGradStyles = {
        [GameType.EUROMILLIONS]: "from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-400",
        [GameType.TOTOLOTO]: "from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400",
        [GameType.EURODREAMS]: "from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400"
    };
    const currentBg = bgStyles[gameType] || "bg-zinc-50 dark:bg-black";
    const currentTextGrad = textGradStyles[gameType] || "from-blue-400 to-indigo-400";

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
        <div className={`w-full min-h-screen ${currentBg} text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 font-sans transition-all duration-500`}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Modernizado */}
                <div className="flex items-center gap-4 mb-2 p-4 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-zinc-800/30">
                    <div className="text-4xl filter drop-shadow-sm">{GAME_FLAGS[gameType]}</div>
                    <div>
                        <h1 className={`text-3xl font-extrabold bg-gradient-to-r ${currentTextGrad} bg-clip-text text-transparent tracking-tight`}>
                            {GAME_NAMES[gameType]}
                        </h1>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                            Painel de Análise Estatística Avançada
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
