'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import {
    HelpCircle,
    BarChart3,
    Calendar,
    ArrowRight,
    GitMerge,
    Layers,
    Network,
    Clock,
    TrendingUp,
    Info
} from 'lucide-react';
import { GameType, GAMES } from '@/types/game';

interface Props {
    systemName: string;
    game: string;
}

const GAME_MAP: Record<string, GameType> = {
    'euromillions': GameType.EUROMILLIONS,
    'megasena': GameType.MEGASENA,
    'totoloto': GameType.TOTOLOTO,
    'eurodreams': GameType.EURODREAMS
};

const gameThemeMap = {
    [GameType.MEGASENA]: {
        bg: 'bg-gradient-to-br from-emerald-50/10 via-slate-900 to-amber-950/20 dark:from-black dark:via-zinc-950 dark:to-emerald-950/20',
        card: 'glass-card border-emerald-500/20 bg-zinc-900/60 text-zinc-100',
        accentText: 'text-emerald-400 dark:text-emerald-400',
        accentBorder: 'border-emerald-500/30',
        glow: 'rgba(16, 185, 129, 0.15)'
    },
    [GameType.EUROMILLIONS]: {
        bg: 'bg-gradient-to-br from-blue-950/20 via-slate-900 to-indigo-950/20 dark:from-black dark:via-zinc-950 dark:to-indigo-950/10',
        card: 'glass-card border-blue-500/20 bg-zinc-900/60 text-zinc-100',
        accentText: 'text-blue-400 dark:text-blue-400',
        accentBorder: 'border-blue-500/30',
        glow: 'rgba(59, 130, 246, 0.15)'
    },
    [GameType.TOTOLOTO]: {
        bg: 'bg-gradient-to-br from-teal-950/20 via-slate-900 to-emerald-950/10 dark:from-black dark:via-zinc-950 dark:to-teal-950/20',
        card: 'glass-card border-teal-500/20 bg-zinc-900/60 text-zinc-100',
        accentText: 'text-teal-400 dark:text-teal-400',
        accentBorder: 'border-teal-500/30',
        glow: 'rgba(20, 184, 166, 0.15)'
    },
    [GameType.EURODREAMS]: {
        bg: 'bg-gradient-to-br from-purple-950/20 via-slate-900 to-pink-950/10 dark:from-black dark:via-zinc-950 dark:to-purple-950/20',
        card: 'glass-card border-purple-500/20 bg-zinc-900/60 text-zinc-100',
        accentText: 'text-purple-450 dark:text-purple-400',
        accentBorder: 'border-purple-500/30',
        glow: 'rgba(168, 85, 247, 0.15)'
    }
};

