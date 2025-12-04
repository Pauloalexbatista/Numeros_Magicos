'use client';

import { useEffect, useState } from 'react';
import { getVortexAnalysis, VortexResonance } from '@/app/analysis/vortex-pyramid/actions';

export default function VortexPyramidClient() {
    const [data, setData] = useState<VortexResonance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const results = await getVortexAnalysis();
                setData(results);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="ml-4 text-zinc-600 dark:text-zinc-400">A calcular ressonância vortex...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400">❌ {error}</p>
            </div>
        );
    }

    // Get Top 25 for main display
    const top25 = data.slice(0, 25);
    const maxScore = Math.max(...data.map(d => d.score));

    // Helper for opacity based on score
    const getOpacity = (score: number) => {
        return 0.4 + (score / maxScore) * 0.6;
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>🎯</span> Previsão Vortex Pyramid
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Top 25 números com maior ressonância toroidal (Intensidade = Score)
                </p>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {top25.map((item, index) => (
                        <div
                            key={item.num}
                            className="aspect-square flex flex-col items-center justify-center rounded-lg font-bold text-lg bg-white dark:bg-zinc-800 border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                            title={`Posição ${index + 1} | Score: ${item.score}`}
                        >
                            {/* Heatmap Background */}
                            <div
                                className="absolute inset-0 bg-purple-500 dark:bg-purple-400 transition-opacity"
                                style={{ opacity: getOpacity(item.score) * 0.2 }}
                            />

                            <span className="relative z-10">{item.num}</span>
                            <span className="text-[10px] text-zinc-400 relative z-10 font-normal">
                                {item.score} pts
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-4 bg-white/50 dark:bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        💡 <strong>Dica:</strong> A intensidade da cor e o valor "pts" indicam a força da ressonância vortex.
                        Quanto maior o score, mais vezes o número apareceu nas linhas diagonais temporais.
                    </p>
                </div>
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold mb-3">📊 Estatísticas da Previsão</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{top25.length}</div>
                        <div className="text-xs text-zinc-500">Números Previstos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{Math.min(...top25.map(d => d.num))}</div>
                        <div className="text-xs text-zinc-500">Menor Número</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.max(...top25.map(d => d.num))}</div>
                        <div className="text-xs text-zinc-500">Maior Número</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                            {(top25.reduce((a, b) => a + b.num, 0) / top25.length).toFixed(1)}
                        </div>
                        <div className="text-xs text-zinc-500">Média</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
