import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { BackButton } from '@/components/ui';
import SystemStatsViewer from '@/components/analysis/SystemStatsViewer';
import SendToWheelingButton from '@/components/SendToWheelingButton';
import { formatSystemName } from '@/utils/formatters';
import { HelpCircle } from 'lucide-react';
import { GameType, GAMES } from '@/types/game';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{
        game: string;
        systemName: string;
    }>;
}

// Map URL param to GameType
const GAME_MAP: Record<string, GameType> = {
    'euromillions': GameType.EUROMILLIONS,
    'megasena': GameType.MEGASENA,
    'totoloto': GameType.TOTOLOTO,
    'eurodreams': GameType.EURODREAMS
};

// Dicionário de temas estáticos para Next.js / Tailwind CSS v4 para evitar classes interpoladas dinamicamente
const gameThemeMap = {
    [GameType.MEGASENA]: {
        bg: "bg-gradient-to-br from-amber-50/30 via-slate-50 to-yellow-50/20 dark:from-black dark:via-black dark:to-black",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "glass-card dark:bg-amber-950/30 dark:border-amber-900/50",
        themeColor: "amber",
        btn: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 hover:bg-white dark:hover:bg-zinc-900",
        gradient_light: "from-amber-50/40 via-white/80 to-yellow-50/40 dark:from-zinc-900/60 dark:to-amber-950/30",
        accentText: "text-amber-600 dark:text-amber-400",
        accentBg: "bg-amber-500",
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-450 border border-amber-200/40",
        textGrad: "from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300",
        btnActive: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50",
        btnInactive: "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
        rank1: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50",
        jackpotText: "text-amber-600 dark:text-amber-400"
    },
    [GameType.EUROMILLIONS]: {
        bg: "bg-gradient-to-br from-blue-50/30 via-slate-50 to-indigo-50/20 dark:from-black dark:via-black dark:to-black",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "glass-card",
        themeColor: "euro",
        btn: "bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50 hover:bg-white dark:hover:bg-zinc-900",
        gradient_light: "from-blue-50/40 via-white/80 to-indigo-50/40 dark:from-zinc-900/60 dark:to-euro-950/30",
        accentText: "text-euro-600 dark:text-euro-400",
        accentBg: "bg-euro-500",
        badge: "bg-euro-500/10 text-euro-700 dark:text-euro-450 border border-euro-200/40"
    },
    [GameType.TOTOLOTO]: {
        bg: "bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 dark:from-black dark:via-black dark:to-black",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "glass-card",
        themeColor: "toto",
        btn: "bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50 hover:bg-white dark:hover:bg-zinc-900",
        gradient_light: "from-emerald-50/40 via-white/80 to-teal-50/40 dark:from-zinc-900/60 dark:to-toto-950/30",
        accentText: "text-toto-600 dark:text-toto-400",
        accentBg: "bg-toto-500",
        badge: "bg-toto-500/10 text-toto-700 dark:text-toto-450 border border-toto-200/40"
    },
    [GameType.EURODREAMS]: {
        bg: "bg-gradient-to-br from-purple-50/30 via-slate-50 to-pink-50/20 dark:from-black dark:via-black dark:to-black",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "glass-card",
        themeColor: "dream",
        btn: "bg-dream-100 dark:bg-dream-950/40 text-dream-700 dark:text-dream-400 border border-dream-200/50 hover:bg-white dark:hover:bg-zinc-900",
        gradient_light: "from-purple-50/40 via-white/80 to-pink-50/40 dark:from-zinc-900/60 dark:to-dream-950/30",
        accentText: "text-dream-600 dark:text-dream-400",
        accentBg: "bg-dream-500",
        badge: "bg-dream-500/10 text-dream-700 dark:text-dream-450 border border-dream-200/40"
    }
};

