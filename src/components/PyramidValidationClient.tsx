'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { PyramidAccuracyStats, PyramidRecommendation } from '@/services/statistics';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

interface PyramidValidationClientProps {
    accuracyStats: PyramidAccuracyStats;
    recommendations: PyramidRecommendation[];
    totalDraws: number;
}

export default function PyramidValidationClient({
    accuracyStats,
    recommendations,
    totalDraws
}: PyramidValidationClientProps) {
    const [isDark, setIsDark] = useState(false);

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
            case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
            default: return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400';
        }
    };

    const getConfidenceBadge = (confidence: string) => {
        switch (confidence) {
            case 'high': return '🔥 Alta';
            case 'medium': return '⚡ Média';
            default: return '💫 Baixa';
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 font-sans`}>
            <main className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Validação Histórica da Pirâmide 📊</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Análise de precisão do método da pirâmide e recomendações para o próximo sorteio
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded hover:bg-emerald-500"
                        >
                            {isDark ? 'Modo Claro' : 'Modo Escuro'}
                        </button>
                        <Link href="/matrix" className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                            ← Matrix
                        </Link>
                        <Link href="/" className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                            🏠 Início
                        </Link>
                    </div>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Total de Sorteios</div>
                        <div className="text-3xl font-bold">{totalDraws}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Sorteios Analisados</div>
                        <div className="text-3xl font-bold">{accuracyStats.totalDraws}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Melhor Top-N</div>
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Top {accuracyStats.bestTopN}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Posição Média</div>
                        <div className="text-3xl font-bold">{accuracyStats.averagePosition.toFixed(1)}</div>
                    </div>
                </div>

                {/* Accuracy by Top-N */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-bold mb-4">Taxa de Acerto por Top-N</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="text-left p-3 font-medium text-zinc-500 dark:text-zinc-400">Top-N</th>
                                    <th className="text-right p-3 font-medium text-zinc-500 dark:text-zinc-400">Taxa de Acerto</th>
                                    <th className="text-right p-3 font-medium text-zinc-500 dark:text-zinc-400">Média de Acertos/Sorteio</th>
                                    <th className="text-left p-3 font-medium text-zinc-500 dark:text-zinc-400">Barra de Progresso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accuracyStats.topNSizes.map(topN => {
                                    const hitRate = accuracyStats.hitRates[topN];
                                    const avgHits = accuracyStats.averageHits[topN];
                                    const percentage = (hitRate * 100).toFixed(1);

                                    return (
                                        <tr key={topN} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                                            <td className="p-3 font-medium">Top {topN}</td>
                                            <td className="p-3 text-right font-mono">{percentage}%</td>
                                            <td className="p-3 text-right font-mono">{avgHits}</td>
                                            <td className="p-3">
                                                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                                                    <div
                                                        className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sample Size Info */}
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-xl p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                        ℹ️ <strong>Amostra Mínima:</strong> Apenas sorteios com pelo menos {accuracyStats.minSampleSize} sorteios anteriores foram analisados ({accuracyStats.analyzedDraws} de {accuracyStats.totalDraws} sorteios).
                    </p>
                </div>

                {/* Hit Distribution Comparison */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-bold mb-4">📈 Distribuição de Acertos vs. Probabilidade Teórica</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                        Comparação entre os resultados reais do sistema e o que seria esperado ao escolher números aleatoriamente
                    </p>

                    {accuracyStats.topNSizes.map(topN => {
                        const distribution = accuracyStats.hitDistribution[topN];
                        const theoretical = accuracyStats.theoreticalProbabilities[topN];
                        const total = Object.values(distribution).reduce((a, b) => a + b, 0);

                        return (
                            <div key={topN} className="mb-6 last:mb-0">
                                <h3 className="font-bold mb-3 text-emerald-600 dark:text-emerald-400">Top-{topN}</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                                <th className="text-left p-2 font-medium text-zinc-500 dark:text-zinc-400">Acertos</th>
                                                <th className="text-right p-2 font-medium text-zinc-500 dark:text-zinc-400">Real (Qtd)</th>
                                                <th className="text-right p-2 font-medium text-zinc-500 dark:text-zinc-400">Real (%)</th>
                                                <th className="text-right p-2 font-medium text-zinc-500 dark:text-zinc-400">Teórico (%)</th>
                                                <th className="text-right p-2 font-medium text-zinc-500 dark:text-zinc-400">Diferença</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[0, 1, 2, 3, 4, 5].map(hits => {
                                                const realCount = distribution[hits] || 0;
                                                const realPercent = total > 0 ? (realCount / total) * 100 : 0;
                                                const theoreticalPercent = (theoretical[hits] || 0) * 100;
                                                const difference = realPercent - theoreticalPercent;
                                                const isBetter = difference > 0 && hits >= 2; // Better if more hits >= 2

                                                return (
                                                    <tr key={hits} className="border-b border-zinc-100 dark:border-zinc-800/50">
                                                        <td className="p-2 font-medium">{hits} {hits === 1 ? 'acerto' : 'acertos'}</td>
                                                        <td className="p-2 text-right font-mono">{realCount}</td>
                                                        <td className="p-2 text-right font-mono">{realPercent.toFixed(1)}%</td>
                                                        <td className="p-2 text-right font-mono text-zinc-500">{theoreticalPercent.toFixed(1)}%</td>
                                                        <td className={`p-2 text-right font-mono font-bold ${isBetter
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : difference < 0 && hits >= 2
                                                                ? 'text-red-600 dark:text-red-400'
                                                                : 'text-zinc-500'
                                                            }`}>
                                                            {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>


                {/* Recommendations */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-bold mb-4">🎯 Recomendações para o Próximo Sorteio</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                        Baseado nos totais da pirâmide calculados com todos os sorteios históricos
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {recommendations.map(rec => (
                            <div
                                key={rec.number}
                                className={`p-4 rounded-lg border-2 ${rec.confidence === 'high'
                                    ? 'border-emerald-500 dark:border-emerald-600'
                                    : rec.confidence === 'medium'
                                        ? 'border-yellow-500 dark:border-yellow-600'
                                        : 'border-zinc-300 dark:border-zinc-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-2xl font-bold">{rec.number}</div>
                                    <div className={`text-xs px-2 py-1 rounded ${getConfidenceColor(rec.confidence)}`}>
                                        #{rec.rank}
                                    </div>
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                    Total: {rec.total}
                                </div>
                                <div className="text-xs font-medium">
                                    {getConfidenceBadge(rec.confidence)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">💡 Como Funciona</h3>
                    <div className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
                        <p>
                            <strong>Método da Pirâmide:</strong> Para cada número (1-50), calculamos um total baseado em:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Linha mais recente: conta o número + vizinhos imediatos (3 células)</li>
                            <li>Linhas anteriores: conta apenas os vizinhos laterais (2 células por linha)</li>
                        </ul>
                        <p className="mt-3">
                            <strong>Validação Histórica:</strong> Para cada sorteio passado, calculamos os totais da pirâmide usando apenas os sorteios anteriores a ele, e depois comparamos com os números que realmente saíram.
                        </p>
                        <p className="mt-3">
                            <strong>Taxa de Acerto:</strong> Percentagem de números sorteados que estavam no Top-N previsto. Por exemplo, se Top-10 tem 42% de taxa de acerto, significa que em média 2.1 dos 5 números sorteados estavam no Top-10.
                        </p>
                    </div>
                </div>
                <ResponsibleGamingFooter />
            </main>
        </div>
    );
}
