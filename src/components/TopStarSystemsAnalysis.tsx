
'use client';

import { useState } from 'react';
import { YearlyStarStat } from '@/app/analysis/stars/actions';
import { Card } from '@/components/ui/card';

interface TopStarSystemsAnalysisProps {
    data: Record<string, YearlyStarStat[]>;
}

export function TopStarSystemsAnalysis({ data }: TopStarSystemsAnalysisProps) {
    const currentYear = new Date().getFullYear().toString();
    const availableYears = Object.keys(data);
    const [selectedYear, setSelectedYear] = useState<string>(
        availableYears.includes(currentYear) ? currentYear : availableYears[0] || '2025'
    );

    const years = Object.keys(data);
    const currentStats = data[selectedYear] || [];

    return (
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 backdrop-blur-sm mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                        🏆 Liga das Estrelas (Análise Anual)
                    </h2>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        Performance histórica: Acertos Totais (2 Estrelas) e Parciais (1 Estrela).
                    </p>
                </div>

                <div className="flex gap-2 bg-yellow-100 dark:bg-yellow-900/50 p-1 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`
                                px-4 py-1.5 rounded-md text-sm font-medium transition-all
                                ${selectedYear === year
                                    ? 'bg-yellow-500 text-white shadow-md'
                                    : 'text-yellow-700 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'}
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
                        <tr className="border-b border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 text-xs uppercase tracking-wider">
                            <th className="py-3 px-4">Posição</th>
                            <th className="py-3 px-4">Sistema</th>
                            <th className="py-3 px-4 text-center text-yellow-600 dark:text-yellow-400">2 Estrelas 🌟🌟</th>
                            <th className="py-3 px-4 text-center text-yellow-600/70 dark:text-yellow-400/70">1 Estrela 🌟</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-yellow-200/50 dark:divide-yellow-800/50">
                        {currentStats.map((stat, index) => (
                            <tr key={stat.systemName} className="hover:bg-yellow-200/30 dark:hover:bg-yellow-800/30 transition-colors">
                                <td className="py-3 px-4">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm
                                        ${index === 0 ? 'bg-yellow-400 text-yellow-950 border border-yellow-500' :
                                            index === 1 ? 'bg-zinc-300 text-zinc-900 border border-zinc-400' :
                                                index === 2 ? 'bg-orange-400 text-orange-950 border border-orange-500' :
                                                    'text-yellow-700 dark:text-yellow-300'}
                                    `}>
                                        #{index + 1}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="font-medium text-yellow-900 dark:text-yellow-100">{stat.systemName}</span>
                                    {stat.systemName === 'Hot Stars' && (
                                        <span className="ml-2 text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">HOT</span>
                                    )}
                                    {stat.systemName === 'Anti-Hot Stars' && (
                                        <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">COLD</span>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`font-bold text-lg ${stat.hits2 > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-yellow-900/40 dark:text-yellow-100/40'}`}>
                                        {stat.hits2}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`font-bold ${stat.hits1 > 0 ? 'text-yellow-800 dark:text-yellow-200' : 'text-yellow-900/40 dark:text-yellow-100/40'}`}>
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
