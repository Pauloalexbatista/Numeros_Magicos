'use client';

import { useState } from 'react';
import { YearlyStarStat } from '@/app/analysis/stars/actions';
import { Card } from '@/components/ui/card';

interface TopStarSystemsAnalysisProps {
    data: Record<string, YearlyStarStat[]>;
    game?: string;
    themeMode?: 'light' | 'dark';
}

export function TopStarSystemsAnalysis({ data, game = 'EUROMILLIONS', themeMode }: TopStarSystemsAnalysisProps) {
    const years = Object.keys(data);
    const currentYear = new Date().getFullYear().toString();
    const [selectedYear, setSelectedYear] = useState<string>(years.includes(currentYear) ? currentYear : years[years.length - 1] || currentYear);
    const currentStats = data[selectedYear] || [];

    const isTotoloto = game === 'TOTOLOTO';
    const isEuroDreams = game === 'EURODREAMS';

    // Terminology
    const titleTerm = isTotoloto ? 'Número da Sorte' : isEuroDreams ? 'Número de Sonho' : 'Estrelas';
    const jackpotLabel = isTotoloto ? 'Jackpots (1) 🏆' : isEuroDreams ? 'Jackpots (1) 🏆' : 'Jackpots (2) 🏆';
    const secondaryLabel = isTotoloto ? 'N/A' : isEuroDreams ? 'N/A' : '1 Estrela ★';

    // Theme Colors
    const isSpecialGame = isTotoloto || isEuroDreams;

    return (
        <Card className="p-6 glass-card mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--accent)" }}>
                        🏆 Liga dos Campeões ({titleTerm})
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Análise histórica de performance anual.
                    </p>
                </div>

                <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: "var(--surface-2)" }}>
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`
                                px-4 py-1.5 rounded-md text-sm font-medium transition-all
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
                            <th className="py-3 px-4 text-center" style={{ color: "var(--accent)" }}>{jackpotLabel}</th>
                            {!isSpecialGame && (
                                <th className="py-3 px-4 text-center text-muted-foreground">{secondaryLabel}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {currentStats.map((stat, index) => (
                            <tr key={stat.systemName} className="hover:bg-surface-2/30 transition-colors">
                                <td className="py-3 px-4">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm
                                        ${index === 0 ? 'bg-accent/15 text-accent border border-accent/25' :
                                            index === 1 ? 'bg-surface-3 text-foreground border border-border' :
                                                index === 2 ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20' :
                                                    'text-muted-foreground'}
                                    `}>
                                        #{index + 1}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="font-medium text-foreground">{stat.systemName}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`font-bold text-lg ${(isSpecialGame ? stat.hits1 : stat.hits2) > 0 ? 'text-accent' : 'text-muted-foreground/50'}`}>
                                        {isSpecialGame ? stat.hits1 : stat.hits2}
                                    </span>
                                </td>
                                {!isSpecialGame && (
                                    <td className="py-3 px-4 text-center">
                                        <span className={`font-bold ${stat.hits1 > 0 ? 'text-foreground/85' : 'text-muted-foreground/50'}`}>
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
