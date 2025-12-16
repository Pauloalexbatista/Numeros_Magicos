'use client';

import React, { useState, useEffect } from 'react';
import FlashUpdateClient from './FlashUpdateClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, CheckCircle, AlertTriangle, Download, Server, Wifi, PlayCircle } from 'lucide-react';
import { getSystemBackfillStatus, uploadPredictionPack, recalculateMedals } from '../../app/admin/actions';

export default function BackfillHub() {
    const [systemsStatus, setSystemsStatus] = useState<any[]>([]);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [activeTab, setActiveTab] = useState<'golden' | 'expert' | 'status'>('golden');

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        setLoadingStatus(true);
        try {
            const data = await getSystemBackfillStatus();
            setSystemsStatus(data);
        } finally {
            setLoadingStatus(false);
        }
    };

    const handleRecalculateMedals = async () => {
        if (!confirm('Isto vai recalcular apenas os sistemas Medalha (Ouro/Prata/Bronze). Continuar?')) return;
        setLoadingStatus(true);
        try {
            const result = await recalculateMedals();
            alert(result.success ? '✅ ' + result.message : '❌ ' + result.message);
        } catch (err) {
            alert('Erro ao atualizar medalhas.');
        } finally {
            setLoadingStatus(false);
        }
    };

    // Calculate quick stats
    const missingCount = systemsStatus.filter(s => s.status === 'MISSING').length;

    return (
        <div className="space-y-6">

            {/* Tabs Header */}
            <div className="flex gap-4 border-b border-zinc-800 pb-2">
                <button
                    onClick={() => setActiveTab('golden')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors ${activeTab === 'golden' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <PlayCircle className="w-4 h-4 inline mr-2" />
                    Golden Path (Recomendado)
                </button>
                <button
                    onClick={() => setActiveTab('expert')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors ${activeTab === 'expert' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Server className="w-4 h-4 inline mr-2" />
                    Modo Expert (Manual)
                </button>
                <button
                    onClick={() => setActiveTab('status')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors ${activeTab === 'status' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Estado e Diagnóstico
                    {(missingCount > 0) && <Badge variant="destructive" className="ml-2 bg-red-500 animate-pulse">{missingCount}</Badge>}
                </button>
            </div>

            {/* TAB: GOLDEN PATH */}
            {activeTab === 'golden' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="p-8 bg-gradient-to-br from-amber-500/10 to-zinc-900 border-amber-500/20 text-center">
                        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <span className="text-3xl">🚀</span>
                        </div>
                        <h2 className="text-2xl font-bold text-amber-500 mb-2">MASTER_UPDATE.bat</h2>
                        <p className="text-zinc-300 max-w-2xl mx-auto mb-6">
                            O método oficial "Golden Path" para gerir todo o sistema.
                            <br />
                            Este script único faz <strong>tudo</strong> de forma automática e incremental.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left max-w-4xl mx-auto bg-zinc-950/50 p-6 rounded-xl border border-zinc-800">
                            <div className="p-3 border-l-2 border-indigo-500">
                                <div className="text-xs text-zinc-500 uppercase font-bold">Passo 1</div>
                                <div className="font-bold text-indigo-400">Fetch Draw</div>
                                <div className="text-xs text-zinc-400">Obtém último sorteio online</div>
                            </div>
                            <div className="p-3 border-l-2 border-emerald-500">
                                <div className="text-xs text-zinc-500 uppercase font-bold">Passo 2</div>
                                <div className="font-bold text-emerald-400">Smart Backfill</div>
                                <div className="text-xs text-zinc-400">Atualiza (apenas o necessário)</div>
                            </div>
                            <div className="p-3 border-l-2 border-purple-500">
                                <div className="text-xs text-zinc-500 uppercase font-bold">Passo 3</div>
                                <div className="font-bold text-purple-400">AI & Medals</div>
                                <div className="text-xs text-zinc-400">Treina AI e Calcula Rankings</div>
                            </div>
                            <div className="p-3 border-l-2 border-blue-500">
                                <div className="text-xs text-zinc-500 uppercase font-bold">Passo 4</div>
                                <div className="font-bold text-blue-400">Static Gen</div>
                                <div className="text-xs text-zinc-400">Gera JSONs ultra-rápidos</div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-zinc-900 rounded-lg inline-block border border-zinc-700">
                            <code className="text-green-400 font-mono text-sm">./MASTER_UPDATE.bat</code>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">Execute este ficheiro na raiz do projeto (Terminal Local).</p>
                    </Card>
                </div>
            )}

            {/* TAB: EXPERT */}
            {activeTab === 'expert' && (
                <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="p-6 bg-zinc-900 border-zinc-800">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">🎛️ Controlos Manuais</h3>
                                <p className="text-zinc-400 text-sm">Utilize apenas em situações específicas de debug ou hotfix.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-zinc-950 rounded border border-zinc-800">
                                <h4 className="font-bold text-yellow-500 mb-2">Recalcular Medalhas</h4>
                                <p className="text-xs text-zinc-500 mb-4">Corre apenas o script `turbo-medals.ts`. Útil para afinar pesos.</p>
                                <button onClick={handleRecalculateMedals} disabled={loadingStatus} className="text-xs px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-white border border-zinc-700">
                                    {loadingStatus ? '...' : 'Executar'}
                                </button>
                            </div>
                            {/* Flash Update Legacy */}
                            <div className="p-4 bg-zinc-950 rounded border border-zinc-800 opacity-50">
                                <h4 className="font-bold text-indigo-500 mb-2">Flash Update (Legacy)</h4>
                                <p className="text-xs text-zinc-500 mb-4">Integrado no Golden Path. Não necessita de correr separadamente.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB: STATUS */}
            {activeTab === 'status' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="p-4 bg-zinc-900/50 border-zinc-800 mb-4">
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-zinc-300">OK (Atualizado)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-zinc-300">Requer Atenção</span>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Sistema (Código)</th>
                                    <th className="px-6 py-3">Score (Qualidade)</th>
                                    <th className="px-6 py-3">Sorteios na BD</th>
                                    <th className="px-6 py-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {systemsStatus.map((sys) => (
                                    <tr key={sys.name} className="hover:bg-zinc-800/50">
                                        <td className="px-6 py-4 font-medium text-white">
                                            {sys.name}
                                            {sys.status === 'ZOMBIE' && <span className="ml-2 text-xs text-zinc-500">(Morto/Removido)</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${sys.qualityScore > 1000 ? 'text-amber-400' : 'text-slate-400'}`}>
                                                {sys.qualityScore || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-zinc-400">
                                            {sys.drawCount}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sys.status === 'OK' && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    OK
                                                </span>
                                            )}
                                            {sys.status === 'MISSING' && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    Falta Backfill
                                                </span>
                                            )}
                                            {sys.status === 'ZOMBIE' && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-zinc-800 text-zinc-500">
                                                    Deprecado
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
