'use client';

import { useState, useEffect } from 'react';
import { Vote, TrendingUp, Trophy, Loader2, Check, RefreshCcw, Star } from 'lucide-react';

interface SystemStats {
    name: string;
    accuracy: number;
    jackpots: number;
    avgHits: number;
}

interface ConsensusResponse {
    success: boolean;
    consensus: {
        stars: number[];
        votingDetails: { star: number; votes: number; weightedVotes: number }[];
        method: string;
    };
    antiConsensus: {
        stars: number[];
        votingDetails: { star: number; votes: number; weightedVotes: number }[];
    };
    backtest: {
        drawsAnalyzed: number;
        consensus: {
            accuracyRate: number;
            avgHits: number;
            hitDistribution: Record<number, number>;
        };
        antiConsensus: {
            accuracyRate: number;
            avgHits: number;
            hitDistribution: Record<number, number>;
        };
        validation?: {
            totalPercentage: number;
            isValid: boolean;
            totalStarsDrawn: number;
            consensusStarHits: number;
            antiStarHits: number;
        };
    };
    comparison: {
        bestSolo: { name: string; accuracy: number };
        consensusImprovement: number;
        antiImprovement: number;
        allSystems?: { name: string; accuracy: number; count: number }[];
    };
    systems: { name: string; weight: number }[];
}

