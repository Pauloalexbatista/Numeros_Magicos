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

    // All available years sorted chronologically (e.g. 2004..2026)
    const allYears = useMemo(() => {
        return Object.keys(data).sort();
    }, [data]);

    // Range filter: '5' (last 5 years), '10' (last 10 years), or 'all' (all years)
    const [yearRange, setYearRange] = useState<'5' | '10' | 'all'>('5');

    // Selected visible years based on range
    const visibleYears = useMemo(() => {
        if (yearRange === '5') {
            return allYears.slice(-5);
        }
        if (yearRange === '10') {
            return allYears.slice(-10);
        }
        return allYears;
    }, [allYears, yearRange]);

    // Metric toggle: Jackpots vs High Prizes
    const [metric, setMetric] = useState<'jackpot' | 'highPrize'>('jackpot');
    
    // Column sort: 'total' (All-Time) or specific year ('2026', '2025', etc.)
    const [sortKey, setSortKey] = useState<string>('total');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

    const jackpotLabel = isLotofacil ? '15 Acertos 🎯' : `${t('jackpots_label', { num: is6Jackpot ? 6 : 5 })} 🎯`;
    const highPrizeLabel = isLotofacil ? '14 Acertos 🥈' : (is6Jackpot ? 'Prêmios Altos (5) 🥈' : '2º Prêmio (4) 🥈');

    // Aggregate matrix for all systems across all years
    const tableRows = useMemo(() => {
        const systemNames = new Set<string>();
        Object.values(data).forEach(list => {
            list.forEach(item => systemNames.add(item.systemName));
        });

        const rows: {
            systemName: string;
            yearlyJackpots: Record<string, number>;
            yearlyHighPrizes: Record<string, number>;
            allTimeJackpots: number;
            allTimeHighPrizes: number;
            rangeJackpots: number;
            rangeHighPrizes: number;
        }[] = [];

        systemNames.forEach(name => {
            const yearlyJackpots: Record<string, number> = {};
            const yearlyHighPrizes: Record<string, number> = {};
            let atJackpots = 0;
            let atHighPrizes = 0;
            let rngJackpots = 0;
            let rngHighPrizes = 0;

            allYears.forEach(year => {
                const item = data[year]?.find(s => s.systemName === name);
                const j = item?.jackpots || 0;
                const hp = item?.highPrizes || 0;
                yearlyJackpots[year] = j;
                yearlyHighPrizes[year] = hp;
                atJackpots += j;
                atHighPrizes += hp;

                if (visibleYears.includes(year)) {
                    rngJackpots += j;
                    rngHighPrizes += hp;
                }
            });

            // If item has pre-calculated all-time values from actions, prefer them
            const sampleItem = Object.values(data).flatMap(l => l).find(s => s.systemName === name);
            if (sampleItem?.allTimeJackpots != null) {
                atJackpots = sampleItem.allTimeJackpots;
            }
            if (sampleItem?.allTimeHighPrizes != null) {
                atHighPrizes = sampleItem.allTimeHighPrizes;
            }

            rows.push({
                systemName: name,
                yearlyJackpots,
                yearlyHighPrizes,
                allTimeJackpots: atJackpots,
                allTimeHighPrizes: atHighPrizes,
                rangeJackpots: rngJackpots,
                rangeHighPrizes: rngHighPrizes
            });
        });

        // Sort rows
        return rows.sort((a, b) => {
            let valA = 0;
            let valB = 0;

            if (sortKey === 'total') {
                valA = metric === 'jackpot' ? a.allTimeJackpots : a.allTimeHighPrizes;
                valB = metric === 'jackpot' ? b.allTimeJackpots : b.allTimeHighPrizes;
            } else {
                valA = metric === 'jackpot' ? (a.yearlyJackpots[sortKey] || 0) : (a.yearlyHighPrizes[sortKey] || 0);
                valB = metric === 'jackpot' ? (b.yearlyJackpots[sortKey] || 0) : (b.yearlyHighPrizes[sortKey] || 0);
            }

            if (valA !== valB) {
                return sortDir === 'desc' ? valB - valA : valA - valB;
            }

            // Secondary tie-breaker: All-Time total of active metric
            const totA = metric === 'jackpot' ? a.allTimeJackpots : a.allTimeHighPrizes;
            const totB = metric === 'jackpot' ? b.allTimeJackpots : b.allTimeHighPrizes;
            if (totA !== totB) return totB - totA;

            // Tertiary tie-breaker: Most recent year
            const lastYear = allYears[allYears.length - 1];
            const recA = metric === 'jackpot' ? (a.yearlyJackpots[lastYear] || 0) : (a.yearlyHighPrizes[lastYear] || 0);
            const recB = metric === 'jackpot' ? (b.yearlyJackpots[lastYear] || 0) : (b.yearlyHighPrizes[lastYear] || 0);
            return recB - recA;
        });
    }, [data, allYears, visibleYears, metric, sortKey, sortDir]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const firstYear = allYears[0] || '2004';
    const lastYear = allYears[allYears.length - 1] || new Date().getFullYear().toString();

    return (
        <Card className="p-6 glass-card mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--accent)" }}>
                        🏆 {t("champions_title")}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Análise de Jackpots ({isLotofacil ? '15' : is6Jackpot ? '6' : '5'} números) e Prémios Altos por ano, com o <strong className="text-foreground">Total Geral de Sempre</strong> ({firstYear}–{lastYear}).
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Range Filter Pill */}
                    <div className="flex items-center gap-1 p-1 rounded-xl border border-border/60 bg-surface-2/60 text-xs">
                        <button
                            onClick={() => setYearRange('5')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                yearRange === '5'
                                    ? 'bg-surface-3 text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            title="Ver apenas os últimos 5 anos"
                        >
                            5 Anos
                        </button>
                        <button
                            onClick={() => setYearRange('10')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                yearRange === '10'
                                    ? 'bg-surface-3 text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            title="Ver os últimos 10 anos"
                        >
                            10 Anos
                        </button>
                        <button
                            onClick={() => setYearRange('all')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                                yearRange === 'all'
                                    ? 'bg-surface-3 text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            title={`Ver todos os ${allYears.length} anos com scroll lateral`}
                        >
                            <span>Todos ({allYears.length})</span>
                            <span className="text-[10px] text-muted-foreground">↔</span>
                        </button>
                    </div>

                    {/* Metric Toggle Pill */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border/60 bg-surface-2/60">
                        <button
                            onClick={() => { setMetric('jackpot'); setSortKey('total'); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                metric === 'jackpot'
                                    ? 'shadow-sm text-white'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-3/50'
                            }`}
                            style={metric === 'jackpot' ? { backgroundColor: 'var(--accent)', color: '#fff' } : undefined}
                        >
                            <span>🎯 {jackpotLabel}</span>
                        </button>
                        <button
                            onClick={() => { setMetric('highPrize'); setSortKey('total'); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                metric === 'highPrize'
                                    ? 'shadow-sm text-white'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-3/50'
                            }`}
                            style={metric === 'highPrize' ? { backgroundColor: 'var(--accent)', color: '#fff' } : undefined}
                        >
                            <span>🥈 {highPrizeLabel}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable table container */}
            <div className="relative overflow-x-auto -mx-2 sm:mx-0 border border-border/40 rounded-xl">
                <table className="w-full text-left border-collapse min-w-[720px]">
                    <thead>
                        <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider bg-surface-2/30">
                            <th className="py-3 px-3 w-14 sticky left-0 z-20 bg-surface-1/95 backdrop-blur-md">{t("position")}</th>
                            <th className="py-3 px-4 min-w-[190px] sticky left-14 z-20 bg-surface-1/95 backdrop-blur-md border-r border-border/40">{t("system")}</th>
                            
                            {/* Yearly Columns */}
                            {visibleYears.map(year => {
                                const isCurrent = year === lastYear;
                                const isSorted = sortKey === year;
                                return (
                                    <th
                                        key={year}
                                        onClick={() => handleSort(year)}
                                        className={`py-3 px-2.5 text-center cursor-pointer select-none transition-colors hover:text-foreground whitespace-nowrap ${
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

                            {/* TOTAL GERAL Column at the end (Sticky right) */}
                            <th
                                onClick={() => handleSort('total')}
                                className={`py-3 px-4 text-center cursor-pointer select-none transition-colors sticky right-0 z-20 bg-surface-1/95 backdrop-blur-md border-l border-border/50 ${
                                    sortKey === 'total' ? 'font-black text-accent' : 'font-bold text-foreground'
                                }`}
                                style={{ color: "var(--accent)" }}
                                title="Ordenar pelo Total Geral de Toda a História"
                            >
                                <div className="inline-flex items-center gap-1 font-extrabold whitespace-nowrap">
                                    <span>TOTAL GERAL {metric === 'jackpot' ? '🎯' : '🥈'}</span>
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
                                <td colSpan={visibleYears.length + 3} className="py-8 text-center text-sm text-muted-foreground">
                                    Nenhum sistema com prémios registados.
                                </td>
                            </tr>
                        ) : tableRows.map((row, index) => {
                            const totalVal = metric === 'jackpot' ? row.allTimeJackpots : row.allTimeHighPrizes;

                            return (
                                <tr key={row.systemName} className="hover:bg-surface-2/40 transition-colors group">
                                    {/* Position (Sticky left) */}
                                    <td className="py-3 px-3 sticky left-0 z-10 bg-surface-1/95 backdrop-blur-md">
                                        <div className={`
                                            flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs
                                            ${index === 0 ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30 font-black' :
                                                index === 1 ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-border font-bold' :
                                                    index === 2 ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20' :
                                                        'text-muted-foreground'}
                                        `}>
                                            #{index + 1}
                                        </div>
                                    </td>

                                    {/* System Name (Sticky left) */}
                                    <td className="py-3 px-4 sticky left-14 z-10 bg-surface-1/95 backdrop-blur-md border-r border-border/40 whitespace-nowrap">
                                        <span className="font-semibold text-foreground">{row.systemName}</span>
                                        {row.systemName.includes('Platina') && (
                                            <span className="ml-2 text-[10px] bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 font-bold">IA</span>
                                        )}
                                        {row.systemName.includes('Vizinhos') && (
                                            <span className="ml-2 text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 font-bold">FIXO</span>
                                        )}
                                    </td>

                                    {/* Yearly Values */}
                                    {visibleYears.map(year => {
                                        const val = metric === 'jackpot'
                                            ? (row.yearlyJackpots[year] || 0)
                                            : (row.yearlyHighPrizes[year] || 0);

                                        return (
                                            <td key={year} className="py-3 px-2.5 text-center whitespace-nowrap">
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

                                    {/* TOTAL GERAL Column (Sticky right) */}
                                    <td className="py-3 px-4 text-center sticky right-0 z-10 bg-surface-1/95 backdrop-blur-md border-l border-border/50">
                                        <span className={`inline-flex items-center justify-center min-w-[36px] px-2.5 py-1 rounded-md font-extrabold text-sm tabular-nums shadow-sm ${
                                            totalVal > 0
                                                ? 'bg-accent/15 text-accent border border-accent/30'
                                                : 'text-muted-foreground/40'
                                        }`} style={totalVal > 0 ? { color: "var(--accent)" } : undefined}
                                          title={`Total de sempre (${firstYear}-${lastYear}): ${totalVal}`}>
                                            {totalVal}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {yearRange === 'all' && (
                <p className="text-[11px] text-muted-foreground mt-2 text-right">
                    ↔ Podes deslizar a tabela horizontalmente para consultar os anos anteriores até {firstYear}.
                </p>
            )}
        </Card>
    );
}
