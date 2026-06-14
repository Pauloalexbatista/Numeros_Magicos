'use client';

import { useEffect, useState } from 'react';
import { getSystemPrediction } from '@/app/analysis/actions';

export default function RootSumClient() {
    const [prediction, setPrediction] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPrediction() {
            try {
                setLoading(true);
                const predicted = await getSystemPrediction('Root Sum (Raiz Digital)');
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                    <p className="ml-4 text-muted-foreground">A calcular raízes digitais...</p>
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
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>🎯</span> Previsão Root Sum
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Top 25 números com raízes digitais favoráveis
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {prediction.map((num) => (
                        <div
                            key={num}
                            className="aspect-square flex items-center justify-center rounded-lg font-bold text-lg bg-card/50 backdrop-blur-sm border-2 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 shadow-sm hover:shadow-md transition-shadow"
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
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{prediction.length}</div>
                        <div className="text-xs text-zinc-500">Números</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{Math.min(...prediction)}</div>
                        <div className="text-xs text-zinc-500">Mínimo</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{Math.max(...prediction)}</div>
                        <div className="text-xs text-zinc-500">Máximo</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {(prediction.reduce((a, b) => a + b, 0) / prediction.length).toFixed(1)}
                        </div>
                        <div className="text-xs text-zinc-500">Média</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
