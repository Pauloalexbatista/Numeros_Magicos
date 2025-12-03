'use client';

import { useEffect, useState } from 'react';
import { getHistory } from '@/app/actions';
import { analyzeStarPatterns, StarPatternStats } from '@/services/statistics';
import ExplanationCard from './ExplanationCard';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

export default function StarPatternsClient() {
    const [stats, setStats] = useState<StarPatternStats | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        setLoading(true);
        try {
            const history = await getHistory();
            const calculatedStats = analyzeStarPatterns(history);
            setStats(calculatedStats);
        } catch (error) {
            console.error('Failed to load star stats:', error);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-zinc-500">A carregar estatísticas...</div>;
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

    return (
        <div className="space-y-8">
            <ExplanationCard
                title="⭐ Padrões de Estrelas"
                description="Esta ferramenta analisa o equilíbrio estatístico das Estrelas (1-12), focando-se em propriedades matemáticas fundamentais."
                points={[
                    {
                        title: "Equilíbrio Par/Ímpar",
                        text: "Analisa se as duas estrelas tendem a ser mistas (1 par, 1 ímpar) ou do mesmo tipo. O padrão misto é estatisticamente o mais comum."
                    },
                    {
                        title: "Distribuição Alto/Baixo",
                        text: "Divide as estrelas em Baixas (1-6) e Altas (7-12). Um sorteio equilibrado tende a ter uma de cada."
                    },
                    {
                        title: "Desvio da Normalidade",
                        text: "Permite identificar se os sorteios recentes estão a seguir a distribuição esperada ou se há anomalias temporárias."
                    }
                ]}
            />

            {/* Occurrence Indices */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Even Stars */}
                {(() => {
                    const avg = (2 * stats.evenOdd['2-0'] + 1 * stats.evenOdd['1-1']) / stats.totalDraws;
                    const expected = 1.0;
                    const index = (avg / expected) * 100;

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
                            <div className="text-xs opacity-90 mb-1">Estrelas Pares</div>
                            <div className="text-3xl font-bold mb-1">{avg.toFixed(2)}</div>
                            <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                            <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                Esperado: 1.0
                            </div>
                            <div className={`text-xs px-2 py-1 rounded font-bold ${getColor()}`}>
                                {index.toFixed(0)}% {getStatus()}
                            </div>
                        </div>
                    );
                })()}

                {/* Odd Stars */}
                {(() => {
                    const avg = (2 * stats.evenOdd['0-2'] + 1 * stats.evenOdd['1-1']) / stats.totalDraws;
                    const expected = 1.0;
                    const index = (avg / expected) * 100;

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
                            <div className="text-xs opacity-90 mb-1">Estrelas Ímpares</div>
                            <div className="text-3xl font-bold mb-1">{avg.toFixed(2)}</div>
                            <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                            <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                Esperado: 1.0
                            </div>
                            <div className={`text-xs px-2 py-1 rounded font-bold ${getColor()}`}>
                                {index.toFixed(0)}% {getStatus()}
                            </div>
                        </div>
                    );
                })()}

                {/* High Stars */}
                {(() => {
                    const avg = (2 * stats.highLow['2-0'] + 1 * stats.highLow['1-1']) / stats.totalDraws;
                    const expected = 1.0;
                    const index = (avg / expected) * 100;

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
                            <div className="text-xs opacity-90 mb-1">Estrelas Altas</div>
                            <div className="text-3xl font-bold mb-1">{avg.toFixed(2)}</div>
                            <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                            <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                Esperado: 1.0
                            </div>
                            <div className={`text-xs px-2 py-1 rounded font-bold ${getColor()}`}>
                                {index.toFixed(0)}% {getStatus()}
                            </div>
                        </div>
                    );
                })()}

                {/* Low Stars */}
                {(() => {
                    const avg = (2 * stats.highLow['0-2'] + 1 * stats.highLow['1-1']) / stats.totalDraws;
                    const expected = 1.0;
                    const index = (avg / expected) * 100;

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
                        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-4 rounded-xl shadow-lg">
                            <div className="text-xs opacity-90 mb-1">Estrelas Baixas</div>
                            <div className="text-3xl font-bold mb-1">{avg.toFixed(2)}</div>
                            <div className="text-xs opacity-75 mb-2">média/sorteio</div>
                            <div className="text-xs bg-white/20 px-2 py-1 rounded mb-2">
                                Esperado: 1.0
                            </div>
                            <div className={`text-xs px-2 py-1 rounded font-bold ${getColor()}`}>
                                {index.toFixed(0)}% {getStatus()}
                            </div>
                        </div>
                    );
                })()}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Even / Odd Analysis */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <span>⚖️</span> Par vs. Ímpar
                    </h3>

                    <div className="space-y-4">
                        {/* 1 Even, 1 Odd */}
                        <div className="relative">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">1 Par / 1 Ímpar (Equilibrado)</span>
                                <span className="font-bold text-gray-900 dark:text-white">{getPercentage(stats.evenOdd['1-1'])}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${getPercentage(stats.evenOdd['1-1'])}%` }} />
                            </div>
                            <div className="text-xs text-zinc-500 mt-1 text-right">{stats.evenOdd['1-1']} sorteios</div>
                        </div>

                        {/* 2 Even, 0 Odd */}
                        <div className="relative">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">2 Pares / 0 Ímpares</span>
                                <span className="font-bold text-gray-900 dark:text-white">{getPercentage(stats.evenOdd['2-0'])}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${getPercentage(stats.evenOdd['2-0'])}%` }} />
                            </div>
                            <div className="text-xs text-zinc-500 mt-1 text-right">{stats.evenOdd['2-0']} sorteios</div>
                        </div>

                        {/* 0 Even, 2 Odd */}
                        <div className="relative">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">0 Pares / 2 Ímpares</span>
                                <span className="font-bold text-gray-900 dark:text-white">{getPercentage(stats.evenOdd['0-2'])}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${getPercentage(stats.evenOdd['0-2'])}%` }} />
                            </div>
                            <div className="text-xs text-zinc-500 mt-1 text-right">{stats.evenOdd['0-2']} sorteios</div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            <strong>Conclusão:</strong> O padrão mais frequente é <span className="text-green-600 dark:text-green-400 font-bold">1 Par / 1 Ímpar</span>.
                        </div>
                    </div>
                </div>

                {/* High / Low Analysis */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <span>📈</span> Alto vs. Baixo
                    </h3>
                    <p className="text-xs text-zinc-500 mb-4">Baixo: 1-6 | Alto: 7-12</p>

                    <div className="space-y-4">
                        {/* 1 High, 1 Low */}
                        <div className="relative">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">1 Alto / 1 Baixo (Equilibrado)</span>
                                <span className="font-bold text-gray-900 dark:text-white">{getPercentage(stats.highLow['1-1'])}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${getPercentage(stats.highLow['1-1'])}%` }} />
                            </div>
                            <div className="text-xs text-zinc-500 mt-1 text-right">{stats.highLow['1-1']} sorteios</div>
                        </div>

                        {/* 2 High, 0 Low */}
                        <div className="relative">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">2 Altos / 0 Baixos</span>
                                <span className="font-bold text-gray-900 dark:text-white">{getPercentage(stats.highLow['2-0'])}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${getPercentage(stats.highLow['2-0'])}%` }} />
                            </div>
                            <div className="text-xs text-zinc-500 mt-1 text-right">{stats.highLow['2-0']} sorteios</div>
                        </div>

                        {/* 0 High, 2 Low */}
                        <div className="relative">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">0 Altos / 2 Baixos</span>
                                <span className="font-bold text-gray-900 dark:text-white">{getPercentage(stats.highLow['0-2'])}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                                <div className="h-full bg-pink-500 rounded-full" style={{ width: `${getPercentage(stats.highLow['0-2'])}%` }} />
                            </div>
                            <div className="text-xs text-zinc-500 mt-1 text-right">{stats.highLow['0-2']} sorteios</div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            <strong>Conclusão:</strong> O padrão mais frequente é <span className="text-purple-600 dark:text-purple-400 font-bold">1 Alto / 1 Baixo</span>.
                        </div>
                    </div>
                </div>
            </div>
            <ResponsibleGamingFooter />
        </div>
    );
}
