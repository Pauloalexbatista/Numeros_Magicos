'use client';

import { useState } from 'react';
import { runBacktestAction } from '@/app/actions/backtest';
import { BacktestResult } from '@/models/types';
import ProbabilityTableTooltip from './ProbabilityTableTooltip';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

const MODELS = [
    { id: 'random_baseline', name: 'Aleatório (Baseline)', description: 'Escolhe números aleatórios. Base de comparação.' },
    { id: 'hot_numbers', name: 'Números Quentes', description: 'Escolhe os números mais frequentes do histórico disponível.' },
    { id: 'cold_numbers', name: 'Números Frios', description: 'Escolhe os números MENOS frequentes (estratégia de atraso).' },
    { id: 'balanced_mix', name: 'Mix Equilibrado', description: 'Combina números quentes e frios (50% / 50%).' },
    { id: 'pattern_based', name: 'Padrão (Amplitude/Pirâmide)', description: 'Usa análise de Amplitude e Pirâmide para encontrar padrões.' },
    { id: 'ml_logistic_regression', name: 'Machine Learning (Beta)', description: 'Modelo treinado com Regressão Logística usando 7 features (LAG, Freq, etc.).' },

    // Novos Sistemas
    { id: 'sist_media_camadas', name: 'Sistema Média Camadas', description: 'Média + 3 com Camadas de Equilíbrio Estatístico (55% Acc).' },
    { id: 'sist_media_3_otimizado', name: 'Sistema Média 3 Otimizado', description: 'Variação otimizada da estratégia Média + 3.' },
    { id: 'sist_combinado_media_3', name: 'Sistema Combinado Média 3', description: 'Combinação de múltiplas médias móveis.' },
    { id: 'mdiasemaspontas', name: 'Média Sem Pontas', description: 'Média aparada (remove extremos) para maior robustez.' },
    { id: 'pyramid_pascal', name: 'Pirâmide de Pascal', description: 'Padrões derivados do Triângulo de Pascal.' },
    { id: 'pyramid_gaps', name: 'Pirâmide de Gaps', description: 'Análise de intervalos entre números.' },
    { id: 'vortex_pyramid', name: 'Vortex Pyramid', description: 'Cálculo toroidal baseado em geometria de vórtice.' },
];

