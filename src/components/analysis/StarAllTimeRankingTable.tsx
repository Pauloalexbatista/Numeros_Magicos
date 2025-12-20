
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
        return sortDirection === 'asc' ? <span className="ml-1 text-yellow-500">↑</span> : <span className="ml-1 text-yellow-500">↓</span>;
    };

    return (
        <Card className="p-6 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 backdrop-blur-sm overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-zinc-50 dark:bg-zinc-900 text-zinc-500">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg font-bold">#</th>
                            <th className="px-4 py-3 font-bold">Sistema</th>
                            <th className="px-4 py-3 text-right cursor-pointer hover:text-yellow-600 transition-colors font-bold" onClick={() => handleSort('hits2')}>
                                Jackpots (2★) {getSortIcon('hits2')}
                            </th>
                            <th className="px-4 py-3 text-center font-bold">Prémios Altos</th>
                            <th className="px-4 py-3 text-right cursor-pointer hover:text-yellow-600 transition-colors font-bold" onClick={() => handleSort('winRate')}>
                                Win Rate (1+) {getSortIcon('winRate')}
                            </th>
                            <th className="px-4 py-3 text-right cursor-pointer hover:text-yellow-600 transition-colors rounded-tr-lg font-bold" onClick={() => handleSort('qualityScore')}>
                                Score {getSortIcon('qualityScore')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {sortedData.map((row, index) => (
                            <tr key={row.systemName} className="hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10 transition-colors">
                                <td className="px-4 py-3 font-black text-zinc-400">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{row.systemName}</div>
                                    <div className="text-xs text-zinc-500 truncate max-w-[200px]">{row.description}</div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`font-black text-lg ${row.hits2 > 0 ? 'text-yellow-500' : 'text-zinc-300 dark:text-zinc-700'}`}>
                                        {row.hits2}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-xs">
                                    <div className="flex justify-center gap-2">
                                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400" title="1 Estrela">1★: {row.hits1}</span>
                                    </div>
                                    <div className="mt-1 text-zinc-500 text-[10px] uppercase font-bold tracking-tight">Total: {row.totalPredictions}</div>
                                </td>
                                <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                                    {row.winRate.toFixed(1)}%
                                </td>
                                <td className="px-4 py-3 text-right font-black text-yellow-600 dark:text-yellow-400 text-lg">
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
