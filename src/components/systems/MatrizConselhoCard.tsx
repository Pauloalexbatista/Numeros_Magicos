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
    // 'risk' = sorted descending by risk % (highest risk first)
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

    // High risk balls set based on targetEliminate
    const highRiskBallNumbers = useMemo(() => {
        if (!data || !Array.isArray(data.balls)) return new Set<number>();
        const targetEliminate = data.targetEliminate || Math.floor(data.totalBalls / 2);
        const highRisk = data.balls.slice(0, targetEliminate);
        return new Set(highRisk.map(b => b.ball));
    }, [data]);

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

    // Suggested balls breakdown (how many are high risk, warning, or safe)
    const suggestedBreakdown = useMemo(() => {
        if (!data || suggestedNumbers.length === 0) return { highRisk: 0, warning: 0, safe: 0 };
        let highRisk = 0;
        let warning = 0;
        let safe = 0;

        suggestedNumbers.forEach(num => {
            const b = data.balls.find(item => item.ball === num);
            const isHighRisk = highRiskBallNumbers.has(num);
            const prox = b ? b.maxProximityPct : 0;
            if (isHighRisk) highRisk++;
            else if (prox >= 50) warning++;
            else safe++;
        });

        return { highRisk, warning, safe };
    }, [data, suggestedNumbers, highRiskBallNumbers]);

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
                            Conselho Factual da Matriz &bull; {displayGameName}
                        </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Classificação empírica de risco de todas as {data?.totalBalls || 50} bolas calculada sorteio a sorteio sobre todo o histórico do jogo.
                    </p>
                </div>

                {/* CONTROLS (SORT & FILTER) */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* SORT TOGGLE */}
                    <div className="flex items-center bg-surface-2 rounded-xl p-0.5 border border-border/70 text-xs">
                        <button
                            onClick={() => setSortMode('risk')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                                sortMode === 'risk'
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            title="Ordenar por nível de risco histórico (maior risco primeiro)"
                        >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            <span>% Risco</span>
                        </button>
                        <button
                            onClick={() => setSortMode('number')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                                sortMode === 'number'
                                    ? 'bg-primary text-white shadow-xs'
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

            {/* QUICK AUDIT SUMMARY FOR THIS SYSTEM */}
            {suggestedNumbers.length > 0 && (
                <div className="my-4 p-3.5 rounded-2xl bg-surface-2/60 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gameAccent }} />
                        <span className="font-bold text-foreground">
                            Auditoria às {suggestedNumbers.length} Bolas do {systemName}:
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                            {suggestedBreakdown.highRisk} com Risco Elevado
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                            {suggestedBreakdown.warning} com Aviso Moderado
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            {suggestedBreakdown.safe} em Zona Segura
                        </span>
                    </div>
                </div>
            )}

            {/* LEGEND BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500/40" />
                        <span>Segura (&lt; 50%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-md bg-amber-500/20 border border-amber-500/40" />
                        <span>Aviso (50% a 79%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-md bg-red-500/20 border border-red-500/40" />
                        <span>Risco Elevado ({data?.targetEliminate || 25} bolas)</span>
                    </div>
                    {suggestedNumbers.length > 0 && (
                        <div className="flex items-center gap-1.5">
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
                    <p className="text-xs text-muted-foreground font-semibold">A calcular matriz em tempo real...</p>
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
                            const isHighRisk = highRiskBallNumbers.has(ballNum);
                            const prox = bData.maxProximityPct;
                            const isWarning = !isHighRisk && prox >= 50;
                            const isSuggested = suggestedSet.has(ballNum);
                            const isSelected = selectedBall?.ball === ballNum;

                            let bgClass = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20";
                            if (isHighRisk) {
                                bgClass = "bg-red-50 dark:bg-red-500/20 border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-300 font-bold hover:bg-red-100 dark:hover:bg-red-500/30";
                            } else if (isWarning) {
                                bgClass = "bg-amber-50 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/30";
                            }

                            return (
                                <button
                                    key={ballNum}
                                    type="button"
                                    onClick={() => setSelectedBall(isSelected ? null : bData)}
                                    className={`relative p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${bgClass} ${
                                        isSelected ? 'ring-2 ring-purple-500 dark:ring-purple-400 scale-105 shadow-md z-10' : ''
                                    }`}
                                    style={isSuggested ? {
                                        boxShadow: `0 0 0 2px ${gameAccent}, 0 0 10px color-mix(in srgb, ${gameAccent} 35%, transparent)`
                                    } : undefined}
                                    title={`Bola ${ballNum}: ${prox.toFixed(0)}% risco de não-saída${isSuggested ? ' (Sugerida pelo sistema)' : ''}`}
                                >
                                    {/* BALL NUMBER (CLEAR, INTACT, NOT CROSSED OUT) */}
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
                    {selectedBall && (
                        <div className="my-4 p-4 sm:p-5 rounded-2xl bg-surface-2 border border-border/80 shadow-inner animate-in fade-in duration-200">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-xl text-white shadow-sm"
                                        style={{ backgroundColor: highRiskBallNumbers.has(selectedBall.ball) ? '#ef4444' : selectedBall.maxProximityPct >= 50 ? '#f59e0b' : '#10b981' }}
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
                                            Probabilidade empírica de não-saída: <strong className="font-bold text-foreground">{selectedBall.maxProximityPct}%</strong> &bull; Estado: {
                                                highRiskBallNumbers.has(selectedBall.ball) 
                                                    ? <span className="text-red-600 dark:text-red-400 font-bold">Risco Elevado</span> 
                                                    : selectedBall.maxProximityPct >= 50 
                                                        ? <span className="text-amber-600 dark:text-amber-400 font-bold">Aviso Moderado</span> 
                                                        : <span className="text-emerald-600 dark:text-emerald-400 font-bold">Zona Segura</span>
                                            }
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
                    )}
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
                        As cores refletem o nível de risco empírico baseado nos limites históricos de todos os sorteios deste jogo, mas <strong>não representam uma ordem de corte e o sistema não acerta sempre a 100%</strong>. Um número com risco elevado (vermelho) pode ainda assim sair sorteado no concurso seguinte. A decisão final de manter qualquer número ou retirá-lo para otimizar o seu volante/desdobramento pertence exclusivamente a si.
                    </p>
                </div>
            </div>
        </div>
    );
}
