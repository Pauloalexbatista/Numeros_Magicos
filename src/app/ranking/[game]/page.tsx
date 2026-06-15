import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getTopSystemsYearlyAnalysis, getJackpotLeaders, getRankingMetrics } from '../actions';
import { TopSystemsAnalysis } from '@/components/TopSystemsAnalysis';
import { GameType, GAMES } from '@/types/game';

export const dynamic = 'force-dynamic';

type TimeFrame = 'historical' | 'last100' | 'last20';

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
        textGrad: 'from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300',
        btnActive: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50',
        rank1: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50',
        jackpotText: 'text-amber-600 dark:text-amber-400',
    },
    [GameType.EUROMILLIONS]: {
        textGrad: 'from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-400',
        btnActive: 'bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50',
        rank1: 'bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50',
        jackpotText: 'text-euro-600 dark:text-euro-400',
    },
    [GameType.TOTOLOTO]: {
        textGrad: 'from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400',
        btnActive: 'bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50',
        rank1: 'bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50',
        jackpotText: 'text-toto-600 dark:text-toto-400',
    },
    [GameType.EURODREAMS]: {
        textGrad: 'from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400',
        btnActive: 'bg-dream-100 dark:bg-dream-950/40 text-dream-700 dark:text-dream-400 border border-dream-200/50',
        rank1: 'bg-dream-100 dark:bg-dream-950/40 text-dream-700 dark:text-dream-400 border border-dream-200/50',
        jackpotText: 'text-dream-600 dark:text-dream-400',
    }
};

interface PageProps {
    params: Promise<{ game: string }>;
    searchParams: Promise<{ view?: string }>;
}

export default async function RankingPage({ params, searchParams }: PageProps) {
    const t = await getTranslations('ranking');
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

    const yearlyAnalysis = await getTopSystemsYearlyAnalysis(gameType);
    const jackpotLeaders = await getJackpotLeaders(gameType);
    const rankings = await getRankingMetrics(gameType, timeframe);

    const getSubtitle = () => {
        switch (timeframe) {
            case 'last20':
                return '{t("last_20")} Sorteios';
            case 'last100':
                return '{t("last_100")} Sorteios';
            default:
                return 'Análise Histórica Completa (Desde 2004)';
        }
    };

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
                <div className="flex items-center justify-between glass-card p-4 relative">
                    <h1 className={`text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.textGrad} tracking-tight`}>
                        {t('title')} - {GAME_NAMES[gameType]}
                    </h1>
                    <BackButton />
                </div>

                {timeframe === 'historical' && (
                    <TopSystemsAnalysis data={yearlyAnalysis} game={gameType} />
                )}

                <div className="space-y-2">
                    <Card className="space-y-4 glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🏆</span>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">{t("kings_title")}</h2>
                                    <p className="text-sm text-muted-foreground">Sistemas com mais prémios máximos desde sempre.</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                        <span className="block text-[10px] uppercase font-semibold text-muted-foreground">{t("jackpots")}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="flex w-fit items-center gap-2 glass-card p-1.5">
                    <Link
                        href={`/ranking/${game}?view=historical`}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === 'historical'
                            ? currentTheme.btnActive
                            : 'text-muted-foreground hover:bg-surface-2/80'
                            }`}
                    >
                        📊 {t("full_history")}
                    </Link>
                    <Link
                        href={`/ranking/${game}?view=last100`}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === 'last100'
                            ? currentTheme.btnActive
                            : 'text-muted-foreground hover:bg-surface-2/80'
                            }`}
                    >
                        🔥 {t("last_100")}
                    </Link>
                    <Link
                        href={`/ranking/${game}?view=last20`}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === 'last20'
                            ? currentTheme.btnActive
                            : 'text-muted-foreground hover:bg-surface-2/80'
                            }`}
                    >
                        ⚡ {t("last_20")}
                    </Link>
                </div>

                <div className="space-y-4">
                    {rankings.map((sys, idx) => (
                        <Link key={sys.systemName} href={`/ranking/${game}/${encodeURIComponent(sys.systemName)}`} className="block">
                            <Card className="glass-card p-6 transition-all duration-300 hover:shadow-md hover:border-[var(--accent-border)] hover:bg-[var(--accent-muted)]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black shadow-sm
                                            ${idx === 0 ? currentTheme.btnActive
                                                : idx === 1 ? 'bg-surface-3 text-foreground'
                                                : 'bg-surface-2/80 text-muted-foreground border border-border'}
                                        `}>
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-foreground">{sys.systemName}</h3>
                                                {sys.systemName.includes('Platina') && (
                                                    <span className="rounded-full bg-purple-100 dark:bg-purple-950/40 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50">IA</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {(sys as any).description || t('default_desc')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-right">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">{t("win_rate")}</span>
                                            <span className={`text-xl font-bold ${sys.winRate > 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                                                {sys.winRate.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">{t("score")}</span>
                                            <span className="text-xl font-bold text-foreground tabular-nums">
                                                {sys.qualityScore.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-2xl text-muted-foreground transition-transform group-hover:translate-x-1">
                                            →
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
