'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
    GUARANTEE_OPTIONS, 
    STAR_GUARANTEE_OPTIONS, 
    GuaranteeOption, 
    FullKey, 
    generateSmart5Keys, 
    generateMagicSquareWithDetails, 
    MagicSquareResult, 
    NumberSquareStat 
} from '@/services/wheeling';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';
import { MagicSquareDisplay } from '@/components/MagicSquareDisplay';

type WheelingMode = 'magic' | 'smart5' | 'classic';
type GameType = '5' | '6';

const CLASSIC_MAX_NUMBERS = 20;

export default function WheelingPage() {
    const searchParams = useSearchParams();

    // Game type: 5 numbers (Euromilhoes, Totoloto) or 6 numbers (EuroDreams, Mega-Sena)
    const [gameType, setGameType] = useState<GameType>('5');
    const [gameName, setGameName] = useState<string>('euromilhoes');
    const [mode, setMode] = useState<WheelingMode>('magic'); // Default to Adaptive Magic Square
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [guarantee, setGuarantee] = useState<GuaranteeOption>(GUARANTEE_OPTIONS[2]); // Default: 3 if 5
    const [generatedKeys, setGeneratedKeys] = useState<FullKey[]>([]);
    const [keyLabels, setKeyLabels] = useState<string[]>([]);
    const [hoveredKey, setHoveredKey] = useState<number | undefined>(undefined);
    const [hoveredNumber, setHoveredNumber] = useState<number | undefined>(undefined);
    const [magicSquare, setMagicSquare] = useState<number[][]>([]);
    const [numberStats, setNumberStats] = useState<NumberSquareStat[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Dynamic thresholds based on gameType
    const minNumbers = gameType === '5' ? 10 : 12;
    const maxNumbers = gameType === '5' ? 25 : 36;
    const maxPoolBalls = gameType === '6' && (gameName === 'megasena') ? 60 : gameType === '6' ? 40 : 50;

    // Load numbers & settings from URL parameters
    useEffect(() => {
        const gameParam = searchParams?.get('game')?.toLowerCase();
        const modeParam = searchParams?.get('mode')?.toLowerCase();
        const numbersParam = searchParams?.get('numbers');

        if (gameParam) {
            setGameName(gameParam);
            if (gameParam === 'eurodreams' || gameParam === 'megasena' || gameParam === '6') {
                setGameType('6');
            } else {
                setGameType('5');
            }
        }

        if (modeParam) {
            if (modeParam === 'magic25') {
                setMode('magic');
                setGameType('5');
            } else if (modeParam === 'magic36') {
                setMode('magic');
                setGameType('6');
            } else if (modeParam === 'smart5') {
                setMode('smart5');
            } else if (modeParam === 'classic') {
                setMode('classic');
            }
        }

        if (numbersParam) {
            const nums = numbersParam.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 60);
            if (nums.length > 0) {
                if (nums.length > 25 && !gameParam) {
                    setGameType('6');
                }
                setSelectedNumbers(nums.slice(0, 36));
            }
        }
    }, [searchParams]);

    // Handle game type switch
    const handleGameTypeSwitch = (type: GameType) => {
        setGameType(type);
        setGeneratedKeys([]);
        setMagicSquare([]);
        setNumberStats([]);
        setKeyLabels([]);
        const newMax = type === '5' ? 25 : 36;
        if (selectedNumbers.length > newMax) {
            setSelectedNumbers(selectedNumbers.slice(0, newMax));
        }
    };

    // Toggle number in/out of priority list
    const toggleNumber = (num: number) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(selectedNumbers.filter(n => n !== num));
        } else {
            const limit = mode === 'classic' ? CLASSIC_MAX_NUMBERS : maxNumbers;
            if (selectedNumbers.length >= limit) return;
            setSelectedNumbers([...selectedNumbers, num]);
        }
    };

    // Auto-generate or manual generate
    const handleGenerate = () => {
        if (mode === 'magic') {
            if (selectedNumbers.length < minNumbers) return;
            setIsGenerating(true);
            try {
                const n = gameType === '5' ? 5 : 6;
                const result = generateMagicSquareWithDetails(selectedNumbers, [], n);
                setGeneratedKeys(result.keys);
                setKeyLabels(result.keyLabels);
                setMagicSquare(result.square);
                setNumberStats(result.numberStats || []);
            } catch (e) {
                console.error('Magic square generation error:', e);
            } finally {
                setIsGenerating(false);
            }
        } else if (mode === 'smart5') {
            if (selectedNumbers.length < 5) return;
            setIsGenerating(true);
            try {
                const keys = generateSmart5Keys(selectedNumbers, []);
                setGeneratedKeys(keys);
                setMagicSquare([]);
                setNumberStats([]);
                setKeyLabels([]);
            } catch (e) {
                console.error('Smart 5 generation error:', e);
            } finally {
                setIsGenerating(false);
            }
        } else {
            if (selectedNumbers.length < 5) return;
            if (selectedNumbers.length > CLASSIC_MAX_NUMBERS) {
                alert(`O modo clássico está limitado a ${CLASSIC_MAX_NUMBERS} números. Utilize o Quadrado Mágico Adaptativo para desdobramentos maiores.`);
                return;
            }
            setIsGenerating(true);
            setMagicSquare([]);
            setNumberStats([]);
            setKeyLabels([]);

            const worker = new Worker(new URL('./wheeling.worker.ts', import.meta.url));
            worker.onmessage = (event) => {
                const { type, keys: workerKeys, error } = event.data;
                if (type === 'SUCCESS') {
                    setGeneratedKeys(workerKeys);
                    setIsGenerating(false);
                    worker.terminate();
                } else {
                    console.error('Worker Error:', error || 'Unknown');
                    setIsGenerating(false);
                    worker.terminate();
                    alert('Erro ao gerar chaves clássicas.');
                }
            };
            worker.postMessage({
                numbers: selectedNumbers,
                stars: [],
                guarantee,
                starGuarantee: STAR_GUARANTEE_OPTIONS[0]
            });
        }
    };

    useEffect(() => {
        if (mode === 'magic' && selectedNumbers.length >= minNumbers && selectedNumbers.length <= maxNumbers) {
            const n = gameType === '5' ? 5 : 6;
            const result = generateMagicSquareWithDetails(selectedNumbers, [], n);
            setGeneratedKeys(result.keys);
            setKeyLabels(result.keyLabels);
            setMagicSquare(result.square);
            setNumberStats(result.numberStats || []);
        } else if (mode === 'magic' && selectedNumbers.length < minNumbers) {
            setGeneratedKeys([]);
            setMagicSquare([]);
            setNumberStats([]);
            setKeyLabels([]);
        }
    }, [selectedNumbers, mode, gameType, minNumbers, maxNumbers]);

    const handlePrint = () => {
        window.print();
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copiada(s) para a área de transferência!`);
    };

    const costPerKey = useMemo(() => {
        if (gameName === 'totoloto') return 1.00;
        if (gameName === 'megasena') return 5.00;
        return 2.50;
    }, [gameName]);

    const currencySymbol = gameName === 'megasena' ? 'R$' : '€';
    const totalCost = generatedKeys.length * costPerKey;

    const isBelowMin = mode === 'magic' && selectedNumbers.length < minNumbers;
    const canGenerate = mode === 'magic' 
        ? selectedNumbers.length >= minNumbers && selectedNumbers.length <= maxNumbers
        : selectedNumbers.length >= 5;


﻿    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div className="p-4 md:p-8 print:hidden max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2 tracking-tight">
                                <span>🎲</span> Desdobramentos de Números
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Potencie os seus palpites estratégicos por uma fração do preço de apostas múltiplas.
                            </p>
                        </div>
                    </div>

                    {/* Game Type Switcher */}
                    <div className="inline-flex items-center p-1.5 rounded-2xl bg-surface-2 border border-border self-start sm:self-auto shadow-sm">
                        <button
                            onClick={() => handleGameTypeSwitch('5')}
                            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-1.5 ${
                                gameType === '5'
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <span>⭐</span> 5 Números (12 Chaves)
                        </button>
                        <button
                            onClick={() => handleGameTypeSwitch('6')}
                            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-1.5 ${
                                gameType === '6'
                                    ? 'bg-amber-600 text-white shadow-md'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <span>🌟</span> 6 Números (14 Chaves)
                        </button>
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="mb-8 rounded-3xl border border-border bg-card/60 p-5 md:p-7 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <h3 className="text-base md:text-lg font-bold">Escolha o Modo de Desdobramento</h3>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-2 text-muted-foreground">
                            {gameType === '5' ? 'Euromilhões & Totoloto (Grelha 5x5)' : 'EuroDreams & Mega-Sena (Grelha 6x6)'}
                        </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {/* 1. Adaptive Magic Square */}
                        <button
                            onClick={() => setMode('magic')}
                            className={`p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${
                                mode === 'magic'
                                    ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 shadow-[0_0_25px_rgba(168,85,247,0.15)] ring-2 ring-purple-500/20'
                                    : 'border-border hover:border-purple-300 dark:hover:border-purple-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                            }`}
                        >
                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider">
                                Recomendado
                            </div>
                            <div className="font-black text-lg mb-1 flex items-center gap-2 text-purple-950 dark:text-purple-100">
                                <span>✨</span> Quadrado Mágico Adaptativo
                            </div>
                            <div className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-2">
                                {gameType === '5' ? '12 chaves (Grelha 5x5)' : '14 chaves (Grelha 6x6)'}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Distribui os seus números por ordem de força (#1 no centro/diagonais). Sem repetições em nenhuma chave!
                            </p>
                            <div className="mt-3 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                                ✓ Aceita de {minNumbers} a {maxNumbers} números
                            </div>
                        </button>

                        {/* 2. Smart 5 */}
                        <button
                            onClick={() => setMode('smart5')}
                            className={`p-5 rounded-2xl border-2 transition-all text-left group ${
                                mode === 'smart5'
                                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-2 ring-indigo-500/20'
                                    : 'border-border hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                            }`}
                        >
                            <div className="font-bold text-lg mb-1 flex items-center gap-2">
                                <span>🎯</span> 5 Chaves Inteligentes
                            </div>
                            <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                                5 chaves (1 boletim rápido)
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                5 chaves focadas em perfis equilibrados, pares/ímpares e décadas.
                            </p>
                            <div className="mt-3 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                ✓ Requer 5 ou mais números
                            </div>
                        </button>

                        {/* 3. Classic */}
                        <button
                            onClick={() => setMode('classic')}
                            className={`p-5 rounded-2xl border-2 transition-all text-left group ${
                                mode === 'classic'
                                    ? 'border-foreground bg-surface-2 text-foreground ring-2 ring-foreground/20'
                                    : 'border-border hover:border-foreground/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                            }`}
                        >
                            <div className="font-bold text-lg mb-1 flex items-center gap-2">
                                <span>📐</span> Coberturas Clássicas
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                Garantias Matemáticas Estritas
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Garante matematicamente X acertos se acertar Y números sorteados.
                            </p>
                            <div className="mt-3 text-[11px] font-semibold text-zinc-500">
                                ✓ Até 20 números no pool
                            </div>
                        </button>
                    </div>
                </div>

                {/* Main Workspace Layout */}
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Column: Number Management & Selection (5 cols) */}
                    <div className="lg:col-span-6 xl:col-span-5 space-y-6">
                        {/* 1. Ranked Importance List */}
                        <div className="bg-card/70 backdrop-blur-sm border border-border p-5 md:p-6 rounded-3xl shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <div>
                                    <h3 className="text-sm md:text-base font-black flex items-center gap-2 uppercase tracking-wide">
                                        <span>🏆</span> Ordem de Importância (#1 a #{selectedNumbers.length || 0})
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        O número <strong>#1</strong> é a âncora principal (aparece em mais chaves).
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                                        isBelowMin
                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                                    }`}>
                                        {selectedNumbers.length} / {maxNumbers}
                                    </span>
                                    {selectedNumbers.length > 0 && (
                                        <button
                                            onClick={() => setSelectedNumbers([])}
                                            className="text-xs text-muted-foreground hover:text-red-500 font-bold transition-colors"
                                        >
                                            Limpar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Badges List */}
                            {selectedNumbers.length === 0 ? (
                                <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl text-xs md:text-sm text-muted-foreground">
                                    Nenhum número selecionado. Clique no quadro abaixo para adicionar números por ordem de força.
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1.5 custom-scrollbar bg-surface-1/40 rounded-2xl border border-border/50">
                                    {selectedNumbers.map((num, idx) => (
                                        <div
                                            key={num}
                                            onMouseEnter={() => setHoveredNumber(num)}
                                            onMouseLeave={() => setHoveredNumber(undefined)}
                                            className={`group relative flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-xl border text-xs font-bold transition-all select-none ${
                                                idx === 0
                                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400/30 scale-105'
                                                    : idx < (gameType === '5' ? 9 : 12)
                                                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700'
                                                        : 'bg-surface-2 text-foreground border-border'
                                            }`}
                                        >
                                            <span className="text-[10px] font-mono opacity-70">#{idx + 1}</span>
                                            <span className="text-sm font-black">{num}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleNumber(num);
                                                }}
                                                className="ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-[10px] font-bold"
                                                title="Remover"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Feedback Notice */}
                            {isBelowMin ? (
                                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                                    <span className="text-lg">⚠️</span>
                                    <div>
                                        Adicione mais <strong>{minNumbers - selectedNumbers.length} números</strong> para ativar o Quadrado Mágico ({selectedNumbers.length}/{minNumbers} mínimo).
                                    </div>
                                </div>
                            ) : mode === 'magic' && selectedNumbers.length >= minNumbers && (
                                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                                    <span className="text-lg">✨</span>
                                    <div>
                                        <strong>Quadrado Mágico Ativo:</strong> {selectedNumbers.length} números distribuídos sem colisões em {gameType === '5' ? '12' : '14'} chaves.
                                    </div>
                                </div>
                            )}
                        </div>

﻿                        {/* 2. Number Grid Picker */}
                        <div className="bg-card/70 backdrop-blur-sm border border-border p-5 md:p-6 rounded-3xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm md:text-base font-black uppercase tracking-wide">
                                    Quadro de Seleção (1 a {maxPoolBalls})
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    Clique para adicionar/remover
                                </span>
                            </div>

                            <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                                {Array.from({ length: maxPoolBalls }, (_, i) => i + 1).map(num => {
                                    const rankIdx = selectedNumbers.indexOf(num);
                                    const isSelected = rankIdx !== -1;
                                    const isTop1 = rankIdx === 0;

                                    return (
                                        <button
                                            key={num}
                                            onClick={() => toggleNumber(num)}
                                            onMouseEnter={() => isSelected && setHoveredNumber(num)}
                                            onMouseLeave={() => setHoveredNumber(undefined)}
                                            className={`relative h-9 sm:h-10 flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all ${
                                                isSelected
                                                    ? isTop1
                                                        ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-400/40 scale-105 z-10'
                                                        : 'bg-purple-600 text-white font-black shadow-sm scale-105 z-10'
                                                    : 'bg-surface-1 hover:bg-surface-2 text-foreground/80 hover:text-foreground border border-border/60'
                                            }`}
                                        >
                                            <span>{num}</span>
                                            {isSelected && (
                                                <span className={`text-[8px] leading-none font-mono ${isTop1 ? 'text-slate-900 font-black' : 'text-purple-200'}`}>
                                                    #{rankIdx + 1}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Guarantee Selector for Classic Mode */}
                            {mode === 'classic' && (
                                <div className="mt-6 pt-6 border-t border-border">
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                                        Garantia Matemática
                                    </label>
                                    <select
                                        value={guarantee.id}
                                        onChange={(e) => {
                                            const g = GUARANTEE_OPTIONS.find(opt => opt.id === e.target.value);
                                            if (g) setGuarantee(g);
                                        }}
                                        className="w-full p-3 bg-surface-2 border border-border rounded-xl text-sm font-semibold"
                                    >
                                        {GUARANTEE_OPTIONS.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="mt-6">
                                <button
                                    onClick={handleGenerate}
                                    disabled={!canGenerate || isGenerating}
                                    className={`w-full py-4 font-black rounded-2xl shadow-lg transition-all text-sm md:text-base flex items-center justify-center gap-2 ${
                                        canGenerate
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20 active:scale-[0.99]'
                                            : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    }`}
                                >
                                    {isGenerating ? (
                                        'A Calcular Distribuição...'
                                    ) : mode === 'magic' ? (
                                        `✨ Gerar ${gameType === '5' ? '12' : '14'} Chaves do Quadrado Mágico`
                                    ) : (
                                        '🚀 Gerar Chaves Otimizadas'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Generated Keys & Quick Output (7 cols) */}
                    <div className="lg:col-span-6 xl:col-span-7 space-y-6">
                        {generatedKeys.length > 0 ? (
                            <div className="bg-card/70 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-border">
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-border">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-black text-purple-600 dark:text-purple-400">
                                            {generatedKeys.length} Chaves Geradas
                                        </h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Custo Estimado: <strong className="text-foreground">{totalCost.toFixed(2)} {currencySymbol}</strong> ({costPerKey.toFixed(2)} {currencySymbol}/chave)
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const text = generatedKeys.map((k, i) => `Chave #${i + 1}: ${k.numbers.join(', ')}`).join('\n');
                                                copyToClipboard(text, 'Todas as Chaves');
                                            }}
                                            className="px-3 py-1.5 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-black transition-all hover:bg-purple-200"
                                        >
                                            📋 Copiar
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-black transition-all"
                                        >
                                            🖨️ Imprimir
                                        </button>
                                    </div>
                                </div>

                                {/* Disclaimer for Magic Square */}
                                {mode === 'magic' && (
                                    <div className="mb-4 p-3.5 bg-purple-50 dark:bg-purple-950/20 rounded-2xl border border-purple-200 dark:border-purple-800/50 text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
                                        <strong>💡 Como funciona:</strong> Cada linha, coluna e diagonal da grelha é uma chave única. O seu palpite <strong>#1</strong> ({selectedNumbers[0]}) foi posicionado nas intersecções mais estratégicas para maximizar múltiplos prémios.
                                    </div>
                                )}

                                {/* Keys List */}
                                <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
                                    {generatedKeys.map((key, idx) => (
                                        <div
                                            key={idx}
                                            onMouseEnter={() => setHoveredKey(idx)}
                                            onMouseLeave={() => setHoveredKey(undefined)}
                                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                                                hoveredKey === idx
                                                    ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                                                    : 'bg-surface-1/50 border-border/60 hover:border-border'
                                            }`}
                                        >
                                            <span className="text-zinc-400 font-mono text-xs w-6 text-center font-bold">
                                                #{idx + 1}
                                            </span>

                                            {keyLabels[idx] && (
                                                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 w-28 shrink-0">
                                                    {keyLabels[idx]}
                                                </span>
                                            )}

                                            {mode === 'smart5' && key.strategy && (
                                                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 w-28 shrink-0">
                                                    {key.strategy}
                                                </span>
                                            )}

                                            {/* Numbers */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {key.numbers.map(n => {
                                                    const isTop1 = selectedNumbers[0] === n;
                                                    const isHovered = hoveredNumber === n;

                                                    return (
                                                        <span
                                                            key={n}
                                                            onMouseEnter={() => setHoveredNumber(n)}
                                                            onMouseLeave={() => setHoveredNumber(undefined)}
                                                            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl font-black text-xs transition-all cursor-pointer ${
                                                                isHovered
                                                                    ? 'bg-amber-400 text-slate-950 scale-110 shadow-md ring-2 ring-amber-400/50'
                                                                    : isTop1
                                                                        ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                                                                        : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-border shadow-sm'
                                                            }`}
                                                        >
                                                            {n}
                                                        </span>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                onClick={() => copyToClipboard(key.numbers.join(', '), `Chave #${idx + 1}`)}
                                                className="ml-auto p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs transition-colors"
                                                title="Copiar Chave"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-3xl bg-card/30">
                                <span className="text-4xl mb-3">🔮</span>
                                <h4 className="text-base font-bold text-foreground">Aguardando Seleção</h4>
                                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                                    {isBelowMin
                                        ? `Selecione pelo menos ${minNumbers} números por ordem de importância para desbloquear as chaves do Quadrado Mágico.`
                                        : 'Escolha os seus números para calcular instantaneamente as chaves ideais.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Magic Square Visual Grid & Deep Statistics (Full Width Below) */}
                {mode === 'magic' && magicSquare.length > 0 && (
                    <div className="mt-14 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <MagicSquareDisplay 
                            square={magicSquare} 
                            highlightedKey={hoveredKey} 
                            hoveredNumber={hoveredNumber}
                            numberStats={numberStats}
                        />
                    </div>
                )}
            </div>

            {/* Print View */}
            <div className="hidden print:block p-8 bg-white text-black">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Desdobramento - {gameType === '5' ? '5 Números' : '6 Números'}</h1>
                    <p className="text-sm text-gray-600">
                        Modo: {mode === 'magic' ? 'Quadrado Mágico Adaptativo' : mode === 'smart5' ? 'Smart 5' : 'Clássico'} | Total: {generatedKeys.length} Chaves
                    </p>
                    <p className="text-sm text-gray-600">
                        Data: {new Date().toLocaleDateString()} | Custo Estimado: {totalCost.toFixed(2)} {currencySymbol}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {generatedKeys.map((key, idx) => (
                        <div key={idx} className="border border-gray-300 p-4 rounded flex items-center justify-between">
                            <span className="font-mono text-sm text-gray-500 mr-2">#{idx + 1}</span>
                            <div className="flex gap-2">
                                {key.numbers.map(n => (
                                    <span key={n} className="font-bold text-lg w-8 text-center">{n}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center text-xs text-gray-400">
                    Gerado por Números Mágicos
                </div>
            </div>
        </div>
    );
}
