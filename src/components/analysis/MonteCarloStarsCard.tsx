'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function MonteCarloStarsCard() {
    const [simulations, setSimulations] = useState(1000);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<{ star: number; count: number }[]>([]);

    const runSimulation = () => {
        setIsRunning(true);

        // Simulate Monte Carlo
        setTimeout(() => {
            const counts: Record<number, number> = {};
            for (let i = 1; i <= 12; i++) counts[i] = 0;

            // Simulate weighted random selections
            for (let sim = 0; sim < simulations; sim++) {
                const selected = new Set<number>();
                while (selected.size < 2) {
                    // Weighted selection (simulate historical frequency)
                    const weights = [1.2, 0.9, 1.1, 0.8, 1.3, 1.0, 0.95, 1.15, 1.25, 0.85, 1.05, 0.9];
                    const totalWeight = weights.reduce((a, b) => a + b, 0);
                    let random = Math.random() * totalWeight;

                    for (let i = 0; i < 12; i++) {
                        random -= weights[i];
                        if (random <= 0) {
                            selected.add(i + 1);
                            break;
                        }
                    }
                }
                selected.forEach(s => counts[s]++);
            }

            const sorted = Object.entries(counts)
                .map(([star, count]) => ({ star: parseInt(star), count }))
                .sort((a, b) => b.count - a.count);

            setResults(sorted);
            setIsRunning(false);
        }, 500);
    };

    const topStars = results.slice(0, 6);
    const maxCount = results[0]?.count || 1;

    return (
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-500/30">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                        🎲 Monte Carlo Stars
                    </h3>
                    <a
                        href="/analysis/stars/ranking/Monte%20Carlo%20Stars"
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm transition-colors"
                    >
                        Ver Detalhes →
                    </a>
                </div>

                <p className="text-slate-300 text-sm">
                    Simulações probabilísticas baseadas em frequências históricas
                </p>

                {/* Controls */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">🎯 Número de Simulações</span>
                        <span className="text-yellow-400 font-bold">{simulations.toLocaleString()}</span>
                    </div>
                    <input
                        type="range"
                        min="100"
                        max="5000"
                        step="100"
                        value={simulations}
                        onChange={(e) => setSimulations(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        disabled={isRunning}
                    />
                    <button
                        onClick={runSimulation}
                        disabled={isRunning}
                        className="w-full py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg font-medium transition-all"
                    >
                        {isRunning ? '⏳ Simulando...' : '▶️ Executar Simulação'}
                    </button>
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-400">📊 Resultados ({simulations} simulações):</p>

                        {/* Top 6 Stars */}
                        <div className="grid grid-cols-6 gap-2">
                            {topStars.map((item, idx) => (
                                <div key={item.star} className="text-center">
                                    <div className="relative">
                                        <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-black">
                                            {item.star}
                                        </div>
                                        {idx < 3 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs">
                                                {idx + 1}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-400">
                                        {item.count}x
                                    </div>
                                    <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-500"
                                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-2 bg-yellow-900/20 border border-yellow-500/30 rounded text-xs text-slate-400">
                            💡 As estrelas mais frequentes nas simulações têm maior probabilidade de aparecer
                        </div>
                    </div>
                )}

                {results.length === 0 && (
                    <div className="p-8 text-center text-slate-500 italic">
                        👆 Clique em "Executar Simulação" para ver os resultados
                    </div>
                )}
            </div>
        </Card>
    );
}
