import Link from 'next/link';
import { Star, Hash, Trophy, ChevronRight } from 'lucide-react';
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
import { GameType, GAMES } from '@/types/game';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

interface PageProps {
    params: Promise<{
        game: string;
    }>;
}

export default async function GameDashboardPage({ params }: PageProps) {
    const t = await getTranslations('dashboard');
    const tNav = await getTranslations('nav');
    const { game } = await params;
    const gameKey = game.toLowerCase();
    const gameConfig = Object.values(GAMES).find(g => g.slug === gameKey);
    const gameType = gameConfig?.id;

    if (!gameType) {
        notFound();
    }

    const titleGrad = gameConfig?.ui.themeGrad;
    const fullHistory = await getHistory(gameType);
    const draws = fullHistory.filter(d => d.game === gameType);

    if (draws.length === 0) {
        // Handle case with no data yet
        return <div className="p-8 text-center text-zinc-500">{t("loading")} {tNav(game as any) || gameConfig.name}...</div>;
    }

    const latestDraw = draws[0];

    // Fetch metrics specifically for this game
    const rankings = await getRankingMetrics(gameType);

    const topNumberSystems = rankings
        .filter(r => !['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina'].includes(r.systemName))
        .sort((a, b) => b.qualityScore - a.qualityScore) // Ensure sorted by Quality Score
        .slice(0, 5);

    const jackpotLeaders = await getJackpotLeaders(gameType);
    const starJackpotLeaders = await getStarJackpotLeaders(gameType);
    const hasStars = (gameConfig?.rules.bonusCount ?? 0) > 0;

    return (
        <div className={`min-h-screen text-foreground p-4 sm:p-6 font-sans transition-all duration-500 game-page-${gameConfig?.slug}`} style={{
            "--accent": gameConfig?.ui.accent,
            "--accent-hover": "color-mix(in srgb, " + gameConfig?.ui.accent + " 80%, white)",
            "--accent-muted": "color-mix(in srgb, " + gameConfig?.ui.accent + " 15%, transparent)",
            "--accent-border": "color-mix(in srgb, " + gameConfig?.ui.accent + " 30%, transparent)",
        } as React.CSSProperties}>
            <div className="mx-auto max-w-7xl space-y-6">
                <LatestDrawWidget latestDraw={latestDraw} game={gameType} />

                {/* Quick Ranking Navigation Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-1/70 border border-border/70 backdrop-blur-md shadow-sm">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[var(--accent)]" />
                        <span className="text-xs font-semibold text-muted-foreground">Classificações e Desempenho dos Sistemas:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={`/ranking/${gameConfig?.slug}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[var(--accent)] text-zinc-950 hover:opacity-90 transition-all shadow hover:scale-105 active:scale-95"
                        >
                            <Trophy className="w-3.5 h-3.5" />
                            Ranking de Sistemas
                            <ChevronRight className="w-3 h-3 opacity-70" />
                        </Link>
                        {hasStars && (
                            <Link
                                href={`/analysis/stars/ranking/${gameConfig?.slug}`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-surface-2/80 hover:bg-surface-2 text-foreground border border-border/80 transition-all shadow-sm hover:scale-105 active:scale-95"
                            >
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                Ranking Estrelas
                                <ChevronRight className="w-3 h-3 opacity-70" />
                            </Link>
                        )}
                    </div>
                </div>

                <div className={`grid grid-cols-1 gap-6 ${hasStars ? 'md:grid-cols-2' : ''} pb-12`}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                                <Hash className="w-6 h-6 text-[var(--accent)]" />
                                {t("top_numbers")}
                            </h2>
                            <Link
                                href={`/ranking/${gameConfig?.slug}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 text-[var(--accent)] border border-[var(--accent)]/30 hover:border-[var(--accent)] transition-all shadow-sm active:scale-95"
                                title="Ver Ranking de Sistemas de Números"
                            >
                                <Trophy className="w-3.5 h-3.5" />
                                <span>Ranking</span>
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <LastDrawNumberSystems game={gameType} />
                        <TopNumberSystemsWidget data={topNumberSystems} game={gameType} />
                        <HistoricalBestWidget leaders={jackpotLeaders} game={gameType} />
                    </div>

                    {hasStars && (
                        /* RIGHT COLUMN: STARS */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <Star className="w-6 h-6 text-[var(--accent)]" />
                                    {t("top_stars")}
                                </h2>
                                <Link
                                    href={`/analysis/stars/ranking/${gameConfig?.slug}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 text-[var(--accent)] border border-[var(--accent)]/30 hover:border-[var(--accent)] transition-all shadow-sm active:scale-95"
                                    title="Ver Ranking de Sistemas de Estrelas"
                                >
                                    <Trophy className="w-3.5 h-3.5" />
                                    <span>Ranking</span>
                                    <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {/* Best System (Last Draw) - Stars */}
                            <LastDrawStarSystems game={gameType} />

                            {/* Top Star Systems */}
                            <TopStarSystemsWidget game={gameType} />

                            {/* Historical Best - Stars */}
                            <StarJackpotLeaders leaders={starJackpotLeaders} game={gameType} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
