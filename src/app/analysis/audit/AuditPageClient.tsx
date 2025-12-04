'use client';

import { useState } from 'react';
import { AuditRecord, VerificationResult, getAuditHistory, verifyPrediction } from './actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AuditPageClientProps {
    initialSystems: string[];
}

export default function AuditPageClient({ initialSystems }: AuditPageClientProps) {
    const [selectedSystem, setSelectedSystem] = useState<string>('');
    const [history, setHistory] = useState<AuditRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [auditResult, setAuditResult] = useState<VerificationResult | null>(null);
    const [auditingId, setAuditingId] = useState<number | null>(null);

    const handleSystemChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const system = e.target.value;
        setSelectedSystem(system);
        setAuditResult(null);

        if (system) {
            setLoading(true);
            try {
                const data = await getAuditHistory(system);
                setHistory(data);
            } catch (error) {
                console.error('Failed to fetch history', error);
            } finally {
                setLoading(false);
            }
        } else {
            setHistory([]);
        }
    };

    const handleAudit = async (recordId: number) => {
        setAuditingId(recordId);
        setAuditResult(null);
        try {
            const result = await verifyPrediction(recordId);
            setAuditResult(result);
        } catch (error) {
            console.error('Audit failed', error);
        } finally {
            setAuditingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
                <div className="flex items-center gap-4">
                    <label className="text-slate-300 font-medium">Escolher Sistema:</label>
                    <select
                        className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedSystem}
                        onChange={handleSystemChange}
                    >
                        <option value="">-- Selecione --</option>
                        {initialSystems.map(sys => (
                            <option key={sys} value={sys}>{sys}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Audit Result Panel */}
            {auditResult && (
                <Card className={`p-6 border-2 ${auditResult.match ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className={`text-xl font-bold ${auditResult.match ? 'text-green-400' : 'text-red-400'}`}>
                                {auditResult.match ? '✅ VERIFICADO' : '❌ DISCREPÂNCIA'}
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">
                                Sorteio: {auditResult.drawDate} | Tempo: {auditResult.executionTimeMs}ms
                            </p>
                        </div>
                        {auditResult.error && (
                            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                                Erro: {auditResult.error}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-400 mb-2">Previsão Guardada (BD)</h4>
                            <div className="flex flex-wrap gap-2">
                                {auditResult.stored.map(n => (
                                    <span key={n} className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full text-sm font-bold text-white">
                                        {n}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-400 mb-2">Recálculo (Agora)</h4>
                            <div className="flex flex-wrap gap-2">
                                {auditResult.recalculated.map(n => {
                                    const isMatch = auditResult.stored.includes(n);
                                    return (
                                        <span key={n} className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold text-white ${isMatch ? 'bg-slate-700' : 'bg-red-600'}`}>
                                            {n}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {!auditResult.match && (
                        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded text-yellow-200 text-sm">
                            ⚠️ Nota: Discrepâncias são esperadas em sistemas aleatórios (Random, Monte Carlo) ou se a lógica do sistema foi alterada desde a previsão original.
                        </div>
                    )}
                </Card>
            )}

            {/* History Table */}
            {selectedSystem && (
                <Card className="overflow-hidden bg-slate-800/50 border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3">Previsão</th>
                                    <th className="px-6 py-3">Acertos</th>
                                    <th className="px-6 py-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Carregando histórico...</td></tr>
                                ) : history.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Sem dados disponíveis.</td></tr>
                                ) : (
                                    history.map(record => (
                                        <tr key={record.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-300">
                                                {record.drawDate}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {record.predictedNumbers.slice(0, 10).map(n => (
                                                        <span key={n} className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${record.actualNumbers.includes(n) ? 'bg-green-600 text-white font-bold' : 'bg-slate-700 text-slate-300'}`}>
                                                            {n}
                                                        </span>
                                                    ))}
                                                    {record.predictedNumbers.length > 10 && (
                                                        <span className="text-xs text-slate-500 self-center">+{record.predictedNumbers.length - 10}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.hits >= 3 ? 'bg-green-900/50 text-green-400' :
                                                        record.hits > 0 ? 'bg-blue-900/50 text-blue-400' :
                                                            'bg-slate-700 text-slate-400'
                                                    }`}>
                                                    {record.hits} Acertos
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAudit(record.id)}
                                                    disabled={auditingId === record.id}
                                                    className="border-slate-600 hover:bg-slate-700 text-slate-300"
                                                >
                                                    {auditingId === record.id ? 'Auditando...' : 'Auditar'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
