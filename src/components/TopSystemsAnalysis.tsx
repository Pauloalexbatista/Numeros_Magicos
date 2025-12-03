
'use client';

import { useState } from 'react';
import { YearlyStat } from '@/app/ranking/actions';
import { Card } from '@/components/ui/card';

interface TopSystemsAnalysisProps {
    data: Record<string, YearlyStat[]>;
}

export function TopSystemsAnalysis({ data }: TopSystemsAnalysisProps) {
    const years = Object.keys(data);
    // Default to 2025 or the latest year available
    const [selectedYear, setSelectedYear] = useState<string>(years.includes('2025') ? '2025' : years[years.length - 1] || '2025');
    const currentStats = data[selectedYear] || [];

    return (
        <Card className="p-6 bg-slate-900/60 border-slate-800 backdrop-blur-sm mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        🏆 Liga dos Campeões (Top 6)
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Análise histórica de Jackpots (5 números) e Prémios Altos (4 números).
                    </p>
                </div>

                <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`
                                px-4 py-1.5 rounded-md text-sm font-medium transition-all
                                ${selectedYear === year
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}
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
                        <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="py-3 px-4">Posição</th>
                            <th className="py-3 px-4">Sistema</th>
                            <th className="py-3 px-4 text-center text-emerald-400">Jackpots (5) 🎯</th>
                            <th className="py-3 px-4 text-center text-amber-400">Prémios Altos (4) 💰</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {currentStats.map((stat, index) => (
                            <tr key={stat.systemName} className="hover:bg-slate-800/30 transition-colors">
                                <td className="py-3 px-4">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm
                                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                            index === 1 ? 'bg-slate-400/20 text-slate-400 border border-slate-400/30' :
                                                index === 2 ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                                                    'text-slate-600'}
                                    `}>
                                        #{index + 1}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="font-medium text-slate-200">{stat.systemName}</span>
                                    {stat.systemName === 'Sistema Média Vizinhos' && (
                                        <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">FIXO</span>
                                    )}
                                    {stat.systemName === 'Sistema Platina' && (
                                        <span className="ml-2 text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">IA</span>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`font-bold text-lg ${stat.jackpots > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                                        {stat.jackpots}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`font-bold ${stat.highPrizes > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                                        {stat.highPrizes}
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
