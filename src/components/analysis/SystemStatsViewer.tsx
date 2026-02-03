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
            const newStats = await getSystemStatsForRange(systemName, range);
            setStats(newStats);
        } catch (error) {
            console.error("Failed to update stats", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Probabilities for "Expected" calculations (Hypergeometric for 25-number predictions)
    const getExpectedProbs = (gameName: string) => {
        const game = gameName.toUpperCase();
        if (game === 'EURODREAMS') {
            // Hypergeometric N=38, K=6, n=25
            return [0.0006, 0.0117, 0.0777, 0.2383, 0.3574, 0.2502, 0.0641];
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
                <div className="bg-slate-900/50 p-1 rounded-lg border border-slate-800 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500 ml-2" />
                    <select
                        value={selectedRange}
                        onChange={(e) => handleRangeChange(Number(e.target.value))}
                        className="bg-transparent text-sm text-slate-300 border-none focus:ring-0 cursor-pointer py-1 pr-8"
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
                <Card className="p-6 bg-slate-900/50 border-slate-800">
                    <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Precisão ({selectedRange === 10000 ? 'Global' : `Últimos ${selectedRange}`})</div>
                    <div className={`text-3xl font-bold ${stats.accuracy >= 50 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {stats.accuracy.toFixed(1)}%
                    </div>
                </Card>
                <Card className="p-6 bg-slate-900/50 border-slate-800">
                    <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Total Analisado</div>
                    <div className="text-3xl font-bold text-white">
                        {stats.total}
                    </div>
                </Card>
                <Card className="p-6 bg-slate-900/50 border-slate-800">
                    <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Status</div>
                    <div className="text-3xl font-bold text-blue-400">
                        {isActive ? 'Ativo' : 'Inativo'}
                    </div>
                </Card>
            </div>

            {/* Hit Distribution Chart */}
            <Card className={`bg-slate-900/40 border-slate-800 backdrop-blur-sm overflow-hidden transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        📊 Distribuição de Acertos
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="p-4 text-left">Acertos</th>
                                <th className="p-4 text-center">Qtd Real</th>
                                <th className="p-4 text-center">% Real</th>
                                <th className="p-4 text-center">Qtd Esperada</th>
                                <th className="p-4 text-center">% Esperada 📊</th>
                                <th className="p-4 text-center">Desvio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {Array.from({ length: maxNumbers + 1 }, (_, i) => i).map(hits => {
                                const realCount = stats.distribution[hits] || 0;
                                const realPercent = stats.total > 0 ? (realCount / stats.total) * 100 : 0;
                                const expectedProb = expectedProbs[hits] || 0;
                                const expectedCount = stats.total * expectedProb;
                                const expectedPercent = expectedProb * 100;
                                const deviation = realPercent - expectedPercent;

                                return (
                                    <tr key={hits} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 font-bold text-white">{hits}</td>
                                        <td className="p-4 text-center text-slate-300">{realCount}</td>
                                        <td className="p-4 text-center text-white font-semibold">
                                            {realPercent.toFixed(2)}%
                                        </td>
                                        <td className="p-4 text-center text-slate-400">{expectedCount.toFixed(1)}</td>
                                        <td className="p-4 text-center text-slate-400">
                                            {expectedPercent.toFixed(2)}%
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-bold ${Math.abs(deviation) < 0.5 ? 'text-slate-500' :
                                                deviation > 0 ? 'text-emerald-400' : 'text-rose-400'
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
