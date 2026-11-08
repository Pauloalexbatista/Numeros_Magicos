'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
    GUARANTEE_OPTIONS, 
    GuaranteeOption, 
    FullKey, 
    generateSmart5Keys, 
    generateMagicSquareWithDetails, 
    NumberSquareStat,
    generateChaveTipoKeys
} from '@/services/wheeling';
import { generateSurgicalKeys } from '@/services/harmonic-generator';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';
import { MagicSquareDisplay } from '@/components/MagicSquareDisplay';
import { MatrizConselhoCard } from '@/components/systems/MatrizConselhoCard';
import { 
    Scissors, 
    Download, 
    AlertTriangle, 
    ShieldCheck, 
    Flame, 
    Info, 
    ChevronDown, 
    ChevronUp, 
    Sparkles, 
    Wand2 
} from 'lucide-react';

type WheelingMode = 'magic' | 'chave_tipo' | 'smart5' | 'classic' | 'cirurgico';
type GameType = '5' | '6' | '15';

const CLASSIC_MAX_NUMBERS = 16;

const WHEELING_GAMES = [
    { key: 'euromilhoes', name: 'Euromilhões', type: '5' as GameType, maxBalls: 50, icon: '⭐' },
    { key: 'totoloto', name: 'Totoloto', type: '5' as GameType, maxBalls: 49, icon: '🎯' },
    { key: 'eurodreams', name: 'EuroDreams', type: '6' as GameType, maxBalls: 40, icon: '🌙' },
    { key: 'megasena', name: 'Mega-Sena', type: '6' as GameType, maxBalls: 60, icon: '🍀' },
    { key: 'lotofacil', name: 'Lotofácil', type: '15' as GameType, maxBalls: 25, icon: '💎' }
];