export default function SystemExplanation({ systemName, game }: Props) {
    const getTranslationKey = (name: string) => {
        const norm = name.toLowerCase().trim();
        if (norm.includes('hot')) return 'hot_numbers';
        if (norm.includes('monte') || norm.includes('carlo')) return 'monte_carlo';
        if (norm.includes('media') || norm.includes('média')) return 'media_3_otimizado';
        if (norm.includes('oscilacao') || norm.includes('oscilação') || norm.includes('universal')) return 'universal_oscillation';
        if (norm.includes('recent')) return 'recent_numbers';
        if (norm.includes('late')) return 'late_numbers';
        if (norm.includes('markov')) return 'markov_chain';
        if (norm.includes('clustering')) return 'clustering';
        if (norm.includes('pascal')) return 'pyramid_pascal';
        if (norm.includes('gap')) return 'pyramid_gaps';
        if (norm.includes('media') || norm.includes('média')) return 'media_3_otimizado';
        if (norm.includes('oscilacao') || norm.includes('oscilação') || norm.includes('universal')) return 'universal_oscillation';
        return norm.replace(/\s+/g, '_');
    };

    const translationKey = getTranslationKey(systemName);
    const t = useTranslations('system_explanations.' + translationKey);
    
    const gameKey = game.toLowerCase();
    const gameType = GAME_MAP[gameKey] || GameType.EUROMILLIONS;
    const currentTheme = gameThemeMap[gameType];
    const gameConfig = GAMES[gameType];

    // --- RENDER METHODS FOR DIFFERENT VISUALIZATIONS ---

    const renderFrequencyTable = () => {
        const sampleNumbers = [1, 7, 14, 23, 32, 45];
        const sampleDraws = [
            { name: 'Sorteio A', hits: [1, 14, 45] },
            { name: 'Sorteio B', hits: [7, 14, 32] },
            { name: 'Sorteio C', hits: [1, 7, 45] }
        ];

        const getHits = (num: number) => {
            let count = 0;
            sampleDraws.forEach(d => {
                if (d.hits.includes(num)) count++;
            });
            return count;
        };

        return (
            <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/40 shadow-inner">
                <table className="w-full border-collapse text-left text-xs min-w-[480px]">
                    <thead>
                        <tr className="bg-zinc-900/60 border-b border-zinc-800">
                            <th className="p-3 font-semibold text-zinc-400">{t('table_draw_title')}</th>
                            {sampleNumbers.map(n => (
                                <th key={n} className="p-3 font-bold text-center border-l border-zinc-800/60 text-zinc-200">{n}</th>
                            ))}
                            <th className="p-3 font-semibold text-center border-l border-zinc-800/60 text-zinc-500">...</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                        {sampleDraws.map((draw, idx) => (
                            <tr key={idx} className="hover:bg-zinc-900/35 transition-colors">
                                <td className="p-3 font-medium text-zinc-300 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-650" />
                                    {draw.name}
                                </td>
                                {sampleNumbers.map(n => {
                                    const isHit = draw.hits.includes(n);
                                    return (
                                        <td key={n} className="p-3 text-center border-l border-zinc-800/40 font-semibold text-sm">
                                            {isHit ? (
                                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/35">
                                                    1
                                                </span>
                                            ) : (
                                                <span className="text-zinc-700 font-light">-</span>
                                            )}
                                        </td>
                                    );
                                })}
                                <td className="p-3 text-center border-l border-zinc-800/40 text-zinc-750">-</td>
                            </tr>
                        ))}
                        <tr className="bg-zinc-900/50 font-bold border-t-2 border-zinc-800">
                            <td className="p-3 text-zinc-200 font-semibold flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: gameConfig.ui.accent }} />
                                {t('table_total_title')}
                            </td>
                            {sampleNumbers.map(n => {
                                const total = getHits(n);
                                const isHot = total >= 2;
                                return (
                                    <td key={n} className="p-3 text-center border-l border-zinc-800/40 text-sm">
                                        <span 
                                            className={`inline-flex items-center justify-center h-6 w-6 rounded-md font-bold transition-all shadow-sm ${
                                                isHot 
                                                    ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/45 text-[var(--accent)]' 
                                                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                            }`} 
                                            style={isHot ? { 
                                                color: gameConfig.ui.accent, 
                                                borderColor: gameConfig.ui.accent + '50', 
                                                backgroundColor: gameConfig.ui.accent + '18',
                                                boxShadow: '0 0 10px ' + gameConfig.ui.accent + '30'
                                            } : {}}
                                        >
                                            {total}
                                        </span>
                                    </td>
                                );
                            })}
                            <td className="p-3 text-center border-l border-zinc-800/40 text-zinc-750">-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    const renderLateTable = () => {
        const sampleNumbers = [4, 9, 15, 27];
        const sampleDraws = [
            { name: 'Sorteio A', drawn: [4, 27] },
            { name: 'Sorteio B', drawn: [15] },
            { name: 'Sorteio C', drawn: [] },
            { name: 'Sorteio D', drawn: [4] }
        ];

        const delayMatrix = {
            4:  [0, 1, 2, 0],
            9:  [3, 4, 5, 6],
            15: [1, 0, 1, 2],
            27: [0, 1, 2, 3]
        };

        return (
            <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/40 shadow-inner">
                <table className="w-full border-collapse text-left text-xs min-w-[420px]">
                    <thead>
                        <tr className="bg-zinc-900/60 border-b border-zinc-800">
                            <th className="p-3 font-semibold text-zinc-400">{t('table_draw_title')}</th>
                            {sampleNumbers.map(n => (
                                <th key={n} className="p-3 font-bold text-center border-l border-zinc-800/60 text-zinc-200">Nº {n}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                        {sampleDraws.map((draw, drawIdx) => (
                            <tr key={drawIdx} className="hover:bg-zinc-900/35 transition-colors">
                                <td className="p-3 font-medium text-zinc-300 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-650" />
                                    {draw.name}
                                </td>
                                {sampleNumbers.map(n => {
                                    const delayVal = delayMatrix[n][drawIdx];
                                    const isDrawn = delayVal === 0;
                                    return (
                                        <td key={n} className="p-3 text-center border-l border-zinc-800/40 font-semibold">
                                            {isDrawn ? (
                                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-450 text-[10px] border border-emerald-500/25">
                                                    Saiu (0)
                                                </span>
                                            ) : (
                                                <span className="text-zinc-400 font-mono">Atraso: {delayVal}</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        <tr className="bg-zinc-900/50 font-bold border-t-2 border-zinc-800">
                            <td className="p-3 text-zinc-200 font-semibold flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: gameConfig.ui.accent }} />
                                {t('table_total_title')}
                            </td>
                            {sampleNumbers.map(n => {
                                const finalDelay = delayMatrix[n][3];
                                const isHighlyLate = finalDelay >= 3;
                                return (
                                    <td key={n} className="p-3 text-center border-l border-zinc-800/40 text-sm">
                                        <span 
                                            className={`inline-flex items-center justify-center px-3 py-1 rounded-md font-mono font-bold transition-all shadow-sm ${
                                                isHighlyLate 
                                                    ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/45 text-[var(--accent)]' 
                                                    : 'bg-zinc-850 text-zinc-400 border border-zinc-805'
                                            }`} 
                                            style={isHighlyLate ? { 
                                                color: gameConfig.ui.accent, 
                                                borderColor: gameConfig.ui.accent + '50', 
                                                backgroundColor: gameConfig.ui.accent + '18',
                                                boxShadow: '0 0 10px ' + gameConfig.ui.accent + '30'
                                            } : {}}
                                        >
                                            {finalDelay} Sorteios
                                        </span>
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    const renderMarkovVisual = () => {
        const sourceNumbers = [14, 3, 42];
        const transitions = [
            { from: 14, to: 23, count: 28, prob: '18.5%' },
            { from: 3, to: 12, count: 22, prob: '14.6%' },
            { from: 42, to: 45, count: 19, prob: '12.6%' }
        ];

        return (
            <div className="space-y-6">
                {/* Visual Flow Diagram */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                        Fluxo de Transições Mais Prováveis
                    </h4>
                    <div className="grid grid-cols-1 gap-3.5">
                        {transitions.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-850/60 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: gameConfig.ui.accent }} />
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                                        {item.from}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-zinc-650" />
                                    <div className="h-8 w-8 rounded-full bg-zinc-900 border flex items-center justify-center text-xs font-extrabold text-zinc-100" style={{ borderColor: gameConfig.ui.accent, boxShadow: '0 0 10px ' + gameConfig.ui.accent + '20' }}>
                                        {item.to}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs font-extrabold" style={{ color: gameConfig.ui.accent }}>
                                        {item.prob}
                                    </span>
                                    <span className="block text-[9px] text-zinc-500 font-medium">
                                        {item.count} conexões históricas
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transition Matrix Grid */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/45 space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {t('table_draw_title')} (Matriz Simplificada)
                    </h4>
                    <div className="grid grid-cols-5 gap-2 text-[10px] text-center text-zinc-300">
                        <div className="bg-zinc-900/60 p-1.5 rounded border border-zinc-800 font-bold">Origem \ Destino</div>
                        <div className="bg-zinc-900/40 p-1.5 rounded font-semibold text-zinc-400">Nº 12</div>
                        <div className="bg-zinc-900/40 p-1.5 rounded font-semibold text-zinc-400">Nº 23</div>
                        <div className="bg-zinc-900/40 p-1.5 rounded font-semibold text-zinc-400">Nº 45</div>
                        <div className="bg-zinc-900/40 p-1.5 rounded font-semibold text-zinc-400">...</div>

                        <div className="bg-zinc-900/40 p-1.5 rounded text-left font-bold text-zinc-400">Nº 3</div>
                        <div className="bg-emerald-500/10 border border-emerald-500/25 p-1.5 rounded font-extrabold text-emerald-400">14.6%</div>
                        <div className="bg-zinc-950/50 p-1.5 rounded text-zinc-650">0.2%</div>
                        <div className="bg-zinc-950/50 p-1.5 rounded text-zinc-650">1.1%</div>
                        <div className="bg-zinc-950/50 p-1.5 rounded text-zinc-700">-</div>

                        <div className="bg-zinc-900/40 p-1.5 rounded text-left font-bold text-zinc-400">Nº 14</div>
                        <div className="bg-zinc-950/50 p-1.5 rounded text-zinc-650">0.5%</div>
                        <div className="bg-emerald-500/10 border border-emerald-500/25 p-1.5 rounded font-extrabold text-emerald-400">18.5%</div>
                        <div className="bg-zinc-950/50 p-1.5 rounded text-zinc-650">0.8%</div>
                        <div className="bg-zinc-950/50 p-1.5 rounded text-zinc-700">-</div>

                        <div className="bg-zinc-900/40 p-1.5 rounded text-left font-bold text-zinc-400">Nº 42</div>
                        <div className="bg-zinc-950/50 p-1.5 rounded text-zinc-650">1.2%</div>
                        <div className="bg-zinc-950/50 p-1.5 rounded text-zinc-650">0.4%</div>
                        <div className="bg-emerald-500/10 border border-emerald-500/25 p-1.5 rounded font-extrabold text-emerald-400">12.6%</div>
                        <div className="bg-zinc-950/50 p-1.5 rounded text-zinc-700">-</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderClusteringVisual = () => {
        return (
            <div className="space-y-6">
                {/* Cluster visual groups */}
                <div className="grid grid-cols-3 gap-3.5">
                    <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/20 text-center space-y-2 opacity-50">
                        <span className="inline-block text-[9px] font-bold bg-zinc-850 px-2 py-0.5 rounded-full text-zinc-400 border border-zinc-800">
                            Cluster A
                        </span>
                        <p className="text-[10px] text-zinc-400 font-semibold">Somas Baixas</p>
                        <p className="text-[9px] text-zinc-500">Média: 64</p>
                    </div>

                    <div className="p-3.5 rounded-xl border text-center space-y-2 relative overflow-hidden" style={{ borderColor: gameConfig.ui.accent + '40', backgroundColor: gameConfig.ui.accent + '05' }}>
                        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: gameConfig.ui.accent }} />
                        <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border" style={{ color: gameConfig.ui.accent, borderColor: gameConfig.ui.accent + '30', backgroundColor: gameConfig.ui.accent + '15' }}>
                            Cluster B (Ativo)
                        </span>
                        <p className="text-[10px] text-zinc-100 font-extrabold">Somas Médias</p>
                        <p className="text-[9px]" style={{ color: gameConfig.ui.accent }}>Média: 138</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/20 text-center space-y-2 opacity-50">
                        <span className="inline-block text-[9px] font-bold bg-zinc-850 px-2 py-0.5 rounded-full text-zinc-400 border border-zinc-800">
                            Cluster C
                        </span>
                        <p className="text-[10px] text-zinc-400 font-semibold">Somas Altas</p>
                        <p className="text-[9px] text-zinc-500">Média: 198</p>
                    </div>
                </div>

                {/* Centroid Distance visualization */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/45 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Distância Geométrica dos Números ao Centroide (Cluster B)
                    </h4>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-350 mb-1">
                                <span>Número 14</span>
                                <span style={{ color: gameConfig.ui.accent }}>Distância: 1.25 (Excelente)</span>
                            </div>
                            <div className="h-2 w-full rounded bg-zinc-900 border border-zinc-800 overflow-hidden">
                                <div className="h-full rounded" style={{ width: '85%', backgroundColor: gameConfig.ui.accent }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-350 mb-1">
                                <span>Número 32</span>
                                <span style={{ color: gameConfig.ui.accent }}>Distância: 2.10 (Muito Próximo)</span>
                            </div>
                            <div className="h-2 w-full rounded bg-zinc-900 border border-zinc-800 overflow-hidden">
                                <div className="h-full rounded" style={{ width: '70%', backgroundColor: gameConfig.ui.accent }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-350 mb-1">
                                <span>Número 48</span>
                                <span className="text-zinc-500">Distância: 5.82 (Afastado)</span>
                            </div>
                            <div className="h-2 w-full rounded bg-zinc-900 border border-zinc-800 overflow-hidden">
                                <div className="h-full rounded bg-zinc-700" style={{ width: '30%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPascalVisual = () => {
        const layers = [
            [5],
            [2, 3],
            [1, 1, 2],
            [3, 8, 3, 9],
            [1, 2, 6, 7, 2]
        ];

        return (
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 flex flex-col items-center justify-center space-y-5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
                    Geração da Estrutura Piramidal (Módulo 10)
                </h4>
                
                {/* Visual Pyramid */}
                <div className="flex flex-col items-center gap-2 font-mono">
                    {layers.map((layer, idx) => (
                        <div key={idx} className="flex gap-2.5">
                            {layer.map((digit, dIdx) => {
                                const isTop = idx === 0;
                                const isBase = idx === layers.length - 1;
                                return (
                                    <div 
                                        key={dIdx} 
                                        className={`h-7 w-7 rounded flex items-center justify-center text-xs font-bold transition-all ${
                                            isTop 
                                                ? 'bg-zinc-100 text-zinc-950 font-extrabold ring-4 ring-zinc-100/10' 
                                                : isBase 
                                                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-400' 
                                                    : 'bg-zinc-855 border border-zinc-750 text-zinc-200'
                                        }`}
                                        style={isTop ? { boxShadow: '0 0 15px ' + gameConfig.ui.accent } : {}}
                                    >
                                        {digit}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="w-full text-center p-2 rounded bg-zinc-900/60 border border-zinc-850">
                    <p className="text-[9px] text-zinc-500 font-semibold">
                        Soma de pares vizinhos: (1+2 = 3), (2+6 = 8), (6+7 = 13 → 3), (7+2 = 9)
                    </p>
                </div>
            </div>
        );
    };

    const renderUniversalOscillationVisual = () => {
        const rootDistribution = [
            { root: 1, count: 0, status: 'Normal' },
            { root: 2, count: 1, status: 'Normal' },
            { root: 3, count: 2, status: 'Dominante' },
            { root: 4, count: 0, status: 'Normal' },
            { root: 5, count: 1, status: 'Normal' },
            { root: 6, count: 0, status: 'Normal' },
            { root: 7, count: 1, status: 'Normal' },
            { root: 8, count: 0, status: 'Normal' },
            { root: 9, count: 0, status: 'Normal' }
        ];

        const sampleScores = [
            { num: 14, root: 5, freq: 100, factor: '1.5x (Boost)', final: 150 },
            { num: 39, root: 3, freq: 120, factor: '0.5x (Penalidade)', final: 60 }
        ];

        return (
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-6">
                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
                        Distribuição de Raízes Digitais no Último Sorteio
                    </h4>
                    <div className="grid grid-cols-9 gap-2 text-center text-[10px] font-bold text-zinc-200">
                        {rootDistribution.map(item => {
                            const isDominant = item.status === 'Dominante';
                            return (
                                <div 
                                    key={item.root} 
                                    className={`p-2 rounded border flex flex-col items-center gap-1 transition-all ${
                                        isDominant 
                                            ? 'bg-red-500/10 border-red-500/30' 
                                            : 'bg-zinc-900/60 border-zinc-800'
                                    }`}
                                    style={isDominant ? { boxShadow: '0 0 10px rgba(239, 68, 68, 0.15)' } : {}}
                                >
                                    <span className="block font-mono text-xs">R{item.root}</span>
                                    <span className={`text-[8px] px-1 rounded ${isDominant ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                        {item.count}x
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-805 bg-zinc-900/10 shadow-inner">
                    <table className="w-full border-collapse text-left text-[11px] min-w-[380px]">
                        <thead>
                            <tr className="bg-zinc-900/60 border-b border-zinc-800">
                                <th className="p-3 font-semibold text-zinc-400">Número</th>
                                <th className="p-3 font-semibold text-zinc-400">Raiz</th>
                                <th className="p-3 font-semibold text-zinc-400">Freq. Base</th>
                                <th className="p-3 font-semibold text-zinc-400">Oscilação (Fator)</th>
                                <th className="p-3 font-semibold text-zinc-200 border-l border-zinc-800/60 text-right">Score Final</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40 text-zinc-300 font-medium">
                            {sampleScores.map((item, idx) => {
                                const isBoost = item.factor.includes('Boost');
                                return (
                                    <tr key={idx} className="hover:bg-zinc-900/35 transition-colors">
                                        <td className="p-3 font-extrabold text-zinc-155">Nº {item.num}</td>
                                        <td className="p-3 font-mono text-zinc-450">R{item.root}</td>
                                        <td className="p-3 text-zinc-400">{item.freq}x</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                                                isBoost ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/10 text-red-400 border border-red-500/25'
                                            }`}>
                                                {item.factor}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono font-bold text-right border-l border-zinc-800/40" style={{ color: isBoost ? gameConfig.ui.accent : '#888' }}>
                                            {item.final} pts
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderMediaOtimizadaVisual = () => {
        const columnsData = [
            { pos: 'Bola 1', values: [3, 4, 3, 5, 8, 9, 4, 6], trimmed: '3 e 9 removidos', mean: 5, neighbors: [4, 5, 6] },
            { pos: 'Bola 2', values: [12, 14, 11, 15, 17, 12, 13, 14], trimmed: '11 e 17 removidos', mean: 13, neighbors: [12, 13, 14] }
        ];

        return (
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
                    Cálculo da Média Aparada e Vizinhos por Posição
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {columnsData.map((col, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-zinc-850 bg-zinc-900/40 relative">
                            <span className="absolute top-2 right-2 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                {col.pos}
                            </span>
                            <div className="space-y-2">
                                <div>
                                    <span className="block text-[9px] text-zinc-550 font-bold uppercase">Últimos 10 Sorteios</span>
                                    <span className="text-[11px] font-mono text-zinc-300">{col.values.join(', ')} ...</span>
                                </div>
                                <div className="text-[9px] text-zinc-400">
                                    <span className="text-red-400 line-through">Outliers:</span> {col.trimmed}
                                </div>
                                <div className="pt-1 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                                    <span className="font-semibold text-zinc-300">Média Aparada:</span>
                                    <span className="font-extrabold text-emerald-400 font-mono">{col.mean}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] pt-1">
                                    <span className="text-zinc-500 font-semibold">Vizinhos (Sugestão):</span>
                                    <div className="flex gap-1.5 font-bold">
                                        {col.neighbors.map(n => (
                                            <span 
                                                key={n} 
                                                className="px-1.5 py-0.5 rounded text-[10px]"
                                                style={{ 
                                                    backgroundColor: n === col.mean ? gameConfig.ui.accent + '15' : 'rgba(255,255,255,0.05)',
                                                    color: n === col.mean ? gameConfig.ui.accent : '#aaa',
                                                    border: n === col.mean ? '1px solid ' + gameConfig.ui.accent + '30' : '1px solid rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                {n}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDiagonaisMatrizVisual = () => {
        const cols = [22, 23, 24, 25, 26, 27, 28];
        const rows = [
            { name: 'Sorteio T-4', hits: [22, 28] },
            { name: 'Sorteio T-3', hits: [23] },
            { name: 'Sorteio T-2', hits: [26] },
            { name: 'Sorteio T-1', hits: [25] },
            { name: 'Previsão T', hits: [] }
        ];

        const isLeftDiag = (rIdx, cVal) => {
            const stepsFromBottom = 4 - rIdx;
            return cVal === 25 - stepsFromBottom;
        };

        const isRightDiag = (rIdx, cVal) => {
            const stepsFromBottom = 4 - rIdx;
            return cVal === 25 + stepsFromBottom;
        };

        return (
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-6">
                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
                        Representação das Diagonais a partir de N=25
                    </h4>
                    
                    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/20 p-4">
                        <div className="min-w-[320px] flex flex-col gap-2">
                            <div className="grid grid-cols-8 gap-1 text-center text-[10px] font-bold text-zinc-400">
                                <div></div>
                                {cols.map(c => (
                                    <div key={c} className={c === 25 ? 'text-zinc-100 font-extrabold' : ''}>{c}</div>
                                ))}
                            </div>

                            {rows.map((row, rIdx) => {
                                const isTargetRow = rIdx === 4;
                                return (
                                    <div key={row.name} className="grid grid-cols-8 gap-1 items-center text-center">
                                        <div className="text-[9px] text-left text-zinc-500 font-medium whitespace-nowrap pr-2">
                                            {row.name}
                                        </div>
                                        {cols.map(c => {
                                            const hasHit = row.hits.includes(c);
                                            const leftD = isLeftDiag(rIdx, c);
                                            const rightD = isRightDiag(rIdx, c);
                                            const isTarget = isTargetRow && c === 25;

                                            let bgClass = 'bg-zinc-900/40 border-zinc-850 text-zinc-600';
                                            let borderStyle = {};
                                            
                                            if (isTarget) {
                                                bgClass = 'bg-zinc-100 text-zinc-950 font-bold border-zinc-100 animate-pulse';
                                                borderStyle = { boxShadow: '0 0 12px #ffffff' };
                                            } else if (leftD || rightD) {
                                                if (hasHit) {
                                                    bgClass = 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300 font-bold';
                                                    borderStyle = { boxShadow: '0 0 8px rgba(16, 185, 129, 0.2)' };
                                                } else {
                                                    bgClass = leftD 
                                                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                                                        : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
                                                }
                                            } else if (hasHit) {
                                                bgClass = 'bg-zinc-800/80 border-zinc-700 text-zinc-300';
                                            }

                                            return (
                                                <div 
                                                    key={c} 
                                                    className={`aspect-square flex items-center justify-center text-xs rounded border transition-all ${bgClass}`}
                                                    style={borderStyle}
                                                >
                                                    {isTarget ? 'T' : (hasHit ? '✓' : '')}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                    <div className="p-3 bg-blue-500/5 rounded border border-blue-500/20 text-blue-400">
                        <span className="block text-zinc-400 font-semibold mb-1">Diag. Esquerda (✓)</span>
                        <span className="text-sm font-extrabold">2 Acertos</span>
                    </div>
                    <div className="p-3 bg-indigo-500/5 rounded border border-indigo-500/20 text-indigo-400">
                        <span className="block text-zinc-400 font-semibold mb-1">Diag. Direita (✓)</span>
                        <span className="text-sm font-extrabold">2 Acertos</span>
                    </div>
                    <div className="p-3 bg-emerald-500/5 rounded border border-emerald-500/20 text-emerald-400">
                        <span className="block text-zinc-400 font-semibold mb-1">Soma Acumulada</span>
                        <span className="text-sm font-extrabold">4 Acertos</span>
                    </div>
                </div>
                
                <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
                    *Nota: As diagonais de todos os números continuam até 50 sorteios de profundidade, totalizando sempre exatamente 50 células analisadas por número (excluindo duplicação do ponto de partida).
                </p>
            </div>
        );
    };

    const renderDiagonaisMatriz3DVisual = () => {
        const cols = [48, 49, 50, 1, 2, 3];
        const rows = [
            { name: 'Sorteio T-4', hits: [48, 3] },
            { name: 'Sorteio T-3', hits: [2] },
            { name: 'Sorteio T-2', hits: [1] },
            { name: 'Sorteio T-1', hits: [50] },
            { name: 'Previsão T', hits: [] }
        ];

        // Diagonal Direita a partir de (T, 50):
        // d=1: (T-1, 50)
        // d=2: (T-2, 1) -> wrap-around!
        // d=3: (T-3, 2)
        // d=4: (T-4, 3)
        const isRightDiag = (rIdx, cVal) => {
            const steps = 4 - rIdx;
            if (steps === 0) return cVal === 50;
            if (steps === 1) return cVal === 50;
            if (steps === 2) return cVal === 1;
            if (steps === 3) return cVal === 2;
            if (steps === 4) return cVal === 3;
            return false;
        };

        // Diagonal Esquerda a partir de (T, 50):
        // d=1: (T-1, 50)
        // d=2: (T-2, 49)
        // d=3: (T-3, 48)
        const isLeftDiag = (rIdx, cVal) => {
            const steps = 4 - rIdx;
            if (steps === 0) return cVal === 50;
            if (steps === 1) return cVal === 50;
            if (steps === 2) return cVal === 49;
            if (steps === 3) return cVal === 48;
            return false;
        };

        return (
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-6">
                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
                        Representação 3D Cilíndrica (Wrap-around entre 50 e 1)
                    </h4>
                    
                    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/20 p-4">
                        <div className="min-w-[320px] flex flex-col gap-2">
                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400">
                                <div></div>
                                <div>48</div>
                                <div>49</div>
                                <div className="text-indigo-400">50</div>
                                <div className="text-zinc-500 font-normal">‖</div>
                                <div className="text-indigo-400">1</div>
                                <div>2</div>
                                <div>3</div>
                            </div>

                            {rows.map((row, rIdx) => {
                                const isTargetRow = rIdx === 4;
                                return (
                                    <div key={row.name} className="grid grid-cols-7 gap-1 items-center text-center">
                                        <div className="text-[9px] text-left text-zinc-500 font-medium whitespace-nowrap pr-2">
                                            {row.name}
                                        </div>
                                        {cols.map((c, cIdx) => {
                                            const hasHit = row.hits.includes(c);
                                            const leftD = isLeftDiag(rIdx, c);
                                            const rightD = isRightDiag(rIdx, c);
                                            const isTarget = isTargetRow && c === 50;

                                            let bgClass = 'bg-zinc-900/40 border-zinc-850 text-zinc-600';
                                            let borderStyle = {};
                                            
                                            if (isTarget) {
                                                bgClass = 'bg-indigo-500 text-zinc-100 font-bold border-indigo-500 animate-pulse';
                                                borderStyle = { boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)' };
                                            } else if (leftD || rightD) {
                                                if (hasHit) {
                                                    bgClass = 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300 font-bold';
                                                    borderStyle = { boxShadow: '0 0 8px rgba(16, 185, 129, 0.2)' };
                                                } else {
                                                    bgClass = leftD 
                                                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                                                        : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-450';
                                                }
                                            } else if (hasHit) {
                                                bgClass = 'bg-zinc-800/80 border-zinc-700 text-zinc-300';
                                            }

                                            // Elementos normais
                                            const element = (
                                                <div 
                                                    key={cIdx} 
                                                    className={`aspect-square flex items-center justify-center text-xs rounded border transition-all ${bgClass}`}
                                                    style={borderStyle}
                                                >
                                                    {isTarget ? 'T' : (hasHit ? '✓' : '')}
                                                </div>
                                            );

                                            // Adicionar a linha divisória do tubo '‖'
                                            if (c === 50) {
                                                return [
                                                    element,
                                                    <div key="separator" className="text-zinc-700 text-[10px] font-bold">‖</div>
                                                ];
                                            }

                                            return element;
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                    <div className="p-3 bg-indigo-500/5 rounded border border-indigo-500/20 text-indigo-400">
                        <span className="block text-zinc-400 font-semibold mb-1">Efeito Cilíndrico</span>
                        <span className="text-[11px] font-medium leading-relaxed">As diagonais continuam após a borda (50 ➔ 1)</span>
                    </div>
                    <div className="p-3 bg-emerald-500/5 rounded border border-emerald-500/20 text-emerald-400">
                        <span className="block text-zinc-400 font-semibold mb-1">Varrimento Histórico</span>
                        <span className="text-[11px] font-medium leading-relaxed">Cálculo de ressonância total até ao sorteio nº 1</span>
                    </div>
                </div>
                
                <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
                    *Nota: A modelagem 3D permite mapear tendências contínuas em forma de espiral na matriz de frequências, varrendo todo o histórico para uma precisão maximizada.
                </p>
            </div>
        );
    };

    const renderMonteCarloVisual = () => {
        const topSimulations = [
            { num: 14, count: 285, percent: '28.5%' },
            { num: 23, count: 241, percent: '24.1%' },
            { num: 32, count: 219, percent: '21.9%' },
            { num: 45, count: 198, percent: '19.8%' }
        ];

        return (
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
                    Resultado de 1000 Simulações de Sorteio (Amostra)
                </h4>
                
                {/* Simulated counts progress bars */}
                <div className="space-y-4">
                    {topSimulations.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-zinc-200">Número {item.num}</span>
                                <span style={{ color: gameConfig.ui.accent }}>
                                    Simulado {item.count}x ({item.percent})
                                </span>
                            </div>
                            <div className="h-3 w-full rounded bg-zinc-900 border border-zinc-800 overflow-hidden flex">
                                <div 
                                    className="h-full rounded transition-all duration-500" 
                                    style={{ 
                                        width: (item.count / 3) + '%', 
                                        backgroundColor: gameConfig.ui.accent,
                                        boxShadow: '0 0 10px ' + gameConfig.ui.accent
                                    }} 
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-850 bg-zinc-900/20 text-center text-[10px] text-zinc-400">
                    <p>
                        Total de Ciclos Simulados: <span className="font-extrabold text-zinc-200">1000 Sorteios Virtuais</span>
                    </p>
                </div>
            </div>
        );
    };

    const renderGapsVisual = () => {
        const sampleBalls = [3, 10, 22, 28, 42];
        const gaps = [7, 12, 6, 14];

        return (
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">
                    Cálculo de Intervalos (Gaps) num Sorteio Exemplo
                </h4>
                
                {/* Balls and Arrows Flow */}
                <div className="flex flex-wrap items-center justify-center gap-3 py-4">
                    {sampleBalls.map((num, idx) => {
                        const nextGap = gaps[idx];
                        return (
                            <React.Fragment key={idx}>
                                <div className="h-10 w-10 rounded-full bg-zinc-900 border-2 flex items-center justify-center text-sm font-extrabold text-zinc-150" style={{ borderColor: gameConfig.ui.accent, boxShadow: '0 0 10px ' + gameConfig.ui.accent + '20' }}>
                                    {num}
                                </div>
                                {idx < sampleBalls.length - 1 && (
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-extrabold text-emerald-400 font-mono">+{nextGap}</span>
                                        <ArrowRight className="w-4.5 h-4.5 text-zinc-600 -mt-1" />
                                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Gap {idx+1}</span>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Gaps Frequency simulation */}
                <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/20 space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Top Intervalos Mais Frequentes (Histórico)
                    </h5>
                    <div className="grid grid-cols-4 gap-2 text-[10px] text-center text-zinc-350">
                        <div className="p-2 bg-zinc-900/60 rounded border border-zinc-800">
                            <span className="block font-bold text-zinc-400">Gap 1 (+7)</span>
                            <span className="block font-semibold text-emerald-450 mt-1">214x</span>
                        </div>
                        <div className="p-2 bg-zinc-900/60 rounded border border-zinc-800">
                            <span className="block font-bold text-zinc-400">Gap 2 (+12)</span>
                            <span className="block font-semibold text-emerald-450 mt-1">189x</span>
                        </div>
                        <div className="p-2 bg-zinc-900/60 rounded border border-zinc-800">
                            <span className="block font-bold text-zinc-400">Gap 3 (+6)</span>
                            <span className="block font-semibold text-emerald-450 mt-1">195x</span>
                        </div>
                        <div className="p-2 bg-zinc-900/60 rounded border border-zinc-800">
                            <span className="block font-bold text-zinc-400">Gap 4 (+14)</span>
                            <span className="block font-semibold text-emerald-450 mt-1">172x</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderVisualization = () => {
        switch (translationKey) {
            case 'recent_numbers':
            case 'hot_numbers':
                return renderFrequencyTable();
            case 'late_numbers':
                return renderLateTable();
            case 'markov_chain':
                return renderMarkovVisual();
            case 'clustering':
                return renderClusteringVisual();
            case 'pyramid_pascal':
                return renderPascalVisual();
            case 'pyramid_gaps':
                return renderGapsVisual();
            case 'monte_carlo':
                return renderMonteCarloVisual();
            case 'media_3_otimizado':
                return renderMediaOtimizadaVisual();
            case 'diagonais_da_matriz_3d':
                return renderDiagonaisMatriz3DVisual();
            case 'diagonais_da_matriz':
                return renderDiagonaisMatrizVisual();
            case 'universal_oscillation':
                return renderUniversalOscillationVisual();
            default:
                return renderFrequencyTable();
        }
    };

    const getIcon = () => {
        switch (translationKey) {
            case 'markov_chain':
                return <Network className="w-5 h-5 shrink-0" />;
            case 'clustering':
                return <GitMerge className="w-5 h-5 shrink-0" />;
            case 'pyramid_pascal':
                return <Layers className="w-5 h-5 shrink-0" />;
            default:
                return <HelpCircle className="w-5 h-5 shrink-0" />;
        }
    };

    return (
        <div className={`min-h-screen ${currentTheme.bg} p-4 sm:p-6 pb-24 font-sans transition-all duration-500 game-page-${gameKey}`}>
            <div className="container mx-auto space-y-8 max-w-5xl">
                
                {/* Header */}
                <div className="flex items-center gap-4 p-4 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-850">
                    <BackButton href={`/ranking/${game}/${encodeURIComponent(systemName)}`} style={{ boxShadow: '0 0 15px color-mix(in srgb, ' + gameConfig.ui.accent + ' 40%, transparent)', border: '1px solid color-mix(in srgb, ' + gameConfig.ui.accent + ' 40%, transparent)' }} />
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                            {t('title')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {gameConfig.name} &bull; {t('concept_title')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                    
                    {/* Left Column: Explanations & Parameter Rules */}
                    <div className="md:col-span-5 flex flex-col gap-6">
                        <Card className={`p-6 ${currentTheme.card} flex-1 flex flex-col justify-between`}>
                            <div>
                                <h3 className={`text-lg font-bold ${currentTheme.accentText} mb-3 flex items-center gap-2`}>
                                    {getIcon()}
                                    {t('concept_title')}
                                </h3>
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                    {t('concept_text')}
                                </p>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-zinc-800 space-y-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t('parameters_title')}
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                        <div className="text-xs">
                                            <p className="font-semibold text-zinc-200">{t('range_text')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <BarChart3 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                        <div className="text-xs">
                                            <p className="font-semibold text-zinc-200">{t('rule_text')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Visual Accumulation Diagram & Pedagogical Simulation */}
                    <div className="md:col-span-7 flex flex-col gap-6">
                        <Card className={`p-6 ${currentTheme.card} flex-1 flex flex-col justify-between`}>
                            <div>
                                <h3 className={`text-lg font-bold ${currentTheme.accentText} mb-1`}>
                                    {t('visual_title')}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-6">
                                    {t('visual_desc')}
                                </p>

                                {renderVisualization()}
                            </div>

                            <div className="mt-6 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-start gap-2.5">
                                <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    {t('visual_legend')}
                                </p>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}