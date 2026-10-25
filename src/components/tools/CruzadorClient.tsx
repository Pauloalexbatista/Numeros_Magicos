"use client";

import SendToWheelingButton from '@/components/SendToWheelingButton';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Compass, 
    Sliders, 
    Sun, 
    Moon, 
    ArrowRightLeft, 
    ShieldAlert, 
    CheckCircle2, 
    Copy, 
    Check, 
    Sparkles, 
    Dices, 
    Info, 
    Layers, 
    Activity, 
    AlertTriangle,
    Flame
} from 'lucide-react';
import { PolarityMetrics, PolarityRankingItem, SYSTEM_FAMILIES } from '@/types/polarity';

const GAMES = [
    { key: 'EUROMILLIONS', name: 'Euromilhões', balls: 50, pick: 5, half: 25, color: 'from-amber-500 to-yellow-600' },
    { key: 'TOTOLOTO', name: 'Totoloto', balls: 49, pick: 5, half: 25, color: 'from-blue-500 to-indigo-600' },
    { key: 'EURODREAMS', name: 'EuroDreams', balls: 40, pick: 6, half: 20, color: 'from-purple-500 to-pink-600' },
    { key: 'MEGASENA', name: 'Mega-Sena', balls: 60, pick: 6, half: 30, color: 'from-emerald-500 to-teal-600' },
    { key: 'LOTOFACIL', name: 'Lotofácil', balls: 25, pick: 15, half: 20, color: 'from-purple-600 to-pink-600' }
];

