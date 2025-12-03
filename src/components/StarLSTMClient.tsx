'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getStarPrediction } from '@/app/analysis/stars/actions';

export function StarLSTMClient() {
    const [stars, setStars] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPrediction();
    }, []);

    const loadPrediction = async () => {
        setLoading(true);
        try {
            // We need to ensure this action exists and supports system name
            // If not, we might need to create a specific action for Star LSTM
            const result = await getStarPrediction('Star LSTM Neural Net');
            setStars(result.slice(0, 2)); // Show Top 2 (Primary prediction)
        } catch (error) {
            console.error('Failed to load Star LSTM prediction:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                        <span className="text-2xl">🌟</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            Rede Neuronal (Estrelas)
                            <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
                                Deep Learning
                            </span>
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                            Previsão de estrelas com memória temporal (LSTM)
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
                <div className="flex justify-center gap-6 min-h-[4rem]">
                    {loading ? (
                        Array(2).fill(0).map((_, i) => (
                            <div key={i} className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        ))
                    ) : stars.length > 0 ? (
                        stars.map((star) => (
                            <div key={star} className="relative group">
                                <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-amber-500/30 dark:shadow-amber-900/50 border-2 border-amber-300 group-hover:scale-110 transition-transform">
                                    ★ {star}
                                </div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-amber-600 dark:text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
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
                            <div className="font-mono text-sm text-yellow-600 dark:text-yellow-500 font-bold">Instantâneo</div>
                        </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg flex items-center gap-3 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-xl">🧠</span>
                        <div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Modelo</div>
                            <div className="font-mono text-sm text-amber-600 dark:text-amber-500 font-bold">LSTM (Estrelas)</div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