export default function StarConsensusClient() {
    const [systemStats, setSystemStats] = useState<SystemStats[]>([]);
    const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
    const [method, setMethod] = useState<'simple' | 'weighted'>('weighted');
    const [backtestSize, setBacktestSize] = useState(100);
    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [result, setResult] = useState<ConsensusResponse | null>(null);

    useEffect(() => {
        // Fetch star system statistics
        fetch('/api/star-system-stats')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.systems) {
                    setSystemStats(data.systems);
                    if (data.systems.length === 0) {
                        setStatsError('Nenhum sistema de estrelas encontrado');
                    }
                } else {
                    setStatsError(data.error || 'Erro desconhecido');
                }
            })
            .catch(err => {
                console.error('[Star Consensus] Stats error:', err);
                setStatsError('Erro ao carregar sistemas: ' + err.message);
            })
            .finally(() => setLoadingStats(false));
    }, []);

    const toggleSystem = (name: string) => {
        if (selectedSystems.includes(name)) {
            setSelectedSystems(prev => prev.filter(s => s !== name));
        } else {
            if (selectedSystems.length < 5) {
                setSelectedSystems(prev => [...prev, name]);
            }
        }
    };

    const calculateConsensus = async () => {
        if (selectedSystems.length < 2) {
            alert('Selecione pelo menos 2 sistemas');
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                systems: selectedSystems.join(','),
                method,
                backtest: backtestSize.toString(),
            });

            const res = await fetch(`/api/star-consensus?${params}`);
            const data = await res.json();

            if (data.success) {
                setResult(data);
            } else {
                console.error('[Star Consensus Error]:', data);
                alert(`❌ Erro: ${data.error}\n\n${data.details || ''}`);
            }
        } catch (error: any) {
            console.error('[Star Consensus Fetch Error]:', error);
            alert('❌ Erro na comunicação: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 mb-3 flex items-center justify-center gap-3">
                        <Star className="w-10 h-10 text-yellow-500" />
                        Laboratório de Consenso (Estrelas)
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Combine múltiplos sistemas de estrelas para superar 55% de acerto
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">

                    {/* System Selection */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Vote className="w-5 h-5 text-yellow-500" />
                                Selecione 2-5 Sistemas de Estrelas
                            </h3>
                            {selectedSystems.length > 0 && (
                                <button
                                    onClick={() => {
                                        setSelectedSystems([]);
                                        setResult(null);
                                    }}
                                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:border-slate-500"
                                >
                                    <RefreshCcw className="w-3 h-3" />
                                    Limpar
                                </button>
                            )}
                        </div>
                        {loadingStats ? (
                            <div className="text-center py-8 text-slate-500">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                A carregar estatísticas...
                            </div>
                        ) : statsError ? (
                            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
                                <div className="text-red-400 font-bold mb-2">❌ Erro</div>
                                <div className="text-red-300 text-sm">{statsError}</div>
                            </div>
                        ) : systemStats.length === 0 ? (
                            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6 text-center">
                                <div className="text-yellow-400 font-bold mb-2">⚠️ Sem Dados</div>
                                <div className="text-yellow-300 text-sm">Nenhum sistema encontrado</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                                {systemStats.map(sys => (
                                    <button
                                        key={sys.name}
                                        onClick={() => toggleSystem(sys.name)}
                                        disabled={!selectedSystems.includes(sys.name) && selectedSystems.length >= 5}
                                        className={`
                                            relative p-3 rounded-lg text-left transition-all border-2
                                            ${selectedSystems.includes(sys.name)
                                                ? 'bg-yellow-600 border-yellow-400 text-black shadow-lg scale-105'
                                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}
                                            disabled:opacity-30 disabled:cursor-not-allowed
                                        `}
                                    >
                                        {selectedSystems.includes(sys.name) && (
                                            <div className="absolute top-2 right-2">
                                                <Check className="w-5 h-5 text-black" />
                                            </div>
                                        )}
                                        <div className="font-bold text-sm mb-2 pr-6">{sys.name}</div>
                                        <div className="flex gap-3 text-xs">
                                            <div className={selectedSystems.includes(sys.name) ? 'text-black' : 'text-slate-400'}>
                                                <div className="font-mono font-bold text-lg">{sys.accuracy}%</div>
                                                <div className="opacity-75">acerto</div>
                                            </div>
                                            <div className={selectedSystems.includes(sys.name) ? 'text-black' : 'text-slate-400'}>
                                                <div className="font-mono font-bold text-lg">{sys.jackpots}</div>
                                                <div className="opacity-75">JP</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Method & Backtest */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Método de Votação</label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value as 'simple' | 'weighted')}
                                className="w-full bg-slate-800 border-none rounded text-white p-2"
                            >
                                <option value="weighted">Ponderado (melhor = mais peso)</option>
                                <option value="simple">Simples (1 voto = 1 ponto)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Backtest (sorteios)</label>
                            <select
                                value={backtestSize}
                                onChange={(e) => setBacktestSize(parseInt(e.target.value))}
                                className="w-full bg-slate-800 border-none rounded text-white p-2"
                            >
                                <option value={50}>50 últimos</option>
                                <option value={100}>100 últimos</option>
                                <option value={500}>500 últimos</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={calculateConsensus}
                                disabled={loading || selectedSystems.length < 2}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-black font-bold py-2 px-4 rounded transition flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Calculando...
                                    </>
                                ) : (
                                    <>
                                        <Vote className="w-5 h-5" />
                                        Calcular Consenso
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {result && (
                    <div className="space-y-6">

                        {/* Comparison Card */}
                        <div className={`border-2 rounded-2xl p-8 text-center ${result.comparison.consensusImprovement > 0
                            ? 'bg-green-500/10 border-green-500'
                            : 'bg-red-500/10 border-red-500'
                            }`}>
                            <div className="flex justify-center items-center gap-8 mb-4">
                                <div>
                                    <div className="text-sm text-slate-400 mb-1">Melhor Sistema Solo</div>
                                    <div className="text-4xl font-black text-white">{result.comparison.bestSolo.accuracy}%</div>
                                    <div className="text-xs text-slate-500">{result.comparison.bestSolo.name}</div>
                                </div>

                                <TrendingUp className={`w-12 h-12 ${result.comparison.consensusImprovement > 0 ? 'text-green-400' : 'text-red-400'}`} />

                                <div>
                                    <div className="text-sm text-slate-400 mb-1">Consenso ({selectedSystems.length} sistemas)</div>
                                    <div className="text-5xl font-black text-yellow-400">{result.backtest.consensus.accuracyRate}%</div>
                                    <div className={`text-sm font-bold ${result.comparison.consensusImprovement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {result.comparison.consensusImprovement > 0 ? '+' : ''}{result.comparison.consensusImprovement}%
                                    </div>
                                </div>
                            </div>

                            {result.comparison.consensusImprovement > 0 ? (
                                <div className="text-green-400 font-bold text-lg">✅ CONSENSO É MELHOR!</div>
                            ) : (
                                <div className="text-red-400 font-bold text-lg">❌ Solo ainda é melhor</div>
                            )}
                        </div>

                        {/* Consensus Stars */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Consenso: TOP 6 Estrelas (Cada estrela sorteada que está aqui = +1 acerto)
                            </h3>
                            <div className="flex flex-wrap gap-4 justify-center">
                                {result.consensus.stars.map(star => (
                                    <div key={star} className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                                        <span className="text-2xl font-black text-slate-900">{star}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-center">
                                <div className="text-3xl font-black text-yellow-400">{result.backtest.consensus.accuracyRate}%</div>
                                <div className="text-sm text-slate-500">Taxa de acerto no backtest</div>
                                <div className="mt-3 pt-3 border-t border-slate-700">
                                    <div className="text-xs text-slate-400 mb-2">Distribuição de Acertos por Sorteio:</div>
                                    <div className="flex justify-center gap-4 text-xs">
                                        <div className="text-center">
                                            <div className="font-bold text-white">{result.backtest.consensus.hitDistribution[0]}</div>
                                            <div className="text-slate-500">0 estrelas</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold text-yellow-300">{result.backtest.consensus.hitDistribution[1]}</div>
                                            <div className="text-slate-500">1 estrela</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold text-yellow-400">{result.backtest.consensus.hitDistribution[2]}</div>
                                            <div className="text-slate-500">2 estrelas</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Anti-Consensus Stars */}
                        <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                🔄 Anti-Consenso: BOTTOM 6 Estrelas (Cada estrela sorteada que está aqui = +1 acerto)
                            </h3>
                            <div className="flex flex-wrap gap-4 justify-center">
                                {result.antiConsensus.stars.map(star => (
                                    <div key={star} className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                                        <span className="text-2xl font-black text-white">{star}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-center">
                                <div className="text-3xl font-black text-purple-400">{result.backtest.antiConsensus.accuracyRate}%</div>
                                <div className="text-sm text-slate-500">Taxa de acerto no backtest</div>
                                <div className="mt-3 pt-3 border-t border-slate-700">
                                    <div className="text-xs text-slate-400 mb-2">Distribuição de Acertos por Sorteio:</div>
                                    <div className="flex justify-center gap-4 text-xs">
                                        <div className="text-center">
                                            <div className="font-bold text-white">{result.backtest.antiConsensus.hitDistribution[0]}</div>
                                            <div className="text-slate-500">0 estrelas</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold text-purple-300">{result.backtest.antiConsensus.hitDistribution[1]}</div>
                                            <div className="text-slate-500">1 estrela</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold text-purple-400">{result.backtest.antiConsensus.hitDistribution[2]}</div>
                                            <div className="text-slate-500">2 estrelas</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Validation Card */}
                        {result.backtest.validation && (
                            <div className={`border-2 rounded-xl p-6 ${result.backtest.validation.isValid
                                ? 'bg-green-500/10 border-green-500'
                                : 'bg-red-500/10 border-red-500'
                                }`}>
                                <h3 className="font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
                                    {result.backtest.validation.isValid ? '✅' : '❌'} Validação Matemática
                                </h3>
                                <div className="text-center space-y-4">
                                    <div className="text-5xl font-black">
                                        <span className="text-yellow-400">{result.backtest.consensus.accuracyRate}%</span>
                                        <span className="text-white mx-2">+</span>
                                        <span className="text-purple-400">{result.backtest.antiConsensus.accuracyRate}%</span>
                                        <span className="text-white mx-2">=</span>
                                        <span className={result.backtest.validation.isValid ? 'text-green-400' : 'text-red-400'}>
                                            {result.backtest.validation.totalPercentage}%
                                        </span>
                                    </div>
                                    {result.backtest.validation.isValid ? (
                                        <div className="text-green-400 font-bold text-lg">
                                            ✅ Sistema + Anti-Sistema = 100% (Complemento Matemático Perfeito)
                                        </div>
                                    ) : (
                                        <div className="text-red-400 font-bold text-lg">
                                            ❌ Erro: A soma deveria ser 100%
                                        </div>
                                    )}
                                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 text-sm">
                                        <div className="text-slate-300">
                                            📊 <strong>Contagem por Estrela Individual:</strong>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div className="text-left">
                                                <div className="text-yellow-400 font-bold">{result.backtest.validation.consensusStarHits} estrelas</div>
                                                <div className="text-slate-400">no TOP 6</div>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-purple-400 font-bold">{result.backtest.validation.antiStarHits} estrelas</div>
                                                <div className="text-slate-400">no BOTTOM 6</div>
                                            </div>
                                        </div>
                                        <div className="text-slate-400 mt-2 pt-2 border-t border-slate-700">
                                            Total: {result.backtest.validation.totalStarsDrawn} estrelas sorteadas
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
}
