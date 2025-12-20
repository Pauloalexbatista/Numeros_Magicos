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


// -- NEW ROBUST CLIENT --
function SimpleSearchClient() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const runAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/run-search-script');
            const data = await res.json();

            if (!data.success) throw new Error(data.error || 'Erro desconhecido');
            setResults(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 p-6 rounded-lg border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">🚀 Busca Automática (Motor Dedicado)</h2>
            <p className="text-gray-300 mb-6">
                Este novo motor corre num processo isolado para garantir máxima estabilidade e acesso direto à base de dados.
                Analisa Pares e Trios.
            </p>

            <button
                onClick={runAnalysis}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition disabled:bg-gray-600 flex items-center gap-2"
            >
                {loading ? <span className="animate-spin">⌛</span> : <span>🔍</span>}
                {loading ? 'A Executar Motor de Análise...' : 'Iniciar Busca Completa'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-500/20 text-red-200 border border-red-500 rounded">
                    ❌ Erro: {error}
                </div>
            )}

            {results && (
                <div className="mt-8 space-y-8">
                    {/* PORTFOLIO QUARTETS (NEW) */}
                    {results.quartets && results.quartets.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-lg border border-purple-500/30">
                            <h3 className="text-cyan-400 font-bold text-xl mb-2 flex items-center gap-2">
                                💎 Melhores QUARTETOS (Portfolio)
                                <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30">Novo!</span>
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">Combinações de 4 sistemas que, jogados juntos, teriam garantido mais prémios.</p>
                            <div className="space-y-2">
                                {results.quartets.map((r: any, i: number) => (
                                    <div key={i} className="bg-black/40 p-3 rounded flex justify-between items-center hover:bg-black/60 transition">
                                        <div className="flex-1">
                                            <span className="text-white font-mono text-sm block mb-1">{r.systems.join(' + ')}</span>
                                            <div className="flex gap-3 text-xs">
                                                <span className="text-yellow-400 font-bold">{r.jackpots} Total JPs</span>
                                                <span className="text-gray-400">|</span>
                                                <span className="text-orange-400 font-bold" title="Sorteios onde pelo menos 2 sistemas acertaram Jackpot">{r.combinedJackpots || 0} JPs Combinados 🤝</span>
                                                <span className="text-gray-400">|</span>
                                                <span className="text-green-300">{r.coverage} Linhas Premiadas (4+)</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-green-400 font-bold text-lg mb-2">🏆 Melhores COMBINAÇÕES (Consenso de Voto)</h3>
                        <div className="space-y-2">
                            {results.consensus.map((r: any, i: number) => (
                                <div key={i} className="bg-black/20 p-3 rounded flex justify-between items-center">
                                    <span className="text-white font-mono">#{i + 1} {r.systems.join(' + ')}</span>
                                    <span className="text-green-400 font-bold">{Number(r.consensus).toFixed(2)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-yellow-400 font-bold text-lg mb-2">💀 Melhores ANTI-SISTEMAS</h3>
                        <div className="space-y-2">
                            {results.anti.map((r: any, i: number) => (
                                <div key={i} className="bg-black/20 p-3 rounded flex justify-between items-center">
                                    <span className="text-white font-mono">#{i + 1} {r.systems.join(' + ')}</span>
                                    <span className="text-yellow-400 font-bold">{Number(r.anti).toFixed(2)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SystemComplementarityClient() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🔬 Análise de Complementaridade
                    </h1>
                    <p className="text-gray-300">
                        Ferramentas de análise profunda de sistemas.
                    </p>
                </div>

                <SimpleSearchClient />
            </div>
        </div>
    );
}
