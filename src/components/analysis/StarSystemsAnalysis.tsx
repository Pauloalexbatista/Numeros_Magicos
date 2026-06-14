
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
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border backdrop-blur-sm shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                        🏆 Liga das Estrelas
                    </h2>
                    <p className="text-zinc-500 text-sm">
                        Análise de Jackpots (2 estrelas) e Prémios de Consolação (1 estrela).
                    </p>
                </div>

                <div className="flex gap-2 bg-surface-2 text-foreground p-1 rounded-lg border border-border">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`
                                px-4 py-1.5 rounded-md text-sm font-black transition-all
                                ${selectedYear === year
                                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800'}
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
                        <tr className="border-b border-border text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                            <th className="py-3 px-4">Posição</th>
                            <th className="py-3 px-4">Sistema</th>
                            <th className="py-3 px-4 text-center text-yellow-600 dark:text-yellow-400">Jackpots (2★) 🎯</th>
                            <th className="py-3 px-4 text-center text-muted-foreground">1 Estrela (1★) 💰</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                        {currentStats.map((stat, index) => (
                            <tr key={stat.systemName} className="hover:bg-yellow-50/50 dark:hover:bg-yellow-900/5 transition-colors group">
                                <td className="py-4 px-4">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg font-black text-xs
                                        ${index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' :
                                            index === 1 ? 'bg-zinc-200 dark:bg-zinc-800 text-muted-foreground' :
                                                index === 2 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500' :
                                                    'text-zinc-400'}
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
                                    <span className={`font-black text-xl ${stat.hits2 > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-zinc-300 dark:text-zinc-700'}`}>
                                        {stat.hits2}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className={`font-bold ${stat.hits1 > 0 ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-300 dark:text-zinc-700'}`}>
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
