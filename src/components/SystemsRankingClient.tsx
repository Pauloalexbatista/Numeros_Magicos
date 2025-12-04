'use client';

import { useEffect, useState } from 'react';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';
import ExplanationCard from './ExplanationCard';

interface RankingData {
    systemName: string;
    avgAccuracy: number;
    totalPredictions: number;
    system: {
        name: string;
        description: string;
    };
    recentPerformance?: any[];
}

interface PerformanceRowProps {
    item: RankingData;
    index: number;
    getMedal: (pos: number) => string;
    getStars: (acc: number) => string;
}

function PerformanceRow({ item, index, getMedal, getStars }: PerformanceRowProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <tr
                className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <td className="p-4">
                    <span className="text-2xl">{getMedal(index + 1)}</span>
                </td>
                <td className="p-4">
                    <div>
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            {item.system.name}
                            <span className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {item.system.description}
                        </div>
                    </div>
                </td>
                <td className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {item.avgAccuracy.toFixed(1)}%
                    </div>
                </td>
                <td className="p-4 text-center">
                    <div className="text-xl">
                        {getStars(item.avgAccuracy)}
                    </div>
                </td>
                <td className="p-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    {item.totalPredictions}
                </td>
            </tr>
            {isOpen && item.recentPerformance && (
                <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                    <td colSpan={5} className="p-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                            <h4 className="text-sm font-bold mb-3 text-zinc-500 dark:text-zinc-400">
                                📅 Últimos 10 Resultados
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                                            <th className="text-left py-2">Data</th>
                                            <th className="text-left py-2">Sorteio</th>
                                            <th className="text-left py-2">Previsão (Top 10)</th>
                                            <th className="text-center py-2">Acertos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.recentPerformance.map((perf: any) => {
                                            const drawNums = JSON.parse(perf.draw.numbers);
                                            const predNums = JSON.parse(perf.predictedNumbers);
                                            return (
                                                <tr key={perf.id} className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                                                    <td className="py-2 text-zinc-500">
                                                        {new Date(perf.draw.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-2 font-mono">
                                                        {drawNums.join(', ')}
                                                    </td>
                                                    <td className="py-2 font-mono text-zinc-600 dark:text-zinc-400">
                                                        {predNums.join(', ')}
                                                    </td>
                                                    <td className="py-2 text-center">
                                                        <span className={`
                                                            px-2 py-1 rounded font-bold
                                                            ${perf.hits >= 3 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                                                            ${perf.hits === 2 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                                                            ${perf.hits < 2 ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500' : ''}
                                                        `}>
                                                            {perf.hits}/5
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export default function SystemsRankingClient() {
    const [ranking, setRanking] = useState<RankingData[]>([]);
    const [baseline, setBaseline] = useState<RankingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRanking();
    }, []);

    async function fetchRanking() {
        try {
            const res = await fetch('/api/ranking');
            const data = await res.json();
            setRanking(data.ranking);
            setBaseline(data.baseline);
        } catch (error) {
            console.error('Error fetching ranking:', error);
        } finally {
            setLoading(false);
        }
    }

    function getStars(accuracy: number): string {
        if (accuracy >= 40) return '⭐⭐⭐⭐⭐';
        if (accuracy >= 30) return '⭐⭐⭐⭐';
        if (accuracy >= 25) return '⭐⭐⭐';
        if (accuracy >= 20) return '⭐⭐';
        return '⭐';
    }

    function getMedal(position: number): string {
        if (position === 1) return '🥇';
        if (position === 2) return '🥈';
        if (position === 3) return '🥉';
        return `#${position}`;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4">
                <main className="max-w-6xl mx-auto space-y-6">
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-zinc-600 dark:text-zinc-400">A carregar ranking...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4">
            <main className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">🏆 Ranking de Sistemas Preditivos</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Avaliação objetiva baseada nos últimos 100 sorteios
                        </p>
                    </div>
                    <a href="/" className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                        ← Voltar
                    </a>
                </div>

                {/* Explanation */}
                <ExplanationCard
                    title="🎯 Como Funciona o Ranking"
                    description="Cada sistema gera um Top 10 de números antes de cada sorteio. Comparamos com os 5 números que saíram."
                    points={[
                        {
                            title: "Taxa de Acerto",
                            text: "Quantos dos 10 números previstos saíram nos 5 reais. Exemplo: 2 acertos = 40%."
                        },
                        {
                            title: "Média de 100 Sorteios",
                            text: "Calculamos a média dos últimos 100 sorteios para ter uma avaliação justa."
                        },
                        {
                            title: "Comparação com Aleatório",
                            text: "Escolha aleatória tem ~20% de acerto. Sistemas bons devem superar isto."
                        }
                    ]}
                />

                {/* Ranking Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-lg font-bold">📊 Ranking Atual</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Baseado nos últimos 100 sorteios
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium text-zinc-500">Posição</th>
                                    <th className="text-left p-4 text-sm font-medium text-zinc-500">Sistema</th>
                                    <th className="text-center p-4 text-sm font-medium text-zinc-500">Performance</th>
                                    <th className="text-center p-4 text-sm font-medium text-zinc-500">Avaliação</th>
                                    <th className="text-center p-4 text-sm font-medium text-zinc-500">Previsões</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ranking.map((item, index) => (
                                    <PerformanceRow
                                        key={item.systemName}
                                        item={item}
                                        index={index}
                                        getMedal={getMedal}
                                        getStars={getStars}
                                    />
                                ))}

                                {/* Baseline Separator */}
                                <tr>
                                    <td colSpan={5} className="p-2 bg-zinc-100 dark:bg-zinc-800">
                                        <div className="text-xs text-center text-zinc-500 dark:text-zinc-400 font-medium">
                                            ─── Comparação ───
                                        </div>
                                    </td>
                                </tr>

                                {/* Baseline */}
                                {baseline && (
                                    <tr className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                        <td className="p-4">
                                            <span className="text-xl">📊</span>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <div className="font-bold text-zinc-600 dark:text-zinc-400">
                                                    {baseline.system.name}
                                                </div>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                                                    {baseline.system.description}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="text-2xl font-bold text-zinc-400">
                                                {baseline.avgAccuracy.toFixed(1)}%
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="text-xl">
                                                {getStars(baseline.avgAccuracy)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-sm text-zinc-500">
                                            -
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                        💡 Como Interpretar
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                            <span><strong>&gt;30%:</strong> Excelente performance, muito acima do aleatório</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                            <span><strong>25-30%:</strong> Boa performance, consistentemente melhor que aleatório</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                            <span><strong>20-25%:</strong> Performance razoável, ligeiramente melhor que aleatório</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                            <span><strong>&lt;20%:</strong> Abaixo do aleatório, sistema precisa de melhoria</span>
                        </li>
                    </ul>
                </div>

                {/* Responsible Gaming Footer */}
                <ResponsibleGamingFooter />
            </main>
        </div>
    );
}
