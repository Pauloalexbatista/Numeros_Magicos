'use client';

import { useEffect, useState } from 'react';
import { getHistory } from '@/app/actions';
import { buildTransitionMatrix, getProbableNextNumbers, MarkovPrediction } from '@/services/markov';
import { Draw } from '@/services/statistics';
import ExplanationCard from './ExplanationCard';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

export default function MarkovClient() {
    const [history, setHistory] = useState<Draw[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputNumbers, setInputNumbers] = useState<number[]>([]);
    const [predictions, setPredictions] = useState<MarkovPrediction[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getHistory();
            setHistory(data);

            // Default to the most recent draw's numbers
            if (data.length > 0) {
                const latest = data[0].numbers;
                setInputNumbers(latest);
                updatePredictions(data, latest);
            }
        } catch (error) {
            console.error('Failed to load data for Markov:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const updatePredictions = (draws: Draw[], current: number[]) => {
        if (draws.length === 0) return;
        const matrix = buildTransitionMatrix(draws);
        const preds = getProbableNextNumbers(current, matrix, 10);
        setPredictions(preds);
    };

    const handleNumberToggle = (num: number) => {
        let newNumbers;
        if (inputNumbers.includes(num)) {
            newNumbers = inputNumbers.filter(n => n !== num);
        } else {
            if (inputNumbers.length >= 5) return; // Limit to 5
            newNumbers = [...inputNumbers, num].sort((a, b) => a - b);
        }
        setInputNumbers(newNumbers);
        updatePredictions(history, newNumbers);
    };

    const handleUseLatest = () => {
        if (history.length > 0) {
            const latest = history[0].numbers;
            setInputNumbers(latest);
            updatePredictions(history, latest);
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500">A carregar matriz de transição...</div>;
    if (history.length === 0) return (
        <div className="p-8 text-center">
            <p className="text-red-500 mb-4">Erro ao carregar dados.</p>
            <button
                onClick={loadData}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-sm font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
                Tentar Novamente
            </button>
        </div>
    );

    return (
        <div className="space-y-8">
            <ExplanationCard
                title="🔗 Cadeias de Markov"
                description="Esta ferramenta analisa a probabilidade de um número sair DADO QUE outros números saíram no sorteio anterior."
                points={[
                    {
                        title: "Memória de Transição",
                        text: "O modelo constrói uma matriz que mapeia todas as transições históricas (ex: quantas vezes o 5 saiu depois do 12?)."
                    },
                    {
                        title: "Padrões Sequenciais",
                        text: "Identifica pares ou sequências de números que tendem a aparecer em sorteios consecutivos."
                    },
                    {
                        title: "Previsão Condicional",
                        text: "Ao contrário da frequência simples, esta análise depende do contexto (os números do último sorteio)."
                    }
                ]}
            />

            <div className="grid md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">1. Números Atuais</h3>
                        <button
                            onClick={handleUseLatest}
                            className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition-colors"
                        >
                            Usar Último Sorteio
                        </button>
                    </div>

                    <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg min-h-[60px] flex items-center gap-2 flex-wrap">
                        {inputNumbers.length === 0 ? (
                            <span className="text-zinc-400 text-sm italic">Selecione até 5 números abaixo...</span>
                        ) : (
                            inputNumbers.map(n => (
                                <div key={n} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white font-bold rounded-full shadow-sm animate-in zoom-in duration-200">
                                    {n}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="grid grid-cols-10 gap-2">
                        {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                onClick={() => handleNumberToggle(num)}
                                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-semibold transition-all ${inputNumbers.includes(num)
                                    ? 'bg-blue-600 text-white scale-110 shadow-md'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Prediction Section */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">2. Previsão (Próximo Sorteio)</h3>
                    <p className="text-sm text-zinc-500 mb-6">
                        Baseado no histórico, estes são os números que mais frequentemente saem <strong>imediatamente a seguir</strong> aos números selecionados.
                    </p>

                    <div className="space-y-4">
                        {predictions.map((pred, idx) => (
                            <div key={pred.number} className="relative group">
                                <div className="flex items-center gap-4 mb-1">
                                    <div className={`w-10 h-10 flex items-center justify-center font-bold rounded-full shadow-sm border-2 ${idx < 3
                                        ? 'bg-green-500 text-white border-green-600'
                                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                        }`}>
                                        {pred.number}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">Probabilidade</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{(pred.probability * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${idx < 3 ? 'bg-green-500' : 'bg-zinc-400'}`}
                                                style={{ width: `${(pred.probability / (predictions[0]?.probability || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {predictions.length === 0 && (
                        <div className="text-center text-zinc-400 py-10">
                            Selecione números para ver a previsão.
                        </div>
                    )}
                </div>
            </div>
            <ResponsibleGamingFooter />
        </div>
    );
}
