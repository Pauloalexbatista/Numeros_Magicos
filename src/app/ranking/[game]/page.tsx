import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { notFound } from 'next/navigation';

import { getTopSystemsYearlyAnalysis, getJackpotLeaders, getRankingMetrics } from '../actions';
import { TopSystemsAnalysis } from '@/components/TopSystemsAnalysis';
import { GameType } from '@/types/game';

export const dynamic = 'force-dynamic';

type TimeFrame = 'historical' | 'last100' | 'last20';

// Map URL param to GameType
const GAME_MAP: Record<string, GameType> = {
    'euromillions': GameType.EUROMILLIONS,
    'totoloto': GameType.TOTOLOTO,
    'eurodreams': GameType.EURODREAMS
};

const GAME_NAMES: Record<GameType, string> = {
    [GameType.EUROMILLIONS]: 'EuromilhÃµes',
    [GameType.TOTOLOTO]: 'Totoloto',
    [GameType.EURODREAMS]: 'EuroDreams'
};

const gameThemeMap = {
    [GameType.EUROMILLIONS]: {
        bg: "bg-gradient-to-br from-blue-50/30 via-slate-50 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-euro-950/10",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "bg-card/50 backdrop-blur-sm border border-border backdrop-blur-md shadow-sm",
        themeColor: "euro",
        btnActive: "bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50",
        btnInactive: "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
        rank1: "bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50",
        jackpotText: "text-euro-600 dark:text-euro-400",
        textGrad: "from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-400"
    },
    [GameType.TOTOLOTO]: {
        bg: "bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-toto-950/10",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "bg-card/50 backdrop-blur-sm border border-border backdrop-blur-md shadow-sm",
        themeColor: "toto",
        btnActive: "bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50",
        btnInactive: "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
        rank1: "bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50",
        jackpotText: "text-toto-600 dark:text-toto-400",
        textGrad: "from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400"
    },
    [GameType.EURODREAMS]: {
        bg: "bg-gradient-to-br from-purple-50/30 via-slate-50 to-pink-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-dream-950/10",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "bg-card/50 backdrop-blur-sm border border-border backdrop-blur-md shadow-sm",
        themeColor: "dream",
        btnActive: "bg-dream-100 dark:bg-dream-950/40 text-dream-700 dark:text-dream-400 border border-dream-200/50",
        btnInactive: "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
        rank1: "bg-dream-100 dark:bg-dream-950/40 text-dream-700 dark:text-dream-400 border border-dream-200/50",
        jackpotText: "text-dream-600 dark:text-dream-400",
        textGrad: "from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400"
    }
};

interface PageProps {
    params: Promise<{
        game: string;
    }>;
    searchParams: Promise<{ view?: string }>;
}

