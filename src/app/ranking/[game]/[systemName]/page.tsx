
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

export default async function SystemDetailsPage({ params }: Props) {
    const { game, systemName: encodedName } = await params;

    // Safety decode
    const systemName = decodeURIComponent(encodedName);

    const gameKey = game.toLowerCase();
    const gameType = GAME_MAP[gameKey];

    if (!gameType) {
        notFound();
    }

    // Theme Configuration (Light Mode)
    // EM: Amber, TL: Emerald, ED: Rose
    const theme = (gameType === GameType.EURODREAMS) ? {
        primary: 'rose',
        bg: 'bg-rose-50',
        title: 'text-rose-900',
        subtitle: 'text-rose-600',
        accent: 'rose-600',
        border: 'border-rose-100',
        card: 'bg-white',
        btn: 'bg-rose-100 text-rose-700',
        gradient_light: 'from-rose-50 to-pink-50'
    } : (gameType === GameType.TOTOLOTO) ? {
        primary: 'emerald',
        bg: 'bg-emerald-50',
        title: 'text-emerald-900',
        subtitle: 'text-emerald-600',
        accent: 'emerald-600',
        border: 'border-emerald-100',
        card: 'bg-white',
        btn: 'bg-emerald-100 text-emerald-700',
        gradient_light: 'from-emerald-50 to-green-50'
    } : {
        primary: 'amber', // Yellow for Euromillions
        bg: 'bg-amber-50',
        title: 'text-amber-900',
        subtitle: 'text-amber-600',
        accent: 'amber-600',
        border: 'border-amber-100',
        card: 'bg-white',
        btn: 'bg-amber-100 text-amber-800',
        gradient_light: 'from-amber-50 to-yellow-50'
    };

    const themeColor = (gameType === GameType.TOTOLOTO) ? 'emerald' : (gameType === GameType.EURODREAMS) ? 'rose' : 'amber';

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
        <div className={`min-h-screen ${theme.bg} p-6 pb-24 font-sans`}>
            <div className="container mx-auto space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <BackButton href={`/ranking/${game}`} />
                        <div>
                            <h1 className={`text-3xl font-bold ${theme.title}`}>{formatSystemName(system.name)}</h1>
                            <p className={`${theme.subtitle} opacity-80`}>{system.description || 'Previsão estatística avançada.'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/analysis/history/${encodeURIComponent(systemName)}`}
                            className={`px-4 py-2 ${theme.btn} hover:bg-white border md:border-${themeColor}-200 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2`}
                        >
                            📊 Análise Histórica
                        </Link>
                        {antiSystemExists && (
                            <Link
                                href={`/analysis/compare?system1=${encodeURIComponent(systemName)}&system2=${encodeURIComponent(antiSystemName)}`}
                                className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-white border border-purple-200 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2"
                            >
                                🔄 Comparar Inverso
                            </Link>
                        )}
                    </div>
                </div>

                {/* 📖 EXPLANATION CARD (Dynamic from DB) */}
                {((system as any).concept || (system as any).logic) && (
                    <Card className={`p-6 bg-white border-${themeColor}-100 shadow-sm`}>
                        <h3 className={`text-lg font-bold text-${themeColor}-700 mb-3 flex items-center gap-2`}>
                            💡 Como Funciona Este Sistema
                        </h3>
                        <div className="text-slate-600 space-y-4">
                            {(system as any).concept && (
                                <p><strong className={`text-${themeColor}-600`}>Conceito:</strong> {(system as any).concept}</p>
                            )}
                            {(system as any).logic && (
                                <div className="text-sm">
                                    <strong className={`text-${themeColor}-600`}>Lógica:</strong>
                                    <p className="mt-1 leading-relaxed">{(system as any).logic}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
                <Card className={`p-8 bg-gradient-to-br ${theme.gradient_light} border border-${themeColor}-100 shadow-sm relative overflow-hidden group`}>
                    <div className={`absolute top-0 right-0 p-4 text-${themeColor}-200/50 group-hover:text-${themeColor}-200 transition-colors`}>
                        <span className="text-9xl">🔮</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <h2 className={`text-xl font-bold text-${themeColor}-800 flex items-center gap-2 shrink-0`}>
                            <span className="animate-pulse">✨</span> Próxima Previsão
                        </h2>
                        {nextPrediction && nextPrediction.length > 0 && (
                            <SendToWheelingButton
                                numbers={nextPrediction}
                                label="Enviar para Desdobramentos"
                                className={`bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 shadow-sm border-none`}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mt-6 relative z-10">
                        {nextPrediction && nextPrediction.length > 0 ? (
                            nextPrediction.map((num: number) => (
                                <div key={num} className="relative group/num flex justify-center">
                                    <div className={`absolute inset-0 bg-${themeColor}-400/20 rounded-full blur-md group-hover/num:blur-lg transition-all`}></div>
                                    <div className={`
                                         relative w-10 h-10 flex items-center justify-center rounded-full text-lg font-black shadow-md border-2 
                                         bg-white text-${themeColor}-700 border-${themeColor}-200
                                    `}>
                                        {num}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={`flex flex-col items-center md:items-start text-${themeColor}-500/60`}>
                                <div className="italic mb-2">Previsão indisponível no momento...</div>
                                <div className="text-xs bg-white/50 px-2 py-1 rounded inline-block">
                                    SYSTEM_ID: {systemName} | CACHE: MISSING
                                </div>
                            </div>
                        )}
                    </div>

                    <p className={`text-${themeColor}-800/60 text-sm mt-6 relative z-10`}>
                        Sugestão para o próximo sorteio baseada no algoritmo {formatSystemName(system.name)}.
                    </p>
                </Card>

                {/* 🔥 HOT STATS (Last 20 Draws) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-white border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🔥</span>
                            <h3 className="text-lg font-bold text-slate-800">Forma Recente (20 Sorteios)</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-slate-500 text-sm">Precisão Média</div>
                                <div className={`text-2xl font-bold ${(uniquePerformances.slice(0, 20).reduce((a, b) => a + ((Math.min(maxNumbers, b.hits) / maxNumbers) * 100), 0) / Math.min(20, uniquePerformances.length)) >= 60
                                    ? `text-${themeColor}-600` : 'text-slate-700'
                                    }`}>
                                    {(uniquePerformances.slice(0, 20).reduce((a, b) => a + ((Math.min(maxNumbers, b.hits) / maxNumbers) * 100), 0) / Math.min(20, uniquePerformances.length) || 0).toFixed(1)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-sm">Acertos Altos (4 ou 5)</div>
                                <div className="text-2xl font-bold text-slate-800">
                                    {uniquePerformances.slice(0, 20).filter(p => p.hits >= 4).length} <span className="text-sm text-slate-400 font-normal">vezes</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">⚡</span>
                            <h3 className="text-lg font-bold text-slate-800">Frequência de Impacto</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-slate-500 text-sm">Intervalo Médio (&gt;4 Acertos)</div>
                                <div className={`text-2xl font-bold text-${themeColor}-600`}>
                                    {uniquePerformances.slice(0, 20).filter(p => p.hits >= 4).length > 0
                                        ? `1 a cada ${(20 / uniquePerformances.slice(0, 20).filter(p => p.hits >= 4).length).toFixed(1)} sorteios`
                                        : 'Sem registo recente'}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Baseado nos últimos 20 sorteios</p>
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
                <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Histórico de Previsões</h2>
                        <span className="text-sm text-slate-500">Últimos 50 Sorteios</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Sorteio Real</th>
                                    <th className="p-4">Previsão (Top 20)</th>
                                    <th className="p-4 text-center">Acertos</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {predictions.slice(0, 50).map((pred: any) => {
                                    // Static file already has arrays, no JSON.parse needed
                                    const predicted = pred.predictedNumbers;
                                    const actual = pred.drawNumbers;

                                    return (
                                        <tr key={pred.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-slate-600 font-medium">
                                                {new Date(pred.date).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    {actual.map((n: number) => (
                                                        <span key={n} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
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
                                                                 ${isHit ? 'bg-green-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-400'}
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
                                                    ${pred.hits >= 3 ? 'bg-green-100 text-green-700 border border-green-200' :
                                                        pred.hits >= 1 ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                                                            'bg-slate-100 text-slate-400'}
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
            <div className="opacity-70 mt-12 pt-8 border-t border-slate-200">
                <ResponsibleGamingFooter />
            </div>
        </div >
    );
}
