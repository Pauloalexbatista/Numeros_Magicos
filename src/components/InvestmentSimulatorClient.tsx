'use client';

import { useState } from 'react';
import { calculateROI, InvestmentResult } from '@/services/investment';
import { FullKey } from '@/services/wheeling';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

interface Props {
    history: any[]; // Using any to avoid strict Date type issues from serialization
}

export default function InvestmentSimulatorClient({ history }: Props) {
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [selectedStars, setSelectedStars] = useState<number[]>([]);
    const [costPerBet, setCostPerBet] = useState(2.50);
    const [duration, setDuration] = useState('all'); // '1y', '3y', '5y', 'all'
    const [result, setResult] = useState<InvestmentResult | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const toggleNumber = (num: number) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(selectedNumbers.filter(n => n !== num));
        } else {
            if (selectedNumbers.length >= 5) return;
            setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
        }
    };

    const toggleStar = (num: number) => {
        if (selectedStars.includes(num)) {
            setSelectedStars(selectedStars.filter(n => n !== num));
        } else {
            if (selectedStars.length >= 2) return;
            setSelectedStars([...selectedStars, num].sort((a, b) => a - b));
        }
    };

    const handleSimulate = () => {
        if (selectedNumbers.length !== 5 || selectedStars.length !== 2) return;

        setIsSimulating(true);
        setTimeout(() => {
            // Determine start date
            let startDate: Date | undefined;
            const now = new Date();
            if (duration === '1y') startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            else if (duration === '3y') startDate = new Date(now.setFullYear(now.getFullYear() - 3));
            else if (duration === '5y') startDate = new Date(now.setFullYear(now.getFullYear() - 5));

            const key: FullKey = { numbers: selectedNumbers, stars: selectedStars };
            const res = calculateROI([key], history, costPerBet, startDate);
            setResult(res);
            setIsSimulating(false);
        }, 100);
    };

    // Chart Helper
    const renderChart = () => {
        if (!result || result.history.length === 0) return null;

        const data = result.history;
        const width = 800;
        const height = 300;
        const padding = 40;

        // Find min/max balance for Y scale
        const balances = data.map(d => d.balance);
        const minVal = Math.min(0, ...balances); // Ensure 0 is included
        const maxVal = Math.max(0, ...balances);

        const range = maxVal - minVal || 100; // Avoid divide by zero

        // X scale
        const getX = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);

        // Y scale (inverted because SVG y=0 is top)
        const getY = (val: number) => height - padding - ((val - minVal) / range) * (height - 2 * padding);

        const zeroY = getY(0);

        // Generate path
        const pathD = data.map((d, i) =>
            `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.balance)}`
        ).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {/* Zero Line */}
                <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} stroke="#9ca3af" strokeWidth="1" strokeDasharray="4" />

                {/* Chart Line */}
                <path d={pathD} fill="none" stroke={result.balance >= 0 ? '#22c55e' : '#ef4444'} strokeWidth="2" />

                {/* Area under curve (optional, maybe too complex for simple path) */}

                {/* Y Axis Labels */}
                <text x={padding - 5} y={getY(maxVal)} textAnchor="end" fontSize="10" fill="currentColor">{maxVal.toFixed(0)}€</text>
                <text x={padding - 5} y={getY(minVal)} textAnchor="end" fontSize="10" fill="currentColor">{minVal.toFixed(0)}€</text>
                <text x={padding - 5} y={zeroY} textAnchor="end" fontSize="10" fill="currentColor">0€</text>
            </svg>
        );
    };

    return (
        <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    {/* Numbers */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-bold mb-4">1. Escolha 5 Números</h3>
                        <div className="grid grid-cols-10 gap-2">
                            {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                                <button
                                    key={num}
                                    onClick={() => toggleNumber(num)}
                                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-semibold transition-all ${selectedNumbers.includes(num)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stars */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-bold mb-4">2. Escolha 2 Estrelas</h3>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                                <button
                                    key={num}
                                    onClick={() => toggleStar(num)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${selectedStars.includes(num)
                                        ? 'bg-amber-400 text-amber-900'
                                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-bold mb-4">3. Configurações</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-500 mb-1">Período</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-transparent"
                                >
                                    <option value="1y">Último Ano</option>
                                    <option value="3y">Últimos 3 Anos</option>
                                    <option value="5y">Últimos 5 Anos</option>
                                    <option value="all">Desde o Início (2004)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-500 mb-1">Custo por Aposta (€)</label>
                                <input
                                    type="number"
                                    value={costPerBet}
                                    onChange={(e) => setCostPerBet(parseFloat(e.target.value))}
                                    className="w-full p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSimulate}
                        disabled={selectedNumbers.length !== 5 || selectedStars.length !== 2 || isSimulating}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-zinc-400 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                        {isSimulating ? 'A Simular...' : '💸 Calcular Investimento'}
                    </button>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {result ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    <div className="text-sm text-zinc-500">Total Investido</div>
                                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">{result.totalInvested.toFixed(2)} €</div>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    <div className="text-sm text-zinc-500">Total Ganho</div>
                                    <div className="text-2xl font-bold text-green-600">{result.totalWon.toFixed(2)} €</div>
                                </div>
                                <div className={`col-span-2 p-4 rounded-xl border ${result.balance >= 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm opacity-80">Resultado Líquido</div>
                                            <div className="text-3xl font-bold">{result.balance > 0 ? '+' : ''}{result.balance.toFixed(2)} €</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm opacity-80">ROI</div>
                                            <div className="text-3xl font-bold">{result.roi.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 h-64">
                                <h4 className="text-sm font-bold text-zinc-500 mb-4">Evolução do Saldo</h4>
                                {renderChart()}
                            </div>

                            {/* Best Prize */}
                            {result.bestPrize && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                                    <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2">🏆 Melhor Prémio</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-amber-800 dark:text-amber-200">{result.bestPrize.amount.toLocaleString()} €</span>
                                        <span className="text-sm text-amber-700 dark:text-amber-300">
                                            {new Date(result.bestPrize.date).toLocaleDateString()} ({result.bestPrize.tier})
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                            <span className="text-4xl mb-4">📈</span>
                            <p>Selecione a chave e clique em Calcular</p>
                        </div>
                    )}
                </div>
            </div>
            <ResponsibleGamingFooter />
        </div>
    );
}
