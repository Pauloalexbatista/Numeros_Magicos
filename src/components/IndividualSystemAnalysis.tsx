'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle, Info } from 'lucide-react';
import { getSystemPrediction } from '@/app/analysis/actions';

interface Props {
    history: Array<{
        date: string;
        numbers: number[];
        stars: number[];
    }>;
}

const AVAILABLE_SYSTEMS = [
    'LSTM Neural Net',
    'Random Forest',
    'Sistema Ouro',
    'Sistema Prata',
    'Sistema Bronze',
    'Vortex Pyramid',
    'Monte Carlo',
    'Cadeias Markov',
    'Clustering',
    'Baseado em Padrões (Amplitude/Pirâmide)',
    'Root Sum (Raiz Digital)',
    'Standard Deviation',
    'Hot Numbers',
    'Média Camadas',
    'Média+3 Otimizado'
];

export default function IndividualSystemAnalysis({ history }: Props) {
    const [selectedSystem, setSelectedSystem] = useState(AVAILABLE_SYSTEMS[0]);
    const [numDraws, setNumDraws] = useState(100);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<{
        hits: { [key: number]: number };
        totalPredictions: number;
        accuracy: number;
        predictedNumbers: number[];
        drawDetails: Array<{
            date: string;
            predicted: number[];
            actual: number[];
            matches: number;
        }>;
    } | null>(null);

    const analyzeSystem = async () => {
        setAnalyzing(true);
        setResults(null);

        try {
            const predictedNumbers = await getSystemPrediction(selectedSystem);
            const drawsToAnalyze = history.slice(0, numDraws);
            const hits = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            let totalHits = 0;
            const drawDetails: Array<{
                date: string;
                predicted: number[];
                actual: number[];
                matches: number;
            }> = [];

            drawsToAnalyze.forEach(draw => {
                const matchCount = draw.numbers.filter(n => predictedNumbers.includes(n)).length;
                hits[matchCount as 0 | 1 | 2 | 3 | 4 | 5]++;
                totalHits += matchCount;

                drawDetails.push({
                    date: draw.date,
                    predicted: predictedNumbers,
                    actual: draw.numbers,
                    matches: matchCount
                });
            });

            drawDetails.sort((a, b) => b.matches - a.matches);
            const accuracy = (totalHits / (drawsToAnalyze.length * 5)) * 100;

            setResults({
                hits,
                totalPredictions: drawsToAnalyze.length,
                accuracy,
                predictedNumbers,
                drawDetails
            });

        } catch (error) {
            console.error('Analysis error:', error);
            alert('Erro ao analisar sistema. Verifique se o sistema está disponível.');
        } finally {
            setAnalyzing(false);
        }
    };

    const getHitColor = (hitCount: number) => {
        const colors = {
            0: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
            1: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            2: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            3: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
            4: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
            5: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
        };
        return colors[hitCount as keyof typeof colors];
    };

    const getExpectedPercentage = (hits: number) => {
        // Values from hypergeometric distribution table for 25 numbers out of 50
        const probabilities = {
            0: 2.51,
            1: 14.93,
            2: 32.57,
            3: 32.57,
            4: 14.93,
            5: 2.51
        };
        return probabilities[hits as keyof typeof probabilities] || 0;
    };

    return (
        <div className="space-y-6">

            {/* Disclaimer Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-900 dark:text-amber-100">
                    <p className="font-bold">⚠️ Nota Importante sobre a Simulação:</p>
                    <p>
                        Esta ferramenta realiza uma <strong>Simulação Estática</strong> ("Backtest").
                        Ela pega na <strong>previsão ATUAL</strong> (os números gerados hoje) e verifica como essa chave específica teria performado no passado.
                    </p>
                    <p className="mt-1 opacity-80">
                        Isto é diferente do "Ranking de Modelos", que mostra a performance histórica real (onde as previsões mudavam a cada sorteio).
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Configuração da Análise</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Sistema a Analisar</label>
                        <select
                            value={selectedSystem}
                            onChange={(e) => setSelectedSystem(e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-purple-500"
                        >
                            {AVAILABLE_SYSTEMS.map(system => (
                                <option key={system} value={system}>{system}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Número de Sorteios</label>
                        <input
                            type="number"
                            min="10"
                            max="1000"
                            step="10"
                            value={numDraws}
                            onChange={(e) => setNumDraws(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Máximo: {history.length} sorteios disponíveis</p>
                    </div>
                </div>

                <button
                    onClick={analyzeSystem}
                    disabled={analyzing}
                    className="mt-6 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {analyzing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analisando...
                        </>
                    ) : (
                        'Analisar Sistema (Chave Atual vs Histórico)'
                    )}
                </button>
            </div>

            {results && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
                        <h3 className="text-2xl font-bold mb-2">{selectedSystem}</h3>
                        <p className="text-sm opacity-80 mb-4">Resultados da Chave Atual nos últimos {results.totalPredictions} sorteios</p>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-purple-100 text-sm">Sorteios Analisados</p>
                                <p className="text-3xl font-bold">{results.totalPredictions}</p>
                            </div>
                            <div>
                                <p className="text-purple-100 text-sm">Precisão Média</p>
                                <p className="text-3xl font-bold">{results.accuracy.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-xl font-bold">Distribuição de Acertos (Simulação)</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-50 dark:bg-zinc-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Acertos</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Quantidade</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">% Real</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">% Esperada</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Diferença</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {[0, 1, 2, 3, 4, 5].map(hitCount => {
                                        const actual = results.hits[hitCount];
                                        const actualPct = (actual / results.totalPredictions) * 100;
                                        const expectedPct = getExpectedPercentage(hitCount);
                                        const diff = actualPct - expectedPct;

                                        return (
                                            <tr key={hitCount} className={`${getHitColor(hitCount)} hover:opacity-80 transition-opacity`}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                    {hitCount === 0 ? 'Nenhum' : hitCount} acerto{hitCount !== 1 ? 's' : ''}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">{actual}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">{actualPct.toFixed(2)}%</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-zinc-600 dark:text-zinc-400">{expectedPct.toFixed(2)}%</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${diff > 0 ? 'text-green-600 dark:text-green-400' :
                                                    diff < 0 ? 'text-red-600 dark:text-red-400' :
                                                        'text-zinc-600 dark:text-zinc-400'
                                                    }`}>
                                                    {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
                        <h3 className="text-xl font-bold mb-4">Detalhes dos Sorteios (Top {Math.min(20, results.drawDetails.length)})</h3>

                        <div className="space-y-3">
                            {results.drawDetails.slice(0, 20).map((draw, idx) => (
                                <div key={idx} className={`${getHitColor(draw.matches)} rounded-lg p-4 border border-zinc-200 dark:border-zinc-700`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{new Date(draw.date).toLocaleDateString('pt-PT')}</span>
                                        <span className="text-sm font-bold">{draw.matches} acerto{draw.matches !== 1 ? 's' : ''}</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs font-medium mb-1 opacity-75">Predição (Atual):</p>
                                            <div className="flex flex-wrap gap-1">
                                                {draw.predicted.map(num => (
                                                    <span key={num} className={`px-2 py-1 rounded font-medium ${draw.actual.includes(num) ? 'bg-green-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                                                        }`}>
                                                        {num}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium mb-1 opacity-75">Sorteio Real:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {draw.actual.map(num => (
                                                    <span key={num} className={`px-2 py-1 rounded font-medium ${draw.predicted.includes(num) ? 'bg-green-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                                                        }`}>
                                                        {num}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>💡 Nota:</strong> Esta análise assume que você jogou <strong>exatamente a mesma chave atual</strong> em todos estes sorteios passados.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
