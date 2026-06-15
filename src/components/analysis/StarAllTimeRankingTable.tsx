'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface StarRankingMetric {
    systemName: string;
    description: string;
    winRate: number;
    qualityScore: number;
    hits1: number;
    hits2: number;
    totalPredictions: number;
}

interface StarAllTimeRankingTableProps {
    data: StarRankingMetric[];
}

type SortField = 'qualityScore' | 'winRate' | 'hits2';

export default function StarAllTimeRankingTable({ data }: StarAllTimeRankingTableProps) {
    const [sortField, setSortField] = useState<SortField>('qualityScore');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        const factor = sortDirection === 'asc' ? 1 : -1;
        return (a[sortField] - b[sortField]) * factor;
    });

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <span className="opacity-20 ml-1">↕</span>;
        return sortDirection === 'asc' ? <span className="ml-1 text-yellow-600 dark:text-yellow-400">↑</span> : <span className="ml-1 text-yellow-600 dark:text-yellow-400">↓</span>;
    };

    return (
        <Card className="p-6 glass-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-1/50 text-muted-foreground uppercase tracking-wider text-xs border-b border-border/50">
                        <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 rounded-tl-lg font-bold">#</th>
                            <th className="px-4 py-3 font-bold">Sistema</th>
                            <th className="px-4 py-3 text-right cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors font-bold" onClick={() => handleSort('hits2')}>
                                Jackpots (2★) {getSortIcon('hits2')}
                            </th>
                            <th className="px-4 py-3 text-center font-bold">Prémios Altos</th>
                            <th className="px-4 py-3 text-right cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors font-bold" onClick={() => handleSort('winRate')}>
                                Win Rate (1+) {getSortIcon('winRate')}
                            </th>
                            <th className="px-4 py-3 text-right cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors rounded-tr-lg font-bold" onClick={() => handleSort('qualityScore')}>
                                Score {getSortIcon('qualityScore')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {sortedData.map((row, index) => (
                            <tr key={row.systemName} className="hover:bg-surface-2/30 transition-colors">
                                <td className="px-4 py-3 font-bold text-muted-foreground">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-foreground">{row.systemName}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{row.description}</div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`font-bold text-lg ${row.hits2 > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground/50'}`}>
                                        {row.hits2}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-xs">
                                    <div className="flex justify-center gap-2">
                                        <span className="px-2 py-0.5 rounded bg-surface-2 text-foreground border border-border text-muted-foreground" title="1 Estrela">1★: {row.hits1}</span>
                                    </div>
                                    <div className="mt-1 text-muted-foreground text-[10px] uppercase font-bold tracking-tight">Total: {row.totalPredictions}</div>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                    {row.winRate.toFixed(1)}%
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-yellow-600 dark:text-yellow-400 text-lg">
                                    {row.qualityScore}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