export default async function RankingPage({ params, searchParams }: PageProps) {
    const { game } = await params;
    const gameKey = game.toLowerCase();
    const gameType = GAME_MAP[gameKey];

    if (!gameType) {
        notFound();
    }

    const sp = await searchParams;
    const timeframe = (sp.view || 'historical') as TimeFrame;

    // Obter o tema correto estÃ¡tico
    const currentTheme = gameThemeMap[gameType] || gameThemeMap[GameType.EUROMILLIONS];

    // Always get historical data for yearly analysis and jackpot leaders
    const yearlyAnalysis = await getTopSystemsYearlyAnalysis(gameType);
    const jackpotLeaders = await getJackpotLeaders(gameType);

    // Get ranking metrics based on timeframe
    const rankings = await getRankingMetrics(gameType, timeframe);

    // Determine subtitle based on timeframe
    const getSubtitle = () => {
        switch (timeframe) {
            case 'last20':
                return 'Ãšltimos 20 Sorteios';
            case 'last100':
                return 'Ãšltimos 100 Sorteios';
            default:
                return 'AnÃ¡lise HistÃ³rica Completa (Desde 2004)';
        }
    };

    return (
        <div className={`min-h-screen ${currentTheme.bg} p-4 sm:p-6 pb-24 font-sans transition-all duration-500`}>
            <div className="container mx-auto space-y-6 max-w-5xl">
                {/* Header - Title + Back Button on same line */}
                <div className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm backdrop-blur-md rounded-2xl border border-border">
                    <h1 className={`text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.textGrad} tracking-tight`}>
                        Ranking de Sistemas - {GAME_NAMES[gameType]}
                    </h1>
                    <BackButton />
                </div>

                {/* 1. LIGA DOS CAMPEÃ•ES - Always Historical */}
                {timeframe === 'historical' && (
                    <TopSystemsAnalysis data={yearlyAnalysis} game={gameType} />
                )}

                {/* 2. REIS DO JACKPOT - Always Historical */}
                <div className="space-y-2">
                    <Card className={`p-6 ${currentTheme.card}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">ðŸ†</span>
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Reis do Jackpot (HistÃ³rico)</h2>
                                    <p className="text-sm text-muted-foreground">Sistemas com mais prÃ©mios mÃ¡ximos desde sempre.</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {jackpotLeaders.map((leader, index) => (
                                <div key={leader.systemName} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                                            ${index === 0 ? `${currentTheme.rank1}` : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-slate-700 dark:text-zinc-300">{leader.systemName}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xl font-extrabold ${currentTheme.jackpotText}`}>{leader.jackpots}</span>
                                        <span className="text-[10px] block text-slate-400 dark:text-zinc-500 uppercase font-semibold">Jackpots</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* 3. FILTER BUTTONS */}
                <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 w-fit shadow-sm backdrop-blur-md">
                    <Link
                        href={`/ranking/${game}?view=historical`}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === 'historical'
                            ? currentTheme.btnActive
                            : `text-muted-foreground hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/50`
                            }`}
                    >
                        ðŸ“Š HistÃ³rico Completo
                    </Link>
                    <Link
                        href={`/ranking/${game}?view=last100`}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === 'last100'
                            ? currentTheme.btnActive
                            : `text-muted-foreground hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/50`
                            }`}
                    >
                        ðŸ”¥ Ãšltimos 100
                    </Link>
                    <Link
                        href={`/ranking/${game}?view=last20`}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === 'last20'
                            ? currentTheme.btnActive
                            : `text-muted-foreground hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/50`
                            }`}
                    >
                        âš¡ Ãšltimos 20
                    </Link>
                </div>


                {/* List Ranking Systems */}
                <div className="space-y-4">
                    {rankings.map((sys, idx) => (
                        <Link key={sys.systemName} href={`/dashboard/${game}/${encodeURIComponent(sys.systemName)}`} className="block">
                            <Card className={`p-6 bg-card/50 backdrop-blur-sm border border-border hover:shadow-md hover:border-zinc-350 dark:hover:border-zinc-700 transition-all duration-300 group`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div className={`
                                            w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl shadow-sm
                                            ${idx === 0 ? currentTheme.btnActive :
                                                idx === 1 ? 'bg-slate-100 dark:bg-zinc-800 text-slate-650 dark:text-zinc-300' :
                                                    idx === 2 ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400' :
                                                        'bg-slate-50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-500 border border-slate-100 dark:border-zinc-800'}
                                        `}>
                                            #{idx + 1}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className={`text-lg font-bold text-slate-800 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors`}>
                                                    {sys.systemName}
                                                </h3>
                                                {sys.systemName.includes('Platina') && (
                                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-xs font-bold border border-purple-200 dark:border-purple-900/50">IA</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                                                {(sys as any).description || 'Sistema de previsÃ£o estatÃ­stica.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 text-right">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 block mb-1 font-semibold">Win Rate</span>
                                            <span className={`text-xl font-bold ${sys.winRate > 50 ? 'text-emerald-600' : 'text-slate-655 dark:text-zinc-300'}`}>
                                                {sys.winRate.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 block mb-1 font-semibold">Score</span>
                                            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                                                {sys.qualityScore.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-2xl text-slate-300 dark:text-zinc-700 group-hover:translate-x-1 transition-transform">
                                            â†’
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-zinc-800 opacity-70">
                    <ResponsibleGamingFooter />
                </div>
            </div>
        </div>
    );
}


