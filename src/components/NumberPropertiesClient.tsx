'use client';

import { useEffect, useState } from 'react';
import { getHistory } from '@/app/actions';
import { analyzeNumberProperties, NumberPropertiesAnalysis } from '@/services/statistics';
import ExplanationCard from './ExplanationCard';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

export default function NumberPropertiesClient() {
    const [analysis, setAnalysis] = useState<NumberPropertiesAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(100);

    const loadData = async () => {
        setLoading(true);
        try {
            const history = await getHistory();
            const analyzed = analyzeNumberProperties(history.slice(0, limit));
            setAnalysis(analyzed);
        } catch (error) {
            console.error('Failed to load number properties:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [limit]);

    if (loading || !analysis) {
        return <div className="p-8 text-center text-zinc-500">A carregar análise de propriedades...</div>;
    }

    // Sort numbers by frequency for top 10
    const topNumbers = [...analysis.numbers]
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 font-sans">
            <main className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">🔢 Propriedades dos Números</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Análise de tendências: Pares, Ímpares, Primos e Múltiplos
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Últimos:</label>
                            <input
                                type="number"
                                value={limit}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val >= 5) setLimit(val);
                                }}
                                min="5"
                                className="w-20 px-3 py-2 text-sm font-medium bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md"
                            />
                            <span className="text-sm text-zinc-500">sorteios</span>
                        </div>
                        <a href="/" className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                            ← Voltar
                        </a>
                    </div>
                </div>

                <ExplanationCard
                    title="🔢 Propriedades Matemáticas"
                    description="Esta análise mostra o índice de ocorrência de cada propriedade nos últimos sorteios."
                    points={[
                        {
                            title: "Índice de Ocorrência",
                            text: "Compara o valor real com o esperado. 100% = normal, <95% = abaixo (pode sair mais), >105% = acima (pode sair menos)."
                        },
                        {
                            title: "Pares e Ímpares",
                            text: "25 números pares e 25 ímpares (50% cada). Esperado: 2.5 de cada por sorteio."
                        },
                        {
                            title: "Primos e Múltiplos",
                            text: "15 primos (30%), 16 M3 (32%), 12 M4 (24%), 10 M5 (20%), 7 M7 (14%). Quanto menor a %, mais raro."
                        }
                    ]}
                />

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {/* Pares */}
                    {(() => {
                        const expected = 2.5;
                        const actual = analysis.evenOddStats.avgEvenPerDraw;
                        const index = (actual / expected) * 100;
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
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
                                <div className="text-xs opacity-90 mb-1">Pares</div>
                                <div className="text-3xl font-bold mb-1">{actual.toFixed(2)}</div>
                                <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                                <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                    25/50 (50%)
                                </div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${getColor()}`}>
                                    {index.toFixed(0)}% {getStatus()}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Ímpares */}
                    {(() => {
                        const expected = 2.5;
                        const actual = analysis.evenOddStats.avgOddPerDraw;
                        const index = (actual / expected) * 100;
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
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg">
                                <div className="text-xs opacity-90 mb-1">Ímpares</div>
                                <div className="text-3xl font-bold mb-1">{actual.toFixed(2)}</div>
                                <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                                <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                    25/50 (50%)
                                </div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${getColor()}`}>
                                    {index.toFixed(0)}% {getStatus()}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Primos */}
                    {(() => {
                        const expected = (15 / 50) * 5; // 1.5
                        const actual = analysis.primeStats.avgPrimesPerDraw;
                        const index = (actual / expected) * 100;
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
                            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-xl shadow-lg">
                                <div className="text-xs opacity-90 mb-1">Primos</div>
                                <div className="text-3xl font-bold mb-1">{actual.toFixed(2)}</div>
                                <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                                <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                    15/50 (30%)
                                </div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${getColor()}`}>
                                    {index.toFixed(0)}% {getStatus()}
                                </div>
                            </div>
                        );
                    })()}

                    {/* M3 */}
                    {(() => {
                        const expected = (16 / 50) * 5; // 1.6
                        const actual = analysis.multiplesStats.avgM3;
                        const index = (actual / expected) * 100;
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
                            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-4 rounded-xl shadow-lg">
                                <div className="text-xs opacity-90 mb-1">M3</div>
                                <div className="text-3xl font-bold mb-1">{actual.toFixed(2)}</div>
                                <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                                <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                    16/50 (32%)
                                </div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${getColor()}`}>
                                    {index.toFixed(0)}% {getStatus()}
                                </div>
                            </div>
                        );
                    })()}

                    {/* M4 */}
                    {(() => {
                        const expected = (12 / 50) * 5; // 1.2
                        const actual = analysis.multiplesStats.avgM4;
                        const index = (actual / expected) * 100;
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
                            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 rounded-xl shadow-lg">
                                <div className="text-xs opacity-90 mb-1">M4</div>
                                <div className="text-3xl font-bold mb-1">{actual.toFixed(2)}</div>
                                <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                                <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                    12/50 (24%)
                                </div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${getColor()}`}>
                                    {index.toFixed(0)}% {getStatus()}
                                </div>
                            </div>
                        );
                    })()}

                    {/* M5 */}
                    {(() => {
                        const expected = (10 / 50) * 5; // 1.0
                        const actual = analysis.multiplesStats.avgM5;
                        const index = (actual / expected) * 100;
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
                            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
                                <div className="text-xs opacity-90 mb-1">M5</div>
                                <div className="text-3xl font-bold mb-1">{actual.toFixed(2)}</div>
                                <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                                <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                    10/50 (20%)
                                </div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${getColor()}`}>
                                    {index.toFixed(0)}% {getStatus()}
                                </div>
                            </div>
                        );
                    })()}

                    {/* M7 */}
                    {(() => {
                        const expected = (7 / 50) * 5; // 0.7
                        const actual = analysis.multiplesStats.avgM7;
                        const index = (actual / expected) * 100;
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
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
                                <div className="text-xs opacity-90 mb-1">M7</div>
                                <div className="text-3xl font-bold mb-1">{actual.toFixed(2)}</div>
                                <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                                <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                    7/50 (14%)
                                </div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${getColor()}`}>
                                    {index.toFixed(0)}% {getStatus()}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Top 10 Numbers */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">🏆 Top 10 Números Mais Sorteados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {topNumbers.map((num, idx) => (
                            <div key={num.number} className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{num.number}</span>
                                    <span className="text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">#{idx + 1}</span>
                                </div>
                                <div className="text-sm font-bold mb-2">{num.frequency} vezes</div>
                                <div className="flex flex-wrap gap-1">
                                    {num.isEven && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">Par</span>}
                                    {!num.isEven && <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">Ímpar</span>}
                                    {num.isPrime && <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded">Primo</span>}
                                    {num.isM3 && <span className="text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded">M3</span>}
                                    {num.isM4 && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">M4</span>}
                                    {num.isM5 && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">M5</span>}
                                    {num.isM7 && <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">M7</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <h4 className="font-bold text-sm mb-2">🎨 Legenda</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-600 w-4 h-4 rounded"></span>
                            <span>Par</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-orange-600 w-4 h-4 rounded"></span>
                            <span>Ímpar</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-yellow-600 w-4 h-4 rounded"></span>
                            <span>Primo</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-cyan-600 w-4 h-4 rounded"></span>
                            <span>M3</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-amber-600 w-4 h-4 rounded"></span>
                            <span>M4</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-green-600 w-4 h-4 rounded"></span>
                            <span>M5</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-purple-600 w-4 h-4 rounded"></span>
                            <span>M7</span>
                        </div>
                    </div>
                </div>

                {/* Responsible Gaming Footer */}
                <ResponsibleGamingFooter />
            </main>
        </div>
    );
}
