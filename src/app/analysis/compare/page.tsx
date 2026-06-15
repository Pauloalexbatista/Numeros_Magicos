import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { BackButton } from '@/components/ui';

export const dynamic = 'force-dynamic';

interface SearchParams {
    system1?: string;
    system2?: string;
    game?: string;
}

interface YearlyData {
    year: number;
    jackpots: number;
    highPrizes: number;
    mediumPrizes: number;
    avgHits: number;
}

interface SystemData {
    name: string;
    totalPredictions: number;
    avgAccuracy: number;
    yearlyData: YearlyData[];
    totals: {
        jackpots: number;
        highPrizes: number;
        mediumPrizes: number;
    };
}

async function getSystemData(systemName: string, game: string): Promise<SystemData | null> {
    const system = await prisma.rankedSystem.findFirst({
        where: {
            name: systemName,
            game
        }
    });

    if (!system) return null;

    // Use SystemPerformance which has the 'hits' field
    const performances = await prisma.systemPerformance.findMany({
        where: {
            systemName,
            draw: { game }  // filter via draw relation since game is on draw
        },
        include: { draw: true },
        orderBy: { draw: { date: 'asc' } }
    });

    // Get ranking info separately
    const ranking = await prisma.systemRanking.findFirst({
        where: { systemName } as any
    });

    // Group by year
    const yearlyMap = new Map<number, { jackpots: number; high: number; medium: number; total: number; count: number }>();

    performances.forEach(perf => {
        const year = new Date(perf.draw.date).getFullYear();
        if (!yearlyMap.has(year)) {
            yearlyMap.set(year, { jackpots: 0, high: 0, medium: 0, total: 0, count: 0 });
        }
        const yearData = yearlyMap.get(year)!;

        // Game-aware hit levels
        const is6Jackpot = game === 'EURODREAMS' || game === 'MEGASENA';
        const jpLevel = is6Jackpot ? 6 : 5;
        const highLevel = is6Jackpot ? 5 : 4;
        const mediumLevel = is6Jackpot ? 4 : 3;

        if (perf.hits === jpLevel) yearData.jackpots++;
        else if (perf.hits === highLevel) yearData.high++;
        else if (perf.hits === mediumLevel) yearData.medium++;

        yearData.total += perf.hits;
        yearData.count++;
    });

    const yearlyData: YearlyData[] = Array.from(yearlyMap.entries())
        .map(([year, data]) => ({
            year,
            jackpots: data.jackpots,
            highPrizes: data.high,
            mediumPrizes: data.medium,
            avgHits: data.count > 0 ? data.total / data.count : 0
        }))
        .sort((a, b) => b.year - a.year);

    const totals = yearlyData.reduce((acc, year) => ({
        jackpots: acc.jackpots + year.jackpots,
        highPrizes: acc.highPrizes + year.highPrizes,
        mediumPrizes: acc.mediumPrizes + year.mediumPrizes
    }), { jackpots: 0, highPrizes: 0, mediumPrizes: 0 });

    return {
        name: systemName,
        totalPredictions: performances.length,
        avgAccuracy: ranking?.avgAccuracy || 0,
        yearlyData,
        totals
    };
}

