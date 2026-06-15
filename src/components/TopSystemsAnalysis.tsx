'use client';

import { useState } from 'react';
import { YearlyStat } from '@/app/ranking/actions';
import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface TopSystemsAnalysisProps {
    data: Record<string, YearlyStat[]>;
    game?: string;
}

export function TopSystemsAnalysis({ data, game = 'EUROMILLIONS' }: TopSystemsAnalysisProps) {
    const t = useTranslations('ranking');
    const years = Object.keys(data);
    // Default to Current Year
    const currentYear = new Date().getFullYear().toString();
    const [selectedYear, setSelectedYear] = useState<string>(years.includes(currentYear) ? currentYear : years[years.length - 1] || currentYear);
    const currentStats = data[selectedYear] || [];

    const isEuroDreams = game === 'EURODREAMS';
    const isMegaSena = game === 'MEGASENA';
    const is6Jackpot = isEuroDreams || isMegaSena;
    const isTotoloto = game === 'TOTOLOTO';
    const jackpotLabel = `${t('jackpots_label', { num: is6Jackpot ? 6 : 5 })} 🎯`;
    const highPrizeLabel = is6Jackpot ? 'Prêmios Altos (5) 🥈' : '2º Prêmio (4) 🥈';

    // Theme Configuration
    const themeColor = isTotoloto ? 'emerald' : isEuroDreams ? 'purple' : 'blue'; // Original used Blue for EM, but Star Ranking uses Amber/Yellow. 
    // The user asked for "cores do jogo". For Numbers ranking EM usually uses Blue? No, logo is Yellow/Red. 
    // Let's align with Star Ranking colors for consistency? 
    // Star Ranking used: EM=Yellow/Amber, Totoloto=Emerald, EuroDreams=Pink/Rose.
    // However, existing Numbers code used Blue for EM and Purple for ED. 
    // "agora vamos fazer igual (com as cores do jogo)". 
    // I should probably switch to the same colors as Star Ranking: EM=Amber, ED=Rose/Pink.

    // Let's stick to the Star Ranking palette I just established:
    const palette = isTotoloto ? {
        text: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        btn: 'bg-emerald-600',
        badge: 'bg-emerald-100 text-emerald-700'
    } : isEuroDreams ? {
        text: 'text-rose-600', // Matching Star Ranking (Pink/Rose)
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        btn: 'bg-rose-600',
        badge: 'bg-rose-100 text-rose-700'
    } : {
        text: 'text-amber-600', // Matching Star Ranking (Yellow/Amber)
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        btn: 'bg-amber-500',
        badge: 'bg-amber-100 text-amber-800'
    };

    return (
        <Card className="p-6 glass-card mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--accent)" }}>
                        🏆 {t("champions_title")}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Análise histórica de Jackpots ({is6Jackpot ? '6' : '5'} números) e Prémios Altos ({is6Jackpot ? '5' : '4'} números).
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
                            <th className="py-3 px-4">{t("position")}</th>
                            <th className="py-3 px-4">{t("system")}</th>
                            <th className="py-3 px-4 text-center" style={{ color: "var(--accent)" }}>{jackpotLabel}</th>
                            <th className="py-3 px-4 text-center text-muted-foreground">{highPrizeLabel}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {currentStats.map((stat, index) => (
                            <tr key={stat.systemName} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm
                                        ${index === 0 ? palette.badge :
                                            index === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                                                index === 2 ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                                    'text-slate-500'}
                                    `}>
                                        #{index + 1}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="font-medium text-slate-700">{stat.systemName}</span>
                                    {stat.systemName === 'Sistema Média Vizinhos' && (
                                        <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">FIXO</span>
                                    )}
                                    {stat.systemName === 'Sistema Platina' && (
                                        <span className="ml-2 text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100">IA</span>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`font-bold text-lg ${stat.jackpots > 0 ? palette.text : 'text-slate-400'}`}>
                                        {stat.jackpots}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`font-bold ${stat.highPrizes > 0 ? 'text-slate-600' : 'text-slate-300'}`}>
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
