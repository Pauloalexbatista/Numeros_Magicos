
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface RankingMetric {
    systemName: string;
    description: string;
    accuracy: number;
    winRate: number;
    qualityScore: number;
    hits3: number;
    hits4: number;
    hits5: number;
    totalPredictions: number;
}

interface AllTimeRankingTableProps {
    data: RankingMetric[];
}

type SortField = 'qualityScore' | 'winRate' | 'accuracy' | 'hits5';

export default function AllTimeRankingTable({ data }: AllTimeRankingTableProps) {
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
        return sortDirection === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
    };

    return (
        <Card className="p-6 bg-slate-900/40 border-slate-800 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">#</th>
                            <th className="px-4 py-3">Sistema</th>
                            <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('hits5')}>
                                Jackpots (5★) {getSortIcon('hits5')}
                            </th>
                            <th className="px-4 py-3 text-center">Prémios</th>
                            <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('accuracy')}>
                                Precisão {getSortIcon('accuracy')}
                            </th>
                            <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('winRate')}>
                                Win Rate (3+) {getSortIcon('winRate')}
                            </th>
                            <th className="px-4 py-3 text-right cursor-pointer hover:text-white rounded-tr-lg" onClick={() => handleSort('qualityScore')}>
                                Score {getSortIcon('qualityScore')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {sortedData.map((row, index) => (
                            <tr key={row.systemName} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-500">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-200">{row.systemName}</div>
                                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{row.description}</div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`font-bold ${row.hits5 > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>
                                        {row.hits5}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-xs">
                                    <div className="flex justify-center gap-2">
                                        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400" title="4 Acertos">4★: {row.hits4}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400" title="3 Acertos">3★: {row.hits3}</span>
                                    </div>
                                    <div className="mt-1 text-slate-600">Total: {row.totalPredictions}</div>
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-slate-300">
                                    {row.accuracy.toFixed(1)}%
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-emerald-400">
                                    {row.winRate.toFixed(1)}%
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-blue-400 text-lg">
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
