'use client';

import { useState, useMemo } from 'react';
import { YearlyStat } from '@/app/ranking/actions';
import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface TopSystemsAnalysisProps {
    data: Record<string, YearlyStat[]>;
    game?: string;
}

export function TopSystemsAnalysis({ data, game = 'EUROMILLIONS' }: TopSystemsAnalysisProps) {
    const t = useTranslations('ranking');
    const isLotofacil = game === 'LOTOFACIL';
    const isEuroDreams = game === 'EURODREAMS';
    const isMegaSena = game === 'MEGASENA';
    const is6Jackpot = isEuroDreams || isMegaSena;
    const isTotoloto = game === 'TOTOLOTO';

    // Last 5 years sorted chronologically
    const currentYearNum = new Date().getFullYear();
    const defaultYears = Array.from({ length: 5 }, (_, i) => (currentYearNum - 4 + i).toString());
    const availableYears = Object.keys(data);
    const years = defaultYears.filter(y => availableYears.includes(y)).length > 0
        ? defaultYears
        : availableYears.sort();

    // Metric toggle: Jackpots vs High Prizes
    const [metric, setMetric] = useState<'jackpot' | 'highPrize'>('jackpot');
    
    // Column sort: 'total' or specific year ('2022', '2023', etc.)
    const [sortKey, setSortKey] = useState<string>('total');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

    const jackpotLabel = isLotofacil ? '15 Acertos 🎯' : `${t('jackpots_label', { num: is6Jackpot ? 6 : 5 })} 🎯`;
    const highPrizeLabel = isLotofacil ? '14 Acertos 🥈' : (is6Jackpot ? 'Prêmios Altos (5) 🥈' : '2º Prêmio (4) 🥈');

    // Aggregate matrix for all systems across the 5 years
    const tableRows = useMemo(() => {
        const systemNames = new Set<string>();
        Object.values(data).forEach(list => {
            list.forEach(item => systemNames.add(item.systemName));
        });

        const rows: {
            systemName: string;
            yearlyJackpots: Record<string, number>;
            yearlyHighPrizes: Record<string, number>;
            totalJackpots: number;
            totalHighPrizes: number;
        }[] = [];

        systemNames.forEach(name => {
            const yearlyJackpots: Record<string, number> = {};
            const yearlyHighPrizes: Record<string, number> = {};
            let totalJackpots = 0;
            let totalHighPrizes = 0;

            years.forEach(year => {
                const item = data[year]?.find(s => s.systemName === name);
                const j = item?.jackpots || 0;
                const hp = item?.highPrizes || 0;
                yearlyJackpots[year] = j;
                yearlyHighPrizes[year] = hp;
                totalJackpots += j;
                totalHighPrizes += hp;
            });

            rows.push({
                systemName: name,
                yearlyJackpots,
                yearlyHighPrizes,
                totalJackpots,
                totalHighPrizes
            });
        });

        // Sort rows
        return rows.sort((a, b) => {
            let valA = 0;
            let valB = 0;

            if (sortKey === 'total') {
                valA = metric === 'jackpot' ? a.totalJackpots : a.totalHighPrizes;
                valB = metric === 'jackpot' ? b.totalJackpots : b.totalHighPrizes;
            } else {
                valA = metric === 'jackpot' ? (a.yearlyJackpots[sortKey] || 0) : (a.yearlyHighPrizes[sortKey] || 0);
                valB = metric === 'jackpot' ? (b.yearlyJackpots[sortKey] || 0) : (b.yearlyHighPrizes[sortKey] || 0);
            }

            if (valA !== valB) {
                return sortDir === 'desc' ? valB - valA : valA - valB;
            }

            // Secondary tie-breaker: Total of active metric
            const totA = metric === 'jackpot' ? a.totalJackpots : a.totalHighPrizes;
            const totB = metric === 'jackpot' ? b.totalJackpots : b.totalHighPrizes;
            if (totA !== totB) return totB - totA;

            // Tertiary tie-breaker: Most recent year
            const lastYear = years[years.length - 1];
            const recA = metric === 'jackpot' ? (a.yearlyJackpots[lastYear] || 0) : (a.yearlyHighPrizes[lastYear] || 0);
            const recB = metric === 'jackpot' ? (b.yearlyJackpots[lastYear] || 0) : (b.yearlyHighPrizes[lastYear] || 0);
            return recB - recA;
        });
    }, [data, years, metric, sortKey, sortDir]);

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
                        🏆 {t("champions_title")}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Histórico dos últimos {years.length} anos de Jackpots ({isLotofacil ? '15' : is6Jackpot ? '6' : '5'} números) e Prémios Altos ({isLotofacil ? '14' : is6Jackpot ? '5' : '4'} números).
                    </p>
                </div>

                {/* Toggle Metric Pill */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border/60 bg-surface-2/60">
                    <button
                        onClick={() => { setMetric('jackpot'); setSortKey('total'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            metric === 'jackpot'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-surface-3/50'
                        }`}
                        style={metric === 'jackpot' ? { backgroundColor: 'var(--accent)', color: '#fff' } : undefined}
                    >
                        <span>🎯 {jackpotLabel}</span>
                    </button>
                    <button
                        onClick={() => { setMetric('highPrize'); setSortKey('total'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            metric === 'highPrize'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-surface-3/50'
                        }`}
                        style={metric === 'highPrize' ? { backgroundColor: 'var(--accent)', color: '#fff' } : undefined}
                    >
                        <span>🥈 {highPrizeLabel}</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full text-left border-collapse min-w-[640px]">
                    <thead>
                        <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                            <th className="py-3 px-3 w-16">{t("position")}</th>
                            <th className="py-3 px-4 min-w-[200px]">{t("system")}</th>
                            
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

                            {/* Total Column at the end */}
                            <th
                                onClick={() => handleSort('total')}
                                className={`py-3 px-4 text-center cursor-pointer select-none transition-colors hover:text-foreground ${
                                    sortKey === 'total' ? 'text-accent font-black' : 'text-foreground font-bold'
                                }`}
                                style={{ color: "var(--accent)" }}
                                title="Ordenar pelo Total dos últimos 5 anos"
                            >
                                <div className="inline-flex items-center gap-1 font-extrabold">
                                    <span>TOTAL {metric === 'jackpot' ? '🎯' : '🥈'}</span>
                                    {sortKey === 'total' && (
                                        <span className="text-[10px]">{sortDir === 'desc' ? '▼' : '▲'}</span>
                                    )}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {tableRows.length === 0 ? (
                            <tr>
                                <td colSpan={years.length + 3} className="py-8 text-center text-sm text-muted-foreground">
                                    Nenhum sistema com prémios registados nos últimos 5 anos.
                                </td>
                            </tr>
                        ) : tableRows.map((row, index) => {
                            const totalVal = metric === 'jackpot' ? row.totalJackpots : row.totalHighPrizes;

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
                                        {row.systemName.includes('Platina') && (
                                            <span className="ml-2 text-[10px] bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 font-bold">IA</span>
                                        )}
                                        {row.systemName.includes('Vizinhos') && (
                                            <span className="ml-2 text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 font-bold">FIXO</span>
                                        )}
                                    </td>

                                    {/* 5 Years Values */}
                                    {years.map(year => {
                                        const val = metric === 'jackpot'
                                            ? (row.yearlyJackpots[year] || 0)
                                            : (row.yearlyHighPrizes[year] || 0);

                                        return (
                                            <td key={year} className="py-3 px-3 text-center">
                                                {val > 0 ? (
                                                    <span className={`font-bold tabular-nums text-sm ${
                                                        metric === 'jackpot'
                                                            ? 'text-foreground font-black'
                                                            : 'text-foreground/90 font-semibold'
                                                    }`}>
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
