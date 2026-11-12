import type { Metadata } from 'next';
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
    'eurodreams': GameType.EURODREAMS,
    'lotofacil': GameType.LOTOFACIL
};

const GAME_NAMES: Record<GameType, string> = {
    [GameType.EUROMILLIONS]: 'Euromilhões',
    [GameType.TOTOLOTO]: 'Totoloto',
    [GameType.EURODREAMS]: 'EuroDreams',
    [GameType.MEGASENA]: 'Mega-Sena',
    [GameType.LOTOFACIL]: 'Lotofácil'
};

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }): Promise<Metadata> {
    const { game } = await params;
    const gameKey = game.toLowerCase();
    const gameType = GAME_MAP[gameKey];
    if (!gameType) return {};
    const name = GAME_NAMES[gameType];

    return {
        title: `Ranking dos Melhores Sistemas Matemáticos — ${name}`,
        description: `Classificação auditada dos 20 sistemas preditivos para ${name}. Compara a precisão real, prémios máximos e vantagem face ao acaso.`,
        alternates: {
            canonical: `https://numerosmagicos.com/ranking/${gameKey}`,
        },
    };
}

const gameThemeMap = {
    [GameType.MEGASENA]: {
        textGrad: 'from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300',
        btnActive: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50',
        rank1: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50',
        jackpotText: 'text-amber-600 dark:text-amber-400',
        positiveText: 'text-amber-600 dark:text-amber-400',
        positiveBadge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40',
    },
    [GameType.EUROMILLIONS]: {
        textGrad: 'from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-400',
        btnActive: 'bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50',
        rank1: 'bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50',
        jackpotText: 'text-euro-600 dark:text-euro-400',
        positiveText: 'text-euro-600 dark:text-euro-400',
        positiveBadge: 'bg-euro-100 dark:bg-euro-950/60 text-euro-700 dark:text-euro-300 border border-euro-200/60 dark:border-euro-800/40',
    },
    [GameType.TOTOLOTO]: {
        textGrad: 'from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400',
        btnActive: 'bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50',
        rank1: 'bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50',
        jackpotText: 'text-toto-600 dark:text-toto-400',
        positiveText: 'text-toto-600 dark:text-toto-400',
        positiveBadge: 'bg-toto-100 dark:bg-toto-950/60 text-toto-700 dark:text-toto-300 border border-toto-200/60 dark:border-toto-800/40',
    },
    [GameType.EURODREAMS]: {
        textGrad: 'from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400',
        btnActive: 'bg-dream-100 dark:bg-dream-950/40 text-dream-700 dark:text-dream-400 border border-dream-200/50',
        rank1: 'bg-dream-100 dark:bg-dream-950/40 text-dream-700 dark:text-dream-400 border border-dream-200/50',
        jackpotText: 'text-dream-600 dark:text-dream-400',
        positiveText: 'text-dream-600 dark:text-dream-400',
        positiveBadge: 'bg-dream-100 dark:bg-dream-950/60 text-dream-700 dark:text-dream-300 border border-dream-200/60 dark:border-dream-800/40',
    },
    [GameType.LOTOFACIL]: {
        textGrad: 'from-pink-600 via-rose-500 to-fuchsia-600 dark:from-pink-400 dark:via-rose-400 dark:to-fuchsia-400',
        btnActive: 'bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border border-pink-200/50',
        rank1: 'bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border border-pink-200/50',
        jackpotText: 'text-pink-600 dark:text-pink-400',
        positiveText: 'text-pink-600 dark:text-pink-400',
        positiveBadge: 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/40',
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
    const rankings = await getRankingMetrics(gameType, timeframe);
    const jackpotLeaders = await getJackpotLeaders(gameType, timeframe);

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
            backgroundColor: "var(--" + (gameConfig?.slug === 'euromillions' ? 'euro' : gameConfig?.slug === 'totoloto' ? 'toto' : gameConfig?.slug === 'eurodreams' ? 'dream' : gameConfig?.slug === 'lotofacil' ? 'loto' : 'mega') + "-bg)",
} as React.CSSProperties}>
<div className="game-glow-bg" />
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between glass-card p-4 relative">
                    <h1 className={`text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.textGrad} tracking-tight`}>
                        {t('title')} - {GAME_NAMES[gameType]}
                    </h1>
                    <BackButton href={`/dashboard/${gameKey}`} style={{ boxShadow: `0 0 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)`, border: `1px solid color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }} />
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
                                    <h2 className="text-xl font-bold text-foreground">
                                        {timeframe === 'last20' 
                                            ? 'Reis do Jackpot (Últimos 20)' 
                                            : timeframe === 'last100' 
                                                ? 'Reis do Jackpot (Últimos 100)' 
                                                : t("kings_title")}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {timeframe === 'last20' 
                                            ? 'Sistemas com mais prémios máximos nos últimos 20 sorteios.' 
                                            : timeframe === 'last100' 
                                                ? 'Sistemas com mais prémios máximos nos últimos 100 sorteios.' 
                                                : 'Sistemas com mais prémios máximos desde sempre.'}
                                    </p>
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

                {/* Linha de Base da Auditoria Estatística (Modelo Hipergeométrico) */}
                <div className="glass-card p-4 rounded-xl border border-border/80 bg-surface-1/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">📐</span>
                        <div>
                            <div className="font-bold text-foreground flex items-center gap-2">
                                <span>Linha de Água do Acaso (Diluição Sorteio a Sorteio)</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                    Modelo Hipergeométrico Exato
                                </span>
                            </div>
                            <p className="text-muted-foreground mt-0.5">
                                Probabilidade matemática pura sem viés de seleção:
                                <strong className="text-foreground ml-1">
                                    {gameType === GameType.LOTOFACIL ? '0.47% (Jackpot 15/15 — 1 a cada 211 sort.) / 7.60% (14+15)' :
                                     gameType === GameType.TOTOLOTO ? '2.79% (Jackpot 5/5 — 1 a cada 35.9 sort.) / 18.69% (4+5)' :
                                     gameType === GameType.EUROMILLIONS ? '2.51% (Jackpot 5/5 — 1 a cada 39.9 sort.) / 17.44% (4+5)' :
                                     gameType === GameType.EURODREAMS ? '1.01% (Jackpot 6/6 — 1 a cada 99.0 sort.) / 9.09% (5+6)' :
                                     '1.19% (Jackpot 6/6 — 1 a cada 84.3 sort.) / 9.73% (5+6)'}
                                </strong>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto text-[11px] text-muted-foreground bg-card/60 px-3 py-1.5 rounded-lg border border-border">
                        <span>Significância Jackpots:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Z ≥ +1.96σ (p &lt; 0.05)</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {rankings.map((sys, idx) => {
                        const jackWins = (sys as any).jackpotWins ?? (sys as any).hits5 ?? 0;
                        const secWins = (sys as any).secondPrizeWins ?? (sys as any).hits4 ?? 0;
                        const highWins = (sys as any).highPrecisionWins ?? (jackWins + secWins);
                        const cadence = (sys as any).jackpotCadence;
                        const rec100Rate = (sys as any).recent100JackpotRate ?? 0;
                        const rec100Jacks = (sys as any).recent100Jackpots ?? 0;
                        const velDelta = (sys as any).velocityDelta ?? 0;
                        const expJackRate = (sys as any).expectedJackpotRate ?? 2.51;

                        return (
                        <Link key={sys.systemName} href={`/ranking/${game}/${encodeURIComponent(sys.systemName)}`} className="block" prefetch={false}>
                            <Card className="glass-card p-4 sm:p-6 transition-all duration-300 hover:shadow-md hover:border-[var(--accent-border)] hover:bg-[var(--accent-muted)]">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                                        <div className={`
                                            flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl text-base sm:text-lg font-black shadow-sm
                                            ${idx === 0 ? currentTheme.btnActive
                                                : idx === 1 ? 'bg-surface-3 text-foreground'
                                                : 'bg-surface-2/80 text-muted-foreground border border-border'}
                                        `}>
                                            #{idx + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-base sm:text-lg font-bold text-foreground">{sys.systemName}</h3>
                                                {sys.systemName.includes('Platina') && (
                                                    <span className="rounded-full bg-purple-100 dark:bg-purple-950/40 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50">IA</span>
                                                )}
                                            </div>
                                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                                                {(sys as any).description || t('default_desc')}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-medium">
                                                <span>🎯 <strong>{jackWins}</strong> Jackpots ({secWins} de 2.º prémio) em {sys.totalPredictions} sorteios</span>
                                                {cadence && (
                                                    <span>• ⏱️ 1 a cada <strong>{cadence}</strong> sort.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 text-right pt-2 sm:pt-0 border-t border-border/40 sm:border-0">
                                        {/* Coluna 1: Alta Precisão (4+5 no 5/50, 5+6 no 6/40, 14+15 na Lotofácil) */}
                                        <div className="hidden sm:block">
                                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">
                                                {gameType === GameType.LOTOFACIL ? 'Alta Precisão (14+15)' : (gameType === GameType.EURODREAMS || gameType === GameType.MEGASENA ? 'Alta Precisão (5+6)' : 'Alta Precisão (4+5)')}
                                            </span>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span className={`text-lg sm:text-xl font-black tabular-nums ${((sys as any).prizeAdvantage ?? 0) > 0 ? (currentTheme as any).positiveText : 'text-zinc-600 dark:text-zinc-300'}`}>
                                                    {((sys as any).prizeRate ?? 0).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end gap-0.5 mt-0.5">
                                                {(sys as any).prizeAdvantage != null && (
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight ${
                                                        ((sys as any).prizeAdvantage ?? 0) > 0
                                                            ? (currentTheme as any).positiveBadge
                                                            : 'bg-white dark:bg-white/10 text-zinc-600 dark:text-zinc-200 border border-zinc-200 dark:border-white/15 shadow-sm'
                                                    }`}>
                                                        {((sys as any).prizeAdvantage ?? 0) > 0 ? '+' : ''}{(sys as any).prizeAdvantage}% vs acaso
                                                    </span>
                                                )}
                                                <span className="text-[9px] text-muted-foreground font-semibold">
                                                    {highWins}x ({secWins} de 4 + {jackWins} de 5)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Coluna 2 (Principal): Taxa Viva de Jackpots (5/5) */}
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">
                                                {gameType === GameType.LOTOFACIL ? '% de Quinas (15/15)' : (gameType === GameType.EURODREAMS || gameType === GameType.MEGASENA ? '% de Senas (6/6)' : '% de Cincos (5/5)')}
                                            </span>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span className={`text-lg sm:text-xl font-black tabular-nums ${((sys as any).topAdvantage ?? 0) > 0 ? (currentTheme as any).positiveText : 'text-zinc-600 dark:text-zinc-300'}`}>
                                                    {sys.winRate.toFixed(2)}%
                                                </span>
                                            </div>
                                            {(sys as any).topAdvantage != null && (
                                                <div className="flex flex-col items-end gap-1 mt-1">
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight ${
                                                        ((sys as any).topAdvantage ?? 0) > 0
                                                            ? (currentTheme as any).positiveBadge
                                                            : 'bg-white dark:bg-white/10 text-zinc-600 dark:text-zinc-200 border border-zinc-200 dark:border-white/15 shadow-sm'
                                                    }`}>
                                                        {((sys as any).topAdvantage ?? 0) > 0 ? '+' : ''}{(sys as any).topAdvantage}% vs acaso
                                                    </span>
                                                    {(sys as any).zScore != null && (
                                                        <span
                                                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight ${
                                                                (sys as any).zScore >= 1.96
                                                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                                                    : (sys as any).zScore > 0
                                                                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                                                            }`}
                                                            title={`Z-Score de Jackpots (5/5) face ao acaso puro: ${(sys as any).zScore > 0 ? '+' : ''}${(sys as any).zScore}σ`}
                                                        >
                                                            Z: {(sys as any).zScore > 0 ? '+' : ''}{(sys as any).zScore}σ
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Coluna 3: Velocidade Recente (no Histórico) ou Contagem Direta (nos Últ. 100/20) */}
                                        <div>
                                            {timeframe === 'historical' ? (
                                                <>
                                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">
                                                        Velocidade (Últ. 100)
                                                    </span>
                                                    <span className="text-lg sm:text-xl font-black text-foreground tabular-nums block">
                                                        {rec100Rate.toFixed(1)}%
                                                    </span>
                                                    <div className="flex flex-col items-end gap-0.5 mt-1">
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight ${
                                                            velDelta >= 0.2
                                                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                                                : rec100Rate >= expJackRate
                                                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                                        }`}>
                                                            {velDelta >= 0.2 ? `🔥 Acelerou (${rec100Jacks}J)` : rec100Rate >= expJackRate ? `✅ Manteve (${rec100Jacks}J)` : `❄️ Arrefeceu (${rec100Jacks}J)`}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 font-semibold">
                                                        Jackpots ({timeframe === 'last20' ? 'Últ. 20' : 'Últ. 100'})
                                                    </span>
                                                    <span className="text-lg sm:text-xl font-black text-foreground tabular-nums block">
                                                        {jackWins} <span className="text-xs font-semibold text-muted-foreground">/ {secWins} (4)</span>
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="text-2xl text-muted-foreground transition-transform group-hover:translate-x-1">
                                            →
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                    })}
                </div>

                <div className="mt-8 border-t border-border pt-8 opacity-70">
                    <ResponsibleGamingFooter />
                </div>
            </div>
        </div>
    );
}
