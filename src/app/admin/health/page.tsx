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
    Shield, 
    Layers, 
    Cpu,
    Zap,
    Eye,
    Trash2
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
    const [isTitanStarting, setIsTitanStarting] = useState(false);
    const [titanProgress, setTitanProgress] = useState<any>(null);
    const [isRFStarting, setIsRFStarting] = useState(false);
    const [rfProgress, setRfProgress] = useState<any>(null);
    const [isLSTMStarting, setIsLSTMStarting] = useState(false);
    const [lstmProgress, setLstmProgress] = useState<any>(null);
    const [aiTask, setAiTask] = useState<any>(null); // New global orchestrator state
    const [dbStatus, setDbStatus] = useState<{success: boolean, message: string} | null>(null); // New state for DB health
    const [systemError, setSystemError] = useState<any>(null); // New state for critical errors

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

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAuthenticated && secret) {
            // Poll for titan progress every 3 seconds
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/admin/titan-progress?secret=${secret}`);
                    const data = await res.json();
                    if (!data.error) setTitanProgress(data);
                    
                    const resRF = await fetch(`/api/admin/rf-progress?secret=${secret}`);
                    const dataRF = await resRF.json();
                    if (!dataRF.error) setRfProgress(dataRF);

                    const resLSTM = await fetch(`/api/admin/lstm-progress?secret=${secret}`);
                    const dataLSTM = await resLSTM.json();
                    if (!dataLSTM.error) setLstmProgress(dataLSTM);

                    // Poll Orchestrator
                    const resOrch = await fetch(`/api/admin/ai-orchestrator?secret=${secret}`);
                    const dataOrch = await resOrch.json();
                    if (dataOrch.success) {
                        const active = dataOrch.tasks.find((t: any) => t.status === 'RUNNING' || t.status === 'PAUSED');
                        setAiTask(active || null);
                    }

                    // Poll for system errors
                    try {
                        const resErr = await fetch(`/api/admin/system-error?secret=${secret}`);
                        if (resErr.ok) {
                            const dataErr = await resErr.json();
                            if (dataErr.error) setSystemError(dataErr.data);
                            else setSystemError(null);
                        }
                    } catch (e) {}

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
            }, 3000);
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

    const handleStartTitan = async () => {
        if (!confirm('ATENÇÃO: Este comando vai colocar a VPS em carga máxima (50% ou 100% de CPU dependendo dos cores) durante várias horas ou até dias para processar a linha temporal perfeita no ML Classifier.\\n\\nQueres arrancar o TITAN ENGINE no servidor agora?')) return;
        
        setIsTitanStarting(true);
        try {
            const res = await fetch('/api/admin/start-titan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret })
            });
            const data = await res.json();
            if (data.success) {
                alert('🚀 ' + data.message);
            } else {
                alert('❌ Erro: ' + data.error);
            }
        } catch(e) {
            alert('Falha crítica ao contactar a VPS.');
        } finally {
            setIsTitanStarting(false);
        }
    };

    const handleStartRF = async () => {
        if (!confirm('ATENÇÃO: Este comando vai colocar o processador a calcular as florestas históricas.\\n\\nQueres arrancar o ENGINE RANDOM FOREST no servidor agora?')) return;
        
        setIsRFStarting(true);
        try {
            const res = await fetch('/api/admin/start-rf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret })
            });
            const data = await res.json();
            if (data.success) {
                alert('🌲 ' + data.message);
            } else {
                alert('❌ Erro: ' + data.error);
            }
        } catch(e) {
            alert('Falha crítica ao contactar a VPS.');
        } finally {
            setIsRFStarting(false);
        }
    };

    const handleStartLSTM = async () => {
        if (!confirm('EXTREMO CUIDADO: O Motor LSTM vai demorar vários dias a simular todo o histórico com memória profunda.\n\nDeseja iniciar em MODO BLOCOS (Manuais) conforme solicitado?')) return;
        
        setIsLSTMStarting(true);
        try {
            const res = await fetch('/api/admin/ai-orchestrator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'CREATE', taskName: 'BACKFILL_LSTM_EUROMILLIONS', totalSteps: 20 }) // 20 intervals of 50
            });
            const data = await res.json();
            if (data.success) {
                alert('🧠 Motor Orquestrado Iniciado! Agora podes controlar os passos no painel.');
                setAiTask(data.task);
            }
        } catch(e) {
            alert('Falha ao contactar orquestrador.');
        } finally {
            setIsLSTMStarting(false);
        }
    };

    const handleNextStep = async () => {
        if (!aiTask) return;
        try {
            const nextStep = aiTask.currentStep + 1;
            const res = await fetch('/api/admin/ml', { // Using existing ML endpoint but with Step data
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer magia2026' },
                body: JSON.stringify({ 
                    game: 'EUROMILLIONS', 
                    targetNetwork: aiTask.taskName.includes('LSTM') ? 'LSTM_NUMBERS' : 'RF_NUMBERS',
                    stepMode: true,
                    currentStep: nextStep
                })
            });
            
            if (res.ok) {
                // Update orchestrator status
                await fetch('/api/admin/ai-orchestrator', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'UPDATE_STEP', taskName: aiTask.taskName, step: nextStep })
                });
            }
        } catch (e) { alert('Erro ao processar etapa.'); }
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
            const res = await fetch(`/api/admin/trigger-update`, {
                method: 'POST',
            });
            const data = await res.json();
            
            if (res.ok) {
                alert('Sincronização lançada para o servidor! O processo está a correr em plano de fundo.');
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

    const handleDeepBackfill = async () => {
        if (!confirm('🚨 ATENÇÃO: RECUPERAÇÃO PROFUNDA 🚨\\n\\nEste comando vai:\\n1. Recuperar todos os sorteios em falta (ex: +290 do Totoloto).\\n2. Recalcular TODO o histórico de performance de todos os sistemas.\\n\\nEste processo ocorre em SEGUNDO PLANO na VPS e pode demorar alguns minutos.\\n\\nDeseja continuar?')) {
            return;
        }

        setIsSyncing(true);
        try {
            const res = await fetch(`/api/admin/full-backfill?secret=${secret}`, {
                method: 'POST',
            });
            const data = await res.json();
            
            if (res.ok) {
                alert('🚀 Recuperação Profunda Iniciada! Podes fechar esta janela se quiseres, o servidor vai continuar a processar em background.');
                setTimeout(() => checkHealth(secret), 10000);
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (err) {
            alert('Falha na ligação com a VPS.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCleanDuplicates = async () => {
        if (!confirm('Deseja procurar e remover sorteios duplicados na base de dados? \\n\\nIsto irá fundir registos com a mesma data e garantir a integridade do histórico.')) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/clean-duplicates?secret=${secret}`, {
                method: 'POST',
            });
            const data = await res.json();
            
            if (res.ok) {
                alert(data.message);
                checkHealth(secret);
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (err) {
            alert('Falha na ligação com a VPS.');
        }
    };

    const handleNeuralAction = async (engine: 'TITAN' | 'RF' | 'LSTM', action: 'START' | 'STOP') => {
        if (action === 'STOP' && !confirm(`Deseja interromper o motor ${engine} imediatamente?`)) {
            return;
        }

        try {
            if (action === 'STOP') {
                const res = await fetch(`/api/admin/stop-neural?secret=${secret}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'STOP' })
                });
                if (res.ok) alert('Sinal de paragem enviado! O motor deve desligar-se em breve.');
                return;
            }

            // If START, first RESET the stop signal
            await fetch(`/api/admin/stop-neural?secret=${secret}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'RESET' })
            });

            // Then call the specific start endpoint
            if (engine === 'TITAN') handleStartTitan();
            if (engine === 'RF') handleStartRF();
            if (engine === 'LSTM') handleStartLSTM();

        } catch (err) {
            alert('Erro ao processar comando neural.');
        }
    };

    const handleResetNeural = async () => {
        if (!confirm('Deseja forçar o RESET de todos os motores e erros? Use isto apenas se o sistema parecer bloqueado.')) return;
        try {
            await fetch(`/api/admin/reset-neural?secret=${secret}`, { method: 'POST' });
            setSystemError(null);
            fetchNeuralStatus();
            alert('Sistema resetado com sucesso!');
        } catch (e) { alert('Falha ao resetar.'); }
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

    if (!healthData || !healthData.health) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    const { EUROMILLIONS, EURODREAMS, TOTOLOTO } = healthData.health;
    
    // Explicitly cast to GameHealth to satisfy TypeScript build requirements
    const emHealth = EUROMILLIONS as GameHealth;
    const edHealth = EURODREAMS as GameHealth;
    const ttHealth = TOTOLOTO as GameHealth;

    // Safety check for rendering logic
    const allHealthy = emHealth.healthy && edHealth.healthy && ttHealth.healthy;

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
                                <button
                                    onClick={handleResetNeural}
                                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center"
                                >
                                    <RefreshCw className="w-3 h-3 mr-2" />
                                    Limpar Erro e Resetar Motor
                                </button>
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
        </div>
    );
}
