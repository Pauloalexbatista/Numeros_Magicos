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
        bg: "bg-gradient-to-br from-amber-50/30 via-slate-50 to-yellow-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-amber-950/10",
        title: "text-zinc-800 dark:text-zinc-100",
        subtitle: "text-muted-foreground",
        card: "bg-card/50 backdrop-blur-sm border border-border backdrop-blur-md shadow-sm",
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

    // Fetch NEXT draw prediction
    const nextPrediction = await getStarPrediction(systemName, gameType);

    // Calculate distribution for stats (based on game history)
    const distribution = [0, 0, 0]; // [0 hits, 1 hit, 2 hits]
    let totalHits = 0;

    gameHistory.forEach(p => {
        const hits = Math.min(2, Math.max(0, p.hits));
        distribution[hits]++;
        totalHits += hits;
    });

    const accuracy = gameHistory.length > 0
        ? ((totalHits / gameHistory.length) / 2) * 100
        : 0;

    const stats = {
        accuracy,
        totalPredictions: gameHistory.length,
        distribution
    };

    // Prepare history for table
    const predictions = gameHistory.map(p => ({
        id: p.id,
        date: p.draw.date.toISOString(),
        actualStars: JSON.parse(p.draw.stars || '[]'),
        predictedStars: JSON.parse(p.predictedStars || '[]'),
        hits: p.hits
    }));

    const isTotoloto = gameType === GameType.TOTOLOTO;
    const isEuroDreams = gameType === GameType.EURODREAMS;

    // Obter o tema correto estático
    const currentTheme = gameThemeMap[gameType] || gameThemeMap[GameType.EUROMILLIONS];

    return (
        <div className={`min-h-screen ${currentTheme.bg} p-4 sm:p-6 pb-24 font-sans transition-all duration-500 game-page-${gameKey}`}>
            <div className="container mx-auto space-y-6 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-card/50 backdrop-blur-sm backdrop-blur-md rounded-2xl border border-border">
                    <div className="flex items-center gap-4">
                        <BackButton href={`/analysis/stars/ranking/${game}`} />
                        <div>
                            <h1 className={`text-2xl sm:text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight`}>{system.systemName}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Sistema de previsão de {isTotoloto ? 'N.º da Sorte' : isEuroDreams ? 'N.º de Sonho' : 'Estrelas'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 1. HOW IT WORKS / CONCEPT (from DB if available) */}
                {((system as any).concept || (system as any).logic) && (
                    <Card className={`p-6 ${currentTheme.card}`}>
                        <h3 className={`text-lg font-bold ${currentTheme.accentText} mb-3 flex items-center gap-2`}>
                            💡 Como Funciona Este Sistema
                        </h3>
                        <div className="text-slate-655 dark:text-zinc-350 space-y-4 leading-relaxed">
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
                            nextPrediction.map((num: number, idx: number) => (
                                <div key={idx} className="relative group/num flex justify-center">
                                    <div className="absolute inset-0 bg-card/50 backdrop-blur-sm rounded-full blur-md group-hover/num:blur-lg transition-all"></div>
                                    <div className="relative w-11 h-11 flex items-center justify-center rounded-full text-xl font-black shadow-md border-2 bg-card/50 backdrop-blur-sm text-foreground border-border hover:scale-105 transition-transform cursor-default">
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
                        Sugestão para o próximo sorteio baseada no algoritmo {system.systemName}.
                    </p>
                </Card>

                {/* ACCURACY & STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Accuracy Card */}
                    <Card className={`p-6 ${currentTheme.card} rounded-2xl`}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🎯</span>
                            <h3 className="text-lg font-bold text-foreground">Precisão Global</h3>
                        </div>
                        <div className={`text-4xl font-black ${stats.accuracy >= 50 ? 'text-emerald-600' : 'text-slate-700 dark:text-zinc-300'}`}>
                            {stats.accuracy.toFixed(1)}%
                        </div>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2 font-medium">Baseado em {stats.totalPredictions} sorteios</p>
                    </Card>

                    {/* Distribution Card */}
                    <Card className={`p-6 ${currentTheme.card} rounded-2xl col-span-1 md:col-span-2`}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">📊</span>
                            <h3 className="text-lg font-bold text-foreground">Distribuição de Acertos</h3>
                        </div>
                        <div className={`grid grid-cols-${isEuroDreams || isTotoloto ? 2 : 3} gap-4`}>
                            {(isEuroDreams || isTotoloto ? [0, 1] : [0, 1, 2]).map(hits => (
                                <div key={hits} className="text-center p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800">
                                    <div className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">{hits} Acerto(s)</div>
                                    <div className={`text-2xl font-bold ${hits === (isEuroDreams || isTotoloto ? 1 : 2) ? currentTheme.accentText : 'text-zinc-700 dark:text-zinc-300'}`}>
                                        {stats.distribution[hits]}
                                    </div>
                                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
                                        {Math.round((stats.distribution[hits] / stats.totalPredictions) * 100)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Interactive Stats Viewer - Pass game prop for styling inside */}
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
                                    <th className="p-4">Previsão ({isTotoloto ? 'N. Sorte' : isEuroDreams ? 'N. Sonho' : 'Estrelas'})</th>
                                    <th className="p-4 text-center">Acertos</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {predictions.slice(0, 50).map((pred: any) => {
                                    const predicted = pred.predictedStars;
                                    const actual = pred.actualStars;

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
                                                <div className="flex gap-1">
                                                    {predicted.map((n: number, idx: number) => {
                                                        const isHit = actual.includes(n);
                                                        return (
                                                            <span key={idx} className={`
                                                                 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                                                 ${isHit ? 'bg-green-500 text-white shadow-sm' : 'bg-card/80 border border-slate-250 dark:border-zinc-800 text-slate-400 dark:text-zinc-500'}
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
                                                    ${pred.hits === (isEuroDreams ? 1 : 2) ? 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200/50' :
                                                        pred.hits >= 1 ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-750 dark:text-yellow-400 border border-yellow-100/50' :
                                                            'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'}
                                                `}>
                                                    {pred.hits}/{isEuroDreams || isTotoloto ? 1 : 2}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <div className="opacity-70 mt-12 pt-8 border-t border-slate-200 dark:border-zinc-800">
                <ResponsibleGamingFooter />
            </div>
        </div>
    );
}
