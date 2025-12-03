'use client';

import { useEffect, useState } from 'react';
import { getHistory } from '@/app/actions';
import { analyzePrimeNumbers, PrimeNumberStats } from '@/services/statistics';
import ExplanationCard from './ExplanationCard';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

export default function PrimeNumbersClient() {
    const [stats, setStats] = useState<PrimeNumberStats | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        setLoading(true);
        try {
            const history = await getHistory();
            const calculatedStats = analyzePrimeNumbers(history);
            setStats(calculatedStats);
        } catch (error) {
            console.error('Failed to load prime stats:', error);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-zinc-500">A carregar estatísticas de primos...</div>;
    if (!stats) return (
        <div className="p-8 text-center">
            <p className="text-red-500 mb-4">Erro ao carregar dados.</p>
            <button
                onClick={loadStats}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-sm font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
                Tentar Novamente
            </button>
        </div>
    );

    const total = stats.totalDraws;
    const getPercentage = (count: number) => ((count / total) * 100).toFixed(1);

    // Sort primes by frequency for the chart
    const sortedPrimes = Object.entries(stats.primeFrequency)
        .sort((a, b) => b[1] - a[1])
        .map(([num, count]) => ({ num: parseInt(num), count }));

    const maxFreq = sortedPrimes[0]?.count || 1;

    return (
        <div className="space-y-8">
            <ExplanationCard
                title="🔢 Números Primos"
                description="Esta ferramenta analisa a presença de números primos (divisíveis apenas por 1 e por si mesmos) nos sorteios históricos."
                points={[
                    {
                        title: "Distribuição Típica",
                        text: "A maioria dos sorteios contém entre 1 a 3 números primos. Sorteios sem primos ou só com primos são estatisticamente raros."
                    },
                    {
                        title: "Primos Quentes",
                        text: "Identifica quais os números primos específicos que têm saído com maior frequência."
                    },
                    {
                        title: "Estratégia de Equilíbrio",
                        text: "Ao criar uma chave, incluir 1 ou 2 primos aumenta a probabilidade de alinhar com o padrão histórico."
                    }
                ]}
            />

            {/* Occurrence Index */}
            {(() => {
                // Calculate Average Primes Per Draw
                let totalPrimes = 0;
                Object.entries(stats.primeCounts).forEach(([count, numDraws]) => {
                    totalPrimes += parseInt(count) * numDraws;
                });
                const avgPrimesPerDraw = totalPrimes / stats.totalDraws;

                // Expected: 15 primes in 50 numbers = 30%
                // Per draw (5 numbers): 5 * 0.30 = 1.5
                const expected = 1.5;
                const index = (avgPrimesPerDraw / expected) * 100;

                const getColor = () => {
                    if (index < 85) return 'bg-red-500/20 text-red-700 dark:text-red-300';
                    if (index < 95) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
                    if (index > 115) return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
                    if (index > 105) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
                    return 'bg-green-500/20 text-green-700 dark:text-green-300';
                };
                const getStatus = () => {
                    if (index < 95) return '📉 Abaixo';
                    if (index > 105) return '📈 Acima';
                    return '✅ Normal';
                };

                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg md:col-span-1">
                            <div className="text-sm opacity-90 mb-1">Índice de Ocorrência (Primos)</div>
                            <div className="text-4xl font-bold mb-2">{avgPrimesPerDraw.toFixed(2)}</div>
                            <div className="text-sm opacity-75 mb-3">média/sorteio (Esperado: {expected})</div>

                            <div className="flex items-center gap-2">
                                <div className="text-sm bg-white/20 px-3 py-1 rounded">
                                    15/50 (30%)
                                </div>
                                <div className={`text-sm px-3 py-1 rounded font-bold ${getColor()}`}>
                                    {index.toFixed(0)}% {getStatus()}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm md:col-span-2 flex items-center">
                            <div>
                                <h4 className="font-bold text-lg mb-2">O que isto significa?</h4>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                    O <strong>Índice de Ocorrência</strong> compara a frequência real dos números primos com a probabilidade matemática.
                                    <br />
                                    • <strong>Abaixo (📉):</strong> Estão a sair menos primos que o esperado. Pode haver uma correção em breve.
                                    <br />
                                    • <strong>Acima (📈):</strong> Estão a sair mais primos que o esperado.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div className="grid md:grid-cols-2 gap-6">
                {/* 1. Distribution per Draw */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <span>📊</span> Primos por Sorteio
                    </h3>
                    <p className="text-xs text-zinc-500 mb-4">Quantos números primos saem habitualmente num sorteio?</p>

                    <div className="space-y-4">
                        {[0, 1, 2, 3, 4, 5].map(count => (
                            <div key={count} className="relative">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {count} Primos
                                        {count === stats.mostFrequentCount && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">Mais Comum</span>}
                                    </span>
                                    <span className="font-bold text-gray-900 dark:text-white">{getPercentage(stats.primeCounts[count])}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${count === stats.mostFrequentCount ? 'bg-green-500' : 'bg-blue-400'}`}
                                        style={{ width: `${getPercentage(stats.primeCounts[count])}%` }}
                                    />
                                </div>
                                <div className="text-xs text-zinc-500 mt-1 text-right">{stats.primeCounts[count]} sorteios</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Top Primes Chart */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <span>🏆</span> Primos Mais Frequentes
                    </h3>
                    <p className="text-xs text-zinc-500 mb-4">Quais são os números primos que mais saem?</p>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {sortedPrimes.map((item, idx) => (
                            <div key={item.num} className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-full font-bold text-sm text-zinc-700 dark:text-zinc-300">
                                    {item.num}
                                </div>
                                <div className="flex-1">
                                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${idx < 3 ? 'bg-amber-500' : 'bg-zinc-400'}`}
                                            style={{ width: `${(item.count / maxFreq) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-xs font-mono text-zinc-500 w-12 text-right">
                                    {item.count}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Insight Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">💡 Insight Estatístico</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    A maioria dos sorteios tende a ter entre <strong>1 a 3 números primos</strong>.
                    Apostar em chaves com 0 ou 5 primos é estatisticamente menos provável.
                    O número primo mais frequente é o <strong>{sortedPrimes[0]?.num}</strong>.
                </p>
            </div>
            <ResponsibleGamingFooter />
        </div>
    );
}