export default function WheelingPage() {
    const searchParams = useSearchParams();

    // Game type: 5 numbers (Euromilhoes, Totoloto), 6 numbers (EuroDreams, Mega-Sena) or 15 numbers (Lotofacil)
    const [gameType, setGameType] = useState<GameType>('5');
    const [gameName, setGameName] = useState<string>('euromilhoes');
    const [mode, setMode] = useState<WheelingMode>('magic'); // Default to Adaptive Magic Square
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [guarantee, setGuarantee] = useState<GuaranteeOption>(GUARANTEE_OPTIONS[2]); // Default: 3 if 5
    const [surgicalSignature, setSurgicalSignature] = useState<'1-1-1-1-1' | '2-1-1-1-0'>('1-1-1-1-1');
    const [surgicalCount, setSurgicalCount] = useState<number>(10);
    const [generatedKeys, setGeneratedKeys] = useState<FullKey[]>([]);
    const [keyLabels, setKeyLabels] = useState<string[]>([]);
    const [hoveredKey, setHoveredKey] = useState<number | undefined>(undefined);
    const [hoveredNumber, setHoveredNumber] = useState<number | undefined>(undefined);
    const [magicSquare, setMagicSquare] = useState<number[][]>([]);
    const [numberStats, setNumberStats] = useState<NumberSquareStat[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [chaveTipoCount, setChaveTipoCount] = useState<number>(8);
    const [previousDraw, setPreviousDraw] = useState<number[]>([]);

    // Systems Intelligence Integration
    const [availableSystems, setAvailableSystems] = useState<any[]>([]);
    const [selectedSystemSlug, setSelectedSystemSlug] = useState<string>('mais_quentes');

    useEffect(() => {
        let isMounted = true;
        async function loadSystems() {
            try {
                const res = await fetch('/api/systems/cards');
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && Array.isArray(json.systems) && isMounted) {
                        setAvailableSystems(json.systems);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch systems in wheeling:', err);
            }
        }
        loadSystems();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let isMounted = true;
        async function fetchLastDraw() {
            try {
                const gameKey = gameName.toLowerCase() === 'lotofacil' ? 'LOTOFACIL' : gameName.toLowerCase() === 'megasena' ? 'MEGASENA' : gameName.toLowerCase() === 'eurodreams' ? 'EURODREAMS' : gameName.toLowerCase() === 'totoloto' ? 'TOTOLOTO' : 'EUROMILLIONS';
                const res = await fetch(`/api/draws?game=${gameKey}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0 && isMounted) {
                        const parsed = typeof data[0].numbers === 'string' ? JSON.parse(data[0].numbers) : data[0].numbers;
                        if (Array.isArray(parsed)) {
                            setPreviousDraw(parsed);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch previous draw for wheeling:', err);
            }
        }
        fetchLastDraw();
        return () => { isMounted = false; };
    }, [gameType, gameName]);

    // Dynamic thresholds based on gameType
    const minNumbers = gameType === '15' ? 15 : (gameType === '5' ? 10 : 12);
    const maxNumbers = gameType === '15' ? 25 : (gameType === '5' ? 25 : 36);
    const maxPoolBalls = WHEELING_GAMES.find(g => g.key === gameName.toLowerCase())?.maxBalls || 50;

    // Load numbers & settings from URL parameters
    useEffect(() => {
        const gameParam = searchParams?.get('game')?.toLowerCase();
        const modeParam = searchParams?.get('mode')?.toLowerCase();
        const numbersParam = searchParams?.get('numbers');

        if (gameParam) {
            setGameName(gameParam);
            if (gameParam === 'lotofacil' || gameParam === '15') {
                setGameType('15');
                if (!modeParam || modeParam === 'magic') {
                    setMode('chave_tipo');
                }
            } else if (gameParam === 'eurodreams' || gameParam === 'megasena' || gameParam === '6') {
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
            } else if (modeParam === 'chave_tipo' || modeParam === 'anatomia') {
                setMode('chave_tipo');
            } else if (modeParam === 'smart5') {
                setMode('smart5');
            } else if (modeParam === 'classic') {
                setMode('classic');
            } else if (modeParam === 'cirurgico' || modeParam === 'edison') {
                setMode('cirurgico');
            }
        }

        if (numbersParam) {
            const nums = numbersParam.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 60);
            if (nums.length > 0) {
                if (nums.length > 25 && !gameParam) {
                    setGameType('6');
                } else if (gameParam === 'lotofacil' || gameParam === '15') {
                    setGameType('15');
                }
                setSelectedNumbers(nums.slice(0, 36));
            }
        }
    }, [searchParams]);

        const handleSelectGame = (key: string) => {
        const found = WHEELING_GAMES.find(g => g.key === key) || WHEELING_GAMES[0];
        setGameName(found.key);
        setGameType(found.type);
        setGeneratedKeys([]);
        setMagicSquare([]);
        setNumberStats([]);
        setKeyLabels([]);

        // Lotofácil has 15-ball tickets: 'magic', 'smart5', 'cirurgico' do not apply
        if (found.type === '15') {
            if (mode !== 'classic') {
                setMode('chave_tipo');
            }
        } else {
            // For 5 and 6 numbers, if coming from Lotofácil or unsupported, default to magic
            if (mode === 'chave_tipo' && !searchParams?.get('mode')) {
                // keep mode
            }
        }

        // Adjust selected numbers pool limit to game's maxPoolBalls
        if (selectedNumbers.length > found.maxBalls) {
            setSelectedNumbers(selectedNumbers.filter(n => n <= found.maxBalls));
        }
    };

    // Handle game type switch
    const handleGameTypeSwitch = (type: GameType) => {
        setGameType(type);
        setGeneratedKeys([]);
        setMagicSquare([]);
        setNumberStats([]);
        setKeyLabels([]);
        if (type === '15') {
            setGameName('lotofacil');
        } else if (type === '6' && gameName !== 'eurodreams' && gameName !== 'megasena') {
            setGameName('eurodreams');
        } else if (type === '5' && gameName !== 'totoloto' && gameName !== 'euromilhoes') {
            setGameName('euromilhoes');
        }

        const newMax = type === '15' ? 25 : (type === '5' ? 25 : 36);
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
                const n = gameType === '6' ? 6 : 5;
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
        } else if (mode === 'chave_tipo') {
            const minReq = gameType === '15' ? 15 : (gameType === '6' ? 6 : 5);
            if (selectedNumbers.length < minReq) return;
            setIsGenerating(true);
            try {
                const res = generateChaveTipoKeys(selectedNumbers, gameName, chaveTipoCount, previousDraw);
                setGeneratedKeys(res.keys);
                setKeyLabels(res.keyLabels);
                setMagicSquare([]);
                setNumberStats([]);
            } catch (e) {
                console.error('Chave Tipo generation error:', e);
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
        } else if (mode === 'cirurgico') {
            if (selectedNumbers.length < 5) return;
            setIsGenerating(true);
            try {
                const keys = generateSurgicalKeys(selectedNumbers, surgicalSignature, surgicalCount);
                setGeneratedKeys(keys.map(k => ({
                    numbers: k.numbers,
                    stars: [],
                    strategy: `Anatomia ${k.signature} • Score ${k.harmonicScore}%`
                })));
                setKeyLabels(keys.map(k => `Anatomia ${k.signature} • Score ${k.harmonicScore}%`));
                setMagicSquare([]);
                setNumberStats([]);
            } catch (e) {
                console.error('Surgical generation error:', e);
            } finally {
                setIsGenerating(false);
            }
        } else if (mode === 'classic') {
            if (selectedNumbers.length < 5) return;
            setIsGenerating(true);
            try {
                const worker = new Worker(new URL('./wheeling.worker.ts', import.meta.url));
                worker.postMessage({
                    numbers: selectedNumbers,
                    match: guarantee.match,
                    ifMatch: guarantee.ifMatch,
                    ticketSize: gameType === '6' ? 6 : 5
                });

                worker.onmessage = (e) => {
                    const { success, keys: workerKeys, error } = e.data;
                    if (success) {
                        setGeneratedKeys(workerKeys);
                        setIsGenerating(false);
                        worker.terminate();
                    } else {
                        console.error('Worker Error:', error || 'Unknown');
                        setIsGenerating(false);
                    }
                };

                worker.onerror = (err) => {
                    console.error('Worker crash:', err);
                    setIsGenerating(false);
                    worker.terminate();
                };
            } catch (e) {
                console.error('Classic generation error:', e);
                setIsGenerating(false);
            }
        }
    };

    // Auto-recalculate for instant feedback in interactive modes
    useEffect(() => {
        if (mode === 'magic' && selectedNumbers.length >= minNumbers) {
            const n = gameType === '6' ? 6 : 5;
            const result = generateMagicSquareWithDetails(selectedNumbers, [], n);
            setGeneratedKeys(result.keys);
            setKeyLabels(result.keyLabels);
            setMagicSquare(result.square);
            setNumberStats(result.numberStats || []);
        } else if (mode === 'chave_tipo' && selectedNumbers.length >= (gameType === '15' ? 15 : (gameType === '6' ? 6 : 5))) {
            const res = generateChaveTipoKeys(selectedNumbers, gameName, gameType === '15' ? 8 : 10);
            setGeneratedKeys(res.keys);
            setKeyLabels(res.keyLabels);
            setMagicSquare([]);
            setNumberStats([]);
        } else if (mode === 'cirurgico' && selectedNumbers.length >= 5) {
            const surgicalRes = generateSurgicalKeys(selectedNumbers, surgicalSignature, surgicalCount);
            setGeneratedKeys(surgicalRes.map((k, i) => ({
                numbers: k.numbers,
                stars: [],
                label: `Cirúrgica #${i + 1} (${k.signature || '1-1-1-1-1'})`
            } as FullKey)));
            setKeyLabels(surgicalRes.map((k, i) => `Cirúrgica #${i + 1} (${k.signature || '1-1-1-1-1'} • Harmonia: ${k.harmonicScore}%)`));
            setMagicSquare([]);
            setNumberStats([]);
        } else if (mode === 'magic' && selectedNumbers.length < minNumbers) {
            setGeneratedKeys([]);
            setMagicSquare([]);
            setNumberStats([]);
            setKeyLabels([]);
        }
    }, [selectedNumbers, mode, gameType, gameName, minNumbers, maxNumbers, chaveTipoCount, previousDraw]);

    const handlePrint = () => {
        window.print();
    };

    const copyToClipboard = (text: string, label: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text);
        }
        alert(`${label} copiada(s) para a área de transferência!`);
    };

    const isBelowMin = mode === 'magic' && selectedNumbers.length < minNumbers;
    const isOverMax = selectedNumbers.length > maxNumbers;
    const canGenerate = mode === 'magic' 
        ? selectedNumbers.length >= minNumbers && selectedNumbers.length <= maxNumbers
        : mode === 'chave_tipo'
            ? selectedNumbers.length >= (gameType === '15' ? 15 : (gameType === '6' ? 6 : 5))
            : selectedNumbers.length >= 5;

    const handlePullSystemNumbers = (pullType: 'direct' | 'mirror' | 'all') => {
        const gameId = gameName.toLowerCase() === 'lotofacil' ? 'lotofacil' : 
                       gameName.toLowerCase() === 'megasena' ? 'megasena' : 
                       gameName.toLowerCase() === 'eurodreams' ? 'eurodreams' : 
                       gameName.toLowerCase() === 'totoloto' ? 'totoloto' : 'euromillions';
        const sys = availableSystems.find(s => s.slug === selectedSystemSlug) || availableSystems[0];
        if (!sys || !sys.predictions) return;

        const fullPool: number[] = sys.predictions[gameId] || [];
        if (fullPool.length === 0) {
            alert(`Ainda não existem previsões disponíveis para ${sys.name} neste jogo.`);
            return;
        }

        const half = gameId === 'eurodreams' ? 20 : gameId === 'megasena' ? 30 : gameId === 'lotofacil' ? 15 : 25;

        let nums: number[] = [];
        if (pullType === 'direct') {
            nums = fullPool.slice(0, half);
        } else if (pullType === 'mirror') {
            nums = fullPool.slice(half).reverse();
        } else {
            nums = [...fullPool];
        }

        setSelectedNumbers(nums);
    };

    const handleCutMatrizBall = (ballNum: number) => {
        if (selectedNumbers.includes(ballNum)) {
            // Cut: remove from selection
            setSelectedNumbers(selectedNumbers.filter(n => n !== ballNum));
        } else {
            // Re-add to selection
            if (selectedNumbers.length < maxNumbers) {
                setSelectedNumbers([...selectedNumbers, ballNum]);
            }
        }
    };

    const activeSystem = availableSystems.find(s => s.slug === selectedSystemSlug) || availableSystems[0];

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Screen View */}
            <div className="p-4 md:p-8 print:hidden max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2 tracking-tight">
                                <span>🎲</span> Gerador de Chaves Inteligente (GCI)
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Hub Central de Execução: receba números e estrelas e desdobre com métodos inteligentes e anatómicos.
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                                    <span>🔢</span> 1. Gerador de Números
                                </span>
                                <Link
                                    href="/wheeling/stars"
                                    className="px-3 py-1 rounded-xl bg-surface-2 hover:bg-surface-3 text-muted-foreground hover:text-foreground text-xs font-bold transition-all border border-border flex items-center gap-1.5"
                                >
                                    <span>⭐</span> 2. Desdobrador de Estrelas →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Game Type Switcher */}
                    <div className="flex flex-wrap items-center p-1.5 rounded-2xl bg-surface-2 border border-border self-start sm:self-auto shadow-sm gap-1">
                        {WHEELING_GAMES.map(g => {
                            const isSelected = gameName.toLowerCase() === g.key;
                            return (
                                <button
                                    key={g.key}
                                    onClick={() => handleSelectGame(g.key)}
                                    className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-1.5 ${
                                        isSelected
                                            ? g.type === '15'
                                                ? 'bg-pink-600 text-white shadow-md'
                                                : g.type === '6'
                                                    ? 'bg-amber-600 text-white shadow-md'
                                                    : 'bg-purple-600 text-white shadow-md'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <span>{g.icon}</span>
                                    <span>{g.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="mb-8 rounded-3xl border border-border bg-card/60 p-5 md:p-7 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <h3 className="text-base md:text-lg font-bold">Escolha o Método de Desdobramento</h3>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-2 text-muted-foreground">
                            {(() => {
                                const activeG = WHEELING_GAMES.find(g => g.key === gameName.toLowerCase()) || WHEELING_GAMES[0];
                                return `${activeG.name} (${activeG.type === '15' ? 'Chaves de 15' : activeG.type === '6' ? 'Grelha 6x6 • Chaves de 6' : 'Grelha 5x5 • Chaves de 5'} • ${activeG.maxBalls} Bolas)`;
                            })()}
                        </span>
                    </div>

                    {/* MÉTODOS CONDICIONAIS: 3 MÉTODOS DE ELITE */}
                    <div className={`grid gap-4 ${gameType === '15' ? 'sm:grid-cols-2 max-w-4xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto'}`}>
                        {/* 1. Cubo Interativo (Apenas para 5 e 6 números - escondido na Lotofácil para eliminar ruído) */}
                        {gameType !== '15' && (
                            <button
                                onClick={() => setMode('magic')}
                                className={`p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${
                                    mode === 'magic'
                                        ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 shadow-[0_0_25px_rgba(168,85,247,0.15)] ring-2 ring-purple-500/20'
                                        : 'border-border hover:border-purple-300 dark:hover:border-purple-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                                }`}
                            >
                                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider">
                                    Lado a Lado
                                </div>
                                <div className="font-black text-base sm:text-lg mb-1 flex items-center gap-2 text-purple-950 dark:text-purple-100">
                                    <span>✨</span> Cubo Interativo
                                </div>
                                <div className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-2">
                                    {gameType === '6' ? '14 chaves (Grelha 6x6)' : '12 chaves (Grelha 5x5)'}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Distribuição de ressonância com iluminação simultânea do cubo e das chaves.
                                </p>
                                <div className="mt-3 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                                    ✓ Aceita de {minNumbers} a {maxNumbers} números
                                </div>
                            </button>
                        )}

                        {/* 2. Geração Cirúrgica Anatómica (Fusão Chave Tipo + Motor Edison) */}
                        <button
                            onClick={() => setMode('chave_tipo')}
                            className={`p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${
                                mode === 'chave_tipo'
                                    ? 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/30 shadow-[0_0_25px_rgba(236,72,153,0.15)] ring-2 ring-pink-500/20'
                                    : 'border-border hover:border-pink-300 dark:hover:border-pink-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                            }`}
                        >
                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-pink-600 text-white text-[10px] font-black uppercase tracking-wider">
                                Anatomia Real
                            </div>
                            <div className="font-black text-base sm:text-lg mb-1 flex items-center gap-2 text-pink-950 dark:text-pink-100">
                                <span>⚡</span> Geração Cirúrgica Anatómica
                            </div>
                            <div className="text-xs font-bold text-pink-700 dark:text-pink-300 mb-2">
                                {gameType === '15' 
                                    ? 'Chaves de 15 Bolas (Anatomia Lotofácil)' 
                                    : `Filtros Anatómicos & Harmónicos do ${gameName.toUpperCase()}`}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {gameType === '15' 
                                    ? 'Aplica as leis de 8-10 repetentes T-1, 7-9 ímpares e moldura 9-11.' 
                                    : 'Partições de dezenas 1-1-1-1-1, paridade real, quotas de primos e repetentes.'}
                            </p>
                            <div className="mt-3 text-[11px] font-semibold text-pink-600 dark:text-pink-400">
                                ✓ Seletor de 4 a 20 chaves
                            </div>
                        </button>

                        {/* 3. Coberturas Combinatórias */}
                        <button
                            onClick={() => setMode('classic')}
                            className={`p-5 rounded-2xl border-2 transition-all text-left group ${
                                mode === 'classic'
                                    ? 'border-foreground bg-surface-2 text-foreground ring-2 ring-foreground/20'
                                    : 'border-border hover:border-foreground/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                            }`}
                        >
                            <div className="font-bold text-base sm:text-lg mb-1 flex items-center gap-2">
                                <span>📐</span> Coberturas Combinatórias
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                Garantia Matemática Canónica
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Garantia 100% comprovada por bitmasks de 4 se 5 ou 3 se 5.
                            </p>
                            <div className="mt-3 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                ✓ Teto de segurança: máx. 16 números
                            </div>
                        </button>
                    </div>

                    {/* DNA ANATÓMICO DA CHAVE TIPO (QUANDO MODO CHAVE_TIPO SELECIONADO) */}
                    {mode === 'chave_tipo' && (
                        <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-pink-500/10 border border-pink-500/30 animate-in fade-in duration-300">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">🧬</span>
                                <h4 className="text-sm font-black text-pink-700 dark:text-pink-300 uppercase tracking-wider">
                                    Constituição da Chave Tipo — {WHEELING_GAMES.find(g => g.key === gameName.toLowerCase())?.name.toUpperCase() || gameName.toUpperCase()}
                                </h4>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                                {gameName.toLowerCase() === 'lotofacil' ? (
                                    <>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Dimensão do Jogo</span>
                                            <strong className="text-pink-600 dark:text-pink-400 text-sm font-black">15 Números</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">Volante de 1 a 25</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Paridade do Jogo</span>
                                            <strong className="text-pink-600 dark:text-pink-400 text-sm font-black">8I / 7P ou 7I / 8P</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">57% dos concursos</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Altos / Baixos</span>
                                            <strong className="text-pink-600 dark:text-pink-400 text-sm font-black">8B / 7A ou 7B / 8A</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">1-13 (B) vs 14-25 (A)</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Moldura vs Miolo</span>
                                            <strong className="text-pink-600 dark:text-pink-400 text-sm font-black">9 a 11 na Moldura</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">4 a 6 no Miolo (Grelha 5x5)</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Repetentes T-1</span>
                                            <strong className="text-pink-600 dark:text-pink-400 text-sm font-black">8 a 10 Bolas</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">80%+ dos concursos</span>
                                        </div>
                                    </>
                                ) : gameName.toLowerCase() === 'euromilhoes' ? (
                                    <>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Dimensão do Jogo</span>
                                            <strong className="text-purple-600 dark:text-purple-400 text-sm font-black">5 Bolas + 2 Estrelas</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">1 a 50 (Estrelas 1 a 12)</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Paridade do Jogo</span>
                                            <strong className="text-purple-600 dark:text-purple-400 text-sm font-black">3I / 2P ou 2I / 3P</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">65% dos concursos</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Dispersão por Dezenas</span>
                                            <strong className="text-purple-600 dark:text-purple-400 text-sm font-black">4 a 5 Dezenas</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">Sem aglomerações</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Repetentes Concurso T-1</span>
                                            <strong className="text-purple-600 dark:text-purple-400 text-sm font-black">0 a 1 Bola</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">Rotatividade elevada</span>
                                        </div>
                                    </>
                                ) : gameName.toLowerCase() === 'totoloto' ? (
                                    <>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Dimensão do Jogo</span>
                                            <strong className="text-blue-600 dark:text-blue-400 text-sm font-black">5 Bolas + 1 Sorte</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">1 a 49 (Sorte 1 a 13)</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Paridade do Jogo</span>
                                            <strong className="text-blue-600 dark:text-blue-400 text-sm font-black">3I / 2P ou 2I / 3P</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">66% dos concursos</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Dispersão por Dezenas</span>
                                            <strong className="text-blue-600 dark:text-blue-400 text-sm font-black">3 a 4 Dezenas</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">Distribuição modular</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Repetentes Concurso T-1</span>
                                            <strong className="text-blue-600 dark:text-blue-400 text-sm font-black">0 a 1 Bola</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">Rotatividade elevada</span>
                                        </div>
                                    </>
                                ) : gameName.toLowerCase() === 'eurodreams' ? (
                                    <>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Dimensão do Jogo</span>
                                            <strong className="text-purple-600 dark:text-purple-400 text-sm font-black">6 Bolas + 1 Sonho</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">1 a 40 (Sonho 1 a 5)</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Paridade do Jogo</span>
                                            <strong className="text-purple-600 dark:text-purple-400 text-sm font-black">3I / 3P ou 4I / 2P</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">83% dos concursos</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Altos / Baixos</span>
                                            <strong className="text-purple-600 dark:text-purple-400 text-sm font-black">3B / 3A ou 4B / 2A</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">1-20 (B) vs 21-40 (A)</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Dispersão por Dezenas</span>
                                            <strong className="text-purple-600 dark:text-purple-400 text-sm font-black">3 a 4 Dezenas</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">Equilíbrio de décadas</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Repetentes T-1</span>
                                            <strong className="text-purple-600 dark:text-purple-400 text-sm font-black">0 a 2 Bolas</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">Padrão do jogo</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Dimensão do Jogo</span>
                                            <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-black">6 Bolas (1 a 60)</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">Mega-Sena Clássica</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Paridade do Jogo</span>
                                            <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-black">3I / 3P ou 4I / 2P</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">81% dos concursos</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Altos / Baixos</span>
                                            <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-black">3B / 3A ou 4B / 2A</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">1-30 (B) vs 31-60 (A)</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Quadrantes do Volante</span>
                                            <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-black">3 a 4 Quadrantes</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">Distribuição em 4 quadrantes</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-card/60 border border-border">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Repetentes T-1</span>
                                            <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-black">0 a 1 Bola</strong>
                                            <span className="text-[10px] text-muted-foreground block mt-0.5">Rara repetição de 2+</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* SELETOR DE QUANTIDADE DE CHAVES CHAVE TIPO */}
                            <div className="mt-4 pt-3.5 border-t border-pink-500/20 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-pink-800 dark:text-pink-300 uppercase tracking-wide">
                                        ⚡ Quantidade de Chaves a Desdobrar:
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                        (Cada chave cumpre as 4 leis anatómicas)
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {[4, 8, 12, 16, 20].map(cnt => (
                                        <button
                                            key={cnt}
                                            onClick={() => setChaveTipoCount(cnt)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                                chaveTipoCount === cnt
                                                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 scale-105'
                                                    : 'bg-surface-2 hover:bg-surface-3 text-muted-foreground hover:text-foreground border border-border/60'
                                            }`}
                                        >
                                            {cnt} Chaves
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========================================================================= */}
                {/* INTELLIGENCE HUB: PUXAR SISTEMAS & CONSELHOS ESTATÍSTICOS                 */}
                {/* ========================================================================= */}
                <div className="bg-card/70 backdrop-blur-sm border border-border p-5 md:p-6 rounded-3xl shadow-sm mb-6 space-y-5">
                    {/* Toolbar de Carregamento de Sistemas */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                <Download className="w-4 h-4" />
                            </span>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wide text-foreground">
                                    Puxar Números Sugeridos de Qualquer Sistema
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Importe as previsões oficiais ordenadas por importância para o jogo atual.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Selector do Sistema */}
                            <select
                                value={selectedSystemSlug}
                                onChange={(e) => setSelectedSystemSlug(e.target.value)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-1 border border-border/70 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                            >
                                {availableSystems.map((s) => (
                                    <option key={s.slug} value={s.slug}>
                                        {s.name} ({s.familyName.split(' ')[0]})
                                    </option>
                                ))}
                            </select>

                            {/* Modos de Puxada: Sugeridos | Anti-Sistema | Ambos */}
                            <div className="inline-flex rounded-xl p-1 bg-surface-2/80 border border-border/50 text-[11px] font-bold">
                                <button
                                    onClick={() => handlePullSystemNumbers('direct')}
                                    className="px-2.5 py-1 rounded-lg hover:bg-surface-1 text-foreground transition-all"
                                    title="Carregar apenas a metade superior de bolas recomendadas pelo sistema"
                                >
                                    Sugeridos
                                </button>
                                <button
                                    onClick={() => handlePullSystemNumbers('mirror')}
                                    className="px-2.5 py-1 rounded-lg hover:bg-surface-1 text-foreground transition-all"
                                    title="Carregar o anti-sistema (as bolas menos prováveis, invertidas por força)"
                                >
                                    Anti-Sistema
                                </button>
                                <button
                                    onClick={() => handlePullSystemNumbers('all')}
                                    className="px-2.5 py-1 rounded-lg hover:bg-surface-1 text-foreground transition-all bg-purple-600 text-white shadow-xs"
                                    title="Carregar todo o volante ordenado por importância para você podar"
                                >
                                    Todos (Cortar)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CONSELHO FACTUAL DA MATRIZ DE CORTE (INDICAÇÃO TÉRMICA & AUDITORIA) */}
                    <div className="mt-4">
                        <MatrizConselhoCard
                            gameKey={gameName.toLowerCase() === 'euromilhoes' ? 'euromillions' : gameName.toLowerCase()}
                            gameName={WHEELING_GAMES.find(g => g.key === gameName)?.name || gameName}
                            systemName={activeSystem?.name || 'Volante Atual'}
                            suggestedNumbers={selectedNumbers}
                            onToggleBall={handleCutMatrizBall}
                        />
                    </div>
                </div>

                {/* NUMBER MANAGEMENT (SELECTION & PRIORITY ORDER) */}
                <div className="bg-card/70 backdrop-blur-sm border border-border p-5 md:p-6 rounded-3xl shadow-sm mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 className="text-base font-black flex items-center gap-2 uppercase tracking-wide">
                                <span>🏆</span> Pool de Números por Ordem de Importância (#1 a #{selectedNumbers.length || 0})
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Números recebidos de ferramentas ou selecionados manualmente. A posição <strong>#1</strong> é a âncora principal da aposta.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                                isOverMax
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40 ring-1 ring-amber-500/30'
                                    : isBelowMin
                                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                            }`}>
                                {selectedNumbers.length} / {maxNumbers} Selecionados {isOverMax && `(Corte ${selectedNumbers.length - maxNumbers} bolas)`}
                            </span>
                            {selectedNumbers.length > 0 && (
                                <button
                                    onClick={() => setSelectedNumbers([])}
                                    className="text-xs text-muted-foreground hover:text-red-500 font-bold transition-colors px-2 py-1"
                                >
                                    Limpar Tudo
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Selected Badges */}
                    {selectedNumbers.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-border rounded-2xl text-xs md:text-sm text-muted-foreground">
                            Nenhum número selecionado. Clique no quadro abaixo para adicionar números por ordem de força ou envie de qualquer ferramenta.
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 custom-scrollbar bg-surface-1/40 rounded-2xl border border-border/50 mb-4">
                            {selectedNumbers.map((num, idx) => (
                                <div
                                    key={num}
                                    onMouseEnter={() => setHoveredNumber(num)}
                                    onMouseLeave={() => setHoveredNumber(undefined)}
                                    className={`group relative flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-xl border text-xs font-bold transition-all select-none ${
                                        idx === 0
                                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400/30 scale-105'
                                            : idx < (gameType === '15' ? 15 : gameType === '5' ? 9 : 12)
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
                                        className="opacity-60 hover:opacity-100 hover:text-red-500 p-0.5 rounded transition-opacity"
                                        title="Remover número"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Number Picker Grid */}
                    <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-bold inline-flex items-center gap-1 py-1">
                            <span>✏️ Abrir / Fechar Seletor Manual de Números (1 a {maxPoolBalls})</span>
                        </summary>
                        <div className="grid grid-cols-10 gap-1.5 sm:gap-2 max-w-xl mt-3 p-3 bg-surface-1/50 rounded-2xl border border-border/60">
                            {Array.from({ length: maxPoolBalls }, (_, i) => i + 1).map(num => {
                                const isSelected = selectedNumbers.includes(num);
                                const rank = selectedNumbers.indexOf(num);

                                return (
                                    <button
                                        key={num}
                                        onClick={() => toggleNumber(num)}
                                        className={`relative w-8 h-8 sm:w-10 sm:h-10 flex flex-col items-center justify-center rounded-xl font-black text-xs transition-all ${
                                            isSelected
                                                ? rank === 0
                                                    ? 'bg-amber-400 text-slate-950 border-2 border-amber-300 shadow-md scale-105 ring-2 ring-amber-400/40'
                                                    : 'bg-purple-600 text-white shadow-sm'
                                                : 'bg-surface-2 hover:bg-surface-3 text-muted-foreground hover:text-foreground border border-border/40'
                                        }`}
                                    >
                                        <span>{num}</span>
                                        {isSelected && (
                                            <span className="text-[8px] font-mono leading-none opacity-80">#{rank + 1}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </details>
                </div>

                {/* ========================================================================= */}
                {/* COCKPIT RESULTADOS: LADO A LADO SE MODO CUBO MÁGICO                       */}
                {/* ========================================================================= */}
                {mode === 'magic' && magicSquare.length > 0 ? (
                    <div className="bg-card/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-purple-200 dark:border-purple-900/50 shadow-lg animate-in fade-in duration-500">
                        {/* Header do Cockpit */}
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-border">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
                                    <span>✨</span> Quadrado Mágico &amp; Chaves Harmónicas Lado a Lado
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-purple-600 dark:text-purple-400">
                                    {generatedKeys.length} Chaves • Visão Simultânea
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Passe o cursor sobre qualquer chave à direita para iluminar o traço no cubo à esquerda, ou sobre uma bola no cubo para a destacar nas chaves.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        const text = generatedKeys.map((k, i) => `Chave #${i + 1} (${keyLabels[i] || ''}): ${k.numbers.join(', ')}`).join('\n');
                                        copyToClipboard(text, 'Todas as Chaves');
                                    }}
                                    className="px-3.5 py-2 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-black transition-all hover:bg-purple-200"
                                >
                                    📋 Copiar
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-black transition-all"
                                >
                                    🖨️ Imprimir
                                </button>
                            </div>
                        </div>

                        {/* COCKPIT GRID: 2 COLUNAS LADO A LADO */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* COLUNA ESQUERDA: O CUBO MÁGICO (COMPACTO) */}
                            <div className="lg:col-span-5 xl:col-span-5 sticky top-6">
                                <MagicSquareDisplay 
                                    square={magicSquare} 
                                    highlightedKey={hoveredKey} 
                                    hoveredNumber={hoveredNumber}
                                    numberStats={numberStats}
                                    compact={true}
                                />
                            </div>

                            {/* COLUNA DIREITA: AS CHAVES GERADAS */}
                            <div className="lg:col-span-7 xl:col-span-7 space-y-2.5 max-h-[720px] overflow-y-auto pr-2 custom-scrollbar">
                                {generatedKeys.map((key, idx) => (
                                    <div
                                        key={idx}
                                        onMouseEnter={() => setHoveredKey(idx)}
                                        onMouseLeave={() => setHoveredKey(undefined)}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                                            hoveredKey === idx
                                                ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-500 shadow-md ring-2 ring-purple-500/20 scale-[1.01]'
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
                                                                ? 'bg-amber-400 text-slate-950 scale-110 shadow-md ring-2 ring-amber-400/50 z-10'
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
                                            className="ml-auto p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs transition-colors shrink-0"
                                            title="Copiar Chave"
                                        >
                                            📋
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* OUTROS MODOS OU AGUARDANDO NÚMEROS */
                    <div className="bg-card/70 backdrop-blur-sm p-6 rounded-3xl border border-border shadow-sm">
                        {generatedKeys.length > 0 ? (
                            <div>
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-border">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-black text-foreground">
                                            {generatedKeys.length} Chaves Geradas ({mode === 'chave_tipo' ? 'Chave Tipo' : mode === 'smart5' ? 'Smart 5' : mode === 'cirurgico' ? 'Cirúrgico' : 'Clássico'})
                                        </h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {generatedKeys.length} combinações geradas prontas para registo no boletim.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const text = generatedKeys.map((k, i) => `Chave #${i + 1}: ${k.numbers.join(', ')}`).join('\n');
                                                copyToClipboard(text, 'Todas as Chaves');
                                            }}
                                            className="px-3.5 py-2 bg-surface-2 hover:bg-surface-3 text-foreground rounded-xl text-xs font-black transition-all border border-border"
                                        >
                                            📋 Copiar
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-black transition-all"
                                        >
                                            🖨️ Imprimir
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
                                    {generatedKeys.map((key, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/60 bg-surface-1/50 hover:border-border transition-all"
                                        >
                                            <span className="text-zinc-400 font-mono text-xs w-6 text-center font-bold">
                                                #{idx + 1}
                                            </span>

                                            {mode === 'chave_tipo' && (key as any).anatomy?.badges ? (
                                                <div className="flex flex-wrap items-center gap-1.5 shrink-0 max-w-md">
                                                    {(key as any).anatomy.badges.map((b: any, bIdx: number) => (
                                                        <span
                                                            key={bIdx}
                                                            title={b.title}
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black tracking-tight ${
                                                                b.ok
                                                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                                            }`}
                                                        >
                                                            {b.text}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                keyLabels[idx] && (
                                                    <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400 max-w-xs shrink-0">
                                                        {keyLabels[idx]}
                                                    </span>
                                                )
                                            )}

                                            <div className="flex flex-wrap gap-1.5 ml-auto sm:ml-0">
                                                {key.numbers.map(n => (
                                                    <span
                                                        key={n}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl font-black text-xs bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-border shadow-sm"
                                                    >
                                                        {n}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => copyToClipboard(key.numbers.join(', '), `Chave #${idx + 1}`)}
                                                className="ml-auto p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs transition-colors shrink-0"
                                                title="Copiar Chave"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="min-h-[260px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-3xl bg-card/30">
                                <span className="text-4xl mb-3">🔮</span>
                                <h4 className="text-base font-bold text-foreground">Aguardando Seleção de Números</h4>
                                <p className="text-xs text-muted-foreground max-w-md mt-1">
                                    {isBelowMin
                                        ? `Selecione pelo menos ${minNumbers} números por ordem de importância para desbloquear as chaves do ${mode === 'magic' ? 'Quadrado Mágico' : 'Desdobramento'}.`
                                        : 'Escolha os seus números ou envie-os a partir dos rankings para calcular instantaneamente.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Print View */}
            <div className="hidden print:block p-8 bg-white text-black">
                <div className="border-b border-gray-300 pb-4 mb-6">
                    <h1 className="text-2xl font-bold">Números Mágicos - Desdobramento Oficial</h1>
                    <p className="text-sm text-gray-600">
                        Modo: {mode} | Jogo: {gameName.toUpperCase()} | Total: {generatedKeys.length} Chaves
                    </p>
                    <p className="text-sm text-gray-600">
                        Data: {new Date().toLocaleDateString()} | Total: {generatedKeys.length} Chaves
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {generatedKeys.map((key, idx) => (
                        <div key={idx} className="border border-gray-300 p-4 rounded flex items-center justify-between">
                            <span className="font-mono text-sm text-gray-500 mr-2">#{idx + 1}</span>
                            <div className="flex gap-2 flex-wrap">
                                {key.numbers.map(n => (
                                    <span key={n} className="font-bold text-lg w-8 text-center">{n}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ResponsibleGamingWarning />
        </div>
    );
}
