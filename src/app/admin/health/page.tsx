'use client';

import React, { useState, useEffect } from 'react';
import { 
    Database, 
    RefreshCw, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    Activity, 
    Download, 
    Layers, 
    Cpu,
    Zap,
    RefreshCcw
} from 'lucide-react';

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
    const [isSyncingTarget, setIsSyncingTarget] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'database' | 'systems' | 'neural'>('database');
    const [filterGame, setFilterGame] = useState<string>('ALL');
    const [filterType, setFilterType] = useState<string>('ALL');

    const [dbStatus, setDbStatus] = useState<{success: boolean, message: string} | null>(null);
    const [systemError, setSystemError] = useState<any>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSystems();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAuthenticated && secret) {
            interval = setInterval(async () => {
                try {
                    // Poll for DB Connectivity
                    try {
                        const resDb = await fetch(`/api/admin/db-test?secret=${secret}`);
                        if (resDb.ok) {
                            const dataDb = await resDb.json();
                            setDbStatus({ success: dataDb.success, message: dataDb.success ? dataDb.responseTime : dataDb.error });
                        }
                    } catch (e) {}
                } catch (e) {
                    console.log("[Dashboard] Polling cycle error:", e);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isAuthenticated, secret]);

    const fetchSystems = async () => {
        setIsLoadingSystems(true);
        try {
            const res = await fetch(`/api/admin/systems?secret=${secret}`);
            const data = await res.json();
            if (data.systems) setSystems(data.systems);
        } catch (e) { console.error(e); } finally { setIsLoadingSystems(false); }
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

    const checkHealth = async (pass: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/health?secret=${pass}`);
            const data = await res.json();
            if (data.success) {
                setHealthData(data);
                setIsAuthenticated(true);
                setSecret(pass);
            } else {
                setError(data.error || 'Falha na autenticação.');
            }
        } catch (e) {
            setError('Erro de ligação ao servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForceSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/admin/recalculate-predictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer magia2026' },
                body: JSON.stringify({ secret })
            });
            if (res.ok) alert('Previsões recalculadas!');
        } catch(e) {
            alert('Falha ao sincronizar.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeepBackfill = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/admin/recalculate-rankings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer magia2026' },
                body: JSON.stringify({ secret })
            });
            if (res.ok) alert('Rankings recalculados!');
        } catch(e) {
            alert('Falha no backfill.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleExportCalendar = () => {
        window.open(`/api/admin/export-calendar?secret=${secret}`, '_blank');
    };

    const handleExportSystems = () => {
        window.open(`/api/admin/export-systems?secret=${secret}`, '_blank');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600 mb-4">
                            <Database className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Admin Control Panel</h1>
                        <p className="text-slate-500 text-sm text-center mt-2">Insira a chave mestra para aceder aos diagnósticos da base de dados e gestão de sistemas.</p>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Master Secret"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && checkHealth(secret)}
                        />
                        {error && <p className="text-red-500 text-xs font-semibold text-center">{error}</p>}
                        <button
                            onClick={() => checkHealth(secret)}
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center"
                        >
                            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Desbloquear Painel'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const emHealth = healthData!.health.EUROMILLIONS;
    const edHealth = healthData!.health.EURODREAMS;
    const ttHealth = healthData!.health.TOTOLOTO;
    const allHealthy = emHealth.healthy && edHealth.healthy && ttHealth.healthy;

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
                                {dbStatus && (
                                    <div className={`ml-4 flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${dbStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'}`}>
                                        <Database className="w-3 h-3 mr-1" />
                                        {dbStatus.success ? `DB OK (${dbStatus.message})` : `DB ERROR: ${dbStatus.message}`}
                                    </div>
                                )}
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
                            className={`flex items-center justify-center px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                isSyncing 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="Forçar recalculo de previsões (Próximo Sorteio)"
                        >
                            <Activity className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-pulse' : ''}`} />
                            Recalcular Previsões
                        </button>

                        <button
                            onClick={handleDeepBackfill}
                            disabled={isSyncing}
                            className={`flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                isSyncing 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                            }`}
                        >
                            <Zap className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-pulse' : ''}`} />
                            {isSyncing ? 'Processando...' : 'Recalcular Rankings'}
                        </button>
                    </div>
                </div>

                {/* 🚨 SYSTEM ERROR BANNER */}
                {systemError && (
                    <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl shadow-lg animate-bounce-subtle">
                        <div className="flex items-start">
                            <div className="bg-red-100 p-2 rounded-lg text-red-600 mr-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-red-900">🚨 Erro Crítico no Servidor</h3>
                                <p className="text-red-700 mt-1 font-medium">
                                    O motor <span className="font-mono bg-red-100 px-1 rounded">[{systemError.engine}]</span> parou com o seguinte erro:
                                </p>
                                <div className="mt-2 p-3 bg-white/50 border border-red-100 rounded-xl text-sm font-mono text-red-800">
                                    {systemError.message}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                    <GameCard data={emHealth} title="EuroMilhões" onSync={() => handleSpecificSync("EUROMILLIONS")} isSyncing={isSyncingTarget === "EUROMILLIONS"} />
                    <GameCard data={edHealth} title="EuroDreams" onSync={() => handleSpecificSync("EURODREAMS")} isSyncing={isSyncingTarget === "EURODREAMS"} />
                    <GameCard data={ttHealth} title="Totoloto" onSync={() => handleSpecificSync("TOTOLOTO")} isSyncing={isSyncingTarget === "TOTOLOTO"} />
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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <RefreshCw className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Laboratório Neuronal em Reconstrução</h2>
                            <p className="text-slate-500 max-w-lg mt-4 text-lg">
                                Conforme planeado, efetuámos o <strong>Factory Reset</strong> dos motores de IA. 
                                Os antigos scripts (Titan, RF, LSTM) foram removidos para garantir uma base estável e sem erros históricos.
                            </p>
                            <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-sm max-w-md">
                                ℹ️ A estrutura da base de dados foi preservada. Os novos motores individuais serão reconstruídos e testados um a um para garantir máxima precisão.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function GameCard({ data, title, onSync, isSyncing }: { data: GameHealth, title: string, onSync: () => void, isSyncing: boolean }) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border p-6 transition-all hover:shadow-md ${data.healthy ? 'border-gray-100' : 'border-red-100 bg-red-50/30'}`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${data.healthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {data.healthy ? 'Saudável' : 'Inconsistente'}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Sorteios:</span>
                    <span className="font-bold text-slate-800">{data.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Última Data:</span>
                    <span className="font-bold text-slate-800">{new Date(data.lastDate).toLocaleDateString('pt-PT')}</span>
                </div>
                {!data.healthy && (
                    <div className="mt-4 p-3 bg-red-100/50 rounded-xl">
                        <p className="text-xs text-red-700 font-bold">Buracos: {data.missingCount}</p>
                    </div>
                )}
            </div>

            <button
                onClick={onSync}
                disabled={isSyncing}
                className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                    data.healthy 
                    ? 'bg-slate-50 text-slate-600 hover:bg-slate-100' 
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                }`}
            >
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                {isSyncing ? 'Sincronizando...' : 'Forçar Sync'}
            </button>
        </div>
    );
}
