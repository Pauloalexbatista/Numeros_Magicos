'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GUARANTEE_OPTIONS, STAR_GUARANTEE_OPTIONS, GuaranteeOption, FullKey, generateSmart5Keys, generateMagicSquareWithDetails, MagicSquareResult, generateSplitSystem } from '@/services/wheeling';
import { BackButton, LogicExplanation, ResponsibleGamingWarning } from '@/components/ui';
import { MagicSquareDisplay } from '@/components/MagicSquareDisplay';

type WheelingMode = 'classic' | 'smart5' | 'magic25' | 'magic36';
type ResultViewMode = 'combined' | 'split';

const CLASSIC_MAX_NUMBERS = 20;
const CLASSIC_MAX_STARS = 10;

export default function WheelingPage() {
    const searchParams = useSearchParams();

    const [mode, setMode] = useState<WheelingMode>('smart5'); // Default to Smart 5-Key
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [guarantee, setGuarantee] = useState<GuaranteeOption>(GUARANTEE_OPTIONS[2]); // Default: 3 if 5
    const [generatedKeys, setGeneratedKeys] = useState<FullKey[]>([]);
    const [generatedNumberKeys, setGeneratedNumberKeys] = useState<number[][]>([]);
    const [generatedStarKeys, setGeneratedStarKeys] = useState<number[][]>([]);
    const [keyLabels, setKeyLabels] = useState<string[]>([]);
    const [hoveredKey, setHoveredKey] = useState<number | undefined>(undefined);
    const [magicSquare, setMagicSquare] = useState<number[][]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Load numbers from URL parameters
    useEffect(() => {
        const numbersParam = searchParams?.get('numbers');

        if (numbersParam) {
            const nums = numbersParam.split(',').map(n => parseInt(n.trim())).filter(n => n >= 1 && n <= 60);
            setSelectedNumbers(nums.slice(0, 36)); // Max 36
        }
    }, [searchParams]);

    const toggleNumber = (num: number) => {
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(selectedNumbers.filter(n => n !== num));
        } else {
            const limit = mode === 'magic25' ? 25 : mode === 'magic36' ? 36 : 36;
            if (selectedNumbers.length >= limit) return;
            setSelectedNumbers([...selectedNumbers, num]);
        }
    };



    const handleGenerate = async () => {
        if (selectedNumbers.length < 5) return;

        setIsGenerating(true);
        setGeneratedKeys([]);
        setGeneratedNumberKeys([]);
        setGeneratedStarKeys([]);
        setKeyLabels([]);

        try {
            // Only handle numbers now - stars have their own page
            if (mode === 'smart5') {
                const keys = generateSmart5Keys(selectedNumbers, []);
                setGeneratedKeys(keys);
                setIsGenerating(false);
            } else if (mode === 'magic25') {
                if (selectedNumbers.length === 25) {
                    const result = generateMagicSquareWithDetails(selectedNumbers, []);
                    setGeneratedKeys(result.keys);
                    setKeyLabels(result.keyLabels);
                    setMagicSquare(result.square);
                } else {
                    alert('O Quadrado de Marte requer exatamente 25 números!');
                }
                setIsGenerating(false);
            } else if (mode === 'magic36') {
                if (selectedNumbers.length === 36) {
                    const result = generateMagicSquareWithDetails(selectedNumbers, []);
                    setGeneratedKeys(result.keys);
                    setKeyLabels(result.keyLabels);
                    setMagicSquare(result.square);
                } else {
                    alert('O Quadrado do Sol requer exatamente 36 números!');
                }
                setIsGenerating(false);
            } else {
                    
                if (selectedNumbers.length > CLASSIC_MAX_NUMBERS) {
                    alert(`O modo clássico está limitado a ${CLASSIC_MAX_NUMBERS} números. Tente o modo Inteligente ou Quadrado Mágico.`);
                    setIsGenerating(false);
                    return;
                }

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
                        alert('Erro ao gerar chaves.');
                    }
                };
                worker.postMessage({
                    numbers: selectedNumbers,
                    stars: [],
                    guarantee,
                    starGuarantee: STAR_GUARANTEE_OPTIONS[0]
                });
            }
        } catch (e) {
            console.error('Generation Error:', e);
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Simple visual feedback could be added here if we had a toast system
            // For now, we'll just assume it works or use a temporary state
            console.log(`Copied ${label} to clipboard`);
        });
    };

    const copyAll = (keys: number[][], type: 'Números' | 'Estrelas') => {
        const text = keys.map((k, i) => `${type} #${i + 1}: ${k.join(', ')}`).join('\n');
        copyToClipboard(text, `Todas as ${type}`);
    };

    const costPerKey = 2.50;
    const totalCost = generatedKeys.length * costPerKey;

    const getModeDescription = () => {
                switch (mode) {
            case 'smart5':
                return '5 chaves otimizadas (1 boletim) - SEM garantias matemáticas';
            case 'magic25':
                return '12 chaves baseadas no Quadrado de Marte 5x5 - SEM garantias matemáticas';
            case 'magic36':
                return '14 chaves baseadas no Quadrado do Sol 6x6 - SEM garantias matemáticas';
            case 'classic':
                return 'Desdobramento clássico com garantias matemáticas';
        }
    };

    return (
        <div className="min-h-screen bg-surface-1 text-foreground font-[family-name:var(--font-geist-sans)]">
            {/* Header - Hidden on Print */}
            <div className="p-4 md:p-8 print:hidden">
                <div className="w-full">
                    <div className="flex items-center gap-4 mb-8">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>🎟️</span> Desdobramentos de Números
                            </h1>
                            <p className="text-muted-foreground">
                                Jogue com mais números por uma fração do preço.
                            </p>
                        </div>
                    </div>

                    {/* Mode Selector */}
                    <div className="mb-8 rounded-2xl border border-border bg-surface-1/60 p-6 shadow-sm backdrop-blur-sm">
                        <h3 className="mb-4 text-lg font-bold">Escolha o Modo de Desdobramento</h3>
                        <div className="grid gap-4 md:grid-cols-3">
                                                            <button
                                    onClick={() => setMode('magic25')}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left group
                                        ${mode === 'magic25'
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20'
                                            : 'border-border hover:border-purple-300 dark:hover:border-purple-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                        }`}
                                >
                                    <div className="font-bold text-lg mb-1 flex items-center gap-2">
                                        <span className="text-xl">🔮</span> Quadrado de Marte
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-2">
                                        12 chaves (5x5)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-500 mt-auto">
                                        <span className="text-sm">⚠️</span> Sem garantias matemáticas
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        ✨ Requer exatamente 25 números
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => setMode('magic36')}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left group
                                        ${mode === 'magic36'
                                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500/20'
                                            : 'border-border hover:border-yellow-300 dark:hover:border-yellow-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                        }`}
                                >
                                    <div className="font-bold text-lg mb-1 flex items-center gap-2">
                                        <span className="text-xl">☀️</span> Quadrado do Sol
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-2">
                                        14 chaves (6x6)
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-500 mt-auto">
                                        <span className="text-sm">⚠️</span> Sem garantias matemáticas
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        ✨ Requer exatamente 36 números
                                    </div>
                                </button>

                            <button
                                onClick={() => setMode('classic')}
                                className={`rounded-lg border-2 p-4 text-left transition-all ${mode === 'classic'
                                    ? 'border-foreground bg-surface-2 text-foreground'
                                    : 'border-border hover:border-foreground/60'
                                    }`}
                            >
                                <div className="mb-1 text-lg font-bold">🎯 Clássico</div>
                                <div className="text-sm text-muted-foreground">
                                    Desdobramento com garantias
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    ✅ Garantias matemáticas
                                </div>
                            </button>
                        </div>
                        <div className="mt-4 rounded-lg border border-border bg-surface-1/60 p-3 text-sm text-foreground">
                            <strong>Modo atual:</strong> {getModeDescription()}
                        </div>
                    </div>

                    {/* Magic Square Visualization moved to the bottom */}

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column: Selection */}
                        <div className="space-y-8">
                            {/* Number Selection */}
                            <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transition-all duration-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">1. Escolha os Números (Pool)</h3>
                                    <span className="text-sm font-mono bg-surface-2 text-foreground px-2 py-1 rounded">
                                        {selectedNumbers.length}/{mode === 'magic25' ? 25 : mode === 'magic36' ? 36 : 36}
                                    </span>
                                </div>
                                {mode === 'magic25' && selectedNumbers.length !== 25 && (
                                    <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-sm text-purple-700 dark:text-purple-300">
                                        ✨ O Quadrado de Marte requer exatamente 25 números
                                    </div>
                                )}
                                {mode === 'magic36' && selectedNumbers.length !== 36 && (
                                    <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-700 dark:text-yellow-300">
                                        ✨ O Quadrado do Sol requer exatamente 36 números
                                    </div>
                                )}
                                <div className="grid grid-cols-10 gap-2">
                                    {Array.from({ length: 60 }, (_, i) => i + 1).map(num => (
                                        <button
                                            key={num}
                                            onClick={() => toggleNumber(num)}
                                            className={`w-8 h-8 flex items-center justify-center rounded text-xs font-semibold transition-all ${selectedNumbers.includes(num)
                                                ? 'bg-blue-600 text-white scale-110 shadow-md'
                                                : 'bg-surface-2 text-foreground text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>



                            {/* Magic Square Explanation */}
                            {(mode === 'magic25' || mode === 'magic36') && (
                                <LogicExplanation title="Propriedades do Quadrado Mágico">
                                    <div className="space-y-4">
                                        <p>
                                            O <strong>Quadrado Mágico</strong> é uma disposição de números (25 ou 36) onde a soma de cada linha, coluna e das diagonais principais é sempre a mesma (a "Constante Mágica"). A posição de cada número depende da sua probabilidade (os mais prováveis cruzam em mais chaves).
                                        </p>
                                        <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                                            <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2">Porquê usar este método?</h4>
                                            <ul className="list-disc list-inside space-y-2 text-sm">
                                                <li><strong>Equilíbrio Matemático:</strong> Garante que os números fortes são distribuídos de forma simétrica.</li>
                                                <li><strong>Cobertura Estruturada:</strong> Ao jogar as 5 linhas, 5 colunas e 2 diagonais, cobre todas as relações espaciais do quadrado.</li>
                                                <li><strong>Fator de Sorte:</strong> Se o "padrão" do sorteio coincidir com uma das estruturas do quadrado, as chances de hits múltiplos numa só chave aumentam.</li>
                                            </ul>
                                        </div>
                                        <p className="text-sm italic text-zinc-500">
                                            Nota: O número #1 (mais forte) é colocado na 4ª linha, 3ª coluna, seguindo o padrão tradicional do <strong>Quadrado de Marte</strong>.
                                        </p>
                                    </div>
                                </LogicExplanation>
                            )}

                            {/* Guarantee Selection - Only for Classic Mode */}
                            {mode === 'classic' && (
                                <div className="space-y-6">
                                    {selectedNumbers.length > 15 && (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 shadow-sm">
                                            <div className="flex gap-3">
                                                <span className="text-xl">⚠️</span>
                                                <div>
                                                    <h4 className="font-bold text-sm">Aviso de Volume</h4>
                                                    <p className="text-xs">
                                                        Selecionou {selectedNumbers.length} números. O sistema clássico pode gerar <strong>milhares de chaves</strong> para manter garantias.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transition-all duration-700">
                                        <h3 className="text-lg font-bold mb-4">3. Escolha as Garantias</h3>

                                        {/* Numbers Guarantee */}
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Números</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {GUARANTEE_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setGuarantee(opt)}
                                                        className={`p-3 rounded-lg border text-left transition-all ${guarantee.id === opt.id
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
                                                            : 'border-border hover:border-indigo-300'
                                                            }`}
                                                    >
                                                        <div className="font-bold text-sm">{opt.label}</div>
                                                        <div className="text-xs text-zinc-500">
                                                            Garante {opt.match} se acertar {opt.ifMatch}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}



                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={selectedNumbers.length < 5 || isGenerating || (mode === 'magic25' && selectedNumbers.length !== 25) || (mode === 'magic36' && selectedNumbers.length !== 36)}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white font-bold rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2"
                            >
                                {isGenerating ? 'A Calcular...' : '🚀 Gerar Chaves Otimizadas'}
                            </button>
                        </div>

                        {/* Right Column: Results */}
                        <div className="space-y-6">
                            {(generatedKeys.length > 0 || generatedNumberKeys.length > 0) ? (
                                <div className="sticky top-8 space-y-6">
                                    <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-border">
                                        <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                    {generatedKeys.length} Chaves Geradas
                                                </h2>
                                                <p className="text-zinc-500">
                                                    Custo Total Estimado: <span className="font-bold text-zinc-900 dark:text-white">{totalCost.toFixed(2)} €</span>
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const text = generatedKeys.map((k, i) => `Chave #${i + 1}: ${k.numbers.join(', ')}`).join('\n');
                                                        copyToClipboard(text, 'Todas as Chaves');
                                                    }}
                                                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold flex items-center gap-2 transition-all hover:scale-105"
                                                >
                                                    📋 Copiar Tudo
                                                </button>
                                                <button
                                                    onClick={handlePrint}
                                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                                >
                                                    🖨️ Imprimir
                                                </button>
                                            </div>
                                        </div>

                                        {/* Disclaimer for non-guaranteed modes */}
                                        {(mode === 'smart5' || (mode === 'magic25' || mode === 'magic36')) && (
                                            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-2 border-amber-200 dark:border-amber-800">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-2xl">⚠️</span>
                                                    <div className="text-sm text-amber-800 dark:text-amber-200">
                                                        <strong>Aviso Importante:</strong> Este modo <strong>NÃO garante prémios</strong>.
                                                        As chaves são geradas usando estratégias inteligentes de distribuição, mas não há garantias matemáticas de cobertura.
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Magic Square Visualization moved outside */}

                                        {/* Results Display */}
                                        <div className="space-y-3 mt-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                            {generatedKeys.map((key, idx) => (
                                                <div
                                                    key={idx}
                                                    onMouseEnter={() => setHoveredKey(idx)}
                                                    onMouseLeave={() => setHoveredKey(undefined)}
                                                    className={`flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border transition-all ${hoveredKey === idx ? 'border-purple-500 shadow-md ring-1 ring-purple-500/20' : 'border-border'}`}
                                                >
                                                    {/* Strategy Label for Smart 5-Key */}
                                                    {mode === 'smart5' && key.strategy && (
                                                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 w-32 shrink-0">
                                                            {key.strategy}
                                                        </span>
                                                    )}

                                                    {/* Key Label for Magic Square */}
                                                    {(mode === 'magic25' || mode === 'magic36') && keyLabels[idx] && (
                                                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 w-24 shrink-0">
                                                            {keyLabels[idx]}
                                                        </span>
                                                    )}
                                                    <span className="text-zinc-400 font-mono text-sm w-6">#{idx + 1}</span>

                                                    {/* Numbers */}
                                                    <div className="flex gap-2">
                                                        {key.numbers.map(n => (
                                                            <span key={n} className="w-8 h-8 flex items-center justify-center bg-card/80 rounded-full font-bold text-zinc-900 dark:text-white shadow-sm border border-border">
                                                                {n}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <button
                                                        onClick={() => copyToClipboard(key.numbers.join(', '), `Chave #${idx + 1}`)}
                                                        className="ml-auto p-2 opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-all"
                                                        title="Copiar Chave"
                                                    >
                                                        📋
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {mode === 'classic' && (
                                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                                                <p>
                                                    <strong>Nota:</strong> Este sistema garante:
                                                </p>
                                                <ul className="list-disc list-inside mt-1 ml-2">
                                                    <li><strong>Números:</strong> {guarantee.match} se acertar {guarantee.ifMatch}</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : !isGenerating && (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-12 border-2 border-dashed border-border rounded-xl">
                                    <span className="text-4xl mb-4">🎟️</span>
                                    <p>Selecione os números e clique em Gerar</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Magic Square Visualization (Full Width - Bottom) */}
                    {(mode === 'magic25' || mode === 'magic36') && magicSquare.length > 0 && (
                        <div className="mt-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                            <MagicSquareDisplay square={magicSquare} highlightedKey={hoveredKey} />
                        </div>
                    )}
                </div>
            </div>

            {/* Print View (Only visible when printing) */}
            <div className="hidden print:block p-8 bg-white text-black">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">As Minhas Chaves - EuroMilhões</h1>
                    <p className="text-sm text-gray-600">
                        Modo: {mode === 'smart5' ? 'Smart 5-Key' : (mode === 'magic25' || mode === 'magic36') ? 'Quadrado Mágico' : 'Clássico'}
                    </p>
                    <p className="text-sm text-gray-600">
                        Sistema: {selectedNumbers.length} Números
                    </p>
                    {mode === 'classic' && (
                        <p className="text-sm text-gray-600">
                            Garantia: {guarantee.label}
                        </p>
                    )}
                    <p className="text-sm text-gray-600">
                        Data: {new Date().toLocaleDateString()} | Custo: {totalCost.toFixed(2)} €
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {generatedKeys.map((key, idx) => (
                        <div key={idx} className="border border-gray-300 p-4 rounded flex items-center justify-between">
                            <div className="flex gap-2">
                                {key.numbers.map(n => (
                                    <span key={n} className="font-bold text-lg w-8 text-center">{n}</span>
                                ))}
                            </div>
                            <div className="w-px h-6 bg-gray-300 mx-2"></div>
                            <div className="flex gap-2">
                                {key.stars.map(s => (
                                    <span key={s} className="font-bold text-lg w-8 text-center text-gray-600">★{s}</span>
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
