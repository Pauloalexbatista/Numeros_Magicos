'use client';

import { useState } from 'react';

export default function StarComplementarityClient() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const runAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/star-complementarity');
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
        <div className="bg-gradient-to-br from-slate-900 via-yellow-900/20 to-slate-900 p-6 rounded-xl border border-yellow-500/20">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                ⭐ Análise de Complementaridade (Estrelas)
            </h2>
            <p className="text-slate-300 mb-6">
                Descubra quais sistemas de estrelas, quando combinados, cobrem mais jackpots.
            </p>

            <button
                onClick={runAnalysis}
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-8 rounded-lg transition disabled:bg-gray-600 flex items-center gap-2"
            >
                {loading ? <span className="animate-spin">⌛</span> : <span>🔍</span>}
                {loading ? 'A Analisar Sistemas...' : 'Iniciar Análise Completa'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-500/20 text-red-200 border border-red-500 rounded">
                    ❌ Erro: {error}
                </div>
            )}

            {results && (
                <div className="mt-8 space-y-6">
                    {/* Best Pairs */}
                    {results.pairs && results.pairs.length > 0 && (
                        <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 p-4 rounded-lg border border-yellow-500/30">
                            <h3 className="text-yellow-400 font-bold text-xl mb-4">
                                🥇 Melhores PARES de Estrelas
                            </h3>
                            <div className="space-y-3">
                                {results.pairs.slice(0, 5).map((pair: any, i: number) => (
                                    <div key={i} className="bg-black/40 p-4 rounded-lg hover:bg-black/60 transition">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-white font-semibold">{pair.systems.join(' + ')}</span>
                                            <span className="text-yellow-400 font-bold text-lg">{pair.combinedJackpots} JPs</span>
                                        </div>
                                        <div className="flex gap-4 text-sm text-slate-400">
                                            <span>Cobertura: {pair.coverage}%</span>
                                            <span>•</span>
                                            <span>Complementaridade: {pair.complementarity > 0 ? '+' : ''}{pair.complementarity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Best Trios */}
                    {results.trios && results.trios.length > 0 && (
                        <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 p-4 rounded-lg border border-amber-500/30">
                            <h3 className="text-amber-400 font-bold text-xl mb-4">
                                🥈 Melhores TRIOS de Estrelas
                            </h3>
                            <div className="space-y-3">
                                {results.trios.slice(0, 5).map((trio: any, i: number) => (
                                    <div key={i} className="bg-black/40 p-4 rounded-lg hover:bg-black/60 transition">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-white font-semibold text-sm">{trio.systems.join(' + ')}</span>
                                            <span className="text-amber-400 font-bold text-lg">{trio.combinedJackpots} JPs</span>
                                        </div>
                                        <div className="flex gap-4 text-sm text-slate-400">
                                            <span>Cobertura: {trio.coverage}%</span>
                                            <span>•</span>
                                            <span>Complementaridade: {trio.complementarity > 0 ? '+' : ''}{trio.complementarity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    {results.summary && (
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <h4 className="text-white font-bold mb-2">📊 Resumo da Análise</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-yellow-400">{results.summary.totalSystems}</div>
                                    <div className="text-xs text-slate-400">Sistemas</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-400">{results.summary.drawsAnalyzed}</div>
                                    <div className="text-xs text-slate-400">Sorteios</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-400">{results.summary.pairsAnalyzed}</div>
                                    <div className="text-xs text-slate-400">Pares</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-400">{results.summary.triosAnalyzed}</div>
                                    <div className="text-xs text-slate-400">Trios</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
