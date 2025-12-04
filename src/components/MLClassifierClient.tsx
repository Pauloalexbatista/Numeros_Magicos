'use client';

import { useEffect, useState } from 'react';
import { getMLClassifierPrediction } from '@/app/analysis/ml-classifier/actions';

export default function MLClassifierClient() {
    const [prediction, setPrediction] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPrediction() {
            try {
                setLoading(true);
                const predicted = await getMLClassifierPrediction();
                setPrediction(predicted);
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                    <p className="ml-4 text-zinc-600 dark:text-zinc-400">A calcular probabilidades...</p>
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
            <div className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-800">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>🎯</span> Previsão ML Classifier
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Top 25 números com maior probabilidade (função sigmoid)
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {prediction.map((num, index) => (
                        <div
                            key={num}
                            className="aspect-square flex items-center justify-center rounded-lg font-bold text-lg bg-white dark:bg-zinc-800 border-2 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 shadow-sm hover:shadow-md transition-shadow"
                            title={`Posição ${index + 1}`}
                        >
                            {num}
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-4 bg-white/50 dark:bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        💡 <strong>Dica:</strong> A regressão logística calculou probabilidades para cada número
                        baseando-se em features estatísticas extraídas do histórico.
                    </p>
                </div>
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold mb-3">📊 Estatísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{prediction.length}</div>
                        <div className="text-xs text-zinc-500">Números</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{Math.min(...prediction)}</div>
                        <div className="text-xs text-zinc-500">Mínimo</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.max(...prediction)}</div>
                        <div className="text-xs text-zinc-500">Máximo</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {(prediction.reduce((a, b) => a + b, 0) / prediction.length).toFixed(1)}
                        </div>
                        <div className="text-xs text-zinc-500">Média</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
