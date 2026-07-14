import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, TrendingUp, Award } from 'lucide-react';
import JackpotsChart from '@/components/analysis/JackpotsChart';
import CycleDetectionCard from '@/components/analysis/CycleDetectionCard';
import RecoveryStatsCard from '@/components/analysis/RecoveryStatsCard';
import SecondaryPrizesChart from '@/components/analysis/SecondaryPrizesChart';
import SystemRadarChart from '@/components/analysis/SystemRadarChart';
import AntiSystemComparison from '@/components/analysis/AntiSystemComparison';

interface YearlyStats {
    year: number;
    total: number;
    jackpots: number;
    antiJackpots: number;
    highPrizes: number;
    avgHits: number;
    hitsDistribution: Record<number, number>;
}

interface Peak {
    year: number;
    jackpots: number;
    type: 'peak' | 'valley';
}

interface PrizeRecoveryStats {
    currentStreak: number;
    averageDrawsBetween: number;
    maxDrawsBetween: number;
    status: 'hot' | 'warming' | 'cold';
}

interface RecoveryStats {
    jackpot: PrizeRecoveryStats;
    highPrize: PrizeRecoveryStats;
}

interface RadarStats {
    consistency: number;
    frequency: number;
    resilience: number;
    power: number;
}



async function analyzeSystem(systemName: string, gameParam: string) {
    console.log(`[DEBUG] analyzeSystem called with systemName: "${systemName}", gameParam: "${gameParam}"`);
    const performances = await prisma.systemPerformance.findMany({
        where: { systemName, game: gameParam },
        include: {
            draw: {
                select: { date: true, game: true }
            }
        },
        orderBy: {
            draw: { date: 'asc' }
        }
    });

    if (performances.length === 0) {
        throw new Error(`Data not found for systemName: "${systemName}", gameParam: "${gameParam}"`);
        return null;
    }

    // Determine game type and max numbers
    const game = performances[0].draw.game;
    const maxNumbers = (game === 'EURODREAMS' || game === 'MEGASENA') ? 6 : 5;

    // Group by year
    const yearlyStats: Record<number, {
        total: number;
        jackpots: number;
        antiJackpots: number;
        highPrizes: number;
        hits: number[];
    }> = {};

    performances.forEach(perf => {
        const year = perf.draw.date.getFullYear();

        if (!yearlyStats[year]) {
            yearlyStats[year] = {
                total: 0,
                jackpots: 0,
                antiJackpots: 0,
                highPrizes: 0,
                hits: []
            };
        }

        yearlyStats[year].total++;
        yearlyStats[year].hits.push(perf.hits);

        if (perf.hits === maxNumbers) yearlyStats[year].jackpots++;
        if (perf.hits === 0) yearlyStats[year].antiJackpots++;
        if (perf.hits === maxNumbers - 1) yearlyStats[year].highPrizes++;
    });

    const minYear = performances.length > 0 ? performances[0].draw.date.getFullYear() : new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - minYear + 1 }, (_, i) => minYear + i);

    const yearlyData: YearlyStats[] = years.map(year => {
        const stats = yearlyStats[year] || {
            total: 0,
            jackpots: 0,
            antiJackpots: 0,
            highPrizes: 0,
            hits: []
        };
        const avgHits = stats.total > 0 ? stats.hits.reduce((a, b) => a + b, 0) / stats.total : 0;
        
        const hitsDistribution: Record<number, number> = {};
        for (let i = 0; i <= maxNumbers; i++) hitsDistribution[i] = 0;
        stats.hits.forEach(h => {
            if (hitsDistribution[h] !== undefined) hitsDistribution[h]++;
        });

        return {
            year,
            total: stats.total,
            jackpots: stats.jackpots,
            antiJackpots: stats.antiJackpots,
            highPrizes: stats.highPrizes,
            avgHits: Number(avgHits.toFixed(2)),
            hitsDistribution
        };
    });

    // Detect peaks and valleys
    const peaks: Peak[] = [];
    const valleys: Peak[] = [];

    for (let i = 1; i < yearlyData.length - 1; i++) {
        const prev = yearlyData[i - 1].jackpots;
        const curr = yearlyData[i].jackpots;
        const next = yearlyData[i + 1].jackpots;

        if (curr > prev && curr > next) {
            peaks.push({ year: yearlyData[i].year, jackpots: curr, type: 'peak' });
        } else if (curr < prev && curr < next) {
            valleys.push({ year: yearlyData[i].year, jackpots: curr, type: 'valley' });
        }
    }

    // Calculate Recovery Stats
    function calcRecovery(targetHits: number): PrizeRecoveryStats {
        let lastIndex = -1;
        let intervals: number[] = [];
        performances.forEach((perf, index) => {
            if (perf.hits === targetHits) {
                if (lastIndex !== -1) intervals.push(index - lastIndex);
                lastIndex = index;
            }
        });
        const currentStreak = lastIndex !== -1 ? (performances.length - 1 - lastIndex) : performances.length;
        const averageDrawsBetween = intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : 0;
        const maxDrawsBetween = intervals.length > 0 ? Math.max(...intervals) : performances.length;
        
        let status: 'hot' | 'warming' | 'cold' = 'cold';
        if (averageDrawsBetween > 0) {
            if (currentStreak >= averageDrawsBetween) status = 'hot';
            else if (currentStreak >= averageDrawsBetween * 0.7) status = 'warming';
        }
        return { currentStreak, averageDrawsBetween, maxDrawsBetween, status };
    }

    const recoveryStats: RecoveryStats = {
        jackpot: calcRecovery(maxNumbers),
        highPrize: calcRecovery(maxNumbers - 1)
    };

    

    // Calculate Radar Stats
    const yearsWithHits = yearlyData.filter(d => d.jackpots > 0 || d.highPrizes > 0).length;
    const consistency = yearlyData.length > 0 ? Math.round((yearsWithHits / yearlyData.length) * 100) : 0;

    const globalJackpotRate = performances.length > 0 ? (yearlyData.reduce((s,d) => s+d.jackpots, 0) / performances.length) * 100 : 0;
    const frequency = Math.min(100, Math.round(globalJackpotRate * 50));

    const resilience = recoveryStats.jackpot.averageDrawsBetween > 0 ? Math.min(100, Math.round(Math.max(0, 100 - (recoveryStats.jackpot.averageDrawsBetween * 2)))) : 0;

    const globalHighPrizeRate = performances.length > 0 ? (yearlyData.reduce((s,d) => s+d.highPrizes, 0) / performances.length) * 100 : 0;
    const power = Math.min(100, Math.round(globalHighPrizeRate * 20));

    const radarStats: RadarStats = {
        consistency,
        frequency,
        resilience,
        power
    };

    // Calculate cycle pattern
    const gaps: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
        gaps.push(peaks[i].year - peaks[i - 1].year);
    }
    const averageGap = gaps.length > 0
        ? Number((gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1))
        : 0;

    return {
        startYear: minYear,
        systemName,
        game,
        maxNumbers,
        allHits: performances.map(p => ({ year: p.draw.date.getFullYear(), hits: p.hits })),
        totalPerformances: performances.length,
        yearlyData,
        peaks,
        valleys,
        cyclePattern: {
            averageGap,
            gaps
        },
        recoveryStats,
        radarStats
    };
}



