'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface StarYearlyStat {
    systemName: string;
    year: string;
    hits1: number;
    hits2: number;
}

interface StarSystemsAnalysisProps {
    data: Record<string, StarYearlyStat[]>;
}

export function StarSystemsAnalysis({ data }: StarSystemsAnalysisProps) {
    const years = Object.keys(data);
    const [selectedYear, setSelectedYear] = useState<string>(years.includes('2025') ? '2025' : years[0] || '2025');
    const currentStats = data[selectedYear] || [];

    return (
        <Card className="p-6 glass-card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        🏆 Liga das Estrelas
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Análise de Jackpots (2 estrelas) e Prémios de Consolação (1 estrela).
                    </p>
                </div>

                <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: "var(--surface-2)" }}>
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`
                                px-4 py-1.5 rounded-md text-sm font-bold transition-all
                                ${selectedYear === year
                                    ? 'glass-button'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-3'}
                            `}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                            <th className="py-3 px-4">Posição</th>
                            <th className="py-3 px-4">Sistema</th>
                            <th className="py-3 px-4 text-center text-yellow-600 dark:text-yellow-400">Jackpots (2★) 🎯</th>
                            <th className="py-3 px-4 text-center text-muted-foreground">1 Estrela (1★) 💰</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {currentStats.map((stat, index) => (
                            <tr key={stat.systemName} className="hover:bg-surface-2/30 transition-colors group">
                                <td className="py-4 px-4">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm
                                        ${index === 0 ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/25' :
                                            index === 1 ? 'bg-surface-3 text-foreground border border-border' :
                                                index === 2 ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20' :
                                                    'text-muted-foreground'}
                                    `}>
                                        #{index + 1}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className="font-bold text-foreground group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                                        {stat.systemName}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className={`font-black text-xl ${stat.hits2 > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground/50'}`}>
                                        {stat.hits2}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className={`font-bold ${stat.hits1 > 0 ? 'text-foreground/85' : 'text-muted-foreground/50'}`}>
                                        {stat.hits1}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
