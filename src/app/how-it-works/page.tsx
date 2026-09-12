import React from 'react';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import {
    Database,
    Cpu,
    Target,
    Trophy,
    RefreshCw,
    Sparkles,
    ShieldCheck,
    Layers,
    Award,
    CheckCircle2
} from 'lucide-react';

export default async function HowItWorksPage() {
    const t = await getTranslations('how_it_works');

    // Fetch live draw counts with safe fallbacks
    let emCount = 1979;
    let tlCount = 1554;
    let edCount = 325;
    let msCount = 3044;

    try {
        const [em, tl, ed, ms] = await Promise.all([
            prisma.draw.count({ where: { game: 'EUROMILLIONS' } }),
            prisma.draw.count({ where: { game: 'TOTOLOTO' } }),
            prisma.draw.count({ where: { game: 'EURODREAMS' } }),
            prisma.draw.count({ where: { game: 'MEGASENA' } })
        ]);
        if (em > 0) emCount = em;
        if (tl > 0) tlCount = tl;
        if (ed > 0) edCount = ed;
        if (ms > 0) msCount = ms;
    } catch (e) {
        console.warn('[HowItWorks] Error fetching live draw counts:', e);
    }

    const totalDraws = emCount + tlCount + edCount + msCount;

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 transition-colors">
            <div className="container mx-auto space-y-12 max-w-5xl">

                {/* Header */}
                <div className="flex items-start sm:items-center gap-4 border-b border-border/60 pb-6">
                    <BackButton />
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                            <Sparkles size={12} />
                            <span>{t('badge')}</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                            {t('title')}
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-3xl">
                            {t('subtitle')}
                        </p>
                    </div>
                </div>

                {/* O CICLO CONTÍNUO (A ENGRENAGEM) */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                                <RefreshCw className="text-primary animate-spin-slow" size={22} />
                                {t('cycle_title')}
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {t('cycle_subtitle')}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-surface-2 border border-border text-muted-foreground w-fit">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {t('cycle_loop_text')}
                        </div>
                    </div>

                    {/* Circular 4-Step Process Grid */}
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
                        {/* Step 1: Base de Dados */}
                        <Card className="glass-card p-5 relative rounded-2xl border border-blue-500/30 dark:border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent flex flex-col justify-between hover:shadow-lg transition-all">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                                        <Database size={20} />
                                    </div>
                                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                        {t('step1_num')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                                        {t('step1_badge')}
                                    </span>
                                    <h3 className="text-base font-bold text-foreground">
                                        {t('step1_title')}
                                    </h3>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t('step1_desc')}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-1 text-[9px] font-bold text-muted-foreground">
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Euromilhões</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Totoloto</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">EuroDreams</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Mega-Sena</span>
                            </div>
                        </Card>

                        {/* Step 2: Algoritmos */}
                        <Card className="glass-card p-5 relative rounded-2xl border border-purple-500/30 dark:border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent flex flex-col justify-between hover:shadow-lg transition-all">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                                        <Cpu size={20} />
                                    </div>
                                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                        {t('step2_num')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-0.5">
                                        {t('step2_badge')}
                                    </span>
                                    <h3 className="text-base font-bold text-foreground">
                                        {t('step2_title')}
                                    </h3>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t('step2_desc')}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-1 text-[9px] font-bold text-muted-foreground">
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Markov</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Pascal</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Clustering</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Monte Carlo</span>
                            </div>
                        </Card>

                        {/* Step 3: Avaliação Real */}
                        <Card className="glass-card p-5 relative rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent flex flex-col justify-between hover:shadow-lg transition-all">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                                        <Target size={20} />
                                    </div>
                                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        {t('step3_num')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                                        {t('step3_badge')}
                                    </span>
                                    <h3 className="text-base font-bold text-foreground">
                                        {t('step3_title')}
                                    </h3>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t('step3_desc')}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-1 text-[9px] font-bold text-muted-foreground">
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Chave Oficial</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Corte Top 25</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Estrelas</span>
                            </div>
                        </Card>

                        {/* Step 4: Ranking & Pontuação */}
                        <Card className="glass-card p-5 relative rounded-2xl border border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent flex flex-col justify-between hover:shadow-lg transition-all">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                                        <Trophy size={20} />
                                    </div>
                                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        {t('step4_num')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                                        {t('step4_badge')}
                                    </span>
                                    <h3 className="text-base font-bold text-foreground">
                                        {t('step4_title')}
                                    </h3>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t('step4_desc')}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-1 text-[9px] font-bold text-muted-foreground">
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Quality Score</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Reis do Jackpot</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2">Novo Ciclo</span>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* SECÇÃO: COBERTURA HISTÓRICA DAS BASES DE DADOS */}
                <Card className="glass-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <Database size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                                    {t('db_coverage_title')}
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    {t('db_coverage_subtitle')}
                                </p>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 w-fit">
                            <CheckCircle2 size={13} />
                            <span>{totalDraws.toLocaleString()} {t('th_total_draws')}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface-2/60 text-muted-foreground uppercase tracking-wider text-[10px] sm:text-xs font-bold">
                                <tr>
                                    <th className="p-3.5 rounded-l-xl">{t('th_game')}</th>
                                    <th className="p-3.5">{t('th_start_date')}</th>
                                    <th className="p-3.5 text-center">{t('th_total_draws')}</th>
                                    <th className="p-3.5 rounded-r-xl">{t('th_context')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {/* Euromilhões */}
                                <tr className="hover:bg-surface-2/30 transition-colors">
                                    <td className="p-3.5 font-bold text-foreground flex items-center gap-2 whitespace-nowrap">
                                        <span className="text-base">🇪🇺</span>
                                        <span>Euromilhões</span>
                                    </td>
                                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-semibold">
                                        13/02/2004
                                    </td>
                                    <td className="p-3.5 text-center font-black text-blue-600 dark:text-blue-400 tabular-nums">
                                        {emCount.toLocaleString()}
                                    </td>
                                    <td className="p-3.5 text-xs text-muted-foreground">
                                        {t('em_context')}
                                    </td>
                                </tr>

                                {/* Totoloto */}
                                <tr className="hover:bg-surface-2/30 transition-colors">
                                    <td className="p-3.5 font-bold text-foreground flex items-center gap-2 whitespace-nowrap">
                                        <span className="text-base">🇵🇹</span>
                                        <span>Totoloto</span>
                                    </td>
                                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-semibold">
                                        08/07/2011
                                    </td>
                                    <td className="p-3.5 text-center font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                        {tlCount.toLocaleString()}
                                    </td>
                                    <td className="p-3.5 text-xs text-muted-foreground">
                                        {t('tl_context')}
                                    </td>
                                </tr>

                                {/* EuroDreams */}
                                <tr className="hover:bg-surface-2/30 transition-colors">
                                    <td className="p-3.5 font-bold text-foreground flex items-center gap-2 whitespace-nowrap">
                                        <span className="text-base">🇪🇺</span>
                                        <span>EuroDreams</span>
                                    </td>
                                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-semibold">
                                        06/11/2023
                                    </td>
                                    <td className="p-3.5 text-center font-black text-purple-600 dark:text-purple-400 tabular-nums">
                                        {edCount.toLocaleString()}
                                    </td>
                                    <td className="p-3.5 text-xs text-muted-foreground">
                                        {t('ed_context')}
                                    </td>
                                </tr>

                                {/* Mega-Sena */}
                                <tr className="hover:bg-surface-2/30 transition-colors">
                                    <td className="p-3.5 font-bold text-foreground flex items-center gap-2 whitespace-nowrap">
                                        <span className="text-base">🇧🇷</span>
                                        <span>Mega-Sena</span>
                                    </td>
                                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-semibold">
                                        11/03/1996
                                    </td>
                                    <td className="p-3.5 text-center font-black text-amber-600 dark:text-amber-400 tabular-nums">
                                        {msCount.toLocaleString()}
                                    </td>
                                    <td className="p-3.5 text-xs text-muted-foreground">
                                        {t('ms_context')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* SECÇÃO: O QUE É UM SISTEMA? */}
                <Card className="glass-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                            <Layers size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                                {t('what_is_system_title')}
                            </h2>
                        </div>
                    </div>
                    <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed pt-2">
                        <p>
                            {t('what_is_system_p1')}
                        </p>
                        <p>
                            {t('what_is_system_p2')}
                        </p>
                        <p>
                            {t('what_is_system_p3')}
                        </p>
                    </div>
                </Card>

                {/* SECÇÃO: COMO FUNCIONA A PONTUAÇÃO (QUALITY SCORE) */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                            <Award className="text-amber-500" size={24} />
                            {t('score_title')}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {t('score_subtitle')}
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Jackpot */}
                        <Card className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                    🏆 Jackpot
                                </span>
                                <span className="text-base font-black text-amber-600 dark:text-amber-400 tabular-nums">
                                    {t('score_jackpot_points')}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground">
                                {t('score_jackpot_title')}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {t('score_jackpot_desc')}
                            </p>
                        </Card>

                        {/* Grandes Prémios */}
                        <Card className="glass-card p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    🥈 Top 3
                                </span>
                                <span className="text-base font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                    {t('score_high_points')}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground">
                                {t('score_high_title')}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {t('score_high_desc')}
                            </p>
                        </Card>

                        {/* Prémios Base */}
                        <Card className="glass-card p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                    🥉 Base
                                </span>
                                <span className="text-base font-black text-blue-600 dark:text-blue-400 tabular-nums">
                                    {t('score_medium_points')}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground">
                                {t('score_medium_title')}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {t('score_medium_desc')}
                            </p>
                        </Card>

                        {/* Estrelas / Sonho */}
                        <Card className="glass-card p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                    ⭐ Estrelas
                                </span>
                                <span className="text-base font-black text-purple-600 dark:text-purple-400 tabular-nums">
                                    {t('score_stars_points')}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground">
                                {t('score_stars_title')}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {t('score_stars_desc')}
                            </p>
                        </Card>
                    </div>
                </div>

                {/* SECÇÃO: TRANSPARÊNCIA */}
                <Card className="glass-card p-6 rounded-2xl border border-border/80 bg-surface-2/30 flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <ShieldCheck size={22} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-foreground">
                            {t('transparency_title')}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {t('transparency_desc')}
                        </p>
                    </div>
                </Card>

            </div>
        </div>
    );
}
