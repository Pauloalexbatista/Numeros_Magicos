import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { notFound } from 'next/navigation';

import { getStarYearlyHistory, getStarJackpotLeaders, getStarRankingMetrics } from '../../actions';
import { TopStarSystemsAnalysis } from '@/components/TopStarSystemsAnalysis';
import { GameType, GAMES } from '@/types/game';

export const dynamic = 'force-dynamic';

type TimeFrame = 'historical' | 'last100' | 'last20';

// Map URL param to GameType
const GAME_MAP: Record<string, GameType> = {
    'euromillions': GameType.EUROMILLIONS,
    'megasena': GameType.MEGASENA,
    'totoloto': GameType.TOTOLOTO,
    'eurodreams': GameType.EURODREAMS
};

const GAME_NAMES: Record<GameType, string> = {
    [GameType.EUROMILLIONS]: 'Euromilhões',
    [GameType.TOTOLOTO]: 'Totoloto',
    [GameType.EURODREAMS]: 'EuroDreams',
    [GameType.MEGASENA]: 'Mega-Sena'
};

const gameThemeMap = {
    [GameType.MEGASENA]: {
        textGrad: "from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300",
        btnActive: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50",
        rank1: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50",
        jackpotText: "text-amber-600 dark:text-amber-400"
    },
    [GameType.EUROMILLIONS]: {
        btnActive: "bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50",
        rank1: "bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50",
        jackpotText: "text-euro-600 dark:text-euro-400",
        textGrad: "from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-400"
    },
    [GameType.TOTOLOTO]: {
        btnActive: "bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50",
        rank1: "bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50",
        jackpotText: "text-toto-600 dark:text-toto-400",
        textGrad: "from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400"
    },
    [GameType.EURODREAMS]: {
        btnActive: "bg-dream-100 dark:bg-dream-950/40 text-dream-700 dark:text-dream-400 border border-dream-200/50",
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

export default async function StarRankingPage({ params, searchParams }: PageProps) {
    const { game } = await params;
    const gameKey = game.toLowerCase();
    const gameType = GAME_MAP[gameKey];

    if (!gameType) {
        notFound();
    }

    const sp = await searchParams;
    const timeframe = (sp.view || 'historical') as TimeFrame;

    const currentTheme = gameThemeMap[gameType] || gameThemeMap[GameType.EUROMILLIONS];
    const gameConfig = GAMES[gameType];

    const isTotoloto = gameType === GameType.TOTOLOTO;
    const isEuroDreams = gameType === GameType.EURODREAMS;

    const systemTerm = isTotoloto ? 'Número da Sorte' : isEuroDreams ? 'Número de Sonho' : 'Estrelas';

    // Fetch Data
    const yearlyAnalysis = await getStarYearlyHistory(gameType);
    const jackpotLeaders = await getStarJackpotLeaders(gameType);

    let rankings;

    if (timeframe === 'historical') {
        const { getAllTimeStarRankingMetrics } = await import('../../actions');
        rankings = await getAllTimeStarRankingMetrics(gameType);
    } else {
        rankings = await getStarRankingMetrics(gameType, timeframe);
    }

    return (
        <div className={`min-h-screen text-foreground p-4 sm:p-6 pb-24 font-sans transition-all duration-500 relative game-page-${gameConfig?.slug}`} style={{
            "--accent": gameConfig?.ui.accent,
            "--accent-hover": "color-mix(in srgb, " + gameConfig?.ui.accent + " 80%, white)",
            "--accent-muted": "color-mix(in srgb, " + gameConfig?.ui.accent + " 15%, transparent)",
            "--accent-border": "color-mix(in srgb, " + gameConfig?.ui.accent + " 30%, transparent)",
            "--glow": "color-mix(in srgb, " + gameConfig?.ui.accent + " 20%, transparent)",
            backgroundColor: "var(--" + (gameConfig?.slug === 'euromillions' ? 'euro' : gameConfig?.slug === 'totoloto' ? 'toto' : gameConfig?.slug === 'eurodreams' ? 'dream' : 'mega') + "-bg)",
        } as React.CSSProperties}>
            <div className="game-glow-bg" />
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between glass-card p-4 relative">
                    <h1 className={`text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.textGrad} tracking-tight`}>
                        Ranking de {systemTerm} - {GAME_NAMES[gameType]}
                    </h1>
                    <BackButton />
                </div>

                {/* 1. LIGA DOS CAMPEÕES - Historical Only */}
                {timeframe === 'historical' && (
                    <TopStarSystemsAnalysis data={yearlyAnalysis} game={gameType} />
                )}

                {/* 2. REIS DO JACKPOT - Always Historical */}
                <div className="space-y-2">
                    <Card className="space-y-4 glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🏆</span>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Reis do Jackpot (Histórico)</h2>
                                    <p className="text-sm text-muted-foreground">Sistemas com mais acertos máximos.</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {jackpotLeaders.map((leader, index) => (
                                <div key={leader.systemName} className="flex items-center justify-between glass-card p-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
                                            ${index === 0 ? `${currentTheme.rank1}` : 'bg-surface-3 text-muted-foreground'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-foreground">{leader.systemName}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xl font-extrabold ${currentTheme.jackpotText}`}>{leader.jackpots}</span>
                                        <span className="block text-[10px] uppercase font-semibold text-muted-foreground">Jackpots</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* 3. FILTER BUTTONS */}
                <div className="flex w-fit items-center gap-2 glass-card p-1.5">
                    <Link
                        href={`/analysis/stars/ranking/${game}?view=historical`}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === 'historical'
                            ? currentTheme.btnActive
                            : 'text-muted-foreground hover:bg-surface-2/80'
                            }`}
                    >
                        🏆 Histórico Completo
                    </Link>
                    <Link
                        href={`/analysis/stars/ranking/${game}?view=last100`}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === 'last100'
                            ? currentTheme.btnActive
                            : 'text-muted-foreground hover:bg-surface-2/80'
                            }`}
                    >
                        🏆 Últimos 100
                    </Link>
                    <Link
                        href={`/analysis/stars/ranking/${game}?view=last20`}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === 'last20'
                            ? currentTheme.btnActive
                            : 'text-muted-foreground hover:bg-surface-2/80'
                            }`}
                    >
                        ⚡ Últimos 20
                    </Link>
                </div>

                {/* 4. RANKING LIST */}
                <div className="space-y-4">
                    {rankings.map((sys, idx) => (
                        <Link key={sys.systemName} href={`/analysis/stars/ranking/${game}/${encodeURIComponent(sys.systemName)}`} className="block">
                            <Card className="glass-card p-6 transition-all duration-300 hover:shadow-md hover:border-[var(--accent-border)] hover:bg-[var(--accent-muted)]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div className={`
                                            flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black shadow-sm
                                            ${idx === 0 ? currentTheme.btnActive :
                                                idx === 1 ? 'bg-surface-3 text-foreground border border-border' :
                                                    idx === 2 ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20' :
                                                        'bg-surface-2/80 text-muted-foreground border border-border'}
                                        `}>
                                            #{idx + 1}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{sys.systemName}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {sys.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="flex items-center gap-6 text-right">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">Win Rate</span>
                                            <span className={`text-xl font-bold ${sys.winRate > 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                                                {sys.winRate.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">Score</span>
                                            <span className="text-xl font-bold text-foreground tabular-nums">
                                                {sys.qualityScore.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-2xl text-muted-foreground transition-transform group-hover:translate-x-1">
                                             
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 border-t border-border pt-8 opacity-70">
                    <ResponsibleGamingFooter />
                </div>
            </div>
        </div>
    );
}
