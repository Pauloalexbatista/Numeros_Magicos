'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { getStarSystemStatsForRange } from '@/app/analysis/stars/actions';
import { Loader2, Filter } from 'lucide-react';
import { GameType, GAMES } from '@/types/game';

interface StatsData {
    accuracy: number;
    total: number;
    distribution: number[];
}

interface Props {
    systemName: string;
    initialStats: StatsData;
    isActive: boolean;
    game?: string;
}

const RANGES = [
    { label: 'Últimos 20', value: 20 },
    { label: 'Últimos 50', value: 50 },
    { label: 'Últimos 100', value: 100 },
    { label: 'Últimos 500', value: 500 },
    { label: 'Últimos 1000', value: 1000 },
    { label: 'Todo o Histórico', value: 10000 },
];

export default function StarSystemStatsViewer({ systemName, initialStats, isActive, game }: Props) {
    const [stats, setStats] = useState<StatsData>(initialStats);
    const [selectedRange, setSelectedRange] = useState<number>(10000); // Default to ALL
    const [isLoading, setIsLoading] = useState(false);

    const handleRangeChange = async (range: number) => {
        setIsLoading(true);
        setSelectedRange(range);

        try {
            const newStats = await getStarSystemStatsForRange(systemName, game || 'EUROMILLIONS', range);
            setStats(newStats);
        } catch (error) {
            console.error("Failed to update stats", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Probabilities for "Expected" calculations
    const getExpectedProbs = () => {
        const g = (game || 'EUROMILLIONS').toUpperCase();

        if (g === 'EURODREAMS') {
            // N=5, K=1, n=3
            // P(0)=40%, P(1)=60%
            return [0.40, 0.60, 0];
        } else if (g === 'TOTOLOTO') {
            // N=13, K=1, n=5
            // P(0)=61.54%, P(1)=38.46%
            return [0.6154, 0.3846, 0];
        } else {
            // EuroMillions: N=12, K=2, n=6
            return [0.2273, 0.5455, 0.2273];
        }
    };

    const expectedProbs = getExpectedProbs();
    const maxHits = (game || '').toUpperCase() === 'EUROMILLIONS' ? 2 : 1;
    const rows = [0, 1, 2].filter(h => h <= maxHits);

    const gameConfig = game ? GAMES[game as GameType] : GAMES[GameType.EUROMILLIONS];

    return (
        <div className="space-y-4">

            {/* Filter Bar */}
            <div className="flex justify-end mb-2">
                <div className="glass-card p-1 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground ml-2" />
                    <select
                        value={selectedRange}
                        onChange={(e) => handleRangeChange(Number(e.target.value))}
                        className="bg-transparent text-sm text-foreground border-none focus:ring-0 cursor-pointer py-1 pr-8 font-medium"
                        disabled={isLoading}
                    >
                        {RANGES.map(r => (
                            <option key={r.value} value={r.value} className="bg-background text-foreground">{r.label}</option>
                        ))}
                    </select>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2" style={{ color: gameConfig?.ui.accent }} />}
                </div>
            </div>

            {/* Stats Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <Card className="p-6 glass-card">
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Precisão ({selectedRange === 10000 ? 'Global' : `Últimos ${selectedRange}`})</div>
                    <div className={`text-3xl font-bold ${stats.accuracy >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {stats.accuracy.toFixed(1)}%
                    </div>
                </Card>
                <Card className="p-6 glass-card">
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Total Analisado</div>
                    <div className="text-3xl font-bold text-foreground">
                        {stats.total}
                    </div>
                </Card>
                <Card className="p-6 glass-card">
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Status</div>
                    <div className={`text-3xl font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        {isActive ? 'Ativo' : 'Inativo'}
                    </div>
                </Card>
            </div>

            {/* Hit Distribution Chart */}
            <Card className={`glass-card overflow-hidden transition-opacity duration-200 shadow-sm ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        📊 Distribuição de Acertos
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-surface-1/50 text-muted-foreground uppercase tracking-wider text-xs border-b border-border">
                            <tr>
                                <th className="p-4 text-left font-semibold">Acertos</th>
                                <th className="p-4 text-center font-semibold">Qtd Real</th>
                                <th className="p-4 text-center font-semibold">% Real</th>
                                <th className="p-4 text-center font-semibold">Qtd Esperada</th>
                                <th className="p-4 text-center font-semibold">% Esperada 📊</th>
                                <th className="p-4 text-center font-semibold">Desvio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {rows.map(hits => {
                                const realCount = stats.distribution[hits];
                                const realPercent = stats.total > 0 ? (realCount / stats.total) * 100 : 0;
                                const expectedCount = stats.total * expectedProbs[hits];
                                const expectedPercent = expectedProbs[hits] * 100;
                                const deviation = realPercent - expectedPercent;

                                return (
                                    <tr key={hits} className="hover:bg-surface-1/50 transition-colors">
                                        <td className="p-4 font-bold text-foreground">{hits}</td>
                                        <td className="p-4 text-center text-foreground/85">{realCount}</td>
                                        <td className="p-4 text-center text-foreground font-semibold">
                                            {realPercent.toFixed(2)}%
                                        </td>
                                        <td className="p-4 text-center text-muted-foreground">{expectedCount.toFixed(1)}</td>
                                        <td className="p-4 text-center text-muted-foreground">
                                            {expectedPercent.toFixed(2)}%
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-bold ${Math.abs(deviation) < 0.5 ? 'text-muted-foreground' :
                                                deviation > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
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
