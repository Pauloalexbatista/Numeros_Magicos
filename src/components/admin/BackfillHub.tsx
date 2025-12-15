'use client';

import React, { useState, useEffect } from 'react';
import FlashUpdateClient from './FlashUpdateClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, CheckCircle, AlertTriangle, Download, Server, Wifi } from 'lucide-react';
import { getSystemBackfillStatus, uploadPredictionPack, recalculateMedals } from '../../app/admin/actions';

export default function BackfillHub() {
    const [systemsStatus, setSystemsStatus] = useState<any[]>([]);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'online' | 'offline' | 'status'>('online');

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const jsonContent = event.target?.result as string;
                const result = await uploadPredictionPack(jsonContent);

                if (result.success) {
                    alert('✅ ' + result.message);
                    loadStatus(); // Refresh status
                } else {
                    alert('❌ Erro: ' + result.message);
                }
            } catch (err) {
                alert('Erro ao processar ficheiro.');
            } finally {
                setUploading(false);
            }
        };

        reader.readAsText(file);
    };

    const handleRecalculateMedals = async () => {
        if (!confirm('Isto vai atualizar a tabela de Ranking e os sistemas Medalha (Ouro/Prata/Bronze). Continuar?')) return;

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

    // Calculate quick stats
    const missingCount = systemsStatus.filter(s => s.status === 'MISSING').length;
    const zombieCount = systemsStatus.filter(s => s.status === 'ZOMBIE').length;

    return (
        <div className="space-y-6">

            {/* Tabs Header */}
            <div className="flex gap-4 border-b border-zinc-800 pb-2">
                <button
                    onClick={() => setActiveTab('online')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors ${activeTab === 'online' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Wifi className="w-4 h-4 inline mr-2" />
                    Atualizações Online
                </button>
                <button
                    onClick={() => setActiveTab('offline')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors ${activeTab === 'offline' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <UploadCloud className="w-4 h-4 inline mr-2" />
                    Importar Offline (ML)
                </button>
                <button
                    onClick={() => setActiveTab('status')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors ${activeTab === 'status' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Estado e Diagnóstico
                    {(missingCount > 0) && <Badge variant="destructive" className="ml-2 bg-red-500 animate-pulse">{missingCount}</Badge>}
                </button>
            </div>

            {/* WIZARD / GUIDE */}
            <Card className="p-4 bg-gradient-to-r from-zinc-900 to-zinc-950 border-zinc-800">
                <div className="flex justify-between items-center text-xs text-zinc-500 mb-2">
                    <span className="font-bold uppercase tracking-widest text-zinc-600">Fluxo de Trabalho</span>
                    <span>Siga a ordem para garantir consistência</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 flex items-center gap-2 opacity-50">
                        <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">1</span>
                        <span>Inserir Sorteio</span>
                    </div>
                    <div className="bg-zinc-800 h-px w-4"></div>
                    <div className={`flex-1 flex items-center gap-2 ${activeTab === 'online' ? 'text-indigo-400 font-bold' : ''}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === 'online' ? 'bg-indigo-500 text-white' : 'bg-zinc-800'}`}>2</span>
                        <span>Update Hístórico</span>
                    </div>
                    <div className="bg-zinc-800 h-px w-4"></div>
                    <div className={`flex-1 flex items-center gap-2 ${activeTab === 'offline' ? 'text-emerald-400 font-bold' : ''}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === 'offline' ? 'bg-emerald-500 text-white' : 'bg-zinc-800'}`}>3</span>
                        <span>ML Offline</span>
                    </div>
                    <div className="bg-zinc-800 h-px w-4"></div>
                    <div className={`flex-1 flex items-center gap-2 ${activeTab === 'online' ? 'text-yellow-500 font-bold' : ''}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === 'online' ? 'bg-yellow-600 text-black' : 'bg-zinc-800'}`}>4</span>
                        <span>Medalhas</span>
                    </div>
                </div>
            </Card>

            {/* TAB: ONLINE */}
            {activeTab === 'online' && (
                <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <FlashUpdateClient />

                    <Card className="p-6 bg-zinc-900 border-zinc-800">
                        <h3 className="text-lg font-bold text-yellow-500 mb-2">🏅 Atualização de Medalhas</h3>
                        <p className="text-zinc-400 text-sm mb-4">
                            Recalcula os sistemas Ouro, Prata e Bronze com base nas novas performances.
                            <br />⚠️ Executar <strong>após</strong> concluir a atualização histórica acima.
                        </p>
                        <button
                            onClick={handleRecalculateMedals}
                            disabled={loadingStatus}
                            className="px-4 py-2 bg-yellow-600/20 text-yellow-500 border border-yellow-600 rounded hover:bg-yellow-600/30 transition-colors disabled:opacity-50"
                        >
                            {loadingStatus ? 'A processar...' : 'Recalcular Medalhas e Cache'}
                        </button>
                    </Card>
                </div>
            )}

            {/* TAB: OFFLINE IMPORT */}
            {activeTab === 'offline' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* Instructions */}
                    <Card className="p-6 bg-emerald-950/20 border-emerald-900/50">
                        <h3 className="text-lg font-bold text-emerald-400 mb-4">📡 Importar Previsões ML</h3>
                        <p className="text-emerald-200/70 text-sm mb-4">
                            Como as Redes Neuronais são pesadas para correr online, o processo é:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300 mb-6 font-mono">
                            <li>Executar <span className="bg-zinc-800 px-1 rounded">tools\GENERATE_ML_PACK.bat</span> no seu PC.</li>
                            <li>Aguardar que gere o ficheiro <span className="text-yellow-400">ml_pack.json</span>.</li>
                            <li>Carregar esse ficheiro aqui.</li>
                        </ol>
                    </Card>

                    {/* Upload Zone */}
                    <Card className="p-8 border-2 border-dashed border-zinc-700 hover:border-emerald-500 transition-colors flex flex-col items-center justify-center text-center bg-zinc-900/50">
                        <UploadCloud className="w-16 h-16 text-zinc-600 mb-4" />
                        <h4 className="text-lg font-bold text-white mb-2">Carregar ml_pack.json</h4>
                        <p className="text-zinc-500 text-sm mb-6">Arraste o ficheiro ou clique para selecionar</p>

                        <label className="cursor-pointer px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg transition-all active:scale-95">
                            {uploading ? 'A Processar...' : 'Selecionar Ficheiro'}
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                    </Card>
                </div>
            )}

            {/* TAB: STATUS & TOOLS */}
            {activeTab === 'status' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

                    {/* Repair Tools */}
                    <Card className="p-4 bg-red-950/20 border-red-900/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                            <div>
                                <h3 className="font-bold text-red-400">Zona de Perigo / Reparação</h3>
                                <p className="text-xs text-red-300/60">Utilize apenas se tiver erros de base de dados (Ex: Unique constraint).</p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                if (!confirm('Isto vai tentar reparar os IDs das tabelas. Usar apenas se houver erros de gravação. Continuar?')) return;
                                setLoadingStatus(true);
                                try {
                                    const { fixDatabaseSequences } = await import('../../app/admin/actions');
                                    const res = await fixDatabaseSequences();
                                    alert(res.message);
                                } catch (e) { alert('Erro ao executar: ' + e); }
                                finally { setLoadingStatus(false); }
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-lg"
                        >
                            🚑 Reparar Base de Dados
                        </button>
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
