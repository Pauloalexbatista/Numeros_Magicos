'use client';

import { useEffect, useState } from 'react';
import { getHistory } from '@/app/actions';
import { calculateMultiples, MultiplesCount } from '@/services/statistics';
import ExplanationCard from './ExplanationCard';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

interface DrawWithMultiples {
    date: string;
    numbers: number[];
    multiples: MultiplesCount;
    pattern: string;
}

export default function MultiplesClient() {
    const [draws, setDraws] = useState<DrawWithMultiples[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(50);

    const loadData = async () => {
        setLoading(true);
        try {
            const history = await getHistory();
            const analyzed = history.slice(0, limit).map(draw => {
                const multiples = calculateMultiples(draw.numbers);
                const pattern = `M3:${multiples.m3} M4:${multiples.m4} M5:${multiples.m5} M7:${multiples.m7}`;
                return {
                    date: typeof draw.date === 'string' ? draw.date : draw.date.toISOString(),
                    numbers: draw.numbers,
                    multiples,
                    pattern
                };
            });
            setDraws(analyzed);
        } catch (error) {
            console.error('Failed to load multiples data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [limit]);

    if (loading) return <div className="p-8 text-center text-zinc-500">A carregar análise de múltiplos...</div>;

    // Calculate averages
    const avgMultiples = {
        m3: draws.reduce((sum, d) => sum + d.multiples.m3, 0) / draws.length,
        m4: draws.reduce((sum, d) => sum + d.multiples.m4, 0) / draws.length,
        m5: draws.reduce((sum, d) => sum + d.multiples.m5, 0) / draws.length,
        m7: draws.reduce((sum, d) => sum + d.multiples.m7, 0) / draws.length
    };

    // Calculate distribution for each multiple type
    const distributionM3: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const distributionM4: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const distributionM5: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const distributionM7: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    draws.forEach(d => {
        distributionM3[d.multiples.m3]++;
        distributionM4[d.multiples.m4]++;
        distributionM5[d.multiples.m5]++;
        distributionM7[d.multiples.m7]++;
    });

    // Find most common count for each
    const mostCommonM3 = parseInt(Object.entries(distributionM3).reduce((a, b) => a[1] > b[1] ? a : b)[0]);
    const mostCommonM4 = parseInt(Object.entries(distributionM4).reduce((a, b) => a[1] > b[1] ? a : b)[0]);
    const mostCommonM5 = parseInt(Object.entries(distributionM5).reduce((a, b) => a[1] > b[1] ? a : b)[0]);
    const mostCommonM7 = parseInt(Object.entries(distributionM7).reduce((a, b) => a[1] > b[1] ? a : b)[0]);

    // Multiples of 3: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48 (16 numbers)
    // Multiples of 4: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48 (12 numbers)
    // Multiples of 5: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50 (10 numbers)
    // Multiples of 7: 7, 14, 21, 28, 35, 42, 49 (7 numbers)

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 font-sans">
            <main className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">🔢 Análise de Múltiplos</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Contagem de múltiplos de 3, 4, 5 e 7 nos sorteios históricos
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="px-4 py-2 text-sm font-medium bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md"
                        >
                            <option value={50}>50 sorteios</option>
                            <option value={100}>100 sorteios</option>
                            <option value={200}>200 sorteios</option>
                            <option value={500}>500 sorteios</option>
                        </select>
                        <a href="/" className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                            ← Voltar
                        </a>
                    </div>
                </div>

                <ExplanationCard
                    title="🔢 Múltiplos"
                    description="Esta análise conta quantos números em cada sorteio são múltiplos de 3, 4, 5 ou 7."
                    points={[
                        {
                            title: "Múltiplos de 3",
                            text: "Existem 16 múltiplos de 3 entre 1-50 (3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48). Estatisticamente, espera-se 1-2 por sorteio."
                        },
                        {
                            title: "Múltiplos de 4",
                            text: "Existem 12 múltiplos de 4 entre 1-50 (4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48). Estatisticamente, espera-se 1 por sorteio."
                        },
                        {
                            title: "Múltiplos de 5",
                            text: "Existem 10 múltiplos de 5 entre 1-50 (5, 10, 15, 20, 25, 30, 35, 40, 45, 50). Estatisticamente, espera-se 1 por sorteio."
                        },
                        {
                            title: "Múltiplos de 7",
                            text: "Existem 7 múltiplos de 7 entre 1-50 (7, 14, 21, 28, 35, 42, 49). Estatisticamente, espera-se 0-1 por sorteio."
                        }
                    ]}
                />

                {/* Occurrence Indices */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { key: 'm3', label: 'Múltiplos de 3', value: avgMultiples.m3, expected: 1.6, color: 'from-blue-500 to-blue-600' },
                        { key: 'm4', label: 'Múltiplos de 4', value: avgMultiples.m4, expected: 1.2, color: 'from-orange-500 to-orange-600' },
                        { key: 'm5', label: 'Múltiplos de 5', value: avgMultiples.m5, expected: 1.0, color: 'from-green-500 to-green-600' },
                        { key: 'm7', label: 'Múltiplos de 7', value: avgMultiples.m7, expected: 0.7, color: 'from-purple-500 to-purple-600' }
                    ].map(multiple => {
                        const index = (multiple.value / multiple.expected) * 100;

                        const getIndexColor = () => {
                            if (index < 85) return 'bg-white/20 text-white';
                            if (index < 95) return 'bg-white/20 text-white';
                            if (index > 115) return 'bg-white/20 text-white';
                            if (index > 105) return 'bg-white/20 text-white';
                            return 'bg-white/30 text-white border border-white/50';
                        };

                        const getStatus = () => {
                            if (index < 95) return '📉 Abaixo';
                            if (index > 105) return '📈 Acima';
                            return '✅ Normal';
                        };

                        return (
                            <div key={multiple.key} className={`bg-gradient-to-br ${multiple.color} text-white p-4 rounded-xl shadow-lg`}>
                                <div className="text-xs opacity-90 mb-1">{multiple.label}</div>
                                <div className="text-3xl font-bold mb-1">{multiple.value.toFixed(2)}</div>
                                <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                                <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                    Esperado: {multiple.expected}
                                </div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${getIndexColor()}`}>
                                    {index.toFixed(0)}% {getStatus()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="text-sm opacity-90 mb-2">Múltiplos de 3</div>
                        <div className="text-4xl font-bold mb-1">{avgMultiples.m3.toFixed(2)}</div>
                        <div className="text-xs opacity-75">média/sorteio</div>
                        <div className="mt-3 text-xs bg-white/20 px-2 py-1 rounded inline-block">
                            Mais comum: {mostCommonM3}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="text-sm opacity-90 mb-2">Múltiplos de 4</div>
                        <div className="text-4xl font-bold mb-1">{avgMultiples.m4.toFixed(2)}</div>
                        <div className="text-xs opacity-75">média/sorteio</div>
                        <div className="mt-3 text-xs bg-white/20 px-2 py-1 rounded inline-block">
                            Mais comum: {mostCommonM4}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="text-sm opacity-90 mb-2">Múltiplos de 5</div>
                        <div className="text-4xl font-bold mb-1">{avgMultiples.m5.toFixed(2)}</div>
                        <div className="text-xs opacity-75">média/sorteio</div>
                        <div className="mt-3 text-xs bg-white/20 px-2 py-1 rounded inline-block">
                            Mais comum: {mostCommonM5}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="text-sm opacity-90 mb-2">Múltiplos de 7</div>
                        <div className="text-4xl font-bold mb-1">{avgMultiples.m7.toFixed(2)}</div>
                        <div className="text-xs opacity-75">média/sorteio</div>
                        <div className="mt-3 text-xs bg-white/20 px-2 py-1 rounded inline-block">
                            Mais comum: {mostCommonM7}
                        </div>
                    </div>
                </div>

                {/* Distribution Charts */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Multiples of 3 */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="text-blue-500">③</span> Múltiplos de 3
                        </h3>
                        <div className="space-y-3">
                            {[0, 1, 2, 3, 4, 5].map(count => (
                                <div key={count}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium">{count} múltiplos</span>
                                        <span className="font-bold">{((distributionM3[count] / draws.length) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                                        <div
                                            className={`h-full rounded-full ${count === mostCommonM3 ? 'bg-blue-500' : 'bg-blue-300'}`}
                                            style={{ width: `${(distributionM3[count] / draws.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Multiples of 4 */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="text-orange-500">④</span> Múltiplos de 4
                        </h3>
                        <div className="space-y-3">
                            {[0, 1, 2, 3, 4, 5].map(count => (
                                <div key={count}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium">{count} múltiplos</span>
                                        <span className="font-bold">{((distributionM4[count] / draws.length) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                                        <div
                                            className={`h-full rounded-full ${count === mostCommonM4 ? 'bg-orange-500' : 'bg-orange-300'}`}
                                            style={{ width: `${(distributionM4[count] / draws.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Multiples of 5 */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="text-green-500">⑤</span> Múltiplos de 5
                        </h3>
                        <div className="space-y-3">
                            {[0, 1, 2, 3, 4, 5].map(count => (
                                <div key={count}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium">{count} múltiplos</span>
                                        <span className="font-bold">{((distributionM5[count] / draws.length) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                                        <div
                                            className={`h-full rounded-full ${count === mostCommonM5 ? 'bg-green-500' : 'bg-green-300'}`}
                                            style={{ width: `${(distributionM5[count] / draws.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Multiples of 7 */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="text-purple-500">⑦</span> Múltiplos de 7
                        </h3>
                        <div className="space-y-3">
                            {[0, 1, 2, 3, 4, 5].map(count => (
                                <div key={count}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium">{count} múltiplos</span>
                                        <span className="font-bold">{((distributionM7[count] / draws.length) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                                        <div
                                            className={`h-full rounded-full ${count === mostCommonM7 ? 'bg-purple-500' : 'bg-purple-300'}`}
                                            style={{ width: `${(distributionM7[count] / draws.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Draws Table */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">📋 Últimos Sorteios</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="text-left p-3 font-medium text-zinc-500">Data</th>
                                    <th className="text-left p-3 font-medium text-zinc-500">Números</th>
                                    <th className="text-center p-3 font-medium text-zinc-500">M3</th>
                                    <th className="text-center p-3 font-medium text-zinc-500">M4</th>
                                    <th className="text-center p-3 font-medium text-zinc-500">M5</th>
                                    <th className="text-center p-3 font-medium text-zinc-500">M7</th>
                                </tr>
                            </thead>
                            <tbody>
                                {draws.slice(0, 20).map((draw, idx) => (
                                    <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                        <td className="p-3 text-zinc-600 dark:text-zinc-400">
                                            {new Date(draw.date).toLocaleDateString('pt-PT')}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                {draw.numbers.map(n => {
                                                    const isM3 = n % 3 === 0;
                                                    const isM4 = n % 4 === 0;
                                                    const isM5 = n % 5 === 0;
                                                    const isM7 = n % 7 === 0;
                                                    const bgColor = isM3 && isM5 ? 'bg-teal-600' : isM3 ? 'bg-blue-600' : isM4 ? 'bg-orange-600' : isM5 ? 'bg-green-600' : isM7 ? 'bg-purple-600' : 'bg-zinc-600';
                                                    return (
                                                        <div key={n} className={`w-7 h-7 flex items-center justify-center ${bgColor} text-white text-xs font-bold rounded-full`}>
                                                            {n}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-bold text-xs">
                                                {draw.multiples.m3}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded font-bold text-xs">
                                                {draw.multiples.m4}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded font-bold text-xs">
                                                {draw.multiples.m5}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded font-bold text-xs">
                                                {draw.multiples.m7}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <h4 className="font-bold text-sm mb-2">🎨 Legenda de Cores (Tabela)</h4>
                    <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-blue-600 rounded-full"></div>
                            <span>Múltiplo de 3</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-orange-600 rounded-full"></div>
                            <span>Múltiplo de 4</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-green-600 rounded-full"></div>
                            <span>Múltiplo de 5</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-purple-600 rounded-full"></div>
                            <span>Múltiplo de 7</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-teal-600 rounded-full"></div>
                            <span>Múltiplo de 3 e 5 (ex: 15, 30, 45)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-zinc-600 rounded-full"></div>
                            <span>Não é múltiplo</span>
                        </div>
                    </div>
                </div>
            </main>
            <ResponsibleGamingFooter />
        </div>
    );
}
