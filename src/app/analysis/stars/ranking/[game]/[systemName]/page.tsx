import { BackButton } from '@/components/ui';
import { Card } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { getStarSystemDetails, getStarPrediction } from '../../../actions';
import StarSystemStatsViewer from '@/components/analysis/StarSystemStatsViewer';
import SendToWheelingButton from '@/components/SendToWheelingButton';
import { GameType, GAMES } from '@/types/game';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{
        game: string;
        systemName: string;
    }>;
}

const GAME_MAP: Record<string, GameType> = {
    'euromillions': GameType.EUROMILLIONS,
    'megasena': GameType.MEGASENA,
    'totoloto': GameType.TOTOLOTO,
    'eurodreams': GameType.EURODREAMS
};

const gameThemeMap = {
    [GameType.MEGASENA]: {
        textGrad: "from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300",
        btnActive: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50",
        rank1: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50",
        jackpotText: "text-amber-600 dark:text-amber-400",
        accentText: "text-amber-600 dark:text-amber-400",
        card: "glass-card dark:bg-amber-950/30 dark:border-amber-900/50"
    },
    [GameType.EUROMILLIONS]: {
        btnActive: "bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50",
        rank1: "bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50",
        jackpotText: "text-euro-600 dark:text-euro-400",
        accentText: "text-euro-600 dark:text-euro-400",
        textGrad: "from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-400",
        card: "glass-card"
    },
    [GameType.TOTOLOTO]: {
        btnActive: "bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50",
        rank1: "bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50",
        jackpotText: "text-toto-600 dark:text-toto-400",
        accentText: "text-toto-600 dark:text-toto-400",
        textGrad: "from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400",
        card: "glass-card"
    },
    [GameType.EURODREAMS]: {
        btnActive: "bg-dream-100 dark:bg-dream-950/40 text-dream-700 dark:text-dream-400 border border-dream-200/50",
        rank1: "bg-dream-100 dark:bg-dream-950/40 text-dream-700 dark:text-dream-400 border border-dream-200/50",
        jackpotText: "text-dream-600 dark:text-dream-400",
        accentText: "text-dream-600 dark:text-dream-400",
        textGrad: "from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400",
        card: "glass-card"
    }
};

