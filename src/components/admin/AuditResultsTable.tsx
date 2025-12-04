'use client';

import { useState } from 'react';
import { runSystemDiagnostics, DiagnosticResult } from '@/app/admin/audit/actions';

export default function AuditResultsTable() {
    const [results, setResults] = useState<DiagnosticResult[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastRun, setLastRun] = useState<Date | null>(null);

    const handleRunDiagnostics = async () => {
        setLoading(true);
        try {
            const data = await runSystemDiagnostics();
            setResults(data);
            setLastRun(new Date());
        } catch (error) {
            console.error('Failed to run diagnostics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div>
                    <h2 className="text-lg font-bold">Controlo de Qualidade</h2>
                    <p className="text-sm text-zinc-500">
                        {lastRun
                            ? `Última execução: ${lastRun.toLocaleTimeString()}`
                            : 'Nenhum diagnóstico executado ainda.'}
                    </p>
                </div>
                <button
                    onClick={handleRunDiagnostics}
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${loading
                            ? 'bg-zinc-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            A Executar...
                        </span>
                    ) : (
                        '▶ Executar Diagnóstico'
                    )}
                </button>
            </div>

            {results && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="p-4 font-medium">Sistema</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Tempo (ms)</th>
                                <th className="p-4 font-medium">Output</th>
                                <th className="p-4 font-medium">Notas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {results.map((res) => (
                                <tr key={res.systemName} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <td className="p-4 font-medium">{res.systemName}</td>
                                    <td className="p-4">
                                        {res.status === 'OK' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                ✅ OK
                                            </span>
                                        )}
                                        {res.status === 'WARNING' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                ⚠️ Aviso
                                            </span>
                                        )}
                                        {res.status === 'ERROR' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                ❌ Erro
                                            </span>
                                        )}
                                    </td>
                                    <td className={`p-4 font-mono ${res.executionTimeMs > 1000 ? 'text-orange-600 font-bold' : ''}`}>
                                        {res.executionTimeMs}ms
                                    </td>
                                    <td className="p-4 text-zinc-500">
                                        {res.predictionCount} números
                                    </td>
                                    <td className="p-4">
                                        {res.notes.length > 0 ? (
                                            <ul className="list-disc list-inside text-red-600 text-xs">
                                                {res.notes.map((note, i) => (
                                                    <li key={i}>{note}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-zinc-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
