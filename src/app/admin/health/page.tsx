'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Database, Activity, Eye, AlertTriangle, RefreshCw, CheckCircle, Clock, Layers, Cpu, Download } from 'lucide-react';

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

    const [systems, setSystems] = useState<any[]>([]);
    const [isLoadingSystems, setIsLoadingSystems] = useState(false);
    const [neuralStatus, setNeuralStatus] = useState<any>(null);
    const [isLoadingNeural, setIsLoadingNeural] = useState(false);
    const [isTraining, setIsTraining] = useState<string | null>(null);
    const [isSyncingTarget, setIsSyncingTarget] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'database' | 'systems' | 'neural'>('database');
    const [filterGame, setFilterGame] = useState<string>('ALL');
    const [filterType, setFilterType] = useState<string>('ALL');
    const [isBacktestModalOpen, setIsBacktestModalOpen] = useState(false);
    const [backtestTarget, setBacktestTarget] = useState<any>(null);
    const [isBacktesting, setIsBacktesting] = useState(false);
    const [backtestSamples, setBacktestSamples] = useState('10');
    const [backtestResult, setBacktestResult] = useState<any>(null);

    const [isLivePredictModalOpen, setIsLivePredictModalOpen] = useState(false);
    const [livePredictData, setLivePredictData] = useState<any>(null);

    const openLivePredictModal = (modelMeta: any) => {
        setLivePredictData(modelMeta);
        setIsLivePredictModalOpen(true);
    };
    

    useEffect(() => {
        if (isAuthenticated) {
            fetchSystems();
            fetchNeuralStatus();
        }
    }, [isAuthenticated]);

    const fetchSystems = async () => {
        setIsLoadingSystems(true);
        try {
            const res = await fetch(`/api/admin/systems?secret=${secret}`);
            const data = await res.json();
            if (data.systems) setSystems(data.systems);
        } catch (e) { console.error(e); } finally { setIsLoadingSystems(false); }
    };

    const fetchNeuralStatus = async () => {
        setIsLoadingNeural(true);
        try {
            const res = await fetch(`/api/admin/neural-status?secret=${secret}`);
            const data = await res.json();
            if (data.status) setNeuralStatus(data.status);
        } catch (e) { console.error(e); } finally { setIsLoadingNeural(false); }
    };

    const handleToggleSystem = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch('/api/admin/systems', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer magia2026' },
                body: JSON.stringify({ id, isActive: !currentStatus })
            });
            if (res.ok) fetchSystems();
        } catch (e) { console.error(e); }
    };

    const handleTrainML = async (game: string, type: string) => {
        setIsTraining(type);
        try {
            const res = await fetch('/api/admin/ml', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer magia2026' },
                body: JSON.stringify({ game, targetNetwork: type })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Treino concluído com sucesso!');
                fetchNeuralStatus();
            } else {
                alert('Erro: ' + (data.error || 'Falha no treino'));
            }
        } catch (e) { alert('Falha crítica.'); } finally { setIsTraining(null); }
    };

    const handleSpecificSync = async (game: string) => {
        setIsSyncingTarget(game);
        try {
            const res = await fetch('/api/admin/sync-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer magia2026' },
                body: JSON.stringify({ secret, game })
            });
            if (res.ok) checkHealth(secret);
        } catch(e) {} finally { setIsSyncingTarget(null); }
    };

    const openBacktestModal = (game: string, type: string, name: string) => {
        setBacktestTarget({ game, type, name });
        setBacktestResult(null);
        setBacktestSamples('10');
        setIsBacktestModalOpen(true);
    };

    const runBacktest = async () => {
        if (!backtestTarget) return;
        setIsBacktesting(true);
        try {
            const res = await fetch('/api/admin/backtest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer magia2026' },
                body: JSON.stringify({
                    secret,
                    game: backtestTarget.game,
                    targetNetwork: backtestTarget.type,
                    samples: parseInt(backtestSamples)
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setBacktestResult(data.data);
            } else {
                alert('Erro no backtest: ' + data.error);
            }
        } catch (e) {
            alert('Falha crítica no backtest.');
        } finally {
            setIsBacktesting(false);
        }
    };


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

    const handleExportCalendar = () => {
        window.location.href = `/api/admin/export-calendar?secret=${secret}`;
    };

    const handleExportSystems = () => {
        window.location.href = `/api/admin/export-systems?secret=${secret}`;
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

    const GameCard = ({ data, title, onSync, isSyncing }: { data: GameHealth, title: string, onSync: () => void, isSyncing: boolean }) => (
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
                            onClick={handleExportCalendar}
                            className="flex items-center justify-center px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm bg-green-600 text-white hover:bg-green-700 hover:shadow-md"
                            title="Exportar Calendário Completo"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            BD Sorteios
                        </button>
                        <button
                            onClick={handleExportSystems}
                            className="flex items-center justify-center px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                            title="Exportar Lista de Sistemas"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            BD Sistemas
                        </button>
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
                            {isSyncing ? 'Injeção Ocupada...' : 'Forçar Sync (Cron)'}
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex flex-col sm:flex-row gap-2 bg-gray-200/50 p-1.5 rounded-xl mb-8 w-full sm:w-max">
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
                            activeTab === 'database' 
                            ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-gray-900/5' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                        }`}
                    >
                        <Database className="w-4 h-4 mr-2" />
                        Análise da BD
                    </button>
                    <button
                        onClick={() => setActiveTab('systems')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
                            activeTab === 'systems' 
                            ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-gray-900/5' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                        }`}
                    >
                        <Layers className="w-4 h-4 mr-2" />
                        Gestão de Sistemas
                    </button>
                    <button
                        onClick={() => setActiveTab('neural')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
                            activeTab === 'neural' 
                            ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-gray-900/5' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                        }`}
                    >
                        <Cpu className="w-4 h-4 mr-2" />
                        Redes Neuronais
                    </button>
                </div>

                {activeTab === 'database' && (
                    <>
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
                    <GameCard data={EUROMILLIONS} title="EuroMilhões" onSync={() => handleSpecificSync("EUROMILLIONS")} isSyncing={isSyncingTarget === "EUROMILLIONS"} />
                    <GameCard data={EURODREAMS} title="EuroDreams" onSync={() => handleSpecificSync("EURODREAMS")} isSyncing={isSyncingTarget === "EURODREAMS"} />
                    <GameCard data={TOTOLOTO} title="Totoloto" onSync={() => handleSpecificSync("TOTOLOTO")} isSyncing={isSyncingTarget === "TOTOLOTO"} />
                           </div>
                    </>
                )}

                {activeTab === 'systems' && (
                /* Switchboard Section */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center">
                                Gestão de Sistemas (Switchboard)
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Congele ou ative sistemas em tempo real no servidor.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select 
                                className="text-sm font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
                                value={filterGame} 
                                onChange={(e) => setFilterGame(e.target.value)}
                            >
                                <option value="ALL">Qualquer Jogo</option>
                                <option value="EUROMILLIONS">EuroMilhões</option>
                                <option value="EURODREAMS">EuroDreams</option>
                                <option value="TOTOLOTO">Totoloto</option>
                            </select>
                            
                            <select 
                                className="text-sm font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
                                value={filterType} 
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="ALL">Feitio (Qualquer)</option>
                                <option value="BASE">Apenas Base</option>
                                <option value="ENSEMBLE">Apenas Ensemble</option>
                                <option value="NEURAL">Processamento I.A.</option>
                            </select>

                            {isLoadingSystems && <RefreshCw className="w-5 h-5 ml-2 text-indigo-500 animate-spin" />}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="p-4 pl-6">Jogo</th>
                                    <th className="p-4">Sistema</th>
                                    <th className="p-4">Alvo</th>
                                    <th className="p-4">Tipo</th>
                                    <th className="p-4 text-center">Peso</th>
                                    <th className="p-4 pr-6 text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {systems
                                    .filter(sys => filterGame === 'ALL' || sys.game === filterGame)
                                    .filter(sys => filterType === 'ALL' || sys.systemType?.toUpperCase() === filterType)
                                    .map((sys) => (
                                    <tr key={sys.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-6">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                sys.game === 'EUROMILLIONS' ? 'bg-[#001D4A]/10 text-[#001D4A]' :
                                                sys.game === 'EURODREAMS' ? 'bg-[#3510c4]/10 text-[#3510c4]' :
                                                'bg-[#18A058]/10 text-[#18A058]'
                                            }`}>
                                                {sys.game === 'EUROMILLIONS' ? 'EM' : sys.game === 'EURODREAMS' ? 'ED' : 'TT'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-slate-800">{sys.name}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                sys.domain?.toUpperCase() === 'STARS' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {sys.domain?.toUpperCase() === 'STARS' ? 'Estrelas' : 'Números'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">{sys.systemType?.toUpperCase() === 'BASE' ? 'Base' : sys.systemType?.toUpperCase() === 'NEURAL' ? 'Neural' : sys.systemType}</td>
                                        <td className="p-4 text-center text-sm font-mono text-slate-400">c:{sys.complexity}</td>
                                        <td className="p-4 pr-6 text-right flex justify-end">
                                            <button
                                                onClick={() => handleToggleSystem(sys.id, sys.isActive)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                                    sys.isActive ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        sys.isActive ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {systems.length === 0 && !isLoadingSystems && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            Nenhum sistema encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}

                {activeTab === 'neural' && (
                /* Neural Laboratory */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center">
                                Laboratório Neuronal (Machine Learning)
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Gestão inteligente e treino dos Modelos de Inteligência Artificial.</p>
                        </div>
                        {isLoadingNeural && <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />}
                    </div>

                    <div className="p-6 space-y-12">
                        {/* FASE 3.1 EUROMILLIONS */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-2 mb-4">
                                Fase 3.1: Redes EuroMilhões
                            </h3>
                            <h4 className="font-semibold text-slate-700 mb-3 ml-1 text-sm mt-2">Modelos Principais (Números)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                
                                {neuralStatus?.EUROMILLIONS?.NUMBERS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EUROMILLIONS.NUMBERS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 rounded-md">
                                                    Rede Principal
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EUROMILLIONS.NUMBERS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EUROMILLIONS.NUMBERS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EUROMILLIONS.NUMBERS.lastTrained ? `${new Date(neuralStatus.EUROMILLIONS.NUMBERS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EUROMILLIONS.NUMBERS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EUROMILLIONS.NUMBERS?.accuracy !== null && neuralStatus.EUROMILLIONS.NUMBERS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EUROMILLIONS.NUMBERS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EUROMILLIONS.NUMBERS)}
                                                disabled={!neuralStatus.EUROMILLIONS.NUMBERS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EUROMILLIONS', neuralStatus.EUROMILLIONS.NUMBERS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EUROMILLIONS.NUMBERS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EUROMILLIONS.NUMBERS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EUROMILLIONS', neuralStatus.EUROMILLIONS.NUMBERS.type, neuralStatus.EUROMILLIONS.NUMBERS.name)}
                                                disabled={!neuralStatus.EUROMILLIONS.NUMBERS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.EUROMILLIONS?.RF_NUMBERS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EUROMILLIONS.RF_NUMBERS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 rounded-md">
                                                    Random Forest
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EUROMILLIONS.RF_NUMBERS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EUROMILLIONS.RF_NUMBERS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EUROMILLIONS.RF_NUMBERS.lastTrained ? `${new Date(neuralStatus.EUROMILLIONS.RF_NUMBERS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EUROMILLIONS.RF_NUMBERS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EUROMILLIONS.RF_NUMBERS?.accuracy !== null && neuralStatus.EUROMILLIONS.RF_NUMBERS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EUROMILLIONS.RF_NUMBERS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EUROMILLIONS.RF_NUMBERS)}
                                                disabled={!neuralStatus.EUROMILLIONS.RF_NUMBERS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EUROMILLIONS', neuralStatus.EUROMILLIONS.RF_NUMBERS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EUROMILLIONS.RF_NUMBERS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EUROMILLIONS.RF_NUMBERS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EUROMILLIONS', neuralStatus.EUROMILLIONS.RF_NUMBERS.type, neuralStatus.EUROMILLIONS.RF_NUMBERS.name)}
                                                disabled={!neuralStatus.EUROMILLIONS.RF_NUMBERS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.EUROMILLIONS?.CLASSIFIER_NUMBERS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-pink-100 text-pink-700 rounded-md">
                                                    ML Classifier
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.lastTrained ? `${new Date(neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS?.accuracy !== null && neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS)}
                                                disabled={!neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EUROMILLIONS', neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-pink-700 hover:bg-pink-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EUROMILLIONS', neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.type, neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.name)}
                                                disabled={!neuralStatus.EUROMILLIONS.CLASSIFIER_NUMBERS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                            <h4 className="font-semibold text-slate-700 mb-3 ml-1 text-sm mt-8">Modelos de Apoio (Estrelas)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {neuralStatus?.EUROMILLIONS?.STARS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EUROMILLIONS.STARS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-purple-100 text-purple-700 rounded-md">
                                                    Rede Secundária
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EUROMILLIONS.STARS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EUROMILLIONS.STARS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EUROMILLIONS.STARS.lastTrained ? `${new Date(neuralStatus.EUROMILLIONS.STARS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EUROMILLIONS.STARS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EUROMILLIONS.STARS?.accuracy !== null && neuralStatus.EUROMILLIONS.STARS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EUROMILLIONS.STARS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EUROMILLIONS.STARS)}
                                                disabled={!neuralStatus.EUROMILLIONS.STARS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EUROMILLIONS', neuralStatus.EUROMILLIONS.STARS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EUROMILLIONS.STARS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EUROMILLIONS.STARS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EUROMILLIONS', neuralStatus.EUROMILLIONS.STARS.type, neuralStatus.EUROMILLIONS.STARS.name)}
                                                disabled={!neuralStatus.EUROMILLIONS.STARS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.EUROMILLIONS?.RF_STARS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EUROMILLIONS.RF_STARS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 rounded-md">
                                                    Random Forest
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EUROMILLIONS.RF_STARS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EUROMILLIONS.RF_STARS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EUROMILLIONS.RF_STARS.lastTrained ? `${new Date(neuralStatus.EUROMILLIONS.RF_STARS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EUROMILLIONS.RF_STARS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EUROMILLIONS.RF_STARS?.accuracy !== null && neuralStatus.EUROMILLIONS.RF_STARS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EUROMILLIONS.RF_STARS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EUROMILLIONS.RF_STARS)}
                                                disabled={!neuralStatus.EUROMILLIONS.RF_STARS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EUROMILLIONS', neuralStatus.EUROMILLIONS.RF_STARS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EUROMILLIONS.RF_STARS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EUROMILLIONS.RF_STARS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EUROMILLIONS', neuralStatus.EUROMILLIONS.RF_STARS.type, neuralStatus.EUROMILLIONS.RF_STARS.name)}
                                                disabled={!neuralStatus.EUROMILLIONS.RF_STARS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.EUROMILLIONS?.CLASSIFIER_STARS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-pink-100 text-pink-700 rounded-md">
                                                    ML Classifier
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.lastTrained ? `${new Date(neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EUROMILLIONS.CLASSIFIER_STARS?.accuracy !== null && neuralStatus.EUROMILLIONS.CLASSIFIER_STARS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EUROMILLIONS.CLASSIFIER_STARS)}
                                                disabled={!neuralStatus.EUROMILLIONS.CLASSIFIER_STARS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EUROMILLIONS', neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-pink-700 hover:bg-pink-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EUROMILLIONS', neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.type, neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.name)}
                                                disabled={!neuralStatus.EUROMILLIONS.CLASSIFIER_STARS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* FASE 3.2 EURODREAMS */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-2 mb-4">
                                Fase 3.2: Redes EuroDreams
                            </h3>
                            <h4 className="font-semibold text-slate-700 mb-3 ml-1 text-sm mt-2">Modelos Principais (Números)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                
                                {neuralStatus?.EURODREAMS?.NUMBERS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EURODREAMS.NUMBERS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 rounded-md">
                                                    Rede Principal
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EURODREAMS.NUMBERS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EURODREAMS.NUMBERS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EURODREAMS.NUMBERS.lastTrained ? `${new Date(neuralStatus.EURODREAMS.NUMBERS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EURODREAMS.NUMBERS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EURODREAMS.NUMBERS?.accuracy !== null && neuralStatus.EURODREAMS.NUMBERS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EURODREAMS.NUMBERS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EURODREAMS.NUMBERS)}
                                                disabled={!neuralStatus.EURODREAMS.NUMBERS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EURODREAMS', neuralStatus.EURODREAMS.NUMBERS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EURODREAMS.NUMBERS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EURODREAMS.NUMBERS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EURODREAMS', neuralStatus.EURODREAMS.NUMBERS.type, neuralStatus.EURODREAMS.NUMBERS.name)}
                                                disabled={!neuralStatus.EURODREAMS.NUMBERS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.EURODREAMS?.RF_NUMBERS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EURODREAMS.RF_NUMBERS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 rounded-md">
                                                    Random Forest
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EURODREAMS.RF_NUMBERS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EURODREAMS.RF_NUMBERS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EURODREAMS.RF_NUMBERS.lastTrained ? `${new Date(neuralStatus.EURODREAMS.RF_NUMBERS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EURODREAMS.RF_NUMBERS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EURODREAMS.RF_NUMBERS?.accuracy !== null && neuralStatus.EURODREAMS.RF_NUMBERS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EURODREAMS.RF_NUMBERS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EURODREAMS.RF_NUMBERS)}
                                                disabled={!neuralStatus.EURODREAMS.RF_NUMBERS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EURODREAMS', neuralStatus.EURODREAMS.RF_NUMBERS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EURODREAMS.RF_NUMBERS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EURODREAMS.RF_NUMBERS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EURODREAMS', neuralStatus.EURODREAMS.RF_NUMBERS.type, neuralStatus.EURODREAMS.RF_NUMBERS.name)}
                                                disabled={!neuralStatus.EURODREAMS.RF_NUMBERS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.EURODREAMS?.CLASSIFIER_NUMBERS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-pink-100 text-pink-700 rounded-md">
                                                    ML Classifier
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.lastTrained ? `${new Date(neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS?.accuracy !== null && neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS)}
                                                disabled={!neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EURODREAMS', neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-pink-700 hover:bg-pink-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EURODREAMS', neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.type, neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.name)}
                                                disabled={!neuralStatus.EURODREAMS.CLASSIFIER_NUMBERS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                            <h4 className="font-semibold text-slate-700 mb-3 ml-1 text-sm mt-8">Modelos de Apoio (Sonhos)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {neuralStatus?.EURODREAMS?.STARS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EURODREAMS.STARS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-indigo-100 text-indigo-700 rounded-md">
                                                    Rede Secundária
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EURODREAMS.STARS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EURODREAMS.STARS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EURODREAMS.STARS.lastTrained ? `${new Date(neuralStatus.EURODREAMS.STARS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EURODREAMS.STARS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EURODREAMS.STARS?.accuracy !== null && neuralStatus.EURODREAMS.STARS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EURODREAMS.STARS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EURODREAMS.STARS)}
                                                disabled={!neuralStatus.EURODREAMS.STARS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EURODREAMS', neuralStatus.EURODREAMS.STARS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EURODREAMS.STARS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EURODREAMS.STARS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EURODREAMS', neuralStatus.EURODREAMS.STARS.type, neuralStatus.EURODREAMS.STARS.name)}
                                                disabled={!neuralStatus.EURODREAMS.STARS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.EURODREAMS?.RF_STARS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EURODREAMS.RF_STARS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 rounded-md">
                                                    Random Forest
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EURODREAMS.RF_STARS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EURODREAMS.RF_STARS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EURODREAMS.RF_STARS.lastTrained ? `${new Date(neuralStatus.EURODREAMS.RF_STARS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EURODREAMS.RF_STARS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EURODREAMS.RF_STARS?.accuracy !== null && neuralStatus.EURODREAMS.RF_STARS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EURODREAMS.RF_STARS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EURODREAMS.RF_STARS)}
                                                disabled={!neuralStatus.EURODREAMS.RF_STARS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EURODREAMS', neuralStatus.EURODREAMS.RF_STARS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EURODREAMS.RF_STARS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EURODREAMS.RF_STARS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EURODREAMS', neuralStatus.EURODREAMS.RF_STARS.type, neuralStatus.EURODREAMS.RF_STARS.name)}
                                                disabled={!neuralStatus.EURODREAMS.RF_STARS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.EURODREAMS?.CLASSIFIER_STARS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.EURODREAMS.CLASSIFIER_STARS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-pink-100 text-pink-700 rounded-md">
                                                    ML Classifier
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.EURODREAMS.CLASSIFIER_STARS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.EURODREAMS.CLASSIFIER_STARS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.EURODREAMS.CLASSIFIER_STARS.lastTrained ? `${new Date(neuralStatus.EURODREAMS.CLASSIFIER_STARS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.EURODREAMS.CLASSIFIER_STARS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.EURODREAMS.CLASSIFIER_STARS?.accuracy !== null && neuralStatus.EURODREAMS.CLASSIFIER_STARS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.EURODREAMS.CLASSIFIER_STARS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.EURODREAMS.CLASSIFIER_STARS)}
                                                disabled={!neuralStatus.EURODREAMS.CLASSIFIER_STARS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('EURODREAMS', neuralStatus.EURODREAMS.CLASSIFIER_STARS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-pink-700 hover:bg-pink-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.EURODREAMS.CLASSIFIER_STARS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.EURODREAMS.CLASSIFIER_STARS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('EURODREAMS', neuralStatus.EURODREAMS.CLASSIFIER_STARS.type, neuralStatus.EURODREAMS.CLASSIFIER_STARS.name)}
                                                disabled={!neuralStatus.EURODREAMS.CLASSIFIER_STARS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* FASE 3.3 TOTOLOTO */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-2 mb-4">
                                Fase 3.3: Redes Totoloto
                            </h3>
                            <h4 className="font-semibold text-slate-700 mb-3 ml-1 text-sm mt-2">Modelos Principais (Números)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                
                                {neuralStatus?.TOTOLOTO?.NUMBERS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.TOTOLOTO.NUMBERS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 rounded-md">
                                                    Rede Principal
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.TOTOLOTO.NUMBERS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.TOTOLOTO.NUMBERS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.TOTOLOTO.NUMBERS.lastTrained ? `${new Date(neuralStatus.TOTOLOTO.NUMBERS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.TOTOLOTO.NUMBERS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.TOTOLOTO.NUMBERS?.accuracy !== null && neuralStatus.TOTOLOTO.NUMBERS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.TOTOLOTO.NUMBERS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.TOTOLOTO.NUMBERS)}
                                                disabled={!neuralStatus.TOTOLOTO.NUMBERS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('TOTOLOTO', neuralStatus.TOTOLOTO.NUMBERS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.TOTOLOTO.NUMBERS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.TOTOLOTO.NUMBERS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('TOTOLOTO', neuralStatus.TOTOLOTO.NUMBERS.type, neuralStatus.TOTOLOTO.NUMBERS.name)}
                                                disabled={!neuralStatus.TOTOLOTO.NUMBERS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.TOTOLOTO?.RF_NUMBERS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.TOTOLOTO.RF_NUMBERS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 rounded-md">
                                                    Random Forest
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.TOTOLOTO.RF_NUMBERS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.TOTOLOTO.RF_NUMBERS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.TOTOLOTO.RF_NUMBERS.lastTrained ? `${new Date(neuralStatus.TOTOLOTO.RF_NUMBERS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.TOTOLOTO.RF_NUMBERS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.TOTOLOTO.RF_NUMBERS?.accuracy !== null && neuralStatus.TOTOLOTO.RF_NUMBERS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.TOTOLOTO.RF_NUMBERS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.TOTOLOTO.RF_NUMBERS)}
                                                disabled={!neuralStatus.TOTOLOTO.RF_NUMBERS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('TOTOLOTO', neuralStatus.TOTOLOTO.RF_NUMBERS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.TOTOLOTO.RF_NUMBERS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.TOTOLOTO.RF_NUMBERS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('TOTOLOTO', neuralStatus.TOTOLOTO.RF_NUMBERS.type, neuralStatus.TOTOLOTO.RF_NUMBERS.name)}
                                                disabled={!neuralStatus.TOTOLOTO.RF_NUMBERS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.TOTOLOTO?.CLASSIFIER_NUMBERS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-pink-100 text-pink-700 rounded-md">
                                                    ML Classifier
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.lastTrained ? `${new Date(neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS?.accuracy !== null && neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS)}
                                                disabled={!neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('TOTOLOTO', neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-pink-700 hover:bg-pink-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('TOTOLOTO', neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.type, neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.name)}
                                                disabled={!neuralStatus.TOTOLOTO.CLASSIFIER_NUMBERS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                            <h4 className="font-semibold text-slate-700 mb-3 ml-1 text-sm mt-8">Modelos de Apoio (Sorte)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {neuralStatus?.TOTOLOTO?.LUCKY_NUMBER && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.TOTOLOTO.LUCKY_NUMBER.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 rounded-md">
                                                    Rede Secundária
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.TOTOLOTO.LUCKY_NUMBER.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.TOTOLOTO.LUCKY_NUMBER.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.TOTOLOTO.LUCKY_NUMBER.lastTrained ? `${new Date(neuralStatus.TOTOLOTO.LUCKY_NUMBER.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.TOTOLOTO.LUCKY_NUMBER.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.TOTOLOTO.LUCKY_NUMBER?.accuracy !== null && neuralStatus.TOTOLOTO.LUCKY_NUMBER?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.TOTOLOTO.LUCKY_NUMBER.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.TOTOLOTO.LUCKY_NUMBER)}
                                                disabled={!neuralStatus.TOTOLOTO.LUCKY_NUMBER?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('TOTOLOTO', neuralStatus.TOTOLOTO.LUCKY_NUMBER.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.TOTOLOTO.LUCKY_NUMBER.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.TOTOLOTO.LUCKY_NUMBER.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('TOTOLOTO', neuralStatus.TOTOLOTO.LUCKY_NUMBER.type, neuralStatus.TOTOLOTO.LUCKY_NUMBER.name)}
                                                disabled={!neuralStatus.TOTOLOTO.LUCKY_NUMBER.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.TOTOLOTO?.RF_STARS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.TOTOLOTO.RF_STARS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 rounded-md">
                                                    Random Forest
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.TOTOLOTO.RF_STARS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.TOTOLOTO.RF_STARS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.TOTOLOTO.RF_STARS.lastTrained ? `${new Date(neuralStatus.TOTOLOTO.RF_STARS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.TOTOLOTO.RF_STARS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.TOTOLOTO.RF_STARS?.accuracy !== null && neuralStatus.TOTOLOTO.RF_STARS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.TOTOLOTO.RF_STARS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.TOTOLOTO.RF_STARS)}
                                                disabled={!neuralStatus.TOTOLOTO.RF_STARS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('TOTOLOTO', neuralStatus.TOTOLOTO.RF_STARS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.TOTOLOTO.RF_STARS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.TOTOLOTO.RF_STARS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('TOTOLOTO', neuralStatus.TOTOLOTO.RF_STARS.type, neuralStatus.TOTOLOTO.RF_STARS.name)}
                                                disabled={!neuralStatus.TOTOLOTO.RF_STARS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                
                                {neuralStatus?.TOTOLOTO?.CLASSIFIER_STARS && (
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{neuralStatus.TOTOLOTO.CLASSIFIER_STARS.name}</h4>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-pink-100 text-pink-700 rounded-md">
                                                    ML Classifier
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${neuralStatus.TOTOLOTO.CLASSIFIER_STARS.trained ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {neuralStatus.TOTOLOTO.CLASSIFIER_STARS.trained ? 'Treinada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 flex-grow">
                                            
                                            Último Treino: {neuralStatus.TOTOLOTO.CLASSIFIER_STARS.lastTrained ? `${new Date(neuralStatus.TOTOLOTO.CLASSIFIER_STARS.lastTrained).toLocaleDateString('pt-PT')} às ${new Date(neuralStatus.TOTOLOTO.CLASSIFIER_STARS.lastTrained).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                                        </div>
                                        {neuralStatus.TOTOLOTO.CLASSIFIER_STARS?.accuracy !== null && neuralStatus.TOTOLOTO.CLASSIFIER_STARS?.accuracy !== undefined && (
                                            <div className="text-sm font-semibold text-indigo-600 mt-1">
                                                Precisão (Modelo): {neuralStatus.TOTOLOTO.CLASSIFIER_STARS.accuracy}%
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openLivePredictModal(neuralStatus.TOTOLOTO.CLASSIFIER_STARS)}
                                                disabled={!neuralStatus.TOTOLOTO.CLASSIFIER_STARS?.trained || isTraining !== null}
                                                title="Ver Previsão em Tempo Real"
                                                className="sm:w-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleTrainML('TOTOLOTO', neuralStatus.TOTOLOTO.CLASSIFIER_STARS.type)}
                                                disabled={isTraining !== null}
                                                className="w-full bg-pink-700 hover:bg-pink-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
                                            >
                                                {isTraining === neuralStatus.TOTOLOTO.CLASSIFIER_STARS.type ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isTraining === neuralStatus.TOTOLOTO.CLASSIFIER_STARS.type ? 'A Treinar...' : 'Forçar Treino'}
                                            </button>
                                            <button
                                                onClick={() => openBacktestModal('TOTOLOTO', neuralStatus.TOTOLOTO.CLASSIFIER_STARS.type, neuralStatus.TOTOLOTO.CLASSIFIER_STARS.name)}
                                                disabled={!neuralStatus.TOTOLOTO.CLASSIFIER_STARS.trained || isTraining !== null}
                                                title="Avaliar Performance Histórica"
                                                className="sm:w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 flex justify-center items-center rounded-lg py-2 flex-shrink-0 transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>
        
            {/* Live Predict Modal */}
            {isLivePredictModalOpen && livePredictData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
                            <div>
                                <h3 className="font-bold text-lg text-indigo-900 flex items-center">
                                    <Eye className="w-5 h-5 mr-2" />
                                    Central de Previsões ao Vivo
                                </h3>
                                <p className="text-sm text-indigo-700 mt-0.5">{livePredictData.name}</p>
                            </div>
                            <button onClick={() => setIsLivePredictModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 bg-gray-50 flex-grow flex flex-col justify-center items-center">
                            <div className="text-center mb-6">
                                <div className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-2">Próxima Chave Prevista</div>
                                {livePredictData.nextPrediction ? (
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {livePredictData.nextPrediction.map((num: number, idx: number) => (
                                            <div key={idx} className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md ${livePredictData.isSecondary ? 'bg-amber-400' : 'bg-indigo-600'}`}>
                                                {num}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-100">
                                        Nenhuma previsão gerada. Force um novo treino para gerar a primeira chave deste modelo!
                                    </div>
                                )}
                            </div>
                            {livePredictData.accuracy !== null && livePredictData.accuracy !== undefined && (
                                <div className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                                    <span className="text-slate-600 font-medium text-sm">Índice de Confiança (Precisão)</span>
                                    <span className="text-lg font-black text-indigo-600">{livePredictData.accuracy}%</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                            <button
                                onClick={() => setIsLivePredictModalOpen(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
                            >Fechar</button>
                        </div>
                    </div>
                </div>
            )}
    
            {/* Backtest Modal */}
            {isBacktestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 flex items-center">
                                    <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                                    Simulação Retrospectiva
                                </h3>
                                <p className="text-sm text-slate-500">{backtestTarget?.name} ({backtestTarget?.game})</p>
                            </div>
                            <button 
                                onClick={() => setIsBacktestModalOpen(false)}
                                disabled={isBacktesting}
                                className="text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-lg p-1.5 transition-colors disabled:opacity-50"
                            >✕</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            {!backtestResult ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-600">
                                        Escolha o tamanho da amostra (número final de sorteios reais) que pretende esconder do modelo para forçar previsões baseadas no histórico iterativo.
                                    </p>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Qtd. a Simular (Dias):</label>
                                        <select 
                                            value={backtestSamples}
                                            onChange={(e) => setBacktestSamples(e.target.value)}
                                            disabled={isBacktesting}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg border p-2.5"
                                        >
                                            <option value="5">Últimos 5 sorteios</option>
                                            <option value="10">Últimos 10 sorteios (Recomendado)</option>
                                            <option value="25">Últimos 25 sorteios</option>
                                            <option value="50">Últimos 50 sorteios</option>
                                        </select>
                                    </div>
                                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                                        As execuções irão usar a arquitetura de Treino em Tempo Real para prever sucessivamente os resultados ocultos.
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                        <div className="text-green-600 font-bold mb-1">Simulação Concluída!</div>
                                        <div className="text-4xl font-black text-slate-900">{backtestResult.totalPoints} pts</div>
                                        <div className="text-sm text-slate-500 mt-1">Acumulados em {backtestSamples} avaliações.</div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-sm max-h-[300px] overflow-y-auto font-mono text-slate-700">
                                        {backtestResult.logs.map((l, idx) => (
                                            <div key={idx} className="mb-1">{l}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            {!backtestResult ? (
                                <button
                                    onClick={runBacktest}
                                    disabled={isBacktesting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center disabled:opacity-50"
                                >
                                    {isBacktesting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {isBacktesting ? 'A Simular Histórico...' : 'Iniciar Backtest'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setBacktestResult(null)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
                                >Nova Simulação</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