export default async function SystemHistoryPage({ params, searchParams }: { params: any, searchParams: any }) {
    const resolvedParams = await Promise.resolve(params);
    const resolvedSearchParams = await Promise.resolve(searchParams);
    const encodedName = resolvedParams.systemName;
    const gameParam = resolvedSearchParams?.game;
    const game = (gameParam || 'EUROMILLIONS').toUpperCase();
    const systemNameRaw = decodeURIComponent(encodedName);
    let systemName = systemNameRaw;
    let analysis = await analyzeSystem(systemName, game);

    // FALLBACK: Handle cases where '+' in URL might be decoded as ' ' or vice-versa
    if (!analysis && (systemNameRaw.includes(' ') || systemNameRaw.includes('+'))) {
        const alternativeName = systemNameRaw.includes('+')
            ? systemNameRaw.replace(/\+/g, ' ')
            : systemNameRaw.replace(/ /g, '+');

        console.log('[DEBUG] Trying alternative name match (History):', alternativeName);
        analysis = await analyzeSystem(alternativeName, game);

        if (analysis) {
            systemName = alternativeName;
        }
    }

    if (!analysis) {
        console.log(`[DEBUG] 404 triggered for "${systemName}" and game "${game}"`);
        notFound();
    }

    // MIRROR LOGIC: Generate Anti-System on the fly
    

    const currentYear = new Date().getFullYear();
    const currentYearData = analysis.yearlyData.find(d => d.year === currentYear);
    const totalJackpots = analysis.yearlyData.reduce((sum, d) => sum + d.jackpots, 0);



    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <Link
                    href={`/ranking/${game.toLowerCase()}/${encodeURIComponent(systemNameRaw)}`}
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Ranking
                </Link>

                <h1 className="text-4xl font-bold mb-2 text-white">{systemName}</h1>
                <p className="text-zinc-300">Análise Histórica Completa ({analysis.startYear}-{currentYear})</p>
            </div>

            {/* Summary Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-xl p-6 border border-emerald-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-6 h-6 text-emerald-300" />
                        <span className="text-emerald-200 text-sm">Total Jackpots</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{totalJackpots}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-6 h-6 text-blue-300" />
                        <span className="text-blue-200 text-sm">Anos Analisados</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{analysis.yearlyData.length}</div>
                </div>

                <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-purple-300" />
                        <span className="text-purple-200 text-sm">Picos Detectados</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{analysis.peaks.length}</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl p-6 border border-yellow-700">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🏆</span>
                        <span className="text-yellow-200 text-sm">{currentYear}</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {currentYearData?.jackpots || 0} jackpots
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="max-w-7xl mx-auto mb-8">
                <JackpotsChart
                    yearlyData={analysis.yearlyData}
                    peaks={analysis.peaks}
                    valleys={analysis.valleys}
                    systemName={systemName}
                />
            </div>

            {/* Tempo de Recuperação / Streak */}
            <div className="max-w-7xl mx-auto mb-8">
                <RecoveryStatsCard stats={analysis.recoveryStats} />
            </div>

            {/* Chart Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <SystemRadarChart stats={analysis.radarStats} systemName={systemName} />
                <SecondaryPrizesChart data={analysis.yearlyData} />
            </div>

            {/* Anti System Section */}
            <div className="max-w-7xl mx-auto mb-8">
                <AntiSystemComparison 
                    systemName={systemName} 
                    recoveryStatus={analysis.recoveryStats.jackpot.status} 
                    currentStreak={analysis.recoveryStats.jackpot.currentStreak} 
                />
            </div>

            {/* Cycle Detection */}
            <div className="max-w-7xl mx-auto mb-8">
                <CycleDetectionCard
                    peaks={analysis.peaks}
                    valleys={analysis.valleys}
                    cyclePattern={analysis.cyclePattern}
                />
            </div>



            {/* Yearly Data Table */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="p-6 border-b border-zinc-800">
                        <h3 className="text-xl font-bold text-white">📅 Dados Anuais Detalhados</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Ano</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Sorteios</th>
                                    {[...Array(analysis.maxNumbers + 1)].map((_, i) => (
                                        <th key={i} className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                                            {analysis.maxNumbers - i} Acertos
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Média Acertos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {analysis.yearlyData.map((data) => {
                                    const isPeak = analysis.peaks.some(p => p.year === data.year);
                                    const isValley = analysis.valleys.some(v => v.year === data.year);

                                    return (
                                        <tr
                                            key={data.year}
                                            className={`
                                                ${isPeak ? 'bg-emerald-950/30' : ''}
                                                ${isValley ? 'bg-red-950/30' : ''}
                                                hover:bg-zinc-800/50 transition-colors
                                            `}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                {data.year}
                                                {isPeak && <span className="ml-2">📈</span>}
                                                {isValley && <span className="ml-2">📉</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{data.total}</td>
                                            {[...Array(analysis.maxNumbers + 1)].map((_, i) => {
                                                const hits = analysis.maxNumbers - i;
                                                const count = data.hitsDistribution[hits] || 0;
                                                return (
                                                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
        count === 0 ? 'text-zinc-600' :
        hits === analysis.maxNumbers ? 'bg-emerald-500/30 text-emerald-300 font-bold' :
        hits === 0 ? 'bg-purple-500/30 text-purple-300 font-bold' :
        count > 15 ? 'bg-blue-600/60 text-white font-bold' :
        count > 10 ? 'bg-blue-500/40 text-blue-100 font-bold' :
        count > 5 ? 'bg-blue-400/20 text-blue-200' :
        'text-zinc-300'
    }`}>
        {count}
    </div>
</td>
                                                );
                                            })}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{data.avgHits}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
