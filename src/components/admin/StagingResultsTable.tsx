'use client';

import { useState } from 'react';
import { commitStagingAction, clearStagingAction } from '@/app/actions/staging-actions';

interface StagingResult {
    id: number;
    drawId: number;
    systemName: string;
    predictedNumbers: string;
    actualNumbers: string;
    hits: number;
    accuracy: number;
    createdAt: Date;
}

interface Props {
    results: StagingResult[];
    systemName: string;
}

export default function StagingResultsTable({ results, systemName }: Props) {
    const [isCommitting, setIsCommitting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const averageAccuracy = results.length > 0
        ? results.reduce((acc, curr) => acc + curr.accuracy, 0) / results.length
        : 0;

    const handleCommit = async () => {
        if (!confirm('Are you sure you want to commit these results to the LIVE ranking?')) return;
        setIsCommitting(true);
        const res = await commitStagingAction(systemName);
        alert(res.message);
        setIsCommitting(false);
    };

    const handleClear = async () => {
        if (!confirm('Are you sure you want to delete these test results?')) return;
        setIsClearing(true);
        const res = await clearStagingAction(systemName);
        alert(res.message);
        setIsClearing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{systemName} (Staging)</h2>
                    <div className="flex gap-4 text-sm text-gray-600">
                        <span>Draws: <strong className="text-gray-900">{results.length}</strong></span>
                        <span>
                            Avg Accuracy: <strong className={`${averageAccuracy >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {averageAccuracy.toFixed(2)}%
                            </strong>
                            <span className="text-gray-400 font-normal ml-1">
                                (vs Random: 50%)
                            </span>
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={async () => {
                            const { exportStagingToCSV } = await import('@/app/actions/staging-actions');
                            const res = await exportStagingToCSV(systemName);
                            if (res.success && res.csv) {
                                const blob = new Blob([res.csv], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = res.filename || 'export.csv';
                                a.click();
                            } else {
                                alert(res.message);
                            }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium shadow-sm flex items-center gap-2"
                    >
                        <span>📊</span> Export Excel
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={isClearing}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                    >
                        {isClearing ? 'A limpar...' : 'Descartar Teste'}
                    </button>
                    <button
                        onClick={handleCommit}
                        disabled={isCommitting}
                        className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors font-medium shadow-sm"
                    >
                        {isCommitting ? 'A gravar...' : 'Commit to Production'}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Draw ID</th>
                            <th className="px-6 py-4">Predicted</th>
                            <th className="px-6 py-4">Actual</th>
                            <th className="px-6 py-4">Hits</th>
                            <th className="px-6 py-4">Accuracy</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {results.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-900">#{row.drawId}</td>
                                <td className="px-6 py-4 font-mono text-xs max-w-xs truncate text-gray-600" title={row.predictedNumbers}>
                                    {row.predictedNumbers}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs max-w-xs truncate text-gray-600" title={row.actualNumbers}>
                                    {row.actualNumbers}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${row.hits >= 3 ? 'bg-emerald-100 text-emerald-700' :
                                            row.hits > 0 ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-500'
                                        }`}>
                                        {row.hits}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`${row.accuracy >= 60 ? 'text-emerald-600 font-bold' :
                                            row.accuracy >= 20 ? 'text-blue-600' :
                                                'text-gray-400'
                                        }`}>
                                        {row.accuracy.toFixed(0)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
