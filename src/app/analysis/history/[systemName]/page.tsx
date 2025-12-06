import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, TrendingUp, Award } from 'lucide-react';
import JackpotsChart from '@/components/analysis/JackpotsChart';
import CycleDetectionCard from '@/components/analysis/CycleDetectionCard';
import AntiSystemComparison from '@/components/analysis/AntiSystemComparison';

interface YearlyStats {
    year: number;
    total: number;
    jackpots: number;
    highPrizes: number;
    avgHits: number;
    jackpotRate: number;
}

interface Peak {
    year: number;
    jackpots: number;
    type: 'peak' | 'valley';
}

async function analyzeSystem(systemName: string) {
    const performances = await prisma.systemPerformance.findMany({
        where: { systemName },
        include: {
            draw: {
                select: { date: true }
            }
        },
        orderBy: {
            draw: { date: 'asc' }
        }
    });

    if (performances.length === 0) {
        return null;
    }

    // Group by year
    const yearlyStats: Record<number, {
        total: number;
        jackpots: number;
        highPrizes: number;
        hits: number[];
    }> = {};

    performances.forEach(perf => {
        const year = perf.draw.date.getFullYear();

        if (!yearlyStats[year]) {
            yearlyStats[year] = {
                total: 0,
                jackpots: 0,
                highPrizes: 0,
                hits: []
            };
        }

        yearlyStats[year].total++;
        yearlyStats[year].hits.push(perf.hits);

        if (perf.hits === 5) yearlyStats[year].jackpots++;
        if (perf.hits === 4) yearlyStats[year].highPrizes++;
    });

    const years = Object.keys(yearlyStats).map(Number).sort();
    const yearlyData: YearlyStats[] = years.map(year => {
        const stats = yearlyStats[year];
        const avgHits = stats.hits.reduce((a, b) => a + b, 0) / stats.total;
        const jackpotRate = (stats.jackpots / stats.total) * 100;

        return {
            year,
            total: stats.total,
            jackpots: stats.jackpots,
            highPrizes: stats.highPrizes,
            avgHits: Number(avgHits.toFixed(2)),
            jackpotRate: Number(jackpotRate.toFixed(2))
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

    // Calculate cycle pattern
    const gaps: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
        gaps.push(peaks[i].year - peaks[i - 1].year);
    }
    const averageGap = gaps.length > 0
        ? Number((gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1))
        : 0;

    return {
        systemName,
        totalPerformances: performances.length,
        yearlyData,
        peaks,
        valleys,
        cyclePattern: {
            averageGap,
            gaps
        }
    };
}

// Detect anti-system
function getAntiSystemName(systemName: string): string | null {
    if (systemName.startsWith('Anti-')) {
        // Remove "Anti-" prefix
        return systemName.substring(5);
    } else {
        // Add "Anti-" prefix
        return `Anti-${systemName}`;
    }
}

export default async function SystemHistoryPage({ params }: { params: { systemName: string } }) {
    const systemName = decodeURIComponent(params.systemName);
    const analysis = await analyzeSystem(systemName);

    if (!analysis) {
        notFound();
    }

    // Try to find anti-system
    const antiSystemName = getAntiSystemName(systemName);
    const antiAnalysis = antiSystemName ? await analyzeSystem(antiSystemName) : null;

    const currentYear = new Date().getFullYear();
    const currentYearData = analysis.yearlyData.find(d => d.year === currentYear);
    const totalJackpots = analysis.yearlyData.reduce((sum, d) => sum + d.jackpots, 0);

    // Calculate correlation if anti-system exists
    let inverseExtremes = 0;
    let totalExtremes = 0;
    const extremeYears: { year: number; system1: number; system2: number }[] = [];

    if (antiAnalysis) {
        analysis.yearlyData.forEach(data1 => {
            const data2 = antiAnalysis.yearlyData.find(d => d.year === data1.year);
            if (!data2) return;

            const isHigh1 = data1.jackpots >= 5;
            const isLow1 = data1.jackpots <= 1;
            const isHigh2 = data2.jackpots >= 5;
            const isLow2 = data2.jackpots <= 1;

            if ((isHigh1 && isLow2) || (isLow1 && isHigh2)) {
                inverseExtremes++;
                extremeYears.push({ year: data1.year, system1: data1.jackpots, system2: data2.jackpots });
            }
            if ((isHigh1 || isLow1) && (isHigh2 || isLow2)) {
                totalExtremes++;
            }
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <Link
                    href="/ranking"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Ranking
                </Link>

                <h1 className="text-4xl font-bold mb-2">{systemName}</h1>
                <p className="text-zinc-400">Análise Histórica Completa (2004-{currentYear})</p>
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

            {/* Cycle Detection */}
            <div className="max-w-7xl mx-auto mb-8">
                <CycleDetectionCard
                    peaks={analysis.peaks}
                    valleys={analysis.valleys}
                    cyclePattern={analysis.cyclePattern}
                />
            </div>

            {/* Anti-System Comparison */}
            {antiAnalysis && antiSystemName && (
                <div className="max-w-7xl mx-auto mb-8">
                    <AntiSystemComparison
                        systemName={systemName}
                        antiSystemName={antiSystemName}
                        inverseExtremes={inverseExtremes}
                        totalExtremes={totalExtremes}
                        extremeYears={extremeYears}
                    />
                </div>
            )}

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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Jackpots (5)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Prémios (4)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Média Acertos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Taxa Jackpot</th>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`font-bold ${data.jackpots > 5 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                                    {data.jackpots}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{data.highPrizes}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{data.avgHits}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{data.jackpotRate}%</td>
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
