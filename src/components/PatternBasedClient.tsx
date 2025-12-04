'use client';

import { useEffect, useState } from 'react';
import { getSystemPrediction } from '@/app/analysis/actions';

export default function PatternBasedClient() {
    const [prediction, setPrediction] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPrediction() {
            try {
                setLoading(true);
                const predicted = await getSystemPrediction('Baseado em Padrões (Amplitude/Pirâmide)');
                setPrediction(predicted.slice(0, 25));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        }
        fetchPrediction();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                    <p className="ml-4 text-zinc-600 dark:text-zinc-400">A analisar padrões...</p>
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

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 rounded-xl p-6 border border-rose-200 dark:border-rose-800">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>🎯</span> Previsão Pattern Based
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Top 25 números baseados em padrões de amplitude e pirâmide
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {prediction.map((num) => (
                        <div
                            key={num}
                            className="aspect-square flex items-center justify-center rounded-lg font-bold text-lg bg-white dark:bg-zinc-800 border-2 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {num}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold mb-3">📊 Estatísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{prediction.length}</div>
                        <div className="text-xs text-zinc-500">Números</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{Math.min(...prediction)}</div>
                        <div className="text-xs text-zinc-500">Mínimo</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{Math.max(...prediction)}</div>
                        <div className="text-xs text-zinc-500">Máximo</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                            {(prediction.reduce((a, b) => a + b, 0) / prediction.length).toFixed(1)}
                        </div>
                        <div className="text-xs text-zinc-500">Média</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
