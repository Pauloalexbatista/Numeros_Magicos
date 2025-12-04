'use client';

import { useEffect, useState } from 'react';
import { PredictionLine } from './PredictionLine';

interface SystemContribution {
    name: string;
    accuracy: number;
    weight: number;
    prediction: number[];
}

export default function GoldSystemClient() {
    const [finalPrediction, setFinalPrediction] = useState<number[]>([]);
    const [contributors, setContributors] = useState<SystemContribution[]>([]);
    const [totalVotes, setTotalVotes] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadCachedData() {
            try {
                setLoading(true);

                // 1. Fetch Gold System Prediction from Cache
                const goldResponse = await fetch('/api/predictions/latest?system=Gold System');
                const goldData = await goldResponse.json();

                if (goldData.numbers && goldData.numbers.length > 0) {
                    setFinalPrediction(goldData.numbers);
                } else {
                    console.warn('No cached prediction for Gold System');
                }

                // 2. Fetch Ranking to identify Top 3 Contributors
                const rankingResponse = await fetch('/api/ranking');
                if (!rankingResponse.ok) throw new Error('Falha ao carregar ranking');
                const rankingData = await rankingResponse.json();

                const top3 = rankingData.ranking.slice(0, 3);

                // 3. Fetch Cached Predictions for Top 3
                const contribs: SystemContribution[] = [];

                await Promise.all(top3.map(async (r: any) => {
                    try {
                        const resp = await fetch(`/api/predictions/latest?system=${encodeURIComponent(r.system.name)}`);
                        const data = await resp.json();

                        if (data.numbers) {
                            contribs.push({
                                name: r.system.name,
                                accuracy: r.avgAccuracy,
                                weight: r.avgAccuracy / 50,
                                prediction: data.numbers.map((n: any) => Number(n))
                            });
                        }
                    } catch (e) {
                        console.error(`Failed to load cache for ${r.system.name}`);
                    }
                }));

                // Sort contributors by accuracy (ranking order)
                contribs.sort((a, b) => b.accuracy - a.accuracy);
                setContributors(contribs);

                // Calculate votes for display
                const votes: Record<number, number> = {};
                contribs.forEach(contrib => {
                    contrib.prediction.forEach(num => {
                        votes[num] = (votes[num] || 0) + contrib.weight;
                    });
                });
                setTotalVotes(votes);

                // Fallback: If cache was empty but we have votes, calculate Top 25 locally
                if (goldData.numbers.length === 0 && Object.keys(votes).length > 0) {
                    const sortedNumbers = Object.entries(votes)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 25)
                        .map(([num]) => parseInt(num));

                    setFinalPrediction(sortedNumbers);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        }

        loadCachedData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
                    <p className="ml-4 text-zinc-600 dark:text-zinc-400">A carregar Sistema Ouro (Cache)...</p>
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
        <div className="space-y-8">
            {/* Main System Prediction */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-amber-200 dark:border-amber-800 shadow-sm">
                <PredictionLine
                    title="🥇 Previsão Final - Sistema Ouro"
                    selectedNumbers={finalPrediction}
                    totalVotes={totalVotes}
                    isMain={true}
                    colorTheme="amber"
                />
                {finalPrediction.length === 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                        ⚠️ Nenhuma previsão em cache. Por favor, execute o script "ATUALIZAR_MEDALHAS.bat" no servidor.
                    </div>
                )}
            </div>

            {/* Contributors */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6">Sistemas Contribuintes (Top 3)</h3>
                <div className="space-y-2">
                    {contributors.map((contrib, index) => (
                        <PredictionLine
                            key={contrib.name}
                            title={`#${index + 1} ${contrib.name} (Precisão: ${contrib.accuracy.toFixed(1)}%)`}
                            selectedNumbers={contrib.prediction}
                            isMain={false}
                            colorTheme="amber"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
