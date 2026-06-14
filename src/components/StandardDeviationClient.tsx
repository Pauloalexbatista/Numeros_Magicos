'use client';

import { useEffect, useState } from 'react';
import { getSystemPrediction } from '@/app/analysis/actions';

export default function StandardDeviationClient() {
    const [prediction, setPrediction] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPrediction() {
            try {
                setLoading(true);
                const predicted = await getSystemPrediction('Standard Deviation');
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
            <div className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-2xl shadow-xl transition-all duration-700">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                    <p className="ml-4 text-muted-foreground">A calcular desvios padrão...</p>
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
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>🎯</span> Previsão Standard Deviation
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Top 25 números com padrões de variação favoráveis
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {prediction.map((num) => (
                        <div
                            key={num}
                            className="aspect-square flex items-center justify-center rounded-lg font-bold text-lg bg-card/50 backdrop-blur-sm border-2 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {num}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-surface-2 text-foreground rounded-xl p-6 border border-border">
                <h3 className="text-lg font-bold mb-3">📊 Estatísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{prediction.length}</div>
                        <div className="text-xs text-zinc-500">Números</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{Math.min(...prediction)}</div>
                        <div className="text-xs text-zinc-500">Mínimo</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-fuchsia-600 dark:text-fuchsia-400">{Math.max(...prediction)}</div>
                        <div className="text-xs text-zinc-500">Máximo</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                            {(prediction.reduce((a, b) => a + b, 0) / prediction.length).toFixed(1)}
                        </div>
                        <div className="text-xs text-zinc-500">Média</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