export default function CruzadorClient() {
    const [selectedGame, setSelectedGame] = useState('EUROMILLIONS');
    const [selectedSystem, setSelectedSystem] = useState('mais_quentes');
    const [activeMode, setActiveMode] = useState<'DIRECT' | 'MIRROR'>('DIRECT');
    const [sliderThreshold, setSliderThreshold] = useState<number>(80);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{
        polarity: PolarityMetrics;
        systemsRanking: PolarityRankingItem[];
        activeMode: 'DIRECT' | 'MIRROR';
        threshold: number;
        activePool: number[];
        survivingNumbers: number[];
        eliminatedNumbers: number[];
        matrizCorte: {
            totalBalls: number;
            pickSize: number;
            exact25CutoffPct: number;
            euroDreamsPresets?: {
                surgical4CutoffPct: number;
                eco18CutoffPct: number;
                eco24CutoffPct: number;
            };
            balls: { ball: number; maxProximityPct: number; reasons: string[] }[];
        };
    } | null>(null);

    const [copied, setCopied] = useState(false);
    const [selectedBall, setSelectedBall] = useState<{ ball: number; maxProximityPct: number; reasons: string[] } | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const url = `/api/tools/cruzador?game=${selectedGame}&system=${selectedSystem}&mode=${activeMode}&threshold=${sliderThreshold}`;
                const res = await fetch(url);
                const json = await res.json();
                if (!json.success) throw new Error(json.error || 'Erro ao carregar dados do Cruzador');
                if (isMounted) {
                    setData(json.data);
                }
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Falha de comunicação');
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchData();
        return () => { isMounted = false; };
    }, [selectedGame, selectedSystem, activeMode, sliderThreshold]);

    const handleCopy = () => {
        if (!data) return;
        navigator.clipboard.writeText(data.survivingNumbers.join(', '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleMode = () => {
        setActiveMode(prev => prev === 'DIRECT' ? 'MIRROR' : 'DIRECT');
    };

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 dark:text-gray-400 font-medium animate-pulse">A calibrar o Cruzador Inteligente & Bússola de Polaridade...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/30 rounded-2xl">
                <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-3" />
                <p className="text-red-700 dark:text-red-300 font-semibold mb-2">Erro ao carregar o Cruzador</p>
                <p className="text-slate-600 dark:text-gray-400 text-sm mb-4">{error}</p>
                <button 
                    onClick={() => { setSelectedSystem('separacao_aguas'); }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition"
                >
                    Repor Sistema Separação das Águas
                </button>
            </div>
        );
    }

    const { polarity, systemsRanking, matrizCorte, survivingNumbers, eliminatedNumbers } = data;
    const isDirect = activeMode === 'DIRECT';
    const activeBalls = isDirect ? polarity.directNumbers : polarity.mirrorNumbers;

    return (
        <div className="space-y-8">
            {/* Top Bar: Games & System Selector */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
                {/* Games Selector */}
                <div className="flex flex-wrap items-center gap-2">
                    {GAMES.map(g => (
                        <button
                            key={g.key}
                            onClick={() => {
                                setSelectedGame(g.key);
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

                {/* System Selector with JPI & Extreme Separation Badge */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Sistema Base:
                    </span>
                    <select
                        value={selectedSystem}
                        onChange={(e) => setSelectedSystem(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-gray-200 text-sm font-semibold rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full lg:w-72"
                    >
                        {systemsRanking.map(sys => (
                            <option key={sys.systemSlug} value={sys.systemSlug}>
                                {sys.systemName} (Separação: {sys.extremeSeparationRate}%)
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* BÚSSOLA DE POLARIDADE (CENTRAL GAUGE & DUAL CARDS) */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                {/* Compass Header & Recommendation Pill */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10 border-b border-white/10 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
                            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                                Bússola de Polaridade dos Extremos (Teoria de Nazaré)
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black">
                            {polarity.systemName}
                        </h2>
                        <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
                            {polarity.explanation}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className={`px-4 py-2 rounded-2xl border text-sm font-extrabold flex items-center gap-2 shadow-lg ${
                            polarity.recommendation === 'DIRECT' 
                                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300' 
                                : polarity.recommendation === 'MIRROR'
                                    ? 'bg-purple-500/20 border-purple-400/40 text-purple-300'
                                    : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}>
                            {polarity.recommendation === 'DIRECT' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
                            <span>{polarity.headline}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 font-mono font-bold">
                                {polarity.confidence}%
                            </span>
                        </div>

                        {/* 1-Click Flip Button */}
                        <button
                            onClick={toggleMode}
                            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-indigo-600/30"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                            {isDirect ? 'Inverter para Anti-Sistema (2ª Metade)' : 'Inverter para Direto (1ª Metade)'}
                        </button>
                    </div>
                </div>

                {/* Dual Cards: Direto vs Espelho */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {/* Direct Card (1ª Metade) */}
                    <div className={`p-5 rounded-2xl border transition-all ${
                        isDirect 
                            ? 'bg-amber-500/10 border-amber-400/50 ring-2 ring-amber-400/40 shadow-xl' 
                            : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100'
                    }`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Sun className="w-5 h-5 text-amber-400" />
                                <span className="font-extrabold text-sm uppercase tracking-wide text-amber-300">
                                    ☀️ Direto (1ª Metade - Top {polarity.halfSize})
                                </span>
                            </div>
                            {isDirect && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black uppercase">
                                    Modo Ativo
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center pt-2">
                            <div className="p-2.5 rounded-xl bg-black/30">
                                <span className="text-[10px] text-slate-400 block mb-0.5">Jackpots (5-0)</span>
                                <span className="text-lg font-black text-amber-400">{polarity.directJackpots}</span>
                                <span className="text-[9px] text-slate-400 block">μ = {polarity.directMeanCycle}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/30">
                                <span className="text-[10px] text-slate-400 block mb-0.5">Atraso Atual</span>
                                <span className="text-lg font-black text-white">{polarity.directDelay}</span>
                                <span className="text-[9px] text-slate-400 block">JPI = {polarity.directJpi}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/30">
                                <span className="text-[10px] text-slate-400 block mb-0.5">Traves Recentes</span>
                                <span className="text-lg font-black text-emerald-400">{polarity.directTravesLast5}x</span>
                                <span className="text-[9px] text-slate-400 block">(últimos 5)</span>
                            </div>
                        </div>
                    </div>

                    {/* Mirror Card (2ª Metade / Anti-Sistema) */}
                    <div className={`p-5 rounded-2xl border transition-all ${
                        !isDirect 
                            ? 'bg-purple-500/10 border-purple-400/50 ring-2 ring-purple-400/40 shadow-xl' 
                            : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100'
                    }`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Moon className="w-5 h-5 text-purple-400" />
                                <span className="font-extrabold text-sm uppercase tracking-wide text-purple-300">
                                    🌑 Espelho (Anti-Sistema - Últimos {polarity.halfSize})
                                </span>
                            </div>
                            {!isDirect && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-400 text-black uppercase">
                                    Modo Ativo
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center pt-2">
                            <div className="p-2.5 rounded-xl bg-black/30">
                                <span className="text-[10px] text-slate-400 block mb-0.5">Jackpots (0-5)</span>
                                <span className="text-lg font-black text-purple-400">{polarity.mirrorJackpots}</span>
                                <span className="text-[9px] text-slate-400 block">μ = {polarity.mirrorMeanCycle}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/30">
                                <span className="text-[10px] text-slate-400 block mb-0.5">Atraso Atual</span>
                                <span className="text-lg font-black text-white">{polarity.mirrorDelay}</span>
                                <span className="text-[9px] text-slate-400 block">JPI = {polarity.mirrorJpi}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/30">
                                <span className="text-[10px] text-slate-400 block mb-0.5">Traves Recentes</span>
                                <span className="text-lg font-black text-emerald-400">{polarity.mirrorTravesLast5}x</span>
                                <span className="text-[9px] text-slate-400 block">(últimos 5)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Separation vs Noise Summary Bar */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-4">
                        <div>
                            <span className="text-slate-400">Taxa Separação Extrema (5-0, 0-5, 4-1, 1-4):</span>{' '}
                            <span className="font-extrabold text-emerald-400">{polarity.extremeSeparationRate}%</span>
                        </div>
                        <div>
                            <span className="text-slate-400">Ruído Central Desperdiçado (3-2):</span>{' '}
                            <span className="font-extrabold text-rose-400">{polarity.centralNoiseRate}%</span>
                        </div>
                    </div>
                    <div className="text-[11px] text-slate-400">
                        Total Jackpots Extremos:{' '}
                        <span className="font-mono font-bold text-white">
                            {polarity.totalExtremeJackpots} ({polarity.directJackpots} Direto + {polarity.mirrorJackpots} Espelho)
                        </span>
                    </div>
                </div>
            </div>

            {/* MATRIZ DE CORTE V2 TUNING SLIDER */}
            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Potenciómetro da Matriz de Corte V2
                            </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                            Fasquia de Eliminação: <span className="text-indigo-600 dark:text-indigo-400">{sliderThreshold}%</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                            As 8 matrizes filtram em tempo real a pool ativa de {activeBalls.length} números ({isDirect ? 'Direto' : 'Espelho'}).
                        </p>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setSliderThreshold(100)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                sliderThreshold === 100 
                                    ? 'bg-red-500 text-white shadow-md' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400'
                            }`}
                        >
                            🛡️ 100% Blindado
                        </button>
                        <button
                            onClick={() => setSliderThreshold(90)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                sliderThreshold === 90 
                                    ? 'bg-amber-500 text-white shadow-md' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400'
                            }`}
                        >
                            90% Crítico
                        </button>
                        <button
                            onClick={() => setSliderThreshold(80)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                sliderThreshold === 80 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400'
                            }`}
                        >
                            80% Equilibrado
                        </button>
                        <button
                            onClick={() => setSliderThreshold(matrizCorte.exact25CutoffPct)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                sliderThreshold === matrizCorte.exact25CutoffPct 
                                    ? 'bg-purple-600 border-purple-500 text-white shadow-md' 
                                    : 'bg-slate-100 dark:bg-slate-800 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-300'
                            }`}
                        >
                            🎯 Meta 50% ({matrizCorte.exact25CutoffPct}%)
                        </button>
                    </div>
                </div>

                {/* EuroDreams Presets */}
                {selectedGame === 'EURODREAMS' && matrizCorte.euroDreamsPresets && (
                    <div className="flex flex-wrap items-center gap-2 p-3 mb-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold">
                        <span className="text-purple-700 dark:text-purple-300">Atalhos EuroDreams:</span>
                        <button
                            onClick={() => setSliderThreshold(matrizCorte.euroDreamsPresets!.surgical4CutoffPct)}
                            className={`px-3 py-1 rounded-lg transition ${
                                sliderThreshold === matrizCorte.euroDreamsPresets!.surgical4CutoffPct
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'bg-purple-200/50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 hover:bg-purple-200'
                            }`}
                        >
                            🎯 Corte Cirúrgico 4 Bolas (Quadrado 6x6)
                        </button>
                        <button
                            onClick={() => setSliderThreshold(matrizCorte.euroDreamsPresets!.eco24CutoffPct)}
                            className={`px-3 py-1 rounded-lg transition ${
                                sliderThreshold === matrizCorte.euroDreamsPresets!.eco24CutoffPct
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-emerald-200/50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200'
                            }`}
                        >
                            ⚡ Funil 24 Bolas (16 Cortes)
                        </button>
                        <button
                            onClick={() => setSliderThreshold(matrizCorte.euroDreamsPresets!.eco18CutoffPct)}
                            className={`px-3 py-1 rounded-lg transition ${
                                sliderThreshold === matrizCorte.euroDreamsPresets!.eco18CutoffPct
                                    ? 'bg-pink-600 text-white shadow-sm'
                                    : 'bg-pink-200/50 dark:bg-pink-900/40 text-pink-800 dark:text-pink-200 hover:bg-pink-200'
                            }`}
                        >
                            🎯 Funil 18 Bolas (6 Chaves)
                        </button>
                    </div>
                )}

                {/* Slider Control */}
                <input
                    type="range"
                    min="60"
                    max="100"
                    step="0.5"
                    value={sliderThreshold}
                    onChange={(e) => setSliderThreshold(parseFloat(e.target.value))}
                    className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 focus:outline-none mb-3"
                />
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-gray-500 font-mono">
                    <span>60% (Corte Agressivo)</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">75% - 80% (Equilíbrio Seguro)</span>
                    <span>100% (Inviolável)</span>
                </div>
            </div>

            {/* THE CRUZADOR COMBINED MATRIX GRID */}
            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            Grelha do Cruzador: As {activeBalls.length} Bolas do {isDirect ? 'Direto' : 'Anti-Sistema'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                            Bolas verdes = Sobreviventes aprovadas pela Matriz de Corte V2 | Bolas vermelhas = Eliminadas por risco
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-emerald-700 dark:text-emerald-300">{survivingNumbers.length} Sobreviventes</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-red-700 dark:text-red-300">{eliminatedNumbers.length} Eliminadas</span>
                        </div>
                    </div>
                </div>

                {/* Grid of the 25 balls */}
                <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
                    {activeBalls.map((ballNum, rankIdx) => {
                        const mBall = matrizCorte.balls.find(b => b.ball === ballNum);
                        const prox = mBall ? mBall.maxProximityPct : 0;
                        const isCut = prox >= sliderThreshold;
                        const isSelected = selectedBall?.ball === ballNum;

                        let style = "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100";
                        if (isCut) {
                            style = "bg-red-50 dark:bg-red-500/15 border-red-300 dark:border-red-500/40 text-red-500 dark:text-red-400 line-through opacity-50 hover:opacity-100";
                        }

                        return (
                            <button
                                key={ballNum}
                                onClick={() => setSelectedBall(mBall || { ball: ballNum, maxProximityPct: prox, reasons: [] })}
                                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${style} ${
                                    isSelected ? 'ring-2 ring-indigo-500 scale-105 shadow-md' : ''
                                }`}
                            >
                                <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500 font-bold mb-0.5">#{rankIdx + 1}</span>
                                <span className="text-base font-black font-mono">{ballNum}</span>
                                <span className="text-[10px] opacity-80 font-mono mt-0.5">{prox.toFixed(0)}%</span>
                            </button>
                        );
                    })}
                </div>

                {/* Ball Detail Box */}
                {selectedBall && (
                    <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                    Bola {selectedBall.ball}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                                    Proximidade: {selectedBall.maxProximityPct}%
                                </span>
                            </div>
                            {selectedBall.reasons.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {selectedBall.reasons.map((r, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300">
                                            ⚠️ {r}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                    ✓ Aprovada: Sem registo de saturação em nenhuma das 8 matrizes.
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedBall(null)}
                            className="text-xs px-2.5 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-gray-300"
                        >
                            Fechar
                        </button>
                    </div>
                )}
            </div>

            {/* ACTION PANEL: SURVIVING LOT & DIRECT EXPORT */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-50/50 via-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-emerald-500/30 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                As {survivingNumbers.length} Bolas Finais Prontas para Apostar
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                            Cruzamento exato: Seleção do {isDirect ? 'Direto' : 'Anti-Sistema'} filtrada pelas 8 Matrizes de Corte a {sliderThreshold}%.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleCopy}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-md"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copiado!' : 'Copiar Chave'}
                        </button>

                        <SendToWheelingButton
                            numbers={survivingNumbers}
                            game={selectedGame}
                            label="🎲 Desdobrar no Wheeling"
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-md shadow-emerald-600/30"
                        />
                    </div>
                </div>

                {/* Display surviving numbers */}
                <div className="flex flex-wrap gap-2.5">
                    {survivingNumbers.map(num => (
                        <span
                            key={num}
                            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-mono font-black text-base flex items-center justify-center border border-emerald-300 dark:border-emerald-600/40 shadow-sm hover:scale-110 transition-transform"
                        >
                            {num}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
