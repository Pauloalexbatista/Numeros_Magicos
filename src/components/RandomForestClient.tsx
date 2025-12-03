'use client';

import { useEffect, useState } from 'react';
import { getRandomForestPrediction } from '@/app/analysis/random-forest/actions';

export default function RandomForestClient() {
    const [prediction, setPrediction] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPrediction() {
            try {
                setLoading(true);
                const predicted = await getRandomForestPrediction();
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="ml-4 text-zinc-600 dark:text-zinc-400">A processar floresta de árvores...</p>
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
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>🎯</span> Previsão Random Forest
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Top 25 números selecionados por votação ensemble
                </p>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {prediction.map((num, index) => (
                        <div
                            key={num}
                            className="aspect-square flex items-center justify-center rounded-lg font-bold text-lg bg-white dark:bg-zinc-800 border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 shadow-sm hover:shadow-md transition-shadow"
                            title={`Posição ${index + 1}`}
                        >
                            {num}
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-4 bg-white/50 dark:bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        💡 <strong>Dica:</strong> Múltiplas árvores de decisão votaram nestes números.
                        A diversidade do ensemble reduz o risco de overfitting e aumenta a robustez das previsões.
                    </p>
                </div>
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold mb-3">🌳 Ensemble Learning</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">Bagging</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            Cada árvore treina com uma amostra aleatória diferente (bootstrap)
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Votação</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            Combina previsões através de votação majoritária
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold mb-3">📊 Estatísticas da Previsão</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{prediction.length}</div>
                        <div className="text-xs text-zinc-500">Números Previstos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{Math.min(...prediction)}</div>
                        <div className="text-xs text-zinc-500">Menor Número</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{Math.max(...prediction)}</div>
                        <div className="text-xs text-zinc-500">Maior Número</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-lime-600 dark:text-lime-400">
                            {(prediction.reduce((a, b) => a + b, 0) / prediction.length).toFixed(1)}
                        </div>
                        <div className="text-xs text-zinc-500">Média</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
