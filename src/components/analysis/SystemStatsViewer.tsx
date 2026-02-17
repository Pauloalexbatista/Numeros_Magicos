'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { getSystemStatsForRange } from '@/app/ranking/actions';
import { Loader2, Filter } from 'lucide-react';

interface StatsData {
    accuracy: number;
    total: number;
    distribution: number[];
}

interface Props {
    systemName: string;
    initialStats: StatsData;
    isActive: boolean;
    game: string;
}

const RANGES = [
    { label: 'Últimos 20', value: 20 },
    { label: 'Últimos 50', value: 50 },
    { label: 'Últimos 100', value: 100 },
    { label: 'Últimos 500', value: 500 },
    { label: 'Últimos 1000', value: 1000 },
    { label: 'Todo o Histórico', value: 10000 },
];

export default function SystemStatsViewer({ systemName, initialStats, isActive, game }: Props) {
    const [stats, setStats] = useState<StatsData>(initialStats);
    const [selectedRange, setSelectedRange] = useState<number>(10000); // Default to ALL
    const [isLoading, setIsLoading] = useState(false);

    const handleRangeChange = async (range: number) => {
        setIsLoading(true);
        setSelectedRange(range);

        try {
            const newStats = await getSystemStatsForRange(systemName, range, game);
            setStats(newStats);
        } catch (error) {
            console.error("Failed to update stats", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Probabilities for "Expected" calculations (Hypergeometric for correct prediction counts)
    // Formula: P(k hits) = C(n,k) × C(N-n, K-k) / C(N,K)
    // where: N=pool size, K=numbers drawn, n=numbers predicted
    const getExpectedProbs = (gameName: string) => {
        const game = gameName.toUpperCase();
        if (game === 'EURODREAMS') {
            // Hypergeometric N=40, K=6, n=20
            return [0.0101, 0.0808, 0.2398, 0.3386, 0.2398, 0.0808, 0.0101];
        }
        if (game === 'TOTOLOTO') {
            // Hypergeometric N=49, K=5, n=25
            return [0.0223, 0.1393, 0.3184, 0.3329, 0.1592, 0.0279];
        }
        // Default EUROMILLIONS (N=50, K=5, n=25)
        return [0.0251, 0.1493, 0.3257, 0.3257, 0.1493, 0.0251];
    };

    const expectedProbs = getExpectedProbs(game);
    const maxNumbers = game === 'EURODREAMS' ? 6 : 5;

    return (
        <div className="space-y-4">

            {/* Filter Bar */}
            <div className="flex justify-end mb-2">
                <div className="bg-white p-1 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
                    <Filter className="w-4 h-4 text-slate-500 ml-2" />
                    <select
                        value={selectedRange}
                        onChange={(e) => handleRangeChange(Number(e.target.value))}
                        className="bg-transparent text-sm text-slate-700 border-none focus:ring-0 cursor-pointer py-1 pr-8 font-medium"
                        disabled={isLoading}
                    >
                        {RANGES.map(r => (
                            <option key={r.value} value={r.value} className="text-black">{r.label}</option>
                        ))}
                    </select>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2" />}
                </div>
            </div>

            {/* Stats Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <Card className="p-6 bg-white border-slate-200 shadow-sm">
                    <div className="text-sm text-slate-500 uppercase tracking-wider mb-1 font-semibold">Precisão ({selectedRange === 10000 ? 'Global' : `Últimos ${selectedRange}`})</div>
                    <div className={`text-3xl font-bold ${stats.accuracy >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {stats.accuracy.toFixed(1)}%
                    </div>
                </Card>
                <Card className="p-6 bg-white border-slate-200 shadow-sm">
                    <div className="text-sm text-slate-500 uppercase tracking-wider mb-1 font-semibold">Total Analisado</div>
                    <div className="text-3xl font-bold text-slate-800">
                        {stats.total}
                    </div>
                </Card>
                <Card className="p-6 bg-white border-slate-200 shadow-sm">
                    <div className="text-sm text-slate-500 uppercase tracking-wider mb-1 font-semibold">Status</div>
                    <div className={`text-3xl font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                        {isActive ? 'Ativo' : 'Inativo'}
                    </div>
                </Card>
            </div>

            {/* Hit Distribution Chart */}
            <Card className={`bg-white border-slate-200 backdrop-blur-sm overflow-hidden transition-opacity duration-200 shadow-sm ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        📊 Distribuição de Acertos
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-left font-semibold">Acertos</th>
                                <th className="p-4 text-center font-semibold text-blue-600">Anti-Sistema (Espelho)</th>
                                <th className="p-4 text-center font-semibold">Qtd Real</th>
                                <th className="p-4 text-center font-semibold">% Real</th>
                                <th className="p-4 text-center font-semibold">Qtd Esperada</th>
                                <th className="p-4 text-center font-semibold">% Esperada 📊</th>
                                <th className="p-4 text-center font-semibold">Desvio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Array.from({ length: maxNumbers + 1 }, (_, i) => i).map(hits => {
                                const realCount = stats.distribution[hits] || 0;
                                const realPercent = stats.total > 0 ? (realCount / stats.total) * 100 : 0;
                                const expectedProb = expectedProbs[hits] || 0;
                                const expectedCount = stats.total * expectedProb;
                                const expectedPercent = expectedProb * 100;
                                const deviation = realPercent - expectedPercent;
                                const antiHits = maxNumbers - hits;

                                return (
                                    <tr key={hits} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">{hits}</td>
                                        <td className="p-4 text-center font-bold text-blue-600">
                                            {antiHits}
                                        </td>
                                        <td className="p-4 text-center text-slate-600">{realCount}</td>
                                        <td className="p-4 text-center text-slate-900 font-semibold">
                                            {realPercent.toFixed(2)}%
                                        </td>
                                        <td className="p-4 text-center text-slate-500">{expectedCount.toFixed(1)}</td>
                                        <td className="p-4 text-center text-slate-500">
                                            {expectedPercent.toFixed(2)}%
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-bold ${Math.abs(deviation) < 0.5 ? 'text-slate-400' :
                                                deviation > 0 ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                {deviation > 0 ? '+' : ''}{deviation.toFixed(2)}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
