'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import { HelpCircle, BarChart3, Database, Calendar, CheckCircle2, XCircle, Info, Clock } from 'lucide-react';
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
        bg: "bg-gradient-to-br from-emerald-50/10 via-slate-900 to-amber-950/20 dark:from-black dark:via-zinc-950 dark:to-emerald-950/20",
        card: "glass-card border-emerald-500/20 bg-zinc-900/60 text-zinc-100",
        accentText: "text-emerald-400 dark:text-emerald-400",
        accentBorder: "border-emerald-500/30",
        glow: "rgba(16, 185, 129, 0.15)"
    },
    [GameType.EUROMILLIONS]: {
        bg: "bg-gradient-to-br from-blue-950/20 via-slate-900 to-indigo-950/20 dark:from-black dark:via-zinc-950 dark:to-indigo-950/10",
        card: "glass-card border-blue-500/20 bg-zinc-900/60 text-zinc-100",
        accentText: "text-blue-400 dark:text-blue-400",
        accentBorder: "border-blue-500/30",
        glow: "rgba(59, 130, 246, 0.15)"
    },
    [GameType.TOTOLOTO]: {
        bg: "bg-gradient-to-br from-teal-950/20 via-slate-900 to-emerald-950/10 dark:from-black dark:via-zinc-950 dark:to-teal-950/20",
        card: "glass-card border-teal-500/20 bg-zinc-900/60 text-zinc-100",
        accentText: "text-teal-400 dark:text-teal-400",
        accentBorder: "border-teal-500/30",
        glow: "rgba(20, 184, 166, 0.15)"
    },
    [GameType.EURODREAMS]: {
        bg: "bg-gradient-to-br from-purple-950/20 via-slate-900 to-pink-950/10 dark:from-black dark:via-zinc-950 dark:to-purple-950/20",
        card: "glass-card border-purple-500/20 bg-zinc-900/60 text-zinc-100",
        accentText: "text-purple-450 dark:text-purple-400",
        accentBorder: "border-purple-500/30",
        glow: "rgba(168, 85, 247, 0.15)"
    }
};

export default function SystemExplanation({ systemName, game }: Props) {
    const t = useTranslations('system_explanations.hot_numbers');
    
    const gameKey = game.toLowerCase();
    const gameType = GAME_MAP[gameKey] || GameType.EUROMILLIONS;
    const currentTheme = gameThemeMap[gameType];
    const gameConfig = GAMES[gameType];

    // Dummy sample draws for the pedagogical table
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
        <div className={`min-h-screen ${currentTheme.bg} p-4 sm:p-6 pb-24 font-sans transition-all duration-500 game-page-${gameKey}`}>
            <div className="container mx-auto space-y-8 max-w-5xl">
                
                {/* Header */}
                <div className="flex items-center gap-4 p-4 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-850">
                    <BackButton href={`/ranking/${game}/${encodeURIComponent(systemName)}`} style={{ boxShadow: `0 0 15px color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)`, border: `1px solid color-mix(in srgb, ${gameConfig.ui.accent} 40%, transparent)` }} />
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
                                    <HelpCircle className="w-5 h-5 shrink-0" />
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
                                        <Calendar className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5" />
                                        <div className="text-xs">
                                            <p className="font-semibold text-zinc-200">{t('range_text')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <BarChart3 className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5" />
                                        <div className="text-xs">
                                            <p className="font-semibold text-zinc-200">{t('rule_text')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Rules Clarity Card */}
                        <Card className={`p-6 ${currentTheme.card} space-y-4`}>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                                <Info className="w-4 h-4 text-zinc-400" />
                                Regras de Contagem Disponíveis
                            </h3>
                            
                            {/* Rule 1: History Count */}
                            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2 relative overflow-hidden">
                                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-450 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {t('rule_history_status')}
                                </div>
                                <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                                    {t('rule_history_title')}
                                </h4>
                                <p className="text-[11px] text-zinc-400 leading-relaxed pr-24">
                                    {t('rule_history_desc')}
                                </p>
                            </div>

                            {/* Rule 2: Recent X Window Count */}
                            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 opacity-60 space-y-2 relative">
                                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                                    <XCircle className="w-3 h-3" />
                                    {t('rule_recent_status')}
                                </div>
                                <h4 className="text-xs font-bold text-zinc-400">
                                    {t('rule_recent_title')}
                                </h4>
                                <p className="text-[11px] text-zinc-500 leading-relaxed pr-24">
                                    {t('rule_recent_desc')}
                                </p>
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

                                {/* Diagram 1: Frequency Timeline Comparison */}
                                <div className="mb-8 space-y-5 bg-zinc-950/45 p-4 rounded-xl border border-zinc-800/80">
                                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Visualização do Intervalo de Tempo
                                    </h4>

                                    {/* Full History timeline */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
                                            <span>Hot Numbers: Histórico Completo</span>
                                            <span className="text-emerald-400 font-bold">100% Contabilizado</span>
                                        </div>
                                        <div className="relative h-6 w-full rounded-md bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center px-3">
                                            <div 
                                                className="absolute inset-0 opacity-20" 
                                                style={{ 
                                                    background: `linear-gradient(90deg, transparent, ${gameConfig.ui.accent}, transparent)`,
                                                    backgroundSize: '200% 100%',
                                                    animation: 'shimmer 2.5s infinite linear'
                                                }} 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-25" />
                                            <div className="w-full flex justify-between items-center text-[9px] font-bold text-emerald-300 z-10">
                                                <span>Concurso Nº 1 (Início)</span>
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                                                <span>Concurso Atual</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Last X draws timeline */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                                            <span>Janela Recente (Outros Sistemas)</span>
                                            <span>Últimos X Sorteios</span>
                                        </div>
                                        <div className="relative h-6 w-full rounded-md bg-zinc-900/40 border border-zinc-850 overflow-hidden flex items-center">
                                            <div className="w-2/3 h-full bg-zinc-950/80 flex items-center px-3 border-r border-dashed border-zinc-800">
                                                <span className="text-[9px] text-zinc-650 font-semibold uppercase tracking-wider">Ignorado</span>
                                            </div>
                                            <div className="w-1/3 h-full bg-zinc-800/35 flex items-center justify-between px-3 text-[9px] text-zinc-400 font-bold">
                                                <span>Concurso - X</span>
                                                <span>Hoje</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pedagogical Table */}
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
                                            {/* Total Sum Row */}
                                            <tr className="bg-zinc-900/50 font-bold border-t-2 border-zinc-800">
                                                <td className="p-3 text-zinc-200 font-semibold flex items-center gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" style={{ backgroundColor: gameConfig.ui.accent }} />
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
                                                                    borderColor: `${gameConfig.ui.accent}50`, 
                                                                    backgroundColor: `${gameConfig.ui.accent}18`,
                                                                    boxShadow: `0 0 10px ${gameConfig.ui.accent}30`
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
                            </div>

                            <div className="mt-6 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-start gap-2.5">
                                <span className="inline-flex h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: gameConfig.ui.accent }} />
                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    {t('visual_legend')}
                                </p>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
            <style jsx global>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}
