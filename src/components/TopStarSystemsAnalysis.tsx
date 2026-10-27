'use client';

import { useState, useMemo } from 'react';
import { YearlyStarStat } from '@/app/analysis/stars/actions';
import { Card } from '@/components/ui/card';

interface TopStarSystemsAnalysisProps {
    data: Record<string, YearlyStarStat[]>;
    game?: string;
    themeMode?: 'light' | 'dark';
}

export function TopStarSystemsAnalysis({ data, game = 'EUROMILLIONS', themeMode }: TopStarSystemsAnalysisProps) {
    const isTotoloto = game === 'TOTOLOTO';
    const isEuroDreams = game === 'EURODREAMS';
    const isSpecialGame = isTotoloto || isEuroDreams;

    // Terminology
    const titleTerm = isTotoloto ? 'Número da Sorte' : isEuroDreams ? 'Número de Sonho' : 'Estrelas';
    const jackpotLabel = isTotoloto ? 'Jackpots (1) 🏆' : isEuroDreams ? 'Jackpots (1) 🏆' : 'Jackpots (2) 🏆';
    const secondaryLabel = isTotoloto ? 'N/A' : isEuroDreams ? 'N/A' : '1 Estrela ★';

    // Last 5 years sorted chronologically
    const currentYearNum = new Date().getFullYear();
    const defaultYears = Array.from({ length: 5 }, (_, i) => (currentYearNum - 4 + i).toString());
    const availableYears = Object.keys(data);
    const years = defaultYears.filter(y => availableYears.includes(y)).length > 0
        ? defaultYears
        : availableYears.sort();

    // Metric toggle (only relevant for EuroMillions where there are 2 stars vs 1 star)
    const [metric, setMetric] = useState<'jackpot' | 'secondary'>('jackpot');

    // Sorting state
    const [sortKey, setSortKey] = useState<string>('total');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

    const tableRows = useMemo(() => {
        const systemNames = new Set<string>();
        Object.values(data).forEach(list => {
            list.forEach(item => systemNames.add(item.systemName));
        });

        const rows: {
            systemName: string;
            yearlyJackpots: Record<string, number>;
            yearlySecondary: Record<string, number>;
            totalJackpots: number;
            totalSecondary: number;
        }[] = [];

        systemNames.forEach(name => {
            const yearlyJackpots: Record<string, number> = {};
            const yearlySecondary: Record<string, number> = {};
            let totalJackpots = 0;
            let totalSecondary = 0;

            years.forEach(year => {
                const item = data[year]?.find(s => s.systemName === name);
                const j = isSpecialGame ? (item?.hits1 || 0) : (item?.hits2 || 0);
                const sec = item?.hits1 || 0;
                yearlyJackpots[year] = j;
                yearlySecondary[year] = sec;
                totalJackpots += j;
                totalSecondary += sec;
            });

            rows.push({
                systemName: name,
                yearlyJackpots,
                yearlySecondary,
                totalJackpots,
                totalSecondary
            });
        });

        return rows.sort((a, b) => {
            let valA = 0;
            let valB = 0;

            if (sortKey === 'total') {
                valA = metric === 'jackpot' ? a.totalJackpots : a.totalSecondary;
                valB = metric === 'jackpot' ? b.totalJackpots : b.totalSecondary;
            } else {
                valA = metric === 'jackpot' ? (a.yearlyJackpots[sortKey] || 0) : (a.yearlySecondary[sortKey] || 0);
                valB = metric === 'jackpot' ? (b.yearlyJackpots[sortKey] || 0) : (b.yearlySecondary[sortKey] || 0);
            }

            if (valA !== valB) {
                return sortDir === 'desc' ? valB - valA : valA - valB;
            }

            const totA = metric === 'jackpot' ? a.totalJackpots : a.totalSecondary;
            const totB = metric === 'jackpot' ? b.totalJackpots : b.totalSecondary;
            return totB - totA;
        });
    }, [data, years, isSpecialGame, metric, sortKey, sortDir]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    return (
        <Card className="p-6 glass-card mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--accent)" }}>
                        🏆 Liga dos Campeões ({titleTerm})
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Histórico de prémios máximos dos últimos {years.length} anos.
                    </p>
                </div>

                {!isSpecialGame && (
                    <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border/60 bg-surface-2/60">
                        <button
                            onClick={() => { setMetric('jackpot'); setSortKey('total'); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                metric === 'jackpot'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-3/50'
                            }`}
                            style={metric === 'jackpot' ? { backgroundColor: 'var(--accent)', color: '#fff' } : undefined}
                        >
                            <span>🏆 2 Estrelas</span>
                        </button>
                        <button
                            onClick={() => { setMetric('secondary'); setSortKey('total'); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                metric === 'secondary'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-3/50'
                            }`}
                            style={metric === 'secondary' ? { backgroundColor: 'var(--accent)', color: '#fff' } : undefined}
                        >
                            <span>★ 1 Estrela</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full text-left border-collapse min-w-[640px]">
                    <thead>
                        <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                            <th className="py-3 px-3 w-16">Posição</th>
                            <th className="py-3 px-4 min-w-[200px]">Sistema</th>

                            {/* 5 Years Columns */}
                            {years.map(year => {
                                const isCurrent = year === currentYearNum.toString();
                                const isSorted = sortKey === year;
                                return (
                                    <th
                                        key={year}
                                        onClick={() => handleSort(year)}
                                        className={`py-3 px-3 text-center cursor-pointer select-none transition-colors hover:text-foreground ${
                                            isCurrent ? 'font-black text-foreground' : ''
                                        } ${isSorted ? 'text-accent font-bold' : ''}`}
                                        title={`Ordenar por ${year}`}
                                    >
                                        <div className="inline-flex items-center gap-1">
                                            <span>{year}</span>
                                            {isSorted && (
                                                <span className="text-[10px]">{sortDir === 'desc' ? '▼' : '▲'}</span>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}

                            {/* Total Column at the End */}
                            <th
                                onClick={() => handleSort('total')}
                                className={`py-3 px-4 text-center cursor-pointer select-none transition-colors hover:text-foreground ${
                                    sortKey === 'total' ? 'text-accent font-black' : 'text-foreground font-bold'
                                }`}
                                style={{ color: "var(--accent)" }}
                                title="Ordenar pelo Total dos últimos 5 anos"
                            >
                                <div className="inline-flex items-center gap-1 font-extrabold">
                                    <span>TOTAL 🏆</span>
                                    {sortKey === 'total' && (
                                        <span className="text-[10px]">{sortDir === 'desc' ? '▼' : '▲'}</span>
                                    )}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {tableRows.map((row, index) => {
                            const totalVal = metric === 'jackpot' ? row.totalJackpots : row.totalSecondary;

                            return (
                                <tr key={row.systemName} className="hover:bg-surface-2/40 transition-colors">
                                    {/* Position */}
                                    <td className="py-3 px-3">
                                        <div className={`
                                            flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs
                                            ${index === 0 ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30 font-black' :
                                                index === 1 ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-border font-bold' :
                                                    index === 2 ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20' :
                                                        'text-muted-foreground'}
                                        `}>
                                            #{index + 1}
                                        </div>
                                    </td>

                                    {/* System Name */}
                                    <td className="py-3 px-4">
                                        <span className="font-semibold text-foreground">{row.systemName}</span>
                                    </td>

                                    {/* 5 Years Values */}
                                    {years.map(year => {
                                        const val = metric === 'jackpot'
                                            ? (row.yearlyJackpots[year] || 0)
                                            : (row.yearlySecondary[year] || 0);

                                        return (
                                            <td key={year} className="py-3 px-3 text-center">
                                                {val > 0 ? (
                                                    <span className="font-black tabular-nums text-sm text-foreground">
                                                        {val}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/30 text-xs font-light">-</span>
                                                )}
                                            </td>
                                        );
                                    })}

                                    {/* Total Column at the End */}
                                    <td className="py-3 px-4 text-center">
                                        <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-md font-extrabold text-sm tabular-nums ${
                                            totalVal > 0
                                                ? 'bg-accent/15 text-accent border border-accent/25'
                                                : 'text-muted-foreground/40'
                                        }`} style={totalVal > 0 ? { color: "var(--accent)" } : undefined}>
                                            {totalVal}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
