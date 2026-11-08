'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Sparkles, 
    ArrowUpDown, 
    AlertTriangle, 
    Scale,
    Filter
} from 'lucide-react';
import { BallMatrixBreakdown, MatrizCorteResult } from '@/services/matriz-corte-engine';

interface MatrizConselhoCardProps {
    gameKey: string;
    gameName?: string;
    gameAccent?: string;
    suggestedNumbers?: number[];
    systemName?: string;
}

export interface ThermalTier {
    level: 1 | 2 | 3 | 4 | 5;
    name: string;
    shortLabel: string;
    rangeLabel: string;
    bgClass: string;
    hexColor: string;
}

export function getThermalTier(pct: number): ThermalTier {
    if (pct > 90) {
        return {
            level: 5,
            name: 'Fervura / Teto Extremo',
            shortLabel: 'Fervura',
            rangeLabel: '91% a 100%',
            bgClass: 'bg-red-50 dark:bg-red-500/20 border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-300 font-bold hover:bg-red-100 dark:hover:bg-red-500/30',
            hexColor: '#ef4444'
        };
    }
    if (pct > 75) {
        return {
            level: 4,
            name: 'Quente / Alerta',
            shortLabel: 'Quente',
            rangeLabel: '76% a 90%',
            bgClass: 'bg-orange-50 dark:bg-orange-500/20 border-orange-300 dark:border-orange-500/50 text-orange-700 dark:text-orange-300 font-bold hover:bg-orange-100 dark:hover:bg-orange-500/30',
            hexColor: '#f97316'
        };
    }
    if (pct > 50) {
        return {
            level: 3,
            name: 'Morno / Em Andamento',
            shortLabel: 'Morno',
            rangeLabel: '51% a 75%',
            bgClass: 'bg-yellow-50 dark:bg-yellow-500/15 border-yellow-300 dark:border-yellow-500/40 text-yellow-800 dark:text-yellow-300 font-bold hover:bg-yellow-100 dark:hover:bg-yellow-500/25',
            hexColor: '#eab308'
        };
    }
    if (pct > 25) {
        return {
            level: 2,
            name: 'Seguro / Estável',
            shortLabel: 'Seguro',
            rangeLabel: '26% a 50%',
            bgClass: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20',
            hexColor: '#10b981'
        };
    }
    return {
        level: 1,
        name: 'Frio / Inerte',
        shortLabel: 'Frio',
        rangeLabel: '0% a 25%',
        bgClass: 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20',
        hexColor: '#3b82f6'
    };
}

