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
import { fetchSystemPerformances } from '@/services/system-performance-adapter';
import { getLiveNextPrediction } from '@/services/live-prediction-service';
import SystemHistoryTable from '@/components/analysis/SystemHistoryTable';
import JackCyclesTable from '@/components/systems/JackCyclesTable';
import { MatrizConselhoCard } from '@/components/systems/MatrizConselhoCard';
import { SYSTEM_CATALOG, getSystemJackCyclesForGame } from '@/services/systems-catalog';

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
    'eurodreams': GameType.EURODREAMS,
    'lotofacil': GameType.LOTOFACIL
};

const gameThemeMap = {
    [GameType.LOTOFACIL]: {
        bg: "bg-gradient-to-br from-pink-50/30 via-slate-50 to-rose-50/20 dark:from-black dark:via-black dark:to-black",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "glass-card dark:bg-pink-950/30 dark:border-pink-900/50",
        themeColor: "pink",
        btn: "bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border border-pink-200/50 hover:bg-white dark:hover:bg-zinc-900",
        gradient_light: "from-pink-50/40 via-white/80 to-rose-50/40 dark:from-zinc-900/60 dark:to-pink-950/30",
        accentText: "text-pink-600 dark:text-pink-400",
        accentBg: "bg-pink-600",
        badge: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-200/40"
    },
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
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-450 border border-amber-200/40"
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
    const systemName = decodeURIComponent(encodedName);
    const gameKey = game.toLowerCase();
    const gameType = GAME_MAP[gameKey];

    if (!gameType) {
        notFound();
    }

    const currentTheme = gameThemeMap[gameType] || gameThemeMap[GameType.EUROMILLIONS];
    const gameConfig = GAMES[gameType];

    let allPerformances = await fetchSystemPerformances({
        where: { systemName, game: gameType },
        include: { draw: true },
        orderBy: { draw: { date: 'desc' } }
    });

    if (allPerformances.length === 0 && (systemName.includes(' ') || systemName.includes('+'))) {
        const alternativeName = systemName.includes('+')
            ? systemName.replace(/\+/g, ' ')
            : systemName.replace(/ /g, '+');

        allPerformances = await fetchSystemPerformances({
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

    const seenDates = new Set<string>();
    const uniquePerformances = allPerformances.filter(p => {
        if (!p.draw || !p.draw.date) return false;
        const dateStr = new Date(p.draw.date).toISOString().split('T')[0];
        if (seenDates.has(dateStr)) {
            return false;
        }
        seenDates.add(dateStr);
        return true;
    });

    const maxNumbers = (gameType === GameType.EURODREAMS || gameType === GameType.MEGASENA) ? 6 : (gameType === GameType.LOTOFACIL ? 15 : 5);

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

    let nextPredictionFull = await getLiveNextPrediction(systemName, gameType);
    if (!nextPredictionFull || nextPredictionFull.length === 0) {
        const latestPredRec = await prisma.systemPrediction.findFirst({
            where: { systemName, game: gameType, domain: 'NUMBERS' },
            orderBy: { draw: { date: 'desc' } },
            select: { prediction: true }
        });
        if (latestPredRec?.prediction) {
            try { nextPredictionFull = JSON.parse(latestPredRec.prediction); } catch(e) {}
        }
    }

    const isLotofacil = gameType === GameType.LOTOFACIL;
    const halfPoint = gameConfig.id === 'EURODREAMS' ? 20 : (gameConfig.id === 'MEGASENA' ? 30 : (isLotofacil ? 20 : 25));
    const predictions = uniquePerformances.slice(0, 50).map(p => ({
        id: p.id,
        drawId: p.drawId,
        date: p.draw.date.toISOString(),
        calculatedAt: p.calculatedAt ? new Date(p.calculatedAt).toISOString() : null,
        drawNumbers: JSON.parse(p.actualNumbers),
        predictedNumbers: JSON.parse(p.predictedNumbers),
        hits: p.hits
    }));

    const stats = {
        accuracy,
        totalPredictions: uniquePerformances.length,
        distribution
    };

    const normName = systemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const catalogItem = SYSTEM_CATALOG.find(s => {
        const sDbNorm = s.dbName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const sNameNorm = s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return sDbNorm === normName || sNameNorm.includes(normName) || normName.includes(sDbNorm) || s.slug === normName.replace(/\s+/g, '_');
    });

    const systemSlug = catalogItem?.slug || systemName.toLowerCase().replace(/\s+/g, '_');
    const jackCycles = getSystemJackCyclesForGame(systemSlug, gameKey);

    return (
        <div className={`min-h-screen ${currentTheme.bg} p-4 sm:p-6 pb-24 font-sans transition-all duration-500 game-page-${gameKey}`}>
            <div className="container mx-auto space-y-6 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-card/50 backdrop-blur-md rounded-2xl border border-border">
                    <div className="flex items-center gap-4">
                        <BackButton href={`/ranking/${game}`} style={{ boxShadow: `0 0 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)`, border: `1px solid color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }} />
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">{formatSystemName(system.name)}</h1>
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
                            href={`/analysis/history/${encodeURIComponent(systemName)}?game=${game}`}
                            className="px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm bg-surface-1/50 hover:bg-surface-2 border"
                            style={{ borderColor: gameConfig.ui.accent, color: gameConfig.ui.accent, boxShadow: `0 4px 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }}
                        >
                            📊 Análise Histórica
                        </Link>
                    </div>
                </div>

                {/* LIGHT BULB EXPLANATION CARD */}
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

                {/* Performance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={`p-6 ${currentTheme.card} rounded-2xl`} style={{ boxShadow: "-4px 0px 15px -3px color-mix(in srgb, " + gameConfig.ui.accent + " 40%, transparent)", borderLeft: "2px solid " + gameConfig.ui.accent }}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🔥</span>
                            <h3 className="text-lg font-bold text-foreground">Forma Recente (20 Sorteios)</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-muted-foreground text-sm">Precisão Média</div>
                                <div className={`text-2xl font-black ${currentTheme.accentText}`}>
                                    {uniquePerformances.slice(0, 20).length > 0
                                        ? ((uniquePerformances.slice(0, 20).reduce((acc, p) => acc + p.hits, 0) / (uniquePerformances.slice(0, 20).length * maxNumbers)) * 100).toFixed(1) + '%'
                                        : '0%'}
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-sm">Acertos Altos ({maxNumbers === 15 ? '14 ou 15' : maxNumbers === 6 ? '5 ou 6' : '4 ou 5'})</div>
                                <div className="text-2xl font-black text-foreground">
                                    {uniquePerformances.slice(0, 20).filter(p => p.hits >= (maxNumbers === 15 ? 14 : maxNumbers === 6 ? 5 : 4)).length} <span className="text-sm text-muted-foreground/70 font-medium">vezes</span>
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
                                        ? `1 a cada ${(20 / uniquePerformances.slice(0, 20).filter(p => p.hits >= (maxNumbers === 15 ? 14 : maxNumbers === 6 ? 5 : 4)).length).toFixed(1)} sorteios`
                                        : 'Sem registo recente'}
                                </div>
                                <p className="text-xs text-muted-foreground/70 mt-1.5 font-medium">Baseado nos últimos 20 sorteios</p>
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

                {/* 5-LEVEL DYNAMIC JACK CYCLES TABLE (BLOCKS OF 25) */}
                <JackCyclesTable
                    cycles={jackCycles}
                    gameName={gameConfig.name}
                    systemName={formatSystemName(system.name)}
                    accentColor={gameConfig.ui.accent}
                />

                {/* NEXT PREDICTION - ESTILO IDÊNTICO AO HISTÓRICO DE PREVISÕES, POSICIONADO DIRETAMENTE ACIMA DELE */}
                {(() => {
                    const nextSugNumbers = nextPredictionFull ? nextPredictionFull.slice(0, halfPoint) : [];
                    const nextRemNumbers = nextPredictionFull ? nextPredictionFull.slice(halfPoint) : [];

                    return (
                        <Card className="glass-card overflow-hidden rounded-2xl p-5 sm:p-6 shadow-md border" style={{ boxShadow: "-4px 0px 15px -3px color-mix(in srgb, " + gameConfig.ui.accent + " 40%, transparent)", borderLeft: "2px solid " + gameConfig.ui.accent }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-border">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">✨</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                            Próxima Previsão
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                                Próximo Concurso
                                            </span>
                                        </h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Sugestão ativa para o próximo sorteio. Escolhe qual a metade que queres enviar para desdobrar. Para a semana, este sorteio transitará para o histórico abaixo.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {nextPredictionFull && nextPredictionFull.length > 0 ? (
                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 py-2">
                                    {/* QUADRO 1: SUGERIDOS (TOP HALFPOINT) */}
                                    <div className="flex-1 w-full max-w-md flex flex-col gap-2 p-3 sm:p-4 rounded-2xl bg-surface-2/60 dark:bg-surface-2/30 border shadow-xs" style={{ borderColor: `color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }}>
                                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: gameConfig.ui.accent }} />
                                                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider" style={{ color: gameConfig.ui.accent }}>
                                                    Sugeridos (Top {halfPoint})
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground">
                                                {nextSugNumbers.length} Números
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 justify-items-center py-1">
                                            {nextSugNumbers.map((num: number, idx: number) => (
                                                <div
                                                    key={`next-sug-${num}`}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-110 cursor-default bg-white dark:bg-card border-2 shadow-xs text-foreground"
                                                    style={{
                                                        borderColor: gameConfig.ui.accent,
                                                        boxShadow: `0 0 10px color-mix(in srgb, ${gameConfig.ui.accent} 30%, transparent)`
                                                    }}
                                                    title={`Sugerido #${idx + 1}: ${num}`}
                                                >
                                                    {num}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-2 border-t border-border/50">
                                            <SendToWheelingButton
                                                game={gameKey}
                                                numbers={nextSugNumbers}
                                                label={`🎯 Enviar Sugeridos (${nextSugNumbers.length})`}
                                                className="w-full justify-center py-2 px-3 rounded-xl font-bold text-xs text-white shadow-sm transition-all hover:scale-[1.02]"
                                                style={{ backgroundColor: gameConfig.ui.accent }}
                                            />
                                        </div>
                                    </div>

                                    {/* DIVISOR DE CORTE CENTRAL */}
                                    <div className="flex md:flex-col items-center justify-center self-stretch px-0.5 my-1 md:my-0">
                                        <div className="h-0.5 w-full md:w-0.5 md:h-full bg-border border-dashed border-border flex items-center justify-center relative min-h-[30px] md:min-h-[160px]">
                                            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black text-muted-foreground/80 bg-card px-2 py-0.5 rounded border border-border shadow-xs whitespace-nowrap">
                                                CORTE
                                            </span>
                                        </div>
                                    </div>

                                    {/* QUADRO 2: RESTANTES DO POOL (ANTI-SISTEMA) */}
                                    {nextRemNumbers.length > 0 && (
                                        <div className="flex-1 w-full max-w-md flex flex-col gap-2 p-3 sm:p-4 rounded-2xl bg-surface-1/40 dark:bg-surface-1/20 border border-border/70 shadow-xs">
                                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    Restantes ({nextRemNumbers.length})
                                                </span>
                                                <span className="text-[10px] font-semibold text-muted-foreground/70">
                                                    Anti-Sistema
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 justify-items-center py-1">
                                                {nextRemNumbers.map((num: number, idx: number) => (
                                                    <div
                                                        key={`next-rem-${num}`}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition-all hover:scale-110 cursor-default bg-card/70 dark:bg-card/40 border border-border/80 text-muted-foreground hover:text-foreground shadow-xs"
                                                        title={`Restante #${halfPoint + idx + 1}: ${num}`}
                                                    >
                                                        {num}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-2 border-t border-border/50">
                                                <SendToWheelingButton
                                                    game={gameKey}
                                                    numbers={nextRemNumbers}
                                                    label={`🛡️ Enviar Restantes (${nextRemNumbers.length})`}
                                                    className="w-full justify-center py-2 px-3 rounded-xl font-bold text-xs bg-surface-2 hover:bg-surface-3 text-foreground border border-border shadow-sm transition-all hover:scale-[1.02]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    A calcular previsão para o próximo sorteio...
                                </div>
                            )}
                        </Card>
                    );
                })()}

                {/* CONSELHO FACTUAL DA MATRIZ DE CORTE (GRELHA TÉRMICA & ORDEM DE RISCO % COM SALVAGUARDA) */}
                <MatrizConselhoCard
                    gameKey={gameKey}
                    gameName={gameConfig.name}
                    gameAccent={gameConfig.ui.accent}
                    suggestedNumbers={nextPredictionFull ? nextPredictionFull.slice(0, halfPoint) : []}
                    systemName={formatSystemName(system.name)}
                />

                {/* History Table com Auditoria de Cálculo Interativa */}
                <SystemHistoryTable
                    predictions={predictions}
                    game={gameKey}
                    systemName={systemName}
                    accentColor={gameConfig.ui.accent}
                    maxNumbers={maxNumbers}
                    halfPoint={halfPoint}
                />
            </div>
            <div className="opacity-70 mt-12 pt-8 border-t border-slate-200 dark:border-zinc-800">
                <ResponsibleGamingFooter />
            </div>
        </div>
    );
}
