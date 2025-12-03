'use client';

import { useEffect, useState } from 'react';
import { getHistory } from '@/app/actions';
import { runMonteCarloSimulation, MonteCarloResult } from '@/services/monteCarlo';
import { Draw } from '@/services/statistics';
import ExplanationCard from './ExplanationCard';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

export default function MonteCarloClient() {
    const [history, setHistory] = useState<Draw[]>([]);
    const [loading, setLoading] = useState(true);
    const [iterations, setIterations] = useState(10000);
    const [result, setResult] = useState<MonteCarloResult | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getHistory();
            setHistory(data);

            // Initial run with small iterations (can run on main thread or worker)
            // For simplicity, we'll just wait for user to run big sim, or run small one here.
            // Let's run a small one on main thread for instant feedback, or worker.
            // Using worker for consistency.
            runSimulationInWorker(data, 1000);
        } catch (error) {
            console.error('Failed to load data for Monte Carlo:', error);
            setResult(null);
            setLoading(false);
        }
    };

    const runSimulationInWorker = (data: Draw[], iter: number) => {
        setLoading(true);

        try {
            const worker = new Worker(new URL('../workers/monteCarlo.worker.ts', import.meta.url));

            worker.onmessage = (e) => {
                if (e.data.type === 'SUCCESS') {
                    setResult(e.data.result);
                } else {
                    console.error('Worker error:', e.data.error);
                }
                setLoading(false);
                worker.terminate();
            };

            worker.onerror = (error) => {
                console.error('Worker error:', error);
                setLoading(false);
                worker.terminate();
            };

            worker.postMessage({ history: data, iterations: iter });

        } catch (error) {
            console.error('Failed to start worker:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRunSimulation = () => {
        if (!history.length) return;
        runSimulationInWorker(history, iterations);
    };

    if (loading && !result) return <div className="p-8 text-center text-zinc-500">A carregar dados e a simular...</div>;
    if (!result) return (
        <div className="p-8 text-center">
            <p className="text-red-500 mb-4">Erro ao simular.</p>
            <button
                onClick={loadData}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-sm font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
                Tentar Novamente
            </button>
        </div>
    );

    const maxCount = result.mostFrequent[0].count;

    return (
        <div className="space-y-8">
            <ExplanationCard
                title="🎲 Simulação Monte Carlo"
                description="Esta ferramenta executa milhares de sorteios virtuais rápidos para prever resultados futuros baseando-se em probabilidades estatísticas."
                points={[
                    {
                        title: "Lei dos Grandes Números",
                        text: "Ao simular 10.000+ sorteios, as tendências reais emergem e o 'ruído' da aleatoriedade de curto prazo é eliminado."
                    },
                    {
                        title: "Probabilidade Ponderada",
                        text: "A simulação não é puramente aleatória; ela considera o 'peso' histórico de cada número. Números com maior tendência recente têm maior probabilidade de aparecer na simulação."
                    },
                    {
                        title: "Previsão de Convergência",
                        text: "Ajuda a identificar para onde os resultados estão a convergir no longo prazo."
                    }
                ]}
                warning="Simulações passadas não garantem resultados futuros. O EuroMilhões é um jogo de azar."
            />

            {/* Controls */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                            Número de Simulações: <span className="text-teal-600 dark:text-teal-400 text-lg">{iterations.toLocaleString()}</span>
                        </label>
                        <div className="flex gap-2">
                            {[1000, 10000, 50000, 100000].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setIterations(val)}
                                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${iterations === val
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                        }`}
                                >
                                    {val >= 1000 ? `${val / 1000}k` : val}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleRunSimulation}
                        disabled={loading}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'A Simular...' : '🎲 Correr Simulação'}
                    </button>
                </div>
                <p className="text-sm text-zinc-500 mt-4">
                    O método Monte Carlo simula {iterations.toLocaleString()} sorteios futuros baseando-se na probabilidade ponderada de cada número.
                    Isto ajuda a identificar tendências de longo prazo e a reduzir a variância.
                </p>
            </div>

            {/* Results Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Top Numbers Chart */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <span>🏆</span> Top 10 Números Mais Prováveis
                    </h3>
                    <div className="space-y-3">
                        {result.mostFrequent.slice(0, 10).map((item, idx) => (
                            <div key={item.number} className="flex items-center gap-3">
                                <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full text-sm ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-zinc-100 text-zinc-700'
                                    }`}>
                                    {item.number}
                                </div>
                                <div className="flex-1">
                                    <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${idx < 3 ? 'bg-teal-500' : 'bg-zinc-400'}`}
                                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-xs font-mono text-zinc-500 w-16 text-right">
                                    {(item.probability * 100).toFixed(2)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Simulation Stats */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">ℹ️ Estatísticas da Simulação</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                            <p className="text-sm text-zinc-500">Tempo de Execução</p>
                            <p className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{result.executionTimeMs.toFixed(0)} ms</p>
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                            <p className="text-sm text-zinc-500">Total de Números Gerados</p>
                            <p className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{(result.iterations * 5).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-1">💡 Interpretação</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Os números no topo da lista apareceram mais vezes na simulação.
                                Isto indica que, estatisticamente, têm uma maior probabilidade de sair nos próximos sorteios,
                                assumindo que as tendências recentes se mantêm.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <ResponsibleGamingFooter />
        </div>
    );
}