export default async function StarSystemDetailsPage({ params }: Props) {
    const { game, systemName: encodedName } = await params;
    const systemName = decodeURIComponent(encodedName);

    // Validate Game
    const gameKey = game.toLowerCase();
    const gameType = GAME_MAP[gameKey];
    if (!gameType) notFound();

    const details = await getStarSystemDetails(systemName, gameType);

    if (!details) {
        notFound();
    }

    const { system, history } = details;

    // Filter History by Game
    const gameHistory = history.filter(h => h.draw.game === gameType);

    // Fetch NEXT draw prediction (all numbers ordered by importance)
    const nextPrediction = await getStarPrediction(systemName, gameType);

    const isTotoloto = gameType === GameType.TOTOLOTO;
    const isEuroDreams = gameType === GameType.EURODREAMS;

    // Sugerir o dobro dos números sorteados
    const suggestedCount = (gameType === GameType.EUROMILLIONS) ? 4 : 2;
    const suggestedPrediction = nextPrediction.slice(0, suggestedCount);
    const remainingPrediction = nextPrediction.slice(suggestedCount);

    const maxStarsDrawn = (gameType === GameType.EUROMILLIONS) ? 2 : 1;

    // Calculate distribution for stats (based on game history)
    const distribution = isTotoloto || isEuroDreams ? [0, 0] : [0, 0, 0];
    let totalHits = 0;

    gameHistory.forEach(p => {
        const hits = (gameType === GameType.EUROMILLIONS)
            ? (p.star_hits_4 ?? p.star_hits_2 ?? 0)
            : (p.star_hits_2 ?? 0);
        const cappedHits = Math.min(maxStarsDrawn, Math.max(0, hits));
        distribution[cappedHits] = (distribution[cappedHits] || 0) + 1;
        totalHits += hits;
    });

    const accuracy = gameHistory.length > 0
        ? ((totalHits / (gameHistory.length * maxStarsDrawn)) * 100)
        : 0;

    const stats = {
        accuracy,
        totalPredictions: gameHistory.length,
        distribution
    };

    const gameConfig = GAMES[gameType];
    const currentTheme = gameThemeMap[gameType] || gameThemeMap[GameType.EUROMILLIONS];

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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 glass-card relative">
                    <div className="flex items-center gap-4">
                        <BackButton href={`/analysis/stars/ranking/${game}`} style={{ boxShadow: `0 0 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)`, border: `1px solid color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }} />
                        <div>
                            <h1 className={`text-2xl sm:text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight`}>{system.systemName}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Sistema de previsão de {isTotoloto ? 'N.º da Sorte' : isEuroDreams ? 'N.º de Sonho' : 'Estrelas'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* NEXT PREDICTION CRYSTAL BALL CARD */}
                <Card className="p-6 sm:p-8 glass-card border shadow-sm relative overflow-hidden group rounded-2xl" style={{ backgroundColor: `color-mix(in srgb, ${gameConfig.ui.accent} 5%, transparent)`, borderColor: `color-mix(in srgb, ${gameConfig.ui.accent} 20%, transparent)` }}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <h2 className="text-xl font-extrabold text-white flex items-center gap-2 shrink-0" style={{ textShadow: `0 0 15px ${gameConfig.ui.accent}` }}>
                            <span className="animate-pulse" style={{ color: gameConfig.ui.accent }}>🔮</span> Próxima Previsão
                        </h2>
                        {suggestedPrediction && suggestedPrediction.length > 0 && (
                            <SendToWheelingButton
                                numbers={suggestedPrediction}
                                label="Enviar para Desdobramentos"
                                className="px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm bg-surface-1/50 hover:bg-surface-2 border"
                                style={{ borderColor: gameConfig.ui.accent, color: gameConfig.ui.accent, boxShadow: `0 4px 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }}
                            />
                        )}
                    </div>

                    {/* SUGGESTED STARS (Primary Half / Sugeridos) */}
                    <div className="mt-6">
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                            ⭐ Números Sugeridos ({suggestedCount} mais prováveis):
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {suggestedPrediction.map((num: number, idx: number) => (
                                <div key={idx} className="relative group/num flex justify-center">
                                    <div className="absolute inset-0 bg-card/50 backdrop-blur-sm rounded-full blur-md group-hover/num:blur-lg transition-all"></div>
                                    <div className="relative w-12 h-12 flex items-center justify-center rounded-full text-xl font-black shadow-lg border-2 bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform cursor-default" style={{ borderColor: gameConfig.ui.accent, color: gameConfig.ui.accent, boxShadow: `0 0 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent), inset 0 0 10px color-mix(in srgb, ${gameConfig.ui.accent} 20%, transparent)` }}>
                                        {num}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* REMAINING STARS (Ordered by Importance) */}
                    {remainingPrediction.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-border/50">
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-3">
                                Restantes Números (por ordem de importância):
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {remainingPrediction.map((num: number, idx: number) => (
                                    <div key={idx} className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold text-muted-foreground bg-surface-2 border border-border/40 hover:text-foreground">
                                        {num}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-muted-foreground text-xs sm:text-sm mt-6 relative z-10 font-medium">
                        Sugestão para o próximo sorteio baseada no algoritmo {system.systemName}.
                    </p>
                </Card>

                {/* ACCURACY & STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Accuracy Card */}
                    <Card className="p-6 glass-card rounded-2xl" style={{ boxShadow: "-4px 0px 15px -3px color-mix(in srgb, " + gameConfig.ui.accent + " 40%, transparent)", borderLeft: "2px solid " + gameConfig.ui.accent }}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🎯</span>
                            <h3 className="text-lg font-bold text-foreground">Precisão Global</h3>
                        </div>
                        <div className={`text-4xl font-black ${stats.accuracy >= 50 ? 'text-emerald-600' : 'text-zinc-700 dark:text-zinc-300'}`}>
                            {stats.accuracy.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Baseado em {stats.totalPredictions} sorteios</p>
                    </Card>

                    {/* Distribution Card */}
                    <Card className="p-6 glass-card rounded-2xl col-span-1 md:col-span-2" style={{ boxShadow: "-4px 0px 15px -3px color-mix(in srgb, " + gameConfig.ui.accent + " 40%, transparent)", borderLeft: "2px solid " + gameConfig.ui.accent }}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">📊</span>
                            <h3 className="text-lg font-bold text-foreground">Distribuição de Acertos</h3>
                        </div>
                        <div className={`grid grid-cols-${isEuroDreams || isTotoloto ? 2 : 3} gap-4`}>
                            {(isEuroDreams || isTotoloto ? [0, 1] : [0, 1, 2]).map(hits => (
                                <div key={hits} className="text-center p-3 rounded-xl glass-card">
                                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">{hits} Acerto(s)</div>
                                    <div className="text-2xl font-bold" style={{ color: hits === (isEuroDreams || isTotoloto ? 1 : 2) ? "var(--accent)" : "var(--text-primary)" }}>
                                        {stats.distribution[hits] || 0}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-semibold">
                                        {stats.totalPredictions > 0 ? Math.round(((stats.distribution[hits] || 0) / stats.totalPredictions) * 100) : 0}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Interactive Stats Viewer */}
                <StarSystemStatsViewer
                    systemName={systemName}
                    initialStats={{
                        accuracy: stats.accuracy,
                        total: stats.totalPredictions,
                        distribution: stats.distribution
                    }}
                    isActive={true}
                    game={gameType}
                />

                {/* HISTÓRICO DE PREVISÕES */}
                <Card className="p-0 glass-card overflow-hidden mt-8 shadow-sm rounded-2xl" style={{ borderLeft: "2px solid " + gameConfig.ui.accent }}>
                    <div className="p-6 border-b border-border flex items-center justify-between bg-surface-1/30">
                        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                            <span className="text-2xl">🕒</span> Histórico de Previsões
                        </h2>
                        <span className="text-xs sm:text-sm text-muted-foreground font-semibold bg-surface-2 px-3 py-1 rounded-full border border-border">Últimos 50 Sorteios</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface-1/50 text-muted-foreground uppercase tracking-wider text-[10px] sm:text-xs font-bold">
                                <tr>
                                    <th className="p-4 border-b border-border">Data</th>
                                    <th className="p-4 border-b border-border">Sorteio Real</th>
                                    <th className="p-4 border-b border-border">Previsão (Top {suggestedCount})</th>
                                    <th className="p-4 text-center border-b border-border">Acertos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {gameHistory.slice(0, 50).map((h, i) => {
                                    const starsArr = h.draw.stars ? JSON.parse(h.draw.stars) : [];
                                    const predArr = h.prediction ? (typeof h.prediction === 'string' ? JSON.parse(h.prediction) : h.prediction) : [];
                                    const suggested = predArr.slice(0, suggestedCount);
                                    
                                    const hits = (gameType === GameType.EUROMILLIONS)
                                        ? (h.star_hits_4 ?? h.star_hits_2 ?? 0)
                                        : (h.star_hits_2 ?? 0);
                                    const cappedHits = Math.min(maxStarsDrawn, Math.max(0, hits));

                                    return (
                                        <tr key={i} className="hover:bg-surface-1/50 transition-colors">
                                            <td className="p-4 font-semibold text-foreground whitespace-nowrap">
                                                {new Date(h.draw.date).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {starsArr.map((s, idx) => (
                                                        <div key={idx} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold text-white shadow-sm" style={{ backgroundColor: gameConfig.ui.accent }}>
                                                            {s}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {suggested.map((s, idx) => {
                                                        const isHit = starsArr.includes(s);
                                                        return (
                                                            <div key={idx} className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold border transition-colors ${isHit ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/50 dark:border-emerald-500/50 dark:text-emerald-300' : 'bg-surface-2 border-border/50 text-muted-foreground'}`}>
                                                                {s}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold border ${cappedHits === maxStarsDrawn ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/50 dark:border-emerald-500/50 dark:text-emerald-300' : cappedHits > 0 ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/50 dark:border-amber-500/50 dark:text-amber-300' : 'bg-surface-2 border-border/50 text-muted-foreground'}`}>
                                                    {cappedHits}/{maxStarsDrawn}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {gameHistory.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground font-medium">
                                Sem dados históricos disponíveis.
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <ResponsibleGamingFooter />
        </div>
    );
}
