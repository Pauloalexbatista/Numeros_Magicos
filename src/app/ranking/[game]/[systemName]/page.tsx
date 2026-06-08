import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResponsibleGamingFooter from '@/components/ResponsibleGamingFooter';
import { BackButton } from '@/components/ui';
import SystemStatsViewer from '@/components/analysis/SystemStatsViewer';
import SendToWheelingButton from '@/components/SendToWheelingButton';
import { formatSystemName } from '@/utils/formatters';
import { GameType } from '@/types/game';

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
    'totoloto': GameType.TOTOLOTO,
    'eurodreams': GameType.EURODREAMS
};

// Dicionário de temas estáticos para Next.js / Tailwind CSS v4 para evitar classes interpoladas dinamicamente
const gameThemeMap = {
    [GameType.EUROMILLIONS]: {
        bg: "bg-gradient-to-br from-blue-50/30 via-slate-50 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-euro-950/10",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "bg-card/50 backdrop-blur-sm border border-border backdrop-blur-md shadow-sm",
        themeColor: "euro",
        btn: "bg-euro-100 dark:bg-euro-950/40 text-euro-700 dark:text-euro-400 border border-euro-200/50 hover:bg-white dark:hover:bg-zinc-900",
        gradient_light: "from-blue-50/40 via-white/80 to-indigo-50/40 dark:from-zinc-900/60 dark:to-euro-950/30",
        accentText: "text-euro-600 dark:text-euro-400",
        accentBg: "bg-euro-500",
        badge: "bg-euro-500/10 text-euro-700 dark:text-euro-450 border border-euro-200/40"
    },
    [GameType.TOTOLOTO]: {
        bg: "bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-toto-950/10",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "bg-card/50 backdrop-blur-sm border border-border backdrop-blur-md shadow-sm",
        themeColor: "toto",
        btn: "bg-toto-100 dark:bg-toto-950/40 text-toto-700 dark:text-toto-400 border border-toto-200/50 hover:bg-white dark:hover:bg-zinc-900",
        gradient_light: "from-emerald-50/40 via-white/80 to-teal-50/40 dark:from-zinc-900/60 dark:to-toto-950/30",
        accentText: "text-toto-600 dark:text-toto-400",
        accentBg: "bg-toto-500",
        badge: "bg-toto-500/10 text-toto-700 dark:text-toto-450 border border-toto-200/40"
    },
    [GameType.EURODREAMS]: {
        bg: "bg-gradient-to-br from-purple-50/30 via-slate-50 to-pink-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-dream-950/10",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "bg-card/50 backdrop-blur-sm border border-border backdrop-blur-md shadow-sm",
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

    const maxNumbers = gameType === GameType.EURODREAMS ? 6 : 5;

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

    const nextPrediction = nextPred ? JSON.parse(nextPred.numbers) : [];
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

    // Detect anti-system
    const antiSystemName = systemName.startsWith('Anti-')
        ? systemName.substring(5)
        : `Anti-${systemName}`;

    const antiSystem = await prisma.rankedSystem.findUnique({
        where: {
            name_game: {
                name: antiSystemName,
                game: gameType
            }
        }
    });
    const antiSystemExists = !!antiSystem;

    return (
        <div className={`min-h-screen ${currentTheme.bg} p-4 sm:p-6 pb-24 font-sans transition-all duration-500`}>
            <div className="container mx-auto space-y-6 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-card/50 backdrop-blur-sm backdrop-blur-md rounded-2xl border border-border">
                    <div className="flex items-center gap-4">
                        <BackButton href={`/ranking/${game}`} />
                        <div>
                            <h1 className={`text-2xl sm:text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight`}>{formatSystemName(system.name)}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">{system.description || 'Previsão estatística avançada.'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Link
                            href={`/analysis/history/${encodeURIComponent(systemName)}`}
                            className={`px-4 py-2 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2 text-sm ${currentTheme.btn}`}
                        >
                            📊 Análise Histórica
                        </Link>
                        {antiSystemExists && (
                            <Link
                                href={`/analysis/compare?system1=${encodeURIComponent(systemName)}&system2=${encodeURIComponent(antiSystemName)}`}
                                className="px-4 py-2 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 hover:bg-white dark:hover:bg-zinc-900 border border-purple-200 dark:border-purple-900/50 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2 text-sm"
                            >
                                🔄 Comparar Inverso
                            </Link>
                        )}
                    </div>
                </div>

                {/* LIGHT BULB EXPLANATION CARD (Dynamic from DB) */}
                {((system as any).concept || (system as any).logic) && (
                    <Card className={`p-6 ${currentTheme.card}`}>
                        <h3 className={`text-lg font-bold ${currentTheme.accentText} mb-3 flex items-center gap-2`}>
                            💡 Como Funciona Este Sistema
                        </h3>
                        <div className="text-slate-650 dark:text-zinc-350 space-y-4 leading-relaxed">
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
                <Card className={`p-6 sm:p-8 bg-gradient-to-br ${currentTheme.gradient_light} border border-border shadow-sm relative overflow-hidden group rounded-2xl`}>
                    <div className="absolute top-0 right-0 p-4 text-zinc-300/30 dark:text-zinc-700/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-9xl filter drop-shadow-sm select-none">🔮</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <h2 className={`text-xl font-extrabold ${currentTheme.accentText} flex items-center gap-2 shrink-0`}>
                            <span className="animate-pulse">✨</span> Próxima Previsão
                        </h2>
                        {nextPrediction && nextPrediction.length > 0 && (
                            <SendToWheelingButton
                                numbers={nextPrediction}
                                label="Enviar para Desdobramentos"
                                className="shadow-sm border-none bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-bold hover:scale-102 transition-transform py-2.5 px-4"
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 mt-6 relative z-10 w-fit">
                        {nextPrediction && nextPrediction.length > 0 ? (
                            nextPrediction.map((num: number) => (
                                <div key={num} className="relative group/num flex justify-center">
                                    <div className="absolute inset-0 bg-card/50 backdrop-blur-sm rounded-full blur-md group-hover/num:blur-lg transition-all"></div>
                                    <div className={`
                                         relative w-11 h-11 flex items-center justify-center rounded-full text-xl font-black shadow-md border-2 
                                         bg-card/50 backdrop-blur-sm text-foreground border-border
                                         hover:scale-105 transition-transform cursor-default
                                    `}>
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

                    <p className="text-muted-foreground text-xs sm:text-sm mt-6 relative z-10 font-medium">
                        Sugestão para o próximo sorteio baseada no algoritmo {formatSystemName(system.name)}.
                    </p>
                </Card>

                {/* HOT STATS (Last 20 Draws) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className={`p-6 ${currentTheme.card} rounded-2xl`}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🔥</span>
                            <h3 className="text-lg font-bold text-foreground">Forma Recente (20 Sorteios)</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-slate-500 dark:text-zinc-400 text-sm">Precisão Média</div>
                                <div className={`text-2xl font-black ${(uniquePerformances.slice(0, 20).reduce((a, b) => a + ((Math.min(maxNumbers, b.hits) / maxNumbers) * 100), 0) / Math.min(20, uniquePerformances.length)) >= 60
                                    ? `${currentTheme.accentText}` : 'text-zinc-700 dark:text-zinc-300'
                                    }`}>
                                    {(uniquePerformances.slice(0, 20).reduce((a, b) => a + ((Math.min(maxNumbers, b.hits) / maxNumbers) * 100), 0) / Math.min(20, uniquePerformances.length) || 0).toFixed(1)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 dark:text-zinc-400 text-sm">Acertos Altos (4 ou 5)</div>
                                <div className="text-2xl font-black text-foreground">
                                    {uniquePerformances.slice(0, 20).filter(p => p.hits >= 4).length} <span className="text-sm text-slate-400 dark:text-zinc-500 font-medium">vezes</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className={`p-6 ${currentTheme.card} rounded-2xl`}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">⚡</span>
                            <h3 className="text-lg font-bold text-foreground">Frequência de Impacto</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-slate-500 dark:text-zinc-400 text-sm">Intervalo Médio (&gt;4 Acertos)</div>
                                <div className={`text-2xl font-black ${currentTheme.accentText}`}>
                                    {uniquePerformances.slice(0, 20).filter(p => p.hits >= 4).length > 0
                                        ? `1 a cada ${(20 / uniquePerformances.slice(0, 20).filter(p => p.hits >= 4).length).toFixed(1)} sorteios`
                                        : 'Sem registo recente'}
                                </div>
                                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1.5 font-medium">Baseado nos últimos 20 sorteios</p>
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
                <Card className={`bg-card/50 backdrop-blur-sm border border-border shadow-sm overflow-hidden rounded-2xl`}>
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Histórico de Previsões</h2>
                        <span className="text-sm text-muted-foreground font-semibold">Últimos 50 Sorteios</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Sorteio Real</th>
                                    <th className="p-4">Previsão (Top 20)</th>
                                    <th className="p-4 text-center">Acertos</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {predictions.slice(0, 50).map((pred: any) => {
                                    const predicted = pred.predictedNumbers;
                                    const actual = pred.drawNumbers;

                                    return (
                                        <tr key={pred.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/30 transition-colors">
                                            <td className="p-4 text-slate-650 dark:text-zinc-300 font-semibold whitespace-nowrap">
                                                {new Date(pred.date).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    {actual.map((n: number) => (
                                                        <span key={n} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold shadow-sm">
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
                                                            <span key={idx} className={`
                                                                 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold
                                                                 ${isHit ? 'bg-green-500 text-white shadow-sm' : 'bg-card/50 backdrop-blur-sm border border-slate-250 dark:border-zinc-800 text-slate-400 dark:text-zinc-500'}
                                                             `}>
                                                                {n}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`
                                                    inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold
                                                    ${pred.hits >= 3 ? 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200/50' :
                                                        pred.hits >= 1 ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-750 dark:text-yellow-400 border border-yellow-100/50' :
                                                            'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'}
                                                `}>
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
