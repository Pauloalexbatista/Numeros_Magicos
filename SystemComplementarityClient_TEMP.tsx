'use client';

import { useState, useEffect } from 'react';

interface SystemStats {
    name: string;
    totalHits: number;
    jackpots: number;
    drawsCovered: number;
}

interface Combination {
    systems: string[];
    complementarity: number;
    totalCoverage: number;
    overlap: number;
    combinedJackpots: number;
    systemDraws: number[][];
}

interface ApiResponse {
    success: boolean;
    systems: SystemStats[];
    combinations: Combination[];
    stats: {
        totalSystems: number;
        totalCombinations: number;
        perfectCombinations: number;
        avgComplementarity: number;
        avgCoverage: number;
    };
}

export default function SystemComplementarityClient() {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [minHits, setMinHits] = useState(4);
    const [combinationSize, setCombinationSize] = useState(2);
    const [selectedCombination, setSelectedCombination] = useState<Combination | null>(null);

    // Don't auto-fetch on filter change - wait for button click
    useEffect(() => {
        // Only fetch on initial load
        if (data === null) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/complementarity?minHits=${minHits}&combinationSize=${combinationSize}`);
            const result = await response.json();

            if (!result.success) {
                const detailMsg = result.details ? ` (${result.details})` : '';
                throw new Error((result.error || 'Erro ao carregar dados') + detailMsg);
            }

            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Estimate calculation time
    const getEstimatedTime = () => {
        if (combinationSize === 4 && minHits === 4) return '30-60 segundos';
        if (combinationSize === 4) return '10-20 segundos';
        if (combinationSize === 3 && minHits === 4) return '10-15 segundos';
        if (combinationSize === 3) return '5-10 segundos';
        return '2-5 segundos';
    };

    const showWarning = combinationSize === 4 && minHits === 4;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
                    <div className="text-white text-xl mb-2">Calculando combinações...</div>
                    <div className="text-gray-400 text-sm">
                        Tempo estimado: {getEstimatedTime()}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-white">
                    <h2 className="text-xl font-bold mb-2">Erro</h2>
                    <p>{error}</p>
                    <button
                        onClick={fetchData}
                        className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🔬 Análise de Complementaridade de Sistemas
                    </h1>
                    <p className="text-gray-300">
                        Identifique sistemas que acertam em dias diferentes para criar combinações otimizadas
                    </p>
                </div>

                {/* Stats Cards */}
                {data && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                            <div className="text-gray-300 text-sm mb-1">Total de Sistemas</div>
                            <div className="text-3xl font-bold text-white">{data.stats.totalSystems}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                            <div className="text-gray-300 text-sm mb-1">Combinações Possíveis</div>
                            <div className="text-3xl font-bold text-white">{data.stats.totalCombinations}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                            <div className="text-gray-300 text-sm mb-1">Combinações Perfeitas</div>
                            <div className="text-3xl font-bold text-green-400">{data.stats.perfectCombinations}</div>
                            <div className="text-xs text-gray-400 mt-1">0 sobreposições</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                            <div className="text-gray-300 text-sm mb-1">Cobertura Média</div>
                            <div className="text-3xl font-bold text-white">{data.stats.avgCoverage}</div>
                            <div className="text-xs text-gray-400 mt-1">sorteios</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex items-center gap-3">
                            <label className="text-white font-medium">Mínimo de Acertos:</label>
                            <select
                                value={minHits}
                                onChange={(e) => setMinHits(parseInt(e.target.value))}
                                className="px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="4" className="bg-slate-800 text-white">4 acertos</option>
                                <option value="5" className="bg-slate-800 text-white">5 acertos (Jackpot)</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-white font-medium">Tamanho da Combinação:</label>
                            <select
                                value={combinationSize}
                                onChange={(e) => setCombinationSize(parseInt(e.target.value))}
                                className="px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="2" className="bg-slate-800 text-white">2 sistemas</option>
                                <option value="3" className="bg-slate-800 text-white">3 sistemas</option>
                                <option value="4" className="bg-slate-800 text-white">4 sistemas</option>
                            </select>
                        </div>

                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    Calculando...
                                </>
                            ) : (
                                <>
                                    🔬 Calcular
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Warning for slow combinations */}
            {showWarning && (
                <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <div className="text-amber-300 font-semibold mb-1">
                                Aviso: Cálculo Demorado
                            </div>
                            <div className="text-amber-200 text-sm">
                                A combinação de <strong>4 sistemas com 4 acertos</strong> pode demorar <strong>30-60 segundos</strong> a calcular devido ao grande número de combinações possíveis.
                                Para resultados mais rápidos, considere usar <strong>5 acertos (Jackpot)</strong> ou reduzir para <strong>3 sistemas</strong>.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Combinations */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                    🏆 Top Combinações (Máxima Cobertura + Mínima Sobreposição)
                </h2>

                {data && data.combinations.length > 0 ? (
                    <div className="space-y-3">
                        {data.combinations.slice(0, 30).map((combo, idx) => (
                            <div
                                key={idx}
                                className={`border rounded-lg p-4 cursor-pointer transition hover:scale-[1.01] ${combo.overlap === 0
                                    ? 'bg-green-500/10 border-green-500/50'
                                    : selectedCombination === combo
                                        ? 'bg-purple-500/30 border-purple-400'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                onClick={() => setSelectedCombination(selectedCombination === combo ? null : combo)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl font-bold text-purple-300">#{idx + 1}</span>
                                            <div>
                                                <div className="text-white font-semibold">
                                                    {combo.systems.join(' + ')}
                                                </div>
                                                <div className="text-gray-400 text-sm flex items-center gap-2">
                                                    <span className="text-cyan-400 font-bold">{combo.totalCoverage} sorteios cobertos</span>
                                                    <span>•</span>
                                                    <span className={combo.overlap === 0 ? 'text-green-400 font-bold' : ''}>
                                                        {combo.overlap} sobreposições
                                                    </span>
                                                    {combo.overlap === 0 && <span className="text-green-400">⭐ PERFEITO</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-yellow-400 font-bold text-lg">
                                                {combo.combinedJackpots} 🎯
                                            </div>
                                            <div className="text-gray-400 text-xs">Jackpots</div>
                                        </div>

                                        <div className="px-4 py-2 rounded-lg border border-cyan-500/50 bg-cyan-500/10">
                                            <div className="font-bold text-lg text-cyan-300">{combo.complementarity}%</div>
                                            <div className="text-xs text-gray-400">Complementar</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {selectedCombination === combo && (
                                    <div className="mt-4 pt-4 border-t border-white/20">
                                        <div className={`grid grid-cols-${Math.min(combo.systems.length, 3)} gap-4`}>
                                            {combo.systems.map((systemName, sysIdx) => (
                                                <div key={sysIdx}>
                                                    <h4 className="text-purple-300 font-semibold mb-2">{systemName}</h4>
                                                    <div className="text-gray-300 text-sm">
                                                        {combo.systemDraws[sysIdx].length} acertos
                                                    </div>
                                                    <div className="text-gray-400 text-xs mt-1">
                                                        Sorteios: {combo.systemDraws[sysIdx].slice(0, 5).join(', ')}
                                                        {combo.systemDraws[sysIdx].length > 5 && '...'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className={`mt-4 p-3 rounded-lg ${combo.overlap === 0
                                            ? 'bg-green-500/20 border border-green-500/50'
                                            : 'bg-blue-500/20 border border-blue-500/50'
                                            }`}>
                                            <div className={`text-sm font-semibold ${combo.overlap === 0 ? 'text-green-300' : 'text-blue-300'
                                                }`}>
                                                💡 Análise: Esta combinação cobre {combo.totalCoverage} sorteios únicos com {combo.overlap} sobreposição
                                                {combo.overlap === 0 ? ' - complementaridade PERFEITA! 🎯' : '.'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400 text-center py-8">
                        Nenhuma combinação encontrada
                    </div>
                )}
            </div>

            {/* System Performance Table */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                    📊 Performance Individual dos Sistemas
                </h2>

                {data && data.systems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <th className="text-left text-gray-300 font-semibold py-3 px-4">Sistema</th>
                                    <th className="text-center text-gray-300 font-semibold py-3 px-4">Total Acertos</th>
                                    <th className="text-center text-gray-300 font-semibold py-3 px-4">Jackpots</th>
                                    <th className="text-center text-gray-300 font-semibold py-3 px-4">Sorteios Cobertos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.systems.map((system, idx) => (
                                    <tr key={idx} className="border-b border-white/10 hover:bg-white/5 transition">
                                        <td className="py-3 px-4 text-white font-medium">{system.name}</td>
                                        <td className="py-3 px-4 text-center text-gray-300">{system.totalHits}</td>
                                        <td className="py-3 px-4 text-center text-yellow-400 font-bold">{system.jackpots} 🎯</td>
                                        <td className="py-3 px-4 text-center text-gray-300">{system.drawsCovered}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-gray-400 text-center py-8">
                        Nenhum sistema encontrado
                    </div>
                )}
            </div>
        </div>
    );
}
