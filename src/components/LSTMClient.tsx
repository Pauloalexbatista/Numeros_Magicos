'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getSystemPrediction } from '@/app/analysis/actions';

export function LSTMClient() {
    const [numbers, setNumbers] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPrediction();
    }, []);

    const loadPrediction = async () => {
        setLoading(true);
        try {
            // We use the generic action but request the specific system
            const result = await getSystemPrediction('LSTM Neural Net');
            setNumbers(result.slice(0, 5)); // Show Top 5
        } catch (error) {
            console.error('Failed to load LSTM prediction:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                        <span className="text-2xl">🧠</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            Rede Neuronal (LSTM)
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/30">
                                Deep Learning
                            </span>
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                            Analisa sequências temporais complexas (Memória de Longo Prazo)
                        </p>
                    </div>
                </div>
                <button
                    onClick={loadPrediction}
                    disabled={loading}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50 text-zinc-400"
                >
                    {loading ? '↻' : '↻'}
                </button>
            </div>

            <div className="space-y-6">
                {/* Main Prediction */}
                <div className="flex justify-center gap-4 min-h-[3rem]">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        ))
                    ) : numbers.length > 0 ? (
                        numbers.map((num) => (
                            <div key={num} className="relative group">
                                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/50 border border-indigo-500 group-hover:scale-110 transition-transform">
                                    {num}
                                </div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-indigo-600 dark:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                                    Alta Prob.
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-zinc-500 text-sm flex items-center gap-2">
                            <span>⚠️</span> Sem previsão disponível
                        </div>
                    )}
                </div>

                {/* Stats / Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg flex items-center gap-3 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-xl">⚡</span>
                        <div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Velocidade</div>
                            <div className="font-mono text-sm text-yellow-600 dark:text-yellow-500 font-bold">Instantâneo (Cache)</div>
                        </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg flex items-center gap-3 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-xl">🧠</span>
                        <div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Arquitetura</div>
                            <div className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold">32 Neurónios LSTM</div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
