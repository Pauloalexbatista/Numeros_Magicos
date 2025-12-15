'use client';

import React, { useState, useEffect } from 'react';
import FlashUpdateClient from './FlashUpdateClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, CheckCircle, AlertTriangle, Download, Server, Wifi } from 'lucide-react';
import { getSystemBackfillStatus, uploadPredictionPack } from '../../app/admin/actions';

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
                    <Server className="w-4 h-4 inline mr-2" />
                    Estado e Diagnóstico
                    {(missingCount > 0) && <Badge variant="destructive" className="ml-2 bg-red-500">{missingCount}</Badge>}
                </button>
            </div>

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
                        <button className="px-4 py-2 bg-yellow-600/20 text-yellow-500 border border-yellow-600 rounded hover:bg-yellow-600/30 transition-colors">
                            Recalcular Medalhas (Em Breve)
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

            {/* TAB: SYSTEM STATUS */}
            {activeTab === 'status' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Sistema (Código)</th>
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
            )}
        </div>
    );
}
