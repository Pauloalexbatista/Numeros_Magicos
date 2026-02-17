'use client';

import { useState } from 'react';
import { Loader2, Info } from 'lucide-react';
import { getSystemHistoricalPerformance } from '@/app/analysis/actions';

interface Props {
    history: Array<{
        date: string;
        numbers: number[];
        stars: number[];
        game?: string;
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

export default function IndividualSystemAnalysis({ history: initialHistory }: Props) {
    const [selectedSystem, setSelectedSystem] = useState(AVAILABLE_SYSTEMS[0]);
    const [numDraws, setNumDraws] = useState(100);
    const [analyzing, setAnalyzing] = useState(false);

    const [results, setResults] = useState<{
        hits: { [key: number]: number };
        totalPredictions: number;
        accuracy: number;
        predictedNumbers: number[];
        gameType: string;
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
            const data = await getSystemHistoricalPerformance(selectedSystem);

            if (!data) {
                alert('Dados históricos não encontrados para este sistema. Certifique-se que o "MASTER_UPDATE" foi executado recentemente.');
                setAnalyzing(false);
                return;
            }

            const gameType = (data.history && data.history.length > 0) ? ((data.history[0] as any).game || 'EUROMILLIONS') : 'EUROMILLIONS';
            const maxNumbers = gameType === 'EURODREAMS' ? 6 : 5;

            const fullHistory = data.history;
            const hits: { [key: number]: number } = {};
            for (let i = 0; i <= maxNumbers; i++) hits[i] = 0;

            let totalHits = 0;

            fullHistory.forEach((rec: any) => {
                const safeHits = Math.min(maxNumbers, Math.max(0, rec.hits));
                hits[safeHits] = (hits[safeHits] || 0) + 1;
                totalHits += rec.hits;
            });

            const displayHistory = fullHistory.slice(0, numDraws);

            const drawDetails = displayHistory.map((rec: any) => ({
                date: rec.date,
                predicted: rec.predictedNumbers,
                actual: rec.drawNumbers,
                matches: rec.hits
            }));

            const accuracy = fullHistory.length > 0 ? (totalHits / (fullHistory.length * maxNumbers)) * 100 : 0;
            drawDetails.sort((a: any, b: any) => b.matches - a.matches);

            setResults({
                hits,
                totalPredictions: fullHistory.length,
                accuracy: accuracy,
                predictedNumbers: data.nextPrediction || [],
                gameType,
                drawDetails
            });

        } catch (error) {
            console.error('Analysis error:', error);
            alert('Erro ao analisar sistema.');
        } finally {
            setAnalyzing(false);
        }
    };


    const getHitColor = (hitCount: number) => {
        const colors: { [key: number]: string } = {
            0: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
            1: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            2: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            3: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-zinc-900',
            4: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
            5: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
            6: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
        };
        return colors[hitCount] || colors[0];
    };

    const getExpectedPercentage = (hits: number, gameType: string = 'EUROMILLIONS') => {
        // Updated probabilities based on confirmed prediction counts (n=25 for EM/TL, n=20 for ED)
        // Calculated via Hypergeometric Distribution
        const probs: { [key: string]: number[] } = {
            'EUROMILLIONS': [2.5, 14.9, 32.6, 32.6, 14.9, 2.5, 0.0], // N=50, K=5, n=25
            'TOTOLOTO': [2.2, 13.9, 31.8, 33.3, 15.9, 2.8, 0.0],      // N=49, K=5, n=25
            'EURODREAMS': [1.0, 8.1, 24.0, 33.9, 24.0, 8.1, 1.0]      // N=40, K=6, n=20
        };
        const activeProbs = probs[gameType.toUpperCase()] || probs['EUROMILLIONS'];
        return activeProbs[hits] || 0;
    };

    return (
        <div className="space-y-6">

            {/* Information Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-bold">📅 Performance Histórica Real:</p>
                    <p>
                        Esta ferramenta carrega o histórico <strong>verdadeiro</strong> do sistema, verificando se a previsão feita <em>naquela data</em> acertou no sorteio seguinte.
                        Os dados são idênticos aos apresentados na tabela de Classificação.
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
                            title="Sistema a Analisar"
                            aria-label="Sistema a Analisar"
                        >
                            {AVAILABLE_SYSTEMS.map(system => (
                                <option key={system} value={system}>{system}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Limite de Visualização</label>
                        <input
                            type="number"
                            min="10"
                            max="1900"
                            step="10"
                            value={numDraws}
                            onChange={(e) => setNumDraws(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-purple-500"
                            title="Limite de Visualização"
                            aria-label="Limite de Visualização"
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            Limita a tabela de detalhes. Estatísticas usam total disponível no arquivo.
                        </p>
                    </div>
                </div>

                <button
                    onClick={analyzeSystem}
                    disabled={analyzing}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {analyzing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Carregando...
                        </>
                    ) : (
                        'Carregar Histórico Real'
                    )}
                </button>
            </div>

            {results && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg p-6">
                        <h3 className="text-2xl font-bold mb-2">{selectedSystem}</h3>
                        <p className="text-sm opacity-80 mb-4">Performance Histórica Real (Backtest)</p>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-white/70 text-sm">Sorteios Analisados</p>
                                <p className="text-3xl font-bold">{results.totalPredictions}</p>
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">Precisão Média</p>
                                <p className="text-3xl font-bold">{results.accuracy.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-xl font-bold">Distribuição de Acertos</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-50 dark:bg-zinc-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Acertos</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase text-blue-600 dark:text-blue-400">Anti-Sistema (Espelho)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Qtd Real</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">% Real</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Qtd Esperada</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">% Esperada</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Desvio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {Object.keys(results.hits).map(Number).sort((a, b) => a - b).map(hitCount => {
                                        const actual = results.hits[hitCount];
                                        const actualPct = (actual / results.totalPredictions) * 100;
                                        const expectedPct = getExpectedPercentage(hitCount, results.gameType);
                                        const expectedQty = (expectedPct * results.totalPredictions) / 100;
                                        const diff = actualPct - expectedPct;

                                        const maxDraws = results.gameType === 'EURODREAMS' ? 6 : 5;
                                        const antiHits = maxDraws - hitCount;

                                        return (
                                            <tr key={hitCount} className={`${getHitColor(hitCount)} hover:opacity-80 transition-opacity`}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                    {hitCount === 0 ? 'Nenhum' : hitCount} acerto{hitCount !== 1 ? 's' : ''}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-blue-600 dark:text-blue-400">
                                                    {antiHits}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">{actual}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">{actualPct.toFixed(2)}%</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-zinc-600 dark:text-zinc-400">{expectedQty.toFixed(1)}</td>
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
                        <h3 className="text-xl font-bold mb-4">
                            Detalhes dos Sorteios
                            <span className="text-sm font-normal text-zinc-500 ml-2">
                                (Top {Math.min(20, results.drawDetails.length)} melhores resultados)
                            </span>
                        </h3>

                        <div className="space-y-3">
                            {results.drawDetails.slice(0, 20).map((draw, idx) => (
                                <div key={idx} className={`${getHitColor(draw.matches)} rounded-lg p-4 border border-zinc-200 dark:border-zinc-700`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{new Date(draw.date).toLocaleDateString('pt-PT')}</span>
                                        <span className="text-sm font-bold">{draw.matches} acerto{draw.matches !== 1 ? 's' : ''}</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs font-medium mb-1 opacity-75">Previsão (na época):</p>
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
                </div>
            )}
        </div>
    );
}
