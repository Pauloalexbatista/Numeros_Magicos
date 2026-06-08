'use client';

import { useState } from 'react';
import { YearlyStarStat } from '@/app/analysis/stars/actions';
import { Card } from '@/components/ui/card';

interface TopStarSystemsAnalysisProps {
    data: Record<string, YearlyStarStat[]>;
    game?: string;
    themeMode?: 'light' | 'dark';
}

export function TopStarSystemsAnalysis({ data, game = 'EUROMILLIONS', themeMode = 'light' }: TopStarSystemsAnalysisProps) {
    const years = Object.keys(data);
    const currentYear = new Date().getFullYear().toString();
    const [selectedYear, setSelectedYear] = useState<string>(years.includes(currentYear) ? currentYear : years[years.length - 1] || currentYear);
    const currentStats = data[selectedYear] || [];

    const isTotoloto = game === 'TOTOLOTO';
    const isEuroDreams = game === 'EURODREAMS';

    // Terminology
    const titleTerm = isTotoloto ? 'Número da Sorte' : isEuroDreams ? 'Número de Sonho' : 'Estrelas';
    const jackpotLabel = isTotoloto ? 'Jackpots (1) 🎯' : isEuroDreams ? 'Jackpots (1) 🎯' : 'Jackpots (2) 🎯';
    const secondaryLabel = isTotoloto ? 'N/A' : isEuroDreams ? 'N/A' : '1 Estrela ⭐';

    // Theme Colors (Light Mode optimized)
    const themeColor = isTotoloto ? 'emerald' : isEuroDreams ? 'rose' : 'amber';

    // Explicit color map for safelist
    const bgSoft = isTotoloto ? 'bg-emerald-50' : isEuroDreams ? 'bg-rose-50' : 'bg-amber-50';
    const textTheme = isTotoloto ? 'text-emerald-600' : isEuroDreams ? 'text-rose-600' : 'text-amber-600';
    const btnActive = isTotoloto ? 'bg-emerald-600' : isEuroDreams ? 'bg-rose-600' : 'bg-amber-500';

    return (
        <Card className="p-6 bg-white border-slate-200 shadow-xl transition-all duration-700 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className={`text-2xl font-bold flex items-center gap-2 ${textTheme}`}>
                        🏆 Liga dos Campeões ({titleTerm})
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Análise histórica de performance anual.
                    </p>
                </div>

                <div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`
                                px-4 py-1.5 rounded-md text-sm font-medium transition-all
                                ${selectedYear === year
                                    ? `${btnActive} text-white shadow-md`
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white'}
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
                        <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="py-3 px-4">Posição</th>
                            <th className="py-3 px-4">Sistema</th>
                            <th className={`py-3 px-4 text-center ${textTheme}`}>{jackpotLabel}</th>
                            {!isTotoloto && !isEuroDreams && (
                                <th className="py-3 px-4 text-center text-slate-400">{secondaryLabel}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentStats.map((stat, index) => (
                            <tr key={stat.systemName} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm
                                        ${index === 0 ? `bg-${themeColor}-100 text-${themeColor}-700 border border-${themeColor}-200` :
                                            index === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                                                index === 2 ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                                    'text-slate-500'}
                                    `}>
                                        #{index + 1}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="font-medium text-slate-700">{stat.systemName}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`font-bold text-lg ${((isTotoloto || isEuroDreams) ? stat.hits1 : stat.hits2) > 0 ? textTheme : 'text-slate-400'}`}>
                                        {(isTotoloto || isEuroDreams) ? stat.hits1 : stat.hits2}
                                    </span>
                                </td>
                                {!isTotoloto && !isEuroDreams && (
                                    <td className="py-3 px-4 text-center">
                                        <span className={`font-bold ${stat.hits1 > 0 ? 'text-slate-500' : 'text-slate-300'}`}>
                                            {stat.hits1}
                                        </span>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
