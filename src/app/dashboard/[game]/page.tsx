import { Star, Hash } from 'lucide-react';
﻿import { getHistory } from '@/app/actions';
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

// Map URL param to GameType


// Map GameType to Display Name




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

    const titleGrad = gameConfig?.ui.themeGrad;  const fullHistory = await getHistory();
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

                <div className={`grid grid-cols-1 gap-6 ${hasStars ? 'md:grid-cols-2' : ''} pb-12`}>
                    <div className="space-y-4">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                            <Hash className="w-6 h-6 text-[var(--accent)]" />
                            {t("top_numbers")}
                        </h2>
                        <LastDrawNumberSystems game={gameType} />
                        <TopNumberSystemsWidget data={topNumberSystems} game={gameType} />
                        <HistoricalBestWidget leaders={jackpotLeaders} game={gameType} />
                    </div>

                    {hasStars && (
                        /* RIGHT COLUMN: STARS */
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Star className="w-6 h-6 text-[var(--accent)]" />
                                {t("top_stars")}
                            </h2>

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
