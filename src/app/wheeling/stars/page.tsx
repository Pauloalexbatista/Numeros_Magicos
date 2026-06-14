'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BackButton, ResponsibleGamingWarning } from '@/components/ui';

export default function StarsWheelingPage() {
    const searchParams = useSearchParams();
    const [selectedStars, setSelectedStars] = useState<number[]>([]);
    const [generatedKeys, setGeneratedKeys] = useState<number[][]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Load stars from URL parameters
    useEffect(() => {
        const starsParam = searchParams?.get('stars');
        if (starsParam) {
            const stars = starsParam.split(',')
                .map(n => parseInt(n.trim()))
                .filter(n => n >= 1 && n <= 12);
            setSelectedStars(stars.slice(0, 6)); // Max 6
        }
    }, [searchParams]);

    const toggleStar = (num: number) => {
        if (selectedStars.includes(num)) {
            setSelectedStars(selectedStars.filter(n => n !== num));
        } else {
            if (selectedStars.length >= 6) return;
            setSelectedStars([...selectedStars, num]);
        }
    };

    const handleGenerate = () => {
        if (selectedStars.length < 2) return;

        setIsGenerating(true);

        // Simple generation: all combinations of 2 stars
        const keys: number[][] = [];
        for (let i = 0; i < selectedStars.length; i++) {
            for (let j = i + 1; j < selectedStars.length; j++) {
                keys.push([selectedStars[i], selectedStars[j]].sort((a, b) => a - b));
            }
        }

        setGeneratedKeys(keys);
        setIsGenerating(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const copyAll = () => {
        const text = generatedKeys.map((k, i) => `Estrelas #${i + 1}: ${k.join(', ')}`).join('\n');
        navigator.clipboard.writeText(text);
    };

    const costPerKey = 2.50;
    const totalCost = generatedKeys.length * costPerKey;

    return (
        <div className="min-h-screen bg-surface-1 text-foreground font-sans">
            {/* Header - Hidden on Print */}
            <div className="p-4 md:p-8 print:hidden">
                <div className="w-full max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <span>⭐</span> Desdobramentos de Estrelas
                            </h1>
                            <p className="text-muted-foreground">
                                Jogue com mais estrelas por uma fração do preço.
                            </p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column: Selection */}
                        <div className="space-y-8">
                            {/* Star Selection */}
                            <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transition-all duration-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">Escolha as Estrelas (Pool)</h3>
                                    <span className="text-sm font-mono bg-surface-2 text-foreground px-2 py-1 rounded">
                                        {selectedStars.length}/6
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                                        <button
                                            key={num}
                                            onClick={() => toggleStar(num)}
                                            className={`w-12 h-12 flex items-center justify-center rounded-full text-sm font-bold transition-all ${selectedStars.includes(num)
                                                ? 'bg-amber-400 text-amber-900 scale-110 shadow-md'
                                                : 'bg-surface-2 text-foreground text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                }`}
                                        >
                                            ★ {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">ℹ️ Como Funciona</h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                                    <li>• Selecione entre 2 e 6 estrelas</li>
                                    <li>• O sistema gera todas as combinações de 2 estrelas</li>
                                    <li>• Exemplo: 4 estrelas = 6 chaves (combinações)</li>
                                    <li>• Custo: €2.50 por chave</li>
                                </ul>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={selectedStars.length < 2 || isGenerating}
                                className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-400 text-white font-bold rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2"
                            >
                                {isGenerating ? 'A Calcular...' : '🚀 Gerar Chaves'}
                            </button>
                        </div>

                        {/* Right Column: Results */}
                        <div className="space-y-6">
                            {generatedKeys.length > 0 ? (
                                <div className="sticky top-8 space-y-6">
                                    <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-border">
                                        <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                                    {generatedKeys.length} Chaves Geradas
                                                </h2>
                                                <p className="text-zinc-500">
                                                    Custo Total Estimado: <span className="font-bold text-zinc-900 dark:text-white">{totalCost.toFixed(2)} €</span>
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={copyAll}
                                                    className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-bold flex items-center gap-2 transition-all hover:scale-105"
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

                                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                            {generatedKeys.map((stars, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group flex items-center gap-4 p-3 bg-amber-50/30 dark:bg-amber-900/10 rounded-lg border border-amber-100/50 dark:border-amber-900/30 transition-all hover:scale-105 hover:border-amber-400"
                                                >
                                                    <span className="text-amber-500 font-mono text-xs">#{idx + 1}</span>
                                                    <div className="flex gap-2">
                                                        {stars.map(s => (
                                                            <span key={s} className="w-10 h-10 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-full font-bold text-amber-600 shadow-sm border border-amber-200 dark:border-amber-800">
                                                                ★{s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(stars.join(', '));
                                                        }}
                                                        className="ml-auto opacity-0 group-hover:opacity-100 p-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded transition-all"
                                                        title="Copiar"
                                                    >
                                                        📋
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : !isGenerating && (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-12 border-2 border-dashed border-border rounded-xl">
                                    <span className="text-4xl mb-4">⭐</span>
                                    <p>Selecione as estrelas e clique em Gerar</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <ResponsibleGamingWarning />
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block p-8 bg-white text-black">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">As Minhas Estrelas - EuroMilhões</h1>
                    <p className="text-sm text-gray-600">
                        Sistema: {selectedStars.length} Estrelas
                    </p>
                    <p className="text-sm text-gray-600">
                        Data: {new Date().toLocaleDateString()} | Custo: {totalCost.toFixed(2)} €
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {generatedKeys.map((stars, idx) => (
                        <div key={idx} className="border border-gray-300 p-4 rounded flex items-center justify-center gap-2">
                            {stars.map(s => (
                                <span key={s} className="font-bold text-lg">★{s}</span>
                            ))}
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
