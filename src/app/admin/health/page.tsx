'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Database, Activity, AlertTriangle, RefreshCw, CheckCircle, Clock } from 'lucide-react';

interface GameHealth {
    game: string;
    total: number;
    firstDate: string;
    lastDate: string;
    healthy: boolean;
    missingCount: number;
    missingDates: string[];
    duplicates: string[];
}

interface HealthResponse {
    success: boolean;
    timestamp: string;
    health: {
        EUROMILLIONS: GameHealth;
        EURODREAMS: GameHealth;
        TOTOLOTO: GameHealth;
    };
    error?: string;
}

export default function AdminHealthDashboard() {
    const [secret, setSecret] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [healthData, setHealthData] = useState<HealthResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkHealth = async (key: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/health?secret=${key}`);
            const data = await res.json();
            
            if (res.ok && data.success) {
                setHealthData(data);
                setIsAuthenticated(true);
            } else {
                setError(data.error || 'Acesso negado. Chave secreta incorreta.');
                setIsAuthenticated(false);
            }
        } catch (err) {
            setError('Erro de comunicação com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        checkHealth(secret);
    };

    const handleForceSync = async () => {
        if (!confirm('Atenção: Vai disparar uma sincronização total da Base de Dados.\\nIsto fará o servidor raspar os sorteios em falta e recalcular todas as tendências estáticas.\\n\\nTem a certeza?')) {
            return;
        }

        setIsSyncing(true);
        try {
            // Re-using the existing trigger-update endpoint you have
            const res = await fetch(`/api/admin/trigger-update`, {
                method: 'POST',
            });
            const data = await res.json();
            
            if (res.ok) {
                alert('Sincronização lançada para o servidor! O processo está a correr em plano de fundo.');
                // Refresh health data after 5 seconds to see if it picked up something quick
                setTimeout(() => checkHealth(secret), 5000);
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (err) {
            alert('Falha crítica de comunicação.');
        } finally {
            setIsSyncing(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="max-w-md w-full p-8 border border-gray-100 shadow-xl rounded-2xl bg-white text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h1>
                    <p className="text-slate-500 mb-8">
                        Laboratório de Controlo da Base de Dados.<br />
                        Insira a palavra-passe mestre.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Palavra-passe mestra..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center bg-gray-50 text-gray-900"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#3510c4] hover:bg-[#2a0ca0] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                "Destrancar Painel"
                            )}
                        </button>
                    </form>
                    
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const { EUROMILLIONS, EURODREAMS, TOTOLOTO } = healthData!.health;
    const allHealthy = EUROMILLIONS.healthy && EURODREAMS.healthy && TOTOLOTO.healthy;

    const GameCard = ({ data, title }: { data: GameHealth, title: string }) => (
        <div className={`p-6 rounded-2xl border ${data.healthy ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/50'}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-lg text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500">{data.total} Sorteios Analisados</p>
                </div>
                {data.healthy ? (
                    <div className="bg-green-100 text-green-700 p-2 rounded-full">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                ) : (
                    <div className="bg-red-100 text-red-700 p-2 rounded-full">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider mb-1">Primeiro</span>
                        <span className="font-semibold text-slate-800">{new Date(data.firstDate).toLocaleDateString('pt-PT')}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider mb-1">Último</span>
                        <span className="font-semibold text-slate-800">{new Date(data.lastDate).toLocaleDateString('pt-PT')}</span>
                    </div>
                </div>

                {!data.healthy && (
                    <div className="bg-white border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm mt-4">
                        <div className="flex items-center text-red-700 font-semibold mb-2">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Faltam {data.missingCount} Sorteios Históricos
                        </div>
                        <p className="text-xs text-slate-600 mb-2 font-medium">Possíveis datas em falta (amostra):</p>
                        <div className="flex flex-wrap gap-2">
                            {data.missingDates.map(d => (
                                <span key={d} className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-md font-mono border border-red-100">
                                    {d}
                                </span>
                            ))}
                            {data.missingCount > 10 && (
                                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md font-mono border border-gray-100">
                                    +{data.missingCount - 10} ocultos
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {!data.healthy && data.duplicates.length > 0 && (
                    <div className="bg-orange-50 text-orange-700 p-3 rounded-xl text-sm mt-2 border border-orange-100">
                        <strong>Aviso:</strong> {data.duplicates.length} Sorteios Duplicados detetados.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-20">
            <div className="max-w-6xl mx-auto px-4">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 mr-4">
                            <Database className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Análise da Base de Dados</h1>
                            <div className="flex items-center text-slate-500 mt-1">
                                <Clock className="w-4 h-4 mr-1.5" />
                                <span>Relatório gerado a: {new Date(healthData!.timestamp).toLocaleTimeString('pt-PT')}</span>
                                <button 
                                    onClick={() => checkHealth(secret)}
                                    className="ml-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" /> Atualizar Leitura
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleForceSync}
                            disabled={isSyncing}
                            className={`flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                isSyncing 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md'
                            }`}
                        >
                            <Activity className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-pulse' : ''}`} />
                            {isSyncing ? 'Injeção Ocupada...' : 'Forçar Sincronização (Cron)'}
                        </button>
                    </div>
                </div>

                {/* Global Status Banner */}
                <div className={`mb-8 p-5 rounded-2xl flex items-center shadow-sm border ${
                    allHealthy 
                    ? 'bg-[#18A058]/10 border-[#18A058]/20 text-[#18A058]' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {allHealthy ? (
                        <>
                            <CheckCircle className="w-8 h-8 mr-4" />
                            <div>
                                <h4 className="font-bold text-lg">Sistema Global Saudável</h4>
                                <p className="text-sm opacity-90">Não foram encontrados buracos matemáticos nas tabelas primárias. A VPS está íntegra.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="w-8 h-8 mr-4" />
                            <div>
                                <h4 className="font-bold text-lg">Inconsistência Detetada</h4>
                                <p className="text-sm opacity-90">Existem falhas no histórico. O cron job pode ter falhado numa data recente. Clique em Forçar Sincronização.</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GameCard data={EUROMILLIONS} title="EuroMilhões" />
                    <GameCard data={EURODREAMS} title="EuroDreams" />
                    <GameCard data={TOTOLOTO} title="Totoloto" />
                </div>
            </div>
        </div>
    );
}