export default async function SystemDetailsPage({ params }: Props) {
    const { game, systemName: encodedName } = await params;

    // Safety decode
    const systemName = decodeURIComponent(encodedName);

    const gameKey = game.toLowerCase();
    const gameType = GAME_MAP[gameKey];

    if (!gameType) {
        notFound();
    }

    // Obter o tema correto estático
    const currentTheme = gameThemeMap[gameType] || gameThemeMap[GameType.EUROMILLIONS];
    const gameConfig = GAMES[gameType];

    // Fetch data directly from database
    let allPerformances = await prisma.systemPerformance.findMany({
        where: { systemName, game: gameType },
        include: { draw: true },
        orderBy: { draw: { date: 'desc' } }
    });

    // FALLBACK: Handle cases where '+' in URL might be decoded as ' ' or vice-versa
    if (allPerformances.length === 0 && (systemName.includes(' ') || systemName.includes('+'))) {
        const alternativeName = systemName.includes('+')
            ? systemName.replace(/\+/g, ' ')
            : systemName.replace(/ /g, '+');

        allPerformances = await prisma.systemPerformance.findMany({
            where: { systemName: alternativeName, game: gameType },
            include: { draw: true },
            orderBy: { draw: { date: 'desc' } }
        });

        if (allPerformances.length > 0) {
            (systemName as any) = allPerformances[0].systemName;
        }
    }

    if (allPerformances.length === 0) {
        notFound();
    }

    // DEDUPLICATE - Keep only the most recent record per draw
    const seenDrawIds = new Set<number>();
    const uniquePerformances = allPerformances.filter(p => {
        if (seenDrawIds.has(p.drawId)) {
            return false;
        }
        seenDrawIds.add(p.drawId);
        return true;
    });

    const maxNumbers = (gameType === GameType.EURODREAMS || gameType === GameType.MEGASENA) ? 6 : 5;

    // Calculate statistics
    const distribution = Array(maxNumbers + 1).fill(0);
    let totalHits = 0;

    uniquePerformances.forEach(p => {
        const hits = Math.min(maxNumbers, Math.max(0, p.hits));
        distribution[hits]++;
        totalHits += hits;
    });

    const accuracy = uniquePerformances.length > 0
        ? ((totalHits / uniquePerformances.length) / maxNumbers) * 100
        : 0;

    // Get system metadata
    const system = await prisma.rankedSystem.findUnique({
        where: {
            name_game: {
                name: systemName,
                game: gameType
            }
        }
    });

    if (!system) {
        notFound();
    }

    // Get next prediction
    const nextPred = await prisma.cachedPrediction.findUnique({
        where: {
            systemName_game: {
                systemName,
                game: gameType
            }
        }
    });

    const nextPrediction = nextPred ? JSON.parse(nextPred.numbers).slice(0, gameConfig.id === "EURODREAMS" ? 20 : (gameConfig.id === "MEGASENA" ? 30 : 25)) : [];
    const predictions = uniquePerformances.map(p => ({
        id: p.id,
        date: p.draw.date.toISOString(),
        drawNumbers: JSON.parse(p.actualNumbers),
        predictedNumbers: JSON.parse(p.predictedNumbers),
        hits: p.hits
    }));

    const stats = {
        accuracy,
        totalPredictions: uniquePerformances.length,
        distribution
    };

    

    return (
        <div className={`min-h-screen ${currentTheme.bg} p-4 sm:p-6 pb-24 font-sans transition-all duration-500 game-page-${gameKey}`}>
            <div className="container mx-auto space-y-6 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-card/50 backdrop-blur-sm backdrop-blur-md rounded-2xl border border-border">
                    <div className="flex items-center gap-4">
                        <BackButton href={`/ranking/${game}`} style={{ boxShadow: `0 0 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)`, border: `1px solid color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }} />
                        <div>
                            <h1 className={`text-2xl sm:text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight`}>{formatSystemName(system.name)}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">{system.description || 'Previsão estatística avançada.'}</p>
                        </div>
                    </div>
                                        <div className="flex gap-2 shrink-0">
                        <Link
                            href={`/ranking/${game}/${encodeURIComponent(systemName)}/explain`}
                            className="px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm bg-surface-1/50 hover:bg-surface-2 border"
                            style={{ borderColor: gameConfig.ui.accent, color: gameConfig.ui.accent, boxShadow: `0 4px 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }}
                        >
                            <HelpCircle className="w-4 h-4" />
                            Como Funciona
                        </Link>
                        <Link
                            href={`/analysis/history/${encodeURIComponent(systemName)}`}
                            className="px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm bg-surface-1/50 hover:bg-surface-2 border"
                            style={{ borderColor: gameConfig.ui.accent, color: gameConfig.ui.accent, boxShadow: `0 4px 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }}
                        >
                            📊 Análise Histórica
                        </Link>
                        
                    </div>
                </div>

                {/* LIGHT BULB EXPLANATION CARD (Dynamic from DB) */}
                {((system as any).concept || (system as any).logic) && (
                    <Card className={`p-6 ${currentTheme.card}`}>
                        <h3 className={`text-lg font-bold ${currentTheme.accentText} mb-3 flex items-center gap-2`}>
                            💡 Como Funciona Este Sistema
                        </h3>
                        <div className="text-foreground/90 space-y-4 leading-relaxed">
                            {(system as any).concept && (
                                <p><strong className={`${currentTheme.accentText}`}>Conceito:</strong> {(system as any).concept}</p>
                            )}
                            {(system as any).logic && (
                                <div className="text-sm">
                                    <strong className={`${currentTheme.accentText}`}>Lógica:</strong>
                                    <p className="mt-1 leading-relaxed bg-card/50 backdrop-blur-sm p-3 rounded-lg border border-border">{(system as any).logic}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* NEXT PREDICTION CRYSTAL BALL CARD */}
                <Card className={`p-6 sm:p-8 glass-card border shadow-sm relative overflow-hidden group rounded-2xl`} style={{ backgroundColor: `color-mix(in srgb, ${gameConfig.ui.accent} 5%, transparent)`, borderColor: `color-mix(in srgb, ${gameConfig.ui.accent} 20%, transparent)` }}>




                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <h2 className="text-xl font-extrabold text-white flex items-center gap-2 shrink-0" style={{ textShadow: `0 0 15px ${gameConfig.ui.accent}` }}>
                            <span className="animate-pulse" style={{ color: gameConfig.ui.accent }}>✨</span> Próxima Previsão
                        </h2>
                    </div>









                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 mt-6 relative z-10 w-fit">
                        {nextPrediction && nextPrediction.length > 0 ? (
                            nextPrediction.map((num: number) => (
                                <div key={num} className="relative group/num flex justify-center">
                                    <div className="absolute inset-0 bg-card/50 backdrop-blur-sm rounded-full blur-md group-hover/num:blur-lg transition-all"></div>
                                    <div className="relative w-11 h-11 flex items-center justify-center rounded-full text-xl font-black shadow-md border-2 bg-card/50 backdrop-blur-sm hover:scale-105 transition-transform cursor-default" style={{ borderColor: gameConfig.ui.accent, color: gameConfig.ui.accent, boxShadow: `0 0 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent), inset 0 0 10px color-mix(in srgb, ${gameConfig.ui.accent} 20%, transparent)` }}>
                                        {num}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center md:items-start text-zinc-500">
                                <div className="italic mb-2">Previsão indisponível no momento...</div>
                                <div className="text-xs bg-card/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-zinc-250/20 inline-block">
                                    SYSTEM_ID: {systemName} | CACHE: MISSING
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between mt-6 relative z-10 gap-4">
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                            Sugestão para o próximo sorteio baseada no algoritmo {formatSystemName(system.name)}.
                        </p>
                        {nextPrediction && nextPrediction.length > 0 && (
                            <SendToWheelingButton
                                numbers={nextPrediction}
                                label="Enviar para Desdobramentos"
                                className="px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm bg-surface-1/50 hover:bg-surface-2 border"
                                style={{ borderColor: gameConfig.ui.accent, color: gameConfig.ui.accent, boxShadow: `0 4px 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }}
                            />
                        )}
                    </div>
                </Card>

                {/* HOT STATS (Last 20 Draws) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className={`p-6 ${currentTheme.card} rounded-2xl`} style={{ boxShadow: "-4px 0px 15px -3px color-mix(in srgb, " + gameConfig.ui.accent + " 40%, transparent)", borderLeft: "2px solid " + gameConfig.ui.accent }}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🔥</span>
                            <h3 className="text-lg font-bold text-foreground">Forma Recente (20 Sorteios)</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-muted-foreground text-sm">Precisão Média</div>
                                <div className={`text-2xl font-black ${(uniquePerformances.slice(0, 20).reduce((a, b) => a + ((Math.min(maxNumbers, b.hits) / maxNumbers) * 100), 0) / Math.min(20, uniquePerformances.length)) >= 60
                                    ? `${currentTheme.accentText}` : 'text-zinc-700 dark:text-zinc-300'
                                    }`}>
                                    {(uniquePerformances.slice(0, 20).reduce((a, b) => a + ((Math.min(maxNumbers, b.hits) / maxNumbers) * 100), 0) / Math.min(20, uniquePerformances.length) || 0).toFixed(1)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-sm">Acertos Altos ({maxNumbers === 6 ? '5 ou 6' : '4 ou 5'})</div>
                                <div className="text-2xl font-black text-foreground">
                                    {uniquePerformances.slice(0, 20).filter(p => p.hits >= (maxNumbers === 6 ? 5 : 4)).length} <span className="text-sm text-muted-foreground/70 font-medium">vezes</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className={`p-6 ${currentTheme.card} rounded-2xl`} style={{ boxShadow: "-4px 0px 15px -3px color-mix(in srgb, " + gameConfig.ui.accent + " 40%, transparent)", borderLeft: "2px solid " + gameConfig.ui.accent }}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">⚡</span>
                            <h3 className="text-lg font-bold text-foreground">Frequência de Impacto</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-muted-foreground text-sm">Intervalo Médio (&gt;={maxNumbers === 6 ? 5 : 4} Acertos)</div>
                                <div className={`text-2xl font-black ${currentTheme.accentText}`}>
                                    {uniquePerformances.slice(0, 20).filter(p => p.hits >= (maxNumbers === 6 ? 5 : 4)).length > 0
                                        ? `1 a cada ${(20 / uniquePerformances.slice(0, 20).filter(p => p.hits >= (maxNumbers === 6 ? 5 : 4)).length).toFixed(1)} sorteios`
                                        : 'Sem registo recente'}
                                </div>
                                <p className="text-xs text-muted-foreground/70 mt-1.5 font-medium">Baseado nos Últimos 20 sorteios</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Interactive Stats Viewer */}
                <SystemStatsViewer
                    systemName={systemName}
                    isActive={system.isActive}
                    game={gameType}
                    initialStats={{
                        accuracy: stats.accuracy,
                        total: stats.totalPredictions,
                        distribution: stats.distribution
                    }}
                />

                {/* History Table */}
                <Card className="glass-card overflow-hidden rounded-2xl" style={{ boxShadow: "-4px 0px 15px -3px color-mix(in srgb, " + gameConfig.ui.accent + " 40%, transparent)", borderLeft: "2px solid " + gameConfig.ui.accent }}>
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Histórico de Previsões</h2>
                        <span className="text-sm text-muted-foreground font-semibold">Últimos 50 Sorteios</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface-1/50 text-muted-foreground uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Sorteio Real</th>
                                    <th className="p-4">Previsão (Top 20)</th>
                                    <th className="p-4 text-center">Acertos</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {predictions.slice(0, 50).map((pred: any) => {
                                    const predicted = pred.predictedNumbers;
                                    const actual = pred.drawNumbers;

                                    return (
                                        <tr key={pred.id} className="hover:bg-surface-2/30 transition-colors">
                                            <td className="p-4 text-foreground font-semibold whitespace-nowrap">
                                                {new Date(pred.date).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    {actual.map((n: number) => (
                                                        <span key={n} className="w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-bold shadow-sm border border-white/10" style={{ backgroundColor: gameConfig.ui.accent }}>
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="grid grid-cols-10 gap-1 w-fit">
                                                    {predicted.map((n: number, idx: number) => {
                                                        const isHit = actual.includes(n);
                                                        return (
                                                            <span key={idx} className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${isHit ? 'text-white border border-white/20 shadow-md' : 'bg-card/80 border border-border text-muted-foreground'}`} style={isHit ? { backgroundColor: gameConfig.ui.accent, boxShadow: `0 0 12px color-mix(in srgb, ${gameConfig.ui.accent} 60%, transparent)` } : {}}>
                                                                {n}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span 
    className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold ${
        pred.hits === maxNumbers 
            ? 'text-white border-0' 
            : pred.hits === maxNumbers - 1 
                ? 'border bg-transparent shadow-sm' 
                : 'bg-transparent text-game-badge-low-text border border-game-badge-low-border'
    }`}
    style={
        pred.hits === maxNumbers 
            ? { backgroundColor: gameConfig.ui.accent, boxShadow: `0 0 12px color-mix(in srgb, ${gameConfig.ui.accent} 60%, transparent)` } 
            : pred.hits === maxNumbers - 1 
                ? { color: gameConfig.ui.accent, borderColor: gameConfig.ui.accent } 
                : {}
    }
>
    {pred.hits}/{maxNumbers}
</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div >
            <div className="opacity-70 mt-12 pt-8 border-t border-slate-200 dark:border-zinc-800">
                <ResponsibleGamingFooter />
            </div>
        </div >
    );
}