export function MatrizConselhoCard({
    gameKey,
    gameName,
    gameAccent = '#059669',
    suggestedNumbers = [],
    systemName = 'Sistema Ativo'
}: MatrizConselhoCardProps) {
    const [data, setData] = useState<MatrizCorteResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // View controls:
    // 'risk' = sorted descending by risk % (highest saturation first)
    // 'number' = sorted 1 to N
    const [sortMode, setSortMode] = useState<'risk' | 'number'>('risk');
    const [filterOnlySuggested, setFilterOnlySuggested] = useState<boolean>(false);
    const [selectedBall, setSelectedBall] = useState<BallMatrixBreakdown | null>(null);

    const normalizedGame = useMemo(() => {
        const g = (gameKey || 'totoloto').toLowerCase();
        if (g === 'euromilhoes' || g === 'euromillions') return 'EUROMILLIONS';
        if (g === 'totoloto') return 'TOTOLOTO';
        if (g === 'eurodreams') return 'EURODREAMS';
        if (g === 'megasena') return 'MEGASENA';
        if (g === 'lotofacil') return 'LOTOFACIL';
        return g.toUpperCase();
    }, [gameKey]);

    useEffect(() => {
        let isMounted = true;
        async function fetchMatriz() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/tools/matriz-corte?game=${normalizedGame}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (!json.success) throw new Error(json.error || 'Falha ao obter dados da Matriz de Corte');
                if (isMounted) {
                    setData(json.data);
                    setSelectedBall(null);
                }
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Erro ao carregar Matriz de Corte');
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchMatriz();
        return () => { isMounted = false; };
    }, [normalizedGame]);

    const suggestedSet = useMemo(() => new Set(suggestedNumbers), [suggestedNumbers]);

    // Balls list processed according to sortMode and filterOnlySuggested
    const displayBalls = useMemo(() => {
        if (!data || !Array.isArray(data.balls)) return [];
        let list = [...data.balls];

        if (filterOnlySuggested && suggestedSet.size > 0) {
            list = list.filter(b => suggestedSet.has(b.ball));
        }

        if (sortMode === 'risk') {
            list.sort((a, b) => {
                if (b.maxProximityPct !== a.maxProximityPct) return b.maxProximityPct - a.maxProximityPct;
                if (b.compositeScore !== a.compositeScore) return b.compositeScore - a.compositeScore;
                return a.ball - b.ball;
            });
        } else {
            list.sort((a, b) => a.ball - b.ball);
        }

        return list;
    }, [data, sortMode, filterOnlySuggested, suggestedSet]);

    // Suggested balls breakdown across the 5 Thermal Tiers
    const suggestedBreakdown = useMemo(() => {
        if (!data || suggestedNumbers.length === 0) {
            return { n5: 0, n4: 0, n3: 0, n2: 0, n1: 0 };
        }
        let n5 = 0, n4 = 0, n3 = 0, n2 = 0, n1 = 0;

        suggestedNumbers.forEach(num => {
            const b = data.balls.find(item => item.ball === num);
            const prox = b ? b.maxProximityPct : 0;
            if (prox > 90) n5++;
            else if (prox > 75) n4++;
            else if (prox > 50) n3++;
            else if (prox > 25) n2++;
            else n1++;
        });

        return { n5, n4, n3, n2, n1 };
    }, [data, suggestedNumbers]);

    const displayGameName = gameName || data?.gameName || normalizedGame;

    return (
        <div className="rounded-3xl bg-surface-1/95 border border-border/80 p-5 sm:p-7 backdrop-blur-md shadow-sm mb-6">
            {/* CARD HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            <Sparkles className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                            Termómetro Factual da Matriz &bull; {displayGameName}
                        </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Classificação térmica em 5 níveis de saturação calculada sorteio a sorteio sobre todo o histórico do jogo.
                    </p>
                </div>

                {/* CONTROLS (SORT & FILTER) */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* SORT TOGGLE */}
                    <div className="flex items-center bg-surface-2 dark:bg-surface-2/60 rounded-xl p-1 border border-border/70 text-xs shadow-xs">
                        <button
                            onClick={() => setSortMode('risk')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                                sortMode === 'risk'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            title="Ordenar por saturação térmica (maior saturação primeiro)"
                        >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            <span>% Saturação</span>
                        </button>
                        <button
                            onClick={() => setSortMode('number')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                                sortMode === 'number'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            title="Ordenar por número (ordem numérica 1 a N)"
                        >
                            <span>1 a {data?.totalBalls || 'N'}</span>
                        </button>
                    </div>

                    {/* FILTER ONLY SUGGESTED */}
                    {suggestedNumbers.length > 0 && (
                        <button
                            onClick={() => setFilterOnlySuggested(!filterOnlySuggested)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                filterOnlySuggested
                                    ? 'bg-purple-500/15 border-purple-500/40 text-purple-700 dark:text-purple-300'
                                    : 'bg-surface-2 border-border/70 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Filter className="w-3 h-3" />
                            <span>
                                {filterOnlySuggested ? `A ver ${suggestedNumbers.length} Sugeridas` : `Apenas Sugeridas (${suggestedNumbers.length})`}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* QUICK AUDIT SUMMARY FOR THIS SYSTEM ACROSS THE 5 TIERS */}
            {suggestedNumbers.length > 0 && (
                <div className="my-4 p-3.5 rounded-2xl bg-surface-2/60 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gameAccent }} />
                        <span className="font-bold text-foreground">
                            Auditoria Térmica às {suggestedNumbers.length} Bolas do {systemName}:
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                        {suggestedBreakdown.n5 > 0 && (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                {suggestedBreakdown.n5} Fervura (&gt;90%)
                            </span>
                        )}
                        {suggestedBreakdown.n4 > 0 && (
                            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                                {suggestedBreakdown.n4} Quente (76-90%)
                            </span>
                        )}
                        {suggestedBreakdown.n3 > 0 && (
                            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                                {suggestedBreakdown.n3} Em Andamento (51-75%)
                            </span>
                        )}
                        {suggestedBreakdown.n2 > 0 && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                {suggestedBreakdown.n2} Seguro (26-50%)
                            </span>
                        )}
                        {suggestedBreakdown.n1 > 0 && (
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                                {suggestedBreakdown.n1} Frio (0-25%)
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* 5-TIER LEGEND BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-md bg-blue-500/20 border border-blue-500/40" />
                        <span>Frio (0-25%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500/40" />
                        <span>Seguro (26-50%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-md bg-yellow-500/20 border border-yellow-500/40" />
                        <span>Morno (51-75%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-md bg-orange-500/20 border border-orange-500/40" />
                        <span>Quente (76-90%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-md bg-red-500/20 border border-red-500/40" />
                        <span>Fervura (&gt;90%)</span>
                    </div>
                    {suggestedNumbers.length > 0 && (
                        <div className="flex items-center gap-1 ml-1 pl-2 border-l border-border/60">
                            <div 
                                className="w-3 h-3 rounded-full border-2" 
                                style={{ borderColor: gameAccent, backgroundColor: `color-mix(in srgb, ${gameAccent} 30%, transparent)` }} 
                            />
                            <span className="font-bold text-foreground">Sugerida pelo Sistema</span>
                        </div>
                    )}
                </div>

                <span className="text-[11px] italic">
                    Clica numa bola para abrir o Raio-X detalhado.
                </span>
            </div>

            {/* LOADING / ERROR STATES */}
            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-xs text-muted-foreground font-semibold">A calcular termómetro em tempo real...</p>
                </div>
            ) : error || !data ? (
                <div className="py-8 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                        Não foi possível carregar a Matriz para {displayGameName}.
                    </p>
                    <span className="text-[11px] text-muted-foreground">{error}</span>
                </div>
            ) : (
                <>
                    {/* BALLS GRID */}
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5 my-4">
                        {displayBalls.map(bData => {
                            const ballNum = bData.ball;
                            const prox = bData.maxProximityPct;
                            const tier = getThermalTier(prox);
                            const isSuggested = suggestedSet.has(ballNum);
                            const isSelected = selectedBall?.ball === ballNum;

                            return (
                                <button
                                    key={ballNum}
                                    type="button"
                                    onClick={() => setSelectedBall(isSelected ? null : bData)}
                                    className={`relative p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${tier.bgClass} ${
                                        isSelected ? 'ring-2 ring-purple-500 dark:ring-purple-400 scale-105 shadow-md z-10' : ''
                                    }`}
                                    style={isSuggested ? {
                                        boxShadow: `0 0 0 2px ${gameAccent}, 0 0 10px color-mix(in srgb, ${gameAccent} 35%, transparent)`
                                    } : undefined}
                                    title={`Bola ${ballNum}: ${prox.toFixed(0)}% saturação (${tier.name})${isSuggested ? ' • Sugerida pelo sistema' : ''}`}
                                >
                                    {/* BALL NUMBER (CLEAR, INTACT) */}
                                    <span className="text-sm sm:text-base font-black font-mono">
                                        {ballNum}
                                    </span>
                                    {/* PERCENTAGE */}
                                    <span className="text-[10px] opacity-80 font-mono font-bold mt-0.5">
                                        {prox.toFixed(0)}%
                                    </span>

                                    {/* SUGGESTED BADGE INDICATOR */}
                                    {isSuggested && (
                                        <span 
                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-xs"
                                            style={{ backgroundColor: gameAccent }}
                                            title="Sugerida pelo sistema"
                                        >
                                            ★
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* SELECTED BALL RAIO-X DRAWER */}
                    {selectedBall && (() => {
                        const tier = getThermalTier(selectedBall.maxProximityPct);
                        return (
                            <div className="my-4 p-4 sm:p-5 rounded-2xl bg-surface-2 border border-border/80 shadow-inner animate-in fade-in duration-200">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-xl text-white shadow-sm"
                                            style={{ backgroundColor: tier.hexColor }}
                                        >
                                            {selectedBall.ball}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-foreground">
                                                    Raio-X da Bola #{selectedBall.ball}
                                                </h4>
                                                {suggestedSet.has(selectedBall.ball) && (
                                                    <span 
                                                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                                                        style={{ backgroundColor: gameAccent }}
                                                    >
                                                        Sugerida pelo {systemName}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Saturação Térmica: <strong className="font-bold text-foreground">{selectedBall.maxProximityPct}%</strong> &bull; Nível: <span className="font-bold" style={{ color: tier.hexColor }}>{tier.name} ({tier.rangeLabel})</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedBall(null)}
                                        className="text-xs text-muted-foreground hover:text-foreground font-bold p-1"
                                    >
                                        ✕ Fechar
                                    </button>
                                </div>

                                <div className="mt-2 pt-2 border-t border-border/50">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                                        Motivos Detetados nas 8 Matrizes:
                                    </span>
                                    {selectedBall.reasons && selectedBall.reasons.length > 0 ? (
                                        <ul className="space-y-1">
                                            {selectedBall.reasons.map((r, i) => (
                                                <li key={i} className="text-xs text-foreground/90 flex items-start gap-1.5">
                                                    <span className="text-muted-foreground mt-0.5">•</span>
                                                    <span>{r}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                            Nenhuma restrição ou saturação detetada. Bola em zona estatisticamente limpa.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </>
            )}

            {/* SALVAGUARDA AO APOSTADOR (DECISÃO SOBERANA) */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-3">
                <Scale className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                    <strong className="block text-xs font-bold text-amber-800 dark:text-amber-300 mb-0.5 uppercase tracking-wide">
                        ⚖️ Salvaguarda ao Apostador (Decisão Soberana)
                    </strong>
                    <p className="text-[11px] opacity-90 leading-normal">
                        A escala térmica reflete o nível de saturação histórica das bolas perante os seus tetos de janela e inércia passada, mas <strong>não constitui uma ordem de corte e nenhuma bola está proibida de sair</strong>. Mesmo bolas em nível quente ou fervura podem sair. A decisão final de manter ou retirar qualquer número para otimizar o seu volante pertence exclusivamente a si.
                    </p>
                </div>
            </div>
        </div>
    );
}
