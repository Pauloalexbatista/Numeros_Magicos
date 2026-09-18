"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Sliders, 
    ShieldCheck, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle, 
    Info, 
    Layers, 
    Dna, 
    Grid, 
    Flame, 
    Activity, 
    History, 
    Sparkles, 
    Copy, 
    Check, 
    RotateCcw
} from 'lucide-react';
import { MatrizCorteResult, BallMatrixBreakdown } from '@/services/matriz-corte-engine';

function combinations(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    let c = 1;
    for (let i = 1; i <= k; i++) {
        c = (c * (n - (k - i))) / i;
    }
    return Math.round(c);
}

const GAMES = [
    { key: 'EUROMILLIONS', name: 'Euromilhões', balls: 50, pick: 5, target: 25, color: 'from-amber-500 to-yellow-600' },
    { key: 'TOTOLOTO', name: 'Totoloto', balls: 49, pick: 5, target: 24, color: 'from-blue-500 to-indigo-600' },
    { key: 'EURODREAMS', name: 'EuroDreams', balls: 40, pick: 6, target: 20, color: 'from-purple-500 to-pink-600' },
    { key: 'MEGASENA', name: 'Mega-Sena', balls: 60, pick: 6, target: 30, color: 'from-emerald-500 to-teal-600' }
];