export default async function ComparisonPage({
    searchParams
}: {
    searchParams: Promise<SearchParams>
}) {
    // Await searchParams in Next.js 15+
    const params = await searchParams;
    const system1Name = params.system1;
    const system2Name = params.system2;

    if (!system1Name || !system2Name) {
        redirect('/ranking');
    }

    const gameType = params.game?.toUpperCase() || 'EUROMILLIONS';

    const [system1Data, system2Data] = await Promise.all([
        getSystemData(decodeURIComponent(system1Name), gameType),
        getSystemData(decodeURIComponent(system2Name), gameType)
    ]);

    if (!system1Data || !system2Data) {
        notFound();
    }

    // Calculate correlation
    let inverseCorrelation = 0;
    let totalYears = 0;
    const correlationYears: { year: number; s1: number; s2: number }[] = [];

    system1Data.yearlyData.forEach(y1 => {
        const y2 = system2Data.yearlyData.find(y => y.year === y1.year);
        if (!y2) return;

        totalYears++;
        const isHigh1 = y1.jackpots >= 5;
        const isLow1 = y1.jackpots <= 1;
        const isHigh2 = y2.jackpots >= 5;
        const isLow2 = y2.jackpots <= 1;

        if ((isHigh1 && isLow2) || (isLow1 && isHigh2)) {
            inverseCorrelation++;
            correlationYears.push({ year: y1.year, s1: y1.jackpots, s2: y2.jackpots });
        }
    });

    const inversePercentage = totalYears > 0 ? (inverseCorrelation / totalYears) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="container mx-auto space-y-8 max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton href="/ranking" />
                        <div>
                            <h1 className="text-3xl font-bold text-white">Comparação de Sistemas</h1>
                            <p className="text-slate-400">Análise lado-a-lado</p>
                        </div>
                    </div>
                    <Link
                        href={`/analysis/compare?system1=${encodeURIComponent(system2Name)}&system2=${encodeURIComponent(system1Name)}`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                        🔄 Trocar Sistemas
                    </Link>
                </div>

                {/* System Names */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-6 bg-gradient-to-br from-blue-900/40 to-blue-900/20 border-blue-500/30">
                        <h2 className="text-2xl font-bold text-white mb-2">{system1Data.name}</h2>
                        <p className="text-blue-200">Sistema Principal</p>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-purple-900/20 border-purple-500/30">
                        <h2 className="text-2xl font-bold text-white mb-2">{system2Data.name}</h2>
                        <p className="text-purple-200">Sistema Comparado</p>
                    </Card>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-slate-400 mb-1">Precisão Média</div>
                                <div className="text-3xl font-bold text-blue-400">{system1Data.avgAccuracy.toFixed(1)}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-400 mb-1">Total Previsões</div>
                                <div className="text-2xl font-bold text-white">{system1Data.totalPredictions}</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-slate-900/50 border-slate-800">
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-slate-400 mb-1">Precisão Média</div>
                                <div className="text-3xl font-bold text-purple-400">{system2Data.avgAccuracy.toFixed(1)}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-400 mb-1">Total Previsões</div>
                                <div className="text-2xl font-bold text-white">{system2Data.totalPredictions}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Prize Comparison Table */}
                <Card className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-500/30 overflow-hidden">
                    <div className="p-6 border-b border-emerald-800/30">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            🏆 Comparação de Prémios
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    <th className="p-4 text-left text-slate-300">Métrica</th>
                                    <th className="p-4 text-center text-blue-300">{system1Data.name}</th>
                                    <th className="p-4 text-center text-purple-300">{system2Data.name}</th>
                                    <th className="p-4 text-center text-slate-300">Diferença</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                <tr className="hover:bg-slate-800/30">
                                    <td className="p-4 text-white font-semibold">Jackpots (5 acertos)</td>
                                    <td className="p-4 text-center text-blue-400 font-bold text-xl">{system1Data.totals.jackpots}</td>
                                    <td className="p-4 text-center text-purple-400 font-bold text-xl">{system2Data.totals.jackpots}</td>
                                    <td className="p-4 text-center">
                                        <span className={`font-bold ${system1Data.totals.jackpots > system2Data.totals.jackpots ? 'text-emerald-400' : system1Data.totals.jackpots < system2Data.totals.jackpots ? 'text-red-400' : 'text-slate-400'}`}>
                                            {system1Data.totals.jackpots > system2Data.totals.jackpots ? '+' : ''}{system1Data.totals.jackpots - system2Data.totals.jackpots}
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-800/30">
                                    <td className="p-4 text-white font-semibold">Prémios Altos (4 acertos)</td>
                                    <td className="p-4 text-center text-blue-400 font-bold text-xl">{system1Data.totals.highPrizes}</td>
                                    <td className="p-4 text-center text-purple-400 font-bold text-xl">{system2Data.totals.highPrizes}</td>
                                    <td className="p-4 text-center">
                                        <span className={`font-bold ${system1Data.totals.highPrizes > system2Data.totals.highPrizes ? 'text-emerald-400' : system1Data.totals.highPrizes < system2Data.totals.highPrizes ? 'text-red-400' : 'text-slate-400'}`}>
                                            {system1Data.totals.highPrizes > system2Data.totals.highPrizes ? '+' : ''}{system1Data.totals.highPrizes - system2Data.totals.highPrizes}
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-800/30">
                                    <td className="p-4 text-white font-semibold">Prémios Médios (3 acertos)</td>
                                    <td className="p-4 text-center text-blue-400 font-bold text-xl">{system1Data.totals.mediumPrizes}</td>
                                    <td className="p-4 text-center text-purple-400 font-bold text-xl">{system2Data.totals.mediumPrizes}</td>
                                    <td className="p-4 text-center">
                                        <span className={`font-bold ${system1Data.totals.mediumPrizes > system2Data.totals.mediumPrizes ? 'text-emerald-400' : system1Data.totals.mediumPrizes < system2Data.totals.mediumPrizes ? 'text-red-400' : 'text-slate-400'}`}>
                                            {system1Data.totals.mediumPrizes > system2Data.totals.mediumPrizes ? '+' : ''}{system1Data.totals.mediumPrizes - system2Data.totals.mediumPrizes}
                                        </span>
                                    </td>
                                </tr>
                                <tr className="bg-slate-900/50 hover:bg-slate-800/50">
                                    <td className="p-4 text-white font-bold">Total de Prémios</td>
                                    <td className="p-4 text-center text-blue-400 font-bold text-2xl">
                                        {system1Data.totals.jackpots + system1Data.totals.highPrizes + system1Data.totals.mediumPrizes}
                                    </td>
                                    <td className="p-4 text-center text-purple-400 font-bold text-2xl">
                                        {system2Data.totals.jackpots + system2Data.totals.highPrizes + system2Data.totals.mediumPrizes}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`font-bold text-lg ${(system1Data.totals.jackpots + system1Data.totals.highPrizes + system1Data.totals.mediumPrizes) >
                                            (system2Data.totals.jackpots + system2Data.totals.highPrizes + system2Data.totals.mediumPrizes)
                                            ? 'text-emerald-400'
                                            : (system1Data.totals.jackpots + system1Data.totals.highPrizes + system1Data.totals.mediumPrizes) <
                                                (system2Data.totals.jackpots + system2Data.totals.highPrizes + system2Data.totals.mediumPrizes)
                                                ? 'text-red-400'
                                                : 'text-slate-400'
                                            }`}>
                                            {(system1Data.totals.jackpots + system1Data.totals.highPrizes + system1Data.totals.mediumPrizes) >
                                                (system2Data.totals.jackpots + system2Data.totals.highPrizes + system2Data.totals.mediumPrizes)
                                                ? '+'
                                                : ''}
                                            {(system1Data.totals.jackpots + system1Data.totals.highPrizes + system1Data.totals.mediumPrizes) -
                                                (system2Data.totals.jackpots + system2Data.totals.highPrizes + system2Data.totals.mediumPrizes)}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Yearly Comparison Table */}
                <Card className="bg-slate-900/40 border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-2xl font-bold text-white">📊 Comparação Anual</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    <th className="p-4 text-left text-slate-300">Ano</th>
                                    <th className="p-4 text-center text-blue-300" colSpan={2}>{system1Data.name}</th>
                                    <th className="p-4 text-center text-purple-300" colSpan={2}>{system2Data.name}</th>
                                    <th className="p-4 text-center text-slate-300">Diferença</th>
                                </tr>
                                <tr className="bg-slate-900/50">
                                    <th className="p-3 text-left text-slate-400 text-xs"></th>
                                    <th className="p-3 text-center text-slate-400 text-xs">Jackpots</th>
                                    <th className="p-3 text-center text-slate-400 text-xs">Prémios 4</th>
                                    <th className="p-3 text-center text-slate-400 text-xs">Jackpots</th>
                                    <th className="p-3 text-center text-slate-400 text-xs">Prémios 4</th>
                                    <th className="p-3 text-center text-slate-400 text-xs">Jackpots</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {system1Data.yearlyData.map(y1 => {
                                    const y2 = system2Data.yearlyData.find(y => y.year === y1.year);
                                    if (!y2) return null;

                                    const diff = y1.jackpots - y2.jackpots;
                                    return (
                                        <tr key={y1.year} className="hover:bg-slate-800/30">
                                            <td className="p-4 font-bold text-white">{y1.year}</td>
                                            <td className="p-4 text-center text-blue-400 font-semibold">{y1.jackpots}</td>
                                            <td className="p-4 text-center text-blue-300">{y1.highPrizes}</td>
                                            <td className="p-4 text-center text-purple-400 font-semibold">{y2.jackpots}</td>
                                            <td className="p-4 text-center text-purple-300">{y2.highPrizes}</td>
                                            <td className="p-4 text-center">
                                                <span className={`font-bold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                                    {diff > 0 ? '+' : ''}{diff}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Correlation Analysis */}
                <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
                    <div className="p-6 border-b border-purple-800/30">
                        <h2 className="text-2xl font-bold text-white">⚡ Análise de Correlação</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/50">
                                <div className="text-xs text-purple-300 mb-1">Anos Analisados</div>
                                <div className="text-2xl font-bold text-white">{totalYears}</div>
                            </div>
                            <div className="bg-pink-900/30 rounded-lg p-4 border border-pink-700/50">
                                <div className="text-xs text-pink-300 mb-1">Comportamento Inverso</div>
                                <div className="text-2xl font-bold text-white">{inverseCorrelation}</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-700/50">
                                <div className="text-xs text-purple-300 mb-1">Taxa de Correlação Inversa</div>
                                <div className="text-2xl font-bold text-white">{inversePercentage.toFixed(1)}%</div>
                            </div>
                        </div>

                        {correlationYears.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-purple-300 mb-3">
                                    🔥 Anos com Comportamento Inverso
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {correlationYears.slice(0, 10).map(({ year, s1, s2 }) => (
                                        <div
                                            key={year}
                                            className="flex items-center justify-between p-3 rounded-lg bg-purple-950/50 border border-purple-800/50"
                                        >
                                            <span className="font-bold text-white">{year}</span>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className={`font-bold ${s1 >= 5 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {s1 >= 5 ? '🔥' : '❄️'} {s1}
                                                    </div>
                                                </div>
                                                <div className="text-purple-500">↔</div>
                                                <div className="text-left">
                                                    <div className={`font-bold ${s2 >= 5 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {s2 >= 5 ? '🔥' : '❄️'} {s2}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-700/30">
                            <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 Interpretação</h4>
                            <p className="text-sm text-purple-200">
                                {inversePercentage > 60 ? (
                                    <>
                                        <strong className="text-emerald-400">Correlação Inversa Forte!</strong> Quando um sistema está quente (&ge;5 jackpots),
                                        o outro tende a estar frio (&le;1 jackpot). Excelente para diversificação de estratégias.
                                    </>
                                ) : inversePercentage > 40 ? (
                                    <>
                                        <strong className="text-yellow-400">Correlação Inversa Moderada.</strong> Há alguma tendência inversa,
                                        mas os sistemas também podem estar quentes/frios ao mesmo tempo.
                                    </>
                                ) : (
                                    <>
                                        <strong className="text-zinc-400">Correlação Inversa Fraca.</strong> Os sistemas comportam-se de forma
                                        independente na maioria dos anos.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
