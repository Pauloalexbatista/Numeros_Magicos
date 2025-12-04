'use client';

import { useState, useEffect } from 'react';
import { Draw, PredictionModel } from '@/models/types';
import { compareModels, ModelPerformance } from '@/services/modelComparison';

// Import Models
import { HotNumbersModel } from '@/models/implementations/HotNumbersModel';
import { ColdNumbersModel } from '@/models/implementations/ColdNumbersModel';
import { RandomModel } from '@/models/implementations/RandomModel';
import { BalancedMixModel } from '@/models/implementations/BalancedMixModel';
import { PatternBasedModel } from '@/models/implementations/PatternBasedModel';
import { MLClassifierModel } from '@/models/implementations/MLClassifierModel';
import { ElasticModel } from '@/models/implementations/ElasticModel';
import { RootSumModel } from '@/models/implementations/RootSumModel';
import { StandardDeviationModel } from '@/models/implementations/StandardDeviationModel';

export default function ModelComparisonClient({ history }: Props) {
    const [selectedModels, setSelectedModels] = useState<string[]>(['hot_numbers', 'random']);
    const [testDraws, setTestDraws] = useState(50);
    const [predictionSize, setPredictionSize] = useState(5); // Default 5
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<ModelPerformance[]>([]);
    const [progress, setProgress] = useState(0);

    // Available Models
    const availableModels: PredictionModel[] = [
        new HotNumbersModel(),
        new ColdNumbersModel(),
        new RandomModel(),
        new BalancedMixModel(),
        new PatternBasedModel(),
        new PositionalModel(),
        new ElasticModel(),
        new RootSumModel(),
        new StandardDeviationModel(),
        // new MLClassifierModel(), // Hidden as per user request ("se os IA ainda estão a aprender não coloques agora")
    ];

    const handleRunComparison = async () => {
        setIsRunning(true);
        setResults([]);
        setProgress(0);

        // Filter selected models
        const modelsToRun = availableModels.filter(m => selectedModels.includes(m.id));

        try {
            // Run comparison
            const res = await compareModels(modelsToRun, history, testDraws, predictionSize);
            setResults(res);
        } catch (error) {
            console.error("Error running comparison:", error);
            alert("Erro ao executar comparação. Verifique a consola.");
        } finally {
            setIsRunning(false);
        }
    };

    const toggleModel = (id: string) => {
        if (selectedModels.includes(id)) {
            setSelectedModels(selectedModels.filter(m => m !== id));
        } else {
            if (selectedModels.length >= 8) { // Increased limit
                alert("Selecione no máximo 8 modelos.");
                return;
            }
            setSelectedModels([...selectedModels, id]);
        }
    };

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Model Selection */}
                    <div>
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <span>🤖</span> Selecione os Modelos
                        </h3>
                        <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                            {availableModels.map(model => (
                                <label key={model.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedModels.includes(model.id)
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                                    : 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedModels.includes(model.id)}
                                        onChange={() => toggleModel(model.id)}
                                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <div className="font-semibold text-sm">{model.name}</div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{model.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Parameters */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <span>🎯</span> Parâmetros do Teste
                            </h3>

                            {/* Prediction Size Selector */}
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg mb-4">
                                <label className="block text-sm text-zinc-500 mb-2">
                                    Quantos números prever?
                                </label>
                                <select
                                    value={predictionSize}
                                    onChange={(e) => setPredictionSize(parseInt(e.target.value))}
                                    className="w-full p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                >
                                    <option value="5">5 Números</option>
                                    <option value="10">10 Números</option>
                                    <option value="15">15 Números</option>
                                    <option value="20">20 Números</option>
                                    <option value="25">25 Números</option>
                                </select>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                                <label className="block text-sm text-zinc-500 mb-2">
                                    Testar nos últimos <span className="font-bold text-indigo-600 dark:text-indigo-400">{testDraws}</span> sorteios
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="200"
                                    step="10"
                                    value={testDraws}
                                    onChange={(e) => setTestDraws(parseInt(e.target.value))}
                                    className="w-full accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-zinc-400 mt-1">
                                    <span>10</span>
                                    <span>100</span>
                                    <span>200</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleRunComparison}
                                disabled={isRunning || selectedModels.length === 0}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {isRunning ? (
                                    <>
                                        <span className="animate-spin">⏳</span> A Executar Simulação...
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span> Iniciar Comparação
                                    </>
                                )}
                            </button>
                            {isRunning && (
                                <p className="text-center text-xs text-zinc-500 mt-2 animate-pulse">
                                    Isto pode demorar alguns segundos. O browser pode parecer lento.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {results.map((res, idx) => (
                            <div key={res.modelId} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full ${idx === 0 ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                                <div className="pl-3">
                                    <div className="text-xs font-bold uppercase text-zinc-500 mb-1">{res.modelName}</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-2xl font-bold">{(res.hitRate * 100).toFixed(1)}%</div>
                                            <div className="text-xs text-zinc-400">Taxa de Acerto</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-bold ${res.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {res.roi > 0 ? '+' : ''}{res.roi.toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-zinc-400">ROI Estimado</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="px-6 py-3">Modelo</th>
                                        <th className="px-6 py-3 text-center">Acertos Totais</th>
                                        <th className="px-6 py-3 text-center">Média / Sorteio</th>
                                        <th className="px-6 py-3 text-center">Investido</th>
                                        <th className="px-6 py-3 text-center">Ganho</th>
                                        <th className="px-6 py-3 text-center">ROI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {results.map(res => (
                                        <tr key={res.modelId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                            <td className="px-6 py-4 font-medium">{res.modelName}</td>
                                            <td className="px-6 py-4 text-center">{res.totalHits}</td>
                                            <td className="px-6 py-4 text-center font-bold">{res.hitRate.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center">€{res.totalInvested.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center">€{res.totalWon.toFixed(2)}</td>
                                            <td className={`px-6 py-4 text-center font-bold ${res.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {res.roi.toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Distribution Chart (Simple Bar) */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-bold mb-6">Distribuição de Acertos</h3>
                        <div className="h-64 flex items-end justify-around gap-4">
                            {results.map((res, idx) => (
                                <div key={res.modelId} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                    <div className="w-full flex items-end justify-center gap-1 h-full">
                                        {[0, 1, 2, 3, 4, 5].map(matches => {
                                            const count = res.distribution[matches] || 0;
                                            const maxCount = Math.max(...results.map(r => Math.max(...Object.values(r.distribution))));
                                            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

                                            // Only show bars for 2+ matches to save space/noise? No, show all but maybe grouped.
                                            // Actually, a stacked bar or grouped bar is hard in pure CSS/Divs.
                                            // Let's just show the "Hit Rate" bar for now as a simple visual.
                                            return null;
                                        })}
                                        {/* Simplified: Just one bar for Hit Rate */}
                                        <div
                                            className={`w-full rounded-t-lg transition-all ${idx === 0 ? 'bg-indigo-600' : 'bg-zinc-400'}`}
                                            style={{ height: `${(res.hitRate / Math.max(...results.map(r => r.hitRate))) * 100}%` }}
                                        >
                                            <div className="text-center text-white text-xs font-bold pt-1">{res.hitRate.toFixed(2)}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-center font-medium truncate w-full px-1">{res.modelName}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <ResponsibleGamingFooter />
        </div>
    );
}