export default function ModelLabClient({ userRole }: { userRole?: string }) {
    const canCopy = userRole === 'PRO' || userRole === 'ADMIN';

    const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
    const [testDraws, setTestDraws] = useState(100);
    const [predictionSize, setPredictionSize] = useState(5);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<BacktestResult | null>(null);

    const handleRun = async () => {
        setLoading(true);
        try {
            const res = await runBacktestAction(selectedModel, testDraws, predictionSize);
            setResult(res);
        } catch (error) {
            console.error('Backtest failed:', error);
            alert('Erro ao correr simulação. Verifique a consola.');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border-2 border-indigo-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">⚙️ Configuração da Simulação</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Modelo */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Modelo</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent"
                        >
                            {MODELS.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-700 dark:text-zinc-400 mt-1">
                            {MODELS.find((m) => m.id === selectedModel)?.description}
                        </p>
                    </div>

                    {/* Sorteios de Teste */}
                    <div className="group relative">
                        <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                            Sorteios de Teste
                            <span className="ml-1 cursor-help text-zinc-400">ℹ️</span>
                        </label>
                        <select
                            value={testDraws}
                            onChange={(e) => setTestDraws(parseInt(e.target.value))}
                            className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent"
                        >
                            <option value="50">Últimos 50 (Recente)</option>
                            <option value="100">Últimos 100 (Médio Prazo)</option>
                            <option value="500">Últimos 500 (Longo Prazo)</option>
                            <option value="1000">Últimos 1000 (Histórico)</option>
                        </select>
                        <div className="invisible group-hover:visible absolute left-0 top-full mt-1 w-auto min-w-[300px] p-2 bg-black text-white text-xs rounded shadow-lg z-10 whitespace-nowrap">
                            Número de sorteios históricos usados para testar o modelo
                        </div>
                    </div>

                    {/* Tamanho da Previsão */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Quantos números prever?</label>
                        <select
                            value={predictionSize}
                            onChange={(e) => setPredictionSize(parseInt(e.target.value))}
                            className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="25">25</option>
                        </select>
                    </div>

                    {/* Botão */}
                    <div className="flex items-end">
                        <button
                            onClick={handleRun}
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                        >
                            {loading ? 'A Simular...' : '🧪 Correr Simulação'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${!canCopy ? 'select-none' : ''}`}>
                    {/* Summary Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border-2 border-purple-300 dark:border-zinc-800 text-center shadow-md">
                            <div className="text-sm font-bold text-gray-800 dark:text-zinc-300 mb-1">Taxa de Acerto (Hit Rate)</div>
                            <div className="text-3xl font-bold text-purple-600">{result.hitRate}%</div>
                            <div className="text-xs text-gray-700 dark:text-zinc-400 mt-2">
                                {result.hits} acertos em {result.totalDraws * predictionSize} números previstos
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border-2 border-blue-300 dark:border-zinc-800 text-center shadow-md">
                            <div className="text-sm font-bold text-gray-800 dark:text-zinc-300 mb-1">Total de Sorteios</div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{result.totalDraws}</div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border-2 border-green-300 dark:border-zinc-800 text-center shadow-md">
                            <div className="text-sm font-bold text-gray-800 dark:text-zinc-300 mb-1">ROI Simulado</div>
                            <div className="text-3xl font-bold text-zinc-400">{result.roi || '--'}</div>
                            <div className="text-xs text-gray-700 dark:text-zinc-400 mt-2">Em desenvolvimento</div>
                        </div>
                    </div>

                    {/* Distribution Table */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-gray-300 dark:border-zinc-800 overflow-hidden shadow-md">
                        <div className="p-4 border-b-2 border-gray-300 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800">
                            <div className="font-bold text-gray-900 dark:text-white text-base">📊 Distribuição de Acertos</div>
                            <div className="text-xs text-gray-700 dark:text-zinc-400 mt-1">Comparação com Probabilidade Matemática ({predictionSize}/50)</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead className="bg-gray-200 dark:bg-zinc-800/50 text-gray-900 dark:text-zinc-400 font-semibold">
                                    <tr>
                                        <th className="p-3">Acertos</th>
                                        <th className="p-3">Qtd Real</th>
                                        <th className="p-3">% Real</th>
                                        <th className="p-3">Qtd Esperada</th>
                                        <th className="p-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <span>% Esperada</span>
                                                <ProbabilityTableTooltip />
                                            </div>
                                        </th>
                                        <th className="p-3">Desvio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[0, 1, 2, 3, 4, 5].map((hits) => {
                                        const count = result.distribution?.[hits] || 0;
                                        const percentage = (count / result.totalDraws) * 100;
                                        const expected = result.expectedDistribution?.[hits] || 0;
                                        const expectedCount = Math.round((expected / 100) * result.totalDraws);
                                        const diff = percentage - expected;
                                        const isPositive = diff > 0;
                                        return (
                                            <tr key={hits} className="border-b border-zinc-200 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                                                <td className="p-3 font-bold text-gray-900 dark:text-white">{hits}</td>
                                                <td className="p-3 text-gray-800 dark:text-zinc-300">{count}</td>
                                                <td className="p-3 font-medium text-gray-900 dark:text-white">{percentage.toFixed(2)}%</td>
                                                <td className="p-3 text-gray-700 dark:text-zinc-400">{expectedCount}</td>
                                                <td className="p-3 text-gray-700 dark:text-zinc-400">{expected.toFixed(2)}%</td>
                                                <td className={`p-3 font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                                                    {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Details Table */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-gray-300 dark:border-zinc-800 overflow-hidden shadow-md">
                        <div className="p-4 border-b-2 border-gray-300 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800">
                            <div className="font-bold text-gray-900 dark:text-white text-base">📋 20 Maiores Acertos</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-200 dark:bg-zinc-800/50 text-gray-900 dark:text-zinc-400 font-semibold">
                                    <tr>
                                        <th className="p-3">Data</th>
                                        <th className="p-3">Previsão</th>
                                        <th className="p-3">Resultado Real</th>
                                        <th className="p-3 text-center">Acertos</th>
                                        <th className="p-3 text-right">Lógica</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.details.sort((a, b) => b.matches - a.matches).slice(0, 20).map((detail, idx) => (
                                        <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                                            <td className="p-3 font-medium">{new Date(detail.drawDate).toLocaleDateString('pt-PT')}</td>
                                            <td className="p-3">
                                                <div className="flex gap-1">
                                                    {detail.predicted.map((n) => (
                                                        <span
                                                            key={n}
                                                            className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${detail.actual.includes(n) ? 'bg-green-500 text-white font-bold' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                                                        >
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-1">
                                                    {detail.actual.map((n) => (
                                                        <span
                                                            key={n}
                                                            className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${detail.predicted.includes(n) ? 'bg-purple-600 text-white font-bold' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                                                        >
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                {detail.matches > 0 ? (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${detail.matches >= 4 ? 'bg-yellow-400 text-yellow-900' :
                                                        detail.matches >= 2 ? 'bg-green-100 text-green-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {detail.matches} ✓
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-300">-</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                {detail.reasoning && (
                                                    <div className="group relative inline-block">
                                                        <span className="cursor-help text-lg">ℹ️</span>
                                                        <div className="invisible group-hover:visible absolute right-full mr-2 top-0 w-auto min-w-[600px] max-w-[90vw] p-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg shadow-2xl border-2 border-amber-400 dark:border-amber-500 z-[9999]">
                                                            <div className="font-semibold text-amber-900 dark:text-amber-400 mb-2 border-b border-amber-200 dark:border-amber-700 pb-2">📋 Lógica do Modelo</div>
                                                            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{detail.reasoning}</pre>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            <ResponsibleGamingFooter />
        </div>
    );
}