export default function MatrizCorteClient() {
    const [selectedGame, setSelectedGame] = useState('EUROMILLIONS');
    const [selectedDrawIndex, setSelectedDrawIndex] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<MatrizCorteResult | null>(null);

    const [sliderThreshold, setSliderThreshold] = useState<number>(80);
    const [selectedBall, setSelectedBall] = useState<BallMatrixBreakdown | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const url = selectedDrawIndex 
                    ? `/api/tools/matriz-corte?game=${selectedGame}&drawIndex=${selectedDrawIndex}`
                    : `/api/tools/matriz-corte?game=${selectedGame}`;
                const res = await fetch(url);
                const json = await res.json();
                if (!json.success) throw new Error(json.error || 'Erro ao carregar dados');
                if (isMounted) {
                    setData(json.data);
                    setSliderThreshold(json.data.exact25CutoffPct || 80);
                    setSelectedBall(null);
                }
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Falha de comunicação');
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchData();
        return () => { isMounted = false; };
    }, [selectedGame, selectedDrawIndex]);

    const evaluation = useMemo(() => {
        if (!data) return null;

        const balls = data.balls;
        const cutBalls = balls.filter(b => b.maxProximityPct >= sliderThreshold);
        const cutBallNumbers = new Set(cutBalls.map(b => b.ball));
        const survivingBalls = balls.filter(b => !cutBallNumbers.has(b.ball)).map(b => b.ball).sort((a, b) => a - b);

        const totalCombs = combinations(data.totalBalls, data.pickSize);
        const survCombs = combinations(survivingBalls.length, data.pickSize);
        const reductionPct = totalCombs > 0 ? ((1 - survCombs / totalCombs) * 100) : 0;

        let winningCut: number[] = [];
        let winningSurvived: number[] = [];
        let jackpotIntact = false;

        if (data.actualWinningNumbers && data.actualWinningNumbers.length > 0) {
            winningCut = data.actualWinningNumbers.filter(n => cutBallNumbers.has(n));
            winningSurvived = data.actualWinningNumbers.filter(n => !cutBallNumbers.has(n));
            jackpotIntact = winningCut.length === 0;
        }

        return {
            cutBalls,
            cutBallNumbers,
            survivingBalls,
            totalCombs,
            survCombs,
            reductionPct,
            winningCut,
            winningSurvived,
            jackpotIntact
        };
    }, [data, sliderThreshold]);

    const handleCopy = () => {
        if (!evaluation) return;
        navigator.clipboard.writeText(evaluation.survivingBalls.join(', '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 dark:text-gray-400 font-medium animate-pulse">A calcular as 5 matrizes para {selectedGame}...</p>
            </div>
        );
    }

    if (error || !data || !evaluation) {
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/30 rounded-2xl">
                <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-3" />
                <p className="text-red-700 dark:text-red-300 font-semibold mb-2">Erro ao carregar a Matriz de Corte</p>
                <p className="text-slate-600 dark:text-gray-400 text-sm mb-4">{error}</p>
                <button 
                    onClick={() => setSelectedDrawIndex(undefined)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition"
                >
                    Voltar ao Sorteio Atual
                </button>
            </div>
        );
    }

    const isAuditMode = !!data.actualWinningNumbers;

    return (
        <div className="space-y-8">
            {/* Top Bar: Games & Mode Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
                {/* Games Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                    {GAMES.map(g => (
                        <button
                            key={g.key}
                            onClick={() => {
                                setSelectedGame(g.key);
                                setSelectedDrawIndex(undefined);
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                                selectedGame === g.key
                                    ? `bg-gradient-to-r ${g.color} text-white shadow-md shadow-indigo-500/20`
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {g.name}
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-black/20 font-mono">
                                {g.balls}b
                            </span>
                        </button>
                    ))}
                </div>

                {/* Mode / History Selector */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <select
                        value={selectedDrawIndex || ''}
                        onChange={(e) => setSelectedDrawIndex(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-gray-200 text-sm rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
                    >
                        <option value="">🔮 Próximo Sorteio #{data.totalDraws + 1} (Live)</option>
                        <optgroup label="Auditoria Histórica (Laboratório)">
                            {data.recentDrawsList.map(d => (
                                <option key={d.index} value={d.index}>
                                    Sorteio #{d.index} ({d.date}) - [{d.numbers.join(', ')}]
                                </option>
                            ))}
                        </optgroup>
                    </select>
                </div>
            </div>

            {/* Audit Mode Banner */}
            {isAuditMode && (
                <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    evaluation.jackpotIntact 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
                        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300'
                }`}>
                    <div className="flex items-center gap-3">
                        {evaluation.jackpotIntact ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                        )}
                        <div>
                            <p className="font-bold text-sm md:text-base">
                                {evaluation.jackpotIntact 
                                    ? `JACKPOT 100% PRESERVADO! Todas as ${data.pickSize} bolas sorteadas sobreviveram ao corte!`
                                    : `${evaluation.winningSurvived.length} de ${data.pickSize} bolas sorteadas sobreviveram ao corte.`
                                }
                            </p>
                            <p className="text-xs opacity-90 mt-0.5">
                                Chave Sorteada: <span className="font-mono font-bold">[{data.actualWinningNumbers?.join(', ')}]</span>
                                {evaluation.winningCut.length > 0 && (
                                    <> — Bolas eliminadas indevidamente a {sliderThreshold}%: <span className="font-mono font-bold text-red-600 dark:text-red-400">[{evaluation.winningCut.join(', ')}]</span></>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full bg-white/60 dark:bg-black/30 font-mono font-bold border border-slate-300 dark:border-white/10">
                        {evaluation.winningSurvived.length}/{data.pickSize} Acertos Intactos
                    </div>
                </div>
            )}

            {/* THE CENTRAL TUNING KNOB (Slider) & KPI Panel */}
            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Potenciómetro de Fasquia (Cascata de Proximidade)
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                            Fasquia de Corte: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-amber-600 dark:from-indigo-400 dark:to-amber-400">{sliderThreshold}%</span>
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mt-1 max-w-xl">
                            Ajusta o botão para apertar ou desapertar o cerco. As bolas com proximidade ≥ fasquia são eliminadas por sobreaquecimento ou impedimento histórico.
                        </p>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setSliderThreshold(100)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                sliderThreshold === 100 
                                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            🛡️ 100% Blindado
                        </button>
                        <button
                            onClick={() => setSliderThreshold(90)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                sliderThreshold === 90 
                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            90% Crítico
                        </button>
                        <button
                            onClick={() => setSliderThreshold(80)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                sliderThreshold === 80 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            80% Equilibrado
                        </button>
                        <button
                            onClick={() => setSliderThreshold(data.exact25CutoffPct)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                sliderThreshold === data.exact25CutoffPct 
                                    ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20' 
                                    : 'bg-slate-100 dark:bg-slate-800 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white'
                            }`}
                        >
                            🎯 Meta 50% ({data.exact25CutoffPct}%)
                        </button>
                    </div>
                </div>

                {/* The Interactive Slider Bar */}
                <div className="space-y-3 mb-8">
                    <div className="relative flex items-center">
                        <input
                            type="range"
                            min="60"
                            max="100"
                            step="0.5"
                            value={sliderThreshold}
                            onChange={(e) => setSliderThreshold(parseFloat(e.target.value))}
                            className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-gray-500 font-mono">
                        <span>60% (Corte Agressivo)</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">75% (Segurança Recomendada)</span>
                        <span>100% (Inviolável / Recordes Batidos)</span>
                    </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/80">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
                        <span className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider block mb-1">
                            Bolas Eliminadas
                        </span>
                        <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-1">
                            {evaluation.cutBalls.length}
                            <span className="text-xs text-slate-500 dark:text-gray-500">/ {data.totalBalls}</span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-gray-400 mt-1 block">
                            Meta: {data.targetEliminate} eliminadas
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                            Bolas Sobreviventes
                        </span>
                        <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
                            {evaluation.survivingBalls.length}
                            <span className="text-xs text-slate-500 dark:text-gray-500">/ {data.totalBalls}</span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-gray-400 mt-1 block">
                            Universo de aposta
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block mb-1">
                            Redução Combinatória
                        </span>
                        <div className="text-2xl md:text-3xl font-extrabold text-purple-600 dark:text-purple-300">
                            -{evaluation.reductionPct.toFixed(1)}%
                        </div>
                        <span className="text-xs text-slate-500 dark:text-gray-400 mt-1 block">
                            Espaço amostral filtrado
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block mb-1">
                            Chaves Possíveis
                        </span>
                        <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                            {evaluation.survCombs >= 1e6 ? `${(evaluation.survCombs/1e6).toFixed(2)}M` : evaluation.survCombs.toLocaleString()}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-gray-500 mt-1 block">
                            De {evaluation.totalCombs >= 1e6 ? `${(evaluation.totalCombs/1e6).toFixed(2)}M` : evaluation.totalCombs.toLocaleString()} iniciais
                        </span>
                    </div>
                </div>
            </div>

            {/* BALL HEATMAP GRID */}
            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Grid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            Grelha Térmica das {data.totalBalls} Bolas
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                            Clica em qualquer bola para ver o raio-x detalhado das 5 matrizes.
                        </p>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-400 dark:border-emerald-500/40"></div>
                            <span className="text-slate-700 dark:text-gray-300">Segura (&lt;75%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-md bg-amber-100 dark:bg-amber-500/20 border border-amber-400 dark:border-amber-500/40"></div>
                            <span className="text-slate-700 dark:text-gray-300">Aviso (75-84%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-md bg-red-100 dark:bg-red-500/30 border border-red-400 dark:border-red-500/50"></div>
                            <span className="text-slate-700 dark:text-gray-300">Cortada (&ge;{sliderThreshold}%)</span>
                        </div>
                        {isAuditMode && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-yellow-500 dark:border-yellow-400 bg-yellow-400/20"></div>
                                <span className="text-yellow-700 dark:text-yellow-300 font-bold">Vencedora Real</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                    {Array.from({ length: data.totalBalls }, (_, idx) => idx + 1).map(ballNum => {
                        const bData = data.balls.find(b => b.ball === ballNum);
                        const isCut = evaluation.cutBallNumbers.has(ballNum);
                        const isWinning = data.actualWinningNumbers?.includes(ballNum);
                        const prox = bData ? bData.maxProximityPct : 0;
                        const isWarning = !isCut && prox >= 75;
                        const isSelected = selectedBall?.ball === ballNum;

                        let bgClass = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20";
                        if (isCut) {
                            bgClass = "bg-red-50 dark:bg-red-500/20 border-red-200 dark:border-red-500/50 text-red-500 dark:text-red-300 line-through opacity-60 hover:opacity-100";
                        } else if (isWarning) {
                            bgClass = "bg-amber-50 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/30";
                        }

                        return (
                            <button
                                key={ballNum}
                                onClick={() => setSelectedBall(bData || null)}
                                className={`relative p-3 rounded-2xl border flex flex-col items-center justify-center transition-all duration-150 ${bgClass} ${
                                    isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 scale-105 shadow-md' : ''
                                } ${isWinning ? 'ring-2 ring-yellow-500 dark:ring-yellow-400 font-extrabold shadow-yellow-400/20 shadow-md' : ''}`}
                            >
                                <span className="text-base font-black font-mono">{ballNum}</span>
                                <span className="text-[10px] opacity-80 font-mono mt-0.5">{prox.toFixed(0)}%</span>
                                {isWinning && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">
                                        ★
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Ball Detail Drawer / Modal */}
                {selectedBall && (
                    <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-mono font-black text-xl">
                                    {selectedBall.ball}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                        Raio-X da Bola {selectedBall.ball}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">
                                        Proximidade Máxima: <span className="font-bold text-slate-900 dark:text-white">{selectedBall.maxProximityPct}%</span> | Score: {selectedBall.compositeScore}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedBall(null)}
                                className="text-xs text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg transition"
                            >
                                Fechar
                            </button>
                        </div>

                        {selectedBall.reasons.length > 0 ? (
                            <div className="space-y-1.5 mt-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400">Alertas Detetados:</span>
                                <div className="flex flex-wrap gap-2">
                                    {selectedBall.reasons.map((r, i) => (
                                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 font-medium">
                                            ⚠️ {r}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Bola perfeitamente limpa: nenhum limite ou recorde histórico violado.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* GOLD SURVIVORS POOL (As 25 Bolas Sobreviventes) */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-50/50 via-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                O Lote dos {evaluation.survivingBalls.length} Sobreviventes
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                            As bolas que passaram incólumes por todas as 5 matrizes de corte à fasquia de {sliderThreshold}%.
                        </p>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-md shadow-indigo-600/20"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copiado!' : 'Copiar Números'}
                    </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                    {evaluation.survivingBalls.map(num => {
                        const isWinning = data.actualWinningNumbers?.includes(num);
                        return (
                            <span
                                key={num}
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-black text-sm transition-transform hover:scale-110 ${
                                    isWinning 
                                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-md shadow-yellow-500/20 ring-2 ring-yellow-400 dark:ring-yellow-300'
                                        : 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 shadow-sm'
                                }`}
                            >
                                {num}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* DIAGNOSTIC CARDS: THE 5 MATRICES */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Raio-X das 5 Matrizes Especializadas
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Matrix 1 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Matriz #1</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold">100 pts</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Dispersão por Casas (N1 a Nk)</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">Rejeição por consenso unânime de todas as posições ordenadas.</p>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {data.matrixSummary.casasCutsCount} {data.matrixSummary.casasCutsCount === 1 ? 'bola condenada' : 'bolas condenadas'}
                        </div>
                    </div>

                    {/* Matrix 2 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Matriz #2</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold">75 pts</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">DNA de Estados (L=6)</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">64 interruptores binários com histórico consolidado sem saídas.</p>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {data.matrixSummary.dnaCutsCount} {data.matrixSummary.dnaCutsCount === 1 ? 'bola condenada' : 'bolas condenadas'}
                        </div>
                    </div>

                    {/* Matrix 3 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Matriz #3</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold">80 pts</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Saturação de Dezenas</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">Arrefecimento das bolas em falta após tsunami de saídas na dezena.</p>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {data.matrixSummary.dezenasCutsCount} {data.matrixSummary.dezenasCutsCount === 1 ? 'bola em repouso' : 'bolas em repouso'}
                        </div>
                    </div>

                    {/* Matrix 4 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Matriz #4</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold">90 pts</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Densidade e Multi-Janelas</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">Tetos absolutos em janelas deslizantes de 3 a 100 sorteios.</p>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {data.matrixSummary.janelas100CutsCount} {data.matrixSummary.janelas100CutsCount === 1 ? 'teto batido a 100%' : 'tetos batidos a 100%'}
                        </div>
                    </div>

                    {/* Matrix 5 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Matriz #5</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold">95 pts</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Ritmo e Repouso</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">Recordes de streaks, ping-pong e descanso pós-pico obrigatório.</p>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {data.matrixSummary.ritmo100CutsCount} {data.matrixSummary.ritmo100CutsCount === 1 ? 'limite batido a 100%' : 'limites batidos a 100%'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
