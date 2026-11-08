'use client';

import React from 'react';
import { 
    Clock, 
    Sparkles, 
    TrendingUp, 
    ShieldCheck, 
    CheckCircle2,
    Compass
} from 'lucide-react';

export interface JackBand {
    level: number;
    name: string;
    rangeLabel: string;
    min: number;
    max: number;
    tier: 'FREQUÊNCIA ALTA' | 'ZONA MEDIANA' | 'ZONA MÉDIA' | 'MATURAÇÃO TARDIA' | 'OS TEIMOSOS';
    tierColor: 'emerald' | 'blue' | 'amber' | 'purple';
    tierDescription: string;
    count: number;
    pct: number;
    cumCount: number;
    cumPct: number;
    isCurrent: boolean;
}

export interface SystemJackCycles {
    totalJacks: number;
    intervalsCount: number;
    currentDrought: number;
    exactCumCount: number;
    exactCumPct: number;
    avgCycle: number;
    medianCycle: number;
    minCycle: number;
    maxCycle: number;
    bands: JackBand[];
}

interface JackCyclesTableProps {
    cycles: SystemJackCycles | null | undefined;
    gameName: string;
    systemName: string;
    accentColor?: string;
}

export default function JackCyclesTable({
    cycles,
    gameName,
    systemName,
    accentColor = 'rgb(59, 130, 246)'
}: JackCyclesTableProps) {
    if (!cycles || cycles.totalJacks === 0) {
        return (
            <div className="rounded-3xl bg-surface-1/90 border border-border/70 p-6 backdrop-blur-md shadow-sm mb-6">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/60">
                    <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
                        <Clock className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-wide text-foreground">
                        Anatomia dos Ciclos de Jack • {systemName} ({gameName})
                    </h3>
                </div>
                <div className="py-8 px-4 rounded-2xl border border-dashed border-border/70 text-center bg-surface-2/20">
                    <p className="text-xs font-bold text-foreground mb-1">
                        Ainda Sem Ciclos Concluídos Registados
                    </p>
                    <span className="text-[11px] text-muted-foreground block max-w-md mx-auto">
                        Este sistema tem atualmente um atraso de {cycles?.currentDrought ?? 0} sorteios no {gameName}. 
                        Os intervalos de ciclos serão mapeados dinamicamente logo que ocorram os primeiros Jacks.
                    </span>
                </div>
            </div>
        );
    }

    if (cycles.totalJacks === 1) {
        return (
            <div className="rounded-3xl bg-surface-1/90 border border-border/70 p-6 backdrop-blur-md shadow-sm mb-6">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/60">
                    <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
                        <Clock className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-wide text-foreground">
                        Anatomia dos Ciclos de Jack • {systemName} ({gameName})
                    </h3>
                </div>
                <div className="py-6 px-4 rounded-2xl border border-dashed border-border/70 text-center bg-surface-2/20">
                    <p className="text-xs font-bold text-foreground mb-1">
                        1 Jack Registado no Histórico
                    </p>
                    <span className="text-[11px] text-muted-foreground block max-w-md mx-auto">
                        O sistema registou 1 Jack no passado e encontra-se agora no sorteio #{cycles.currentDrought} desde essa ocorrência.
                        Será necessário um segundo Jack para calibrar o primeiro intervalo entre ciclos.
                    </span>
                </div>
            </div>
        );
    }

    const currentBand = cycles.bands.find(b => b.isCurrent);

    return (
        <div 
            className="rounded-3xl bg-surface-1/90 border border-border/70 p-5 sm:p-7 backdrop-blur-md shadow-md mb-6"
            style={{ borderLeft: `3px solid ${accentColor}` }}
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-2xl bg-surface-2 border border-border/50 text-xl">
                        🎯
                    </span>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                                Anatomia dos Ciclos de Jack (Blocos de 25 Sorteios)
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                Dinâmico &bull; A cada Jack calcula
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Histórico empírico dos intervalos entre Jacks (5 acertos no grupo sugerido) no {gameName}.
                        </p>
                    </div>
                </div>

                {/* Badge Onde Está Atualmente */}
                {currentBand && (
                    <div 
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold self-start sm:self-auto shadow-2xs"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                            borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
                            color: 'var(--foreground)'
                        }}
                    >
                        <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: accentColor }} />
                        <span>Fase Atual: <strong>Sorteio #{cycles.currentDrought}</strong> ({currentBand.name.split('•')[0].trim()})</span>
                    </div>
                )}
            </div>

            {/* Micro Stats Resumo do Ciclo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                <div className="p-3 rounded-2xl bg-surface-2/60 border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                        Atraso Atual
                    </span>
                    <div className="text-lg sm:text-xl font-black text-foreground flex items-baseline gap-1">
                        {cycles.currentDrought} <span className="text-xs font-semibold text-muted-foreground">sorteios</span>
                    </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface-2/60 border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                        Ciclo Mediano
                    </span>
                    <div className="text-lg sm:text-xl font-black text-foreground flex items-baseline gap-1">
                        {cycles.medianCycle} <span className="text-xs font-semibold text-muted-foreground">sorteios</span>
                    </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface-2/60 border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                        Ciclo Médio
                    </span>
                    <div className="text-lg sm:text-xl font-black text-foreground flex items-baseline gap-1">
                        {cycles.avgCycle} <span className="text-xs font-semibold text-muted-foreground">sorteios</span>
                    </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface-2/60 border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                        Recorde (Mín / Máx)
                    </span>
                    <div className="text-lg sm:text-xl font-black text-foreground flex items-baseline gap-1">
                        {cycles.minCycle} <span className="text-xs text-muted-foreground">/</span> {cycles.maxCycle} <span className="text-xs font-semibold text-muted-foreground">sorteios</span>
                    </div>
                </div>
            </div>

            {/* TABELA DOS 5 NÍVEIS COM INTERVALOS DE 25 E ACUMULADO */}
            <div className="overflow-x-auto rounded-2xl border border-border/60 bg-surface-1 shadow-2xs">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-border/60 bg-surface-2/80 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                            <th className="py-3 px-3.5">Fase / Nível</th>
                            <th className="py-3 px-3.5">Faixa de Sorteios</th>
                            <th className="py-3 px-3.5 text-right">Jacks na Faixa</th>
                            <th className="py-3 px-3.5 text-right">% Acumulada</th>
                            <th className="py-3 px-3.5 text-center">Estado Atual</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                        {cycles.bands.map(band => {
                            const isCurrent = band.isCurrent;
                            const isPast = cycles.currentDrought > band.max && band.max !== Infinity;

                            return (
                                <tr 
                                    key={band.level}
                                    className={`transition-colors ${
                                        isCurrent 
                                            ? 'font-bold' 
                                            : 'hover:bg-surface-2/40'
                                    }`}
                                    style={isCurrent ? {
                                        backgroundColor: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
                                        boxShadow: `inset 4px 0 0 ${accentColor}`
                                    } : undefined}
                                >
                                    {/* Coluna 1: Nome do Nível */}
                                    <td className="py-3 px-3.5">
                                        <div className="flex items-center gap-2">
                                            <span 
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                                                    band.level === 1 
                                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                        : band.level === 2 || band.level === 3
                                                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                                            : band.level === 4
                                                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                                : 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                                }`}
                                            >
                                                N{band.level}
                                            </span>
                                            <div>
                                                <span className="text-foreground block font-bold leading-tight">
                                                    {band.name.replace(/Nível \d • /, '')}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground block">
                                                    {band.tierDescription}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Coluna 2: Faixa de Sorteios (Blocos de 25) */}
                                    <td className="py-3 px-3.5 font-bold text-foreground">
                                        <span className="px-2 py-1 rounded-md bg-surface-2 border border-border/50 text-xs">
                                            {band.rangeLabel}
                                        </span>
                                    </td>

                                    {/* Coluna 3: Jacks na Faixa (% e total) */}
                                    <td className="py-3 px-3.5 text-right">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-black text-foreground">
                                                    {band.pct}%
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    ({band.count} {band.count === 1 ? 'Jack' : 'Jacks'})
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Coluna 4: % Acumulada + Mini Barra Cumulativa */}
                                    <td className="py-3 px-3.5 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs font-black text-foreground">
                                                {band.cumPct}%
                                            </span>
                                            <div className="w-20 sm:w-28 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all"
                                                    style={{ 
                                                        width: `${Math.min(100, Math.max(4, band.cumPct))}%`,
                                                        backgroundColor: isCurrent ? accentColor : 'rgb(59, 130, 246)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>

                                    {/* Coluna 5: Estado Atual */}
                                    <td className="py-3 px-3.5 text-center">
                                        {isCurrent ? (
                                            <span 
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black text-white shadow-xs"
                                                style={{ backgroundColor: accentColor }}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                FASE ATUAL
                                            </span>
                                        ) : isPast ? (
                                            <span className="text-[10px] font-bold text-muted-foreground/70 inline-flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                Ultrapassado
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-semibold text-muted-foreground/60">
                                                Aguarda evolução
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* CARTÃO "VALORES DE HOJE": SITUAÇÃO EM TEMPO REAL NO CONCURSO ATUAL */}
            <div 
                className="mt-4 p-4 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                style={{
                    backgroundColor: `color-mix(in srgb, ${accentColor} 8%, transparent)`,
                    borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`
                }}
            >
                <div className="flex items-start gap-3">
                    <span 
                        className="p-2 rounded-xl text-white shadow-xs shrink-0 mt-0.5 sm:mt-0"
                        style={{ backgroundColor: accentColor }}
                    >
                        <Compass className="w-4 h-4" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-foreground">
                                Valores de Hoje &bull; Posicionamento em Tempo Real
                            </span>
                        </div>
                        <p className="text-xs text-foreground/90 mt-0.5 leading-relaxed">
                            O sistema está atualmente no <strong className="text-foreground">sorteio #{cycles.currentDrought} sem Jack</strong> ({currentBand?.name ?? 'Em ciclo'}).
                            Historicamente, <strong className="text-foreground">{cycles.exactCumPct}% de todos os Jacks</strong> deste sistema já tinham ocorrido até a esta marca temporal de {cycles.currentDrought} sorteios.
                        </p>
                    </div>
                </div>

                <div className="self-end sm:self-auto shrink-0 px-4 py-2 rounded-xl bg-surface-1 border border-border/70 text-right shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Jacks Anteriores &le; #{cycles.currentDrought}
                    </span>
                    <span className="text-base sm:text-lg font-black" style={{ color: accentColor }}>
                        {cycles.exactCumPct}% <span className="text-xs font-semibold text-muted-foreground">({cycles.exactCumCount}/{cycles.intervalsCount})</span>
                    </span>
                </div>
            </div>

            {/* Mensagem de Transparência & Filosofia do Utilizador */}
            <div className="mt-3 p-3 rounded-2xl bg-surface-2/40 border border-border/50 flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold text-foreground">Transparência Empírica: </span>
                    Não conseguimos prever o futuro — para isso temos o cálculo da <strong>Maturação</strong> —, mas conseguimos mostrar o passado. 
                    Esta tabela calcula dinamicamente a cada Jack ocorrido em blocos padronizados de 25 sorteios para situar o apostador com exatidão no ciclo de vida atual do sistema.
                </div>
            </div>
        </div>
    );
}
