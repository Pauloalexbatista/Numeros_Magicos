'use client';

import { useState } from 'react';

type Draw = {
    date: string;
    numbers: number[];
    stars: number[];
};

type PrizeCounts = {
    '5+2': number;
    '5+1': number;
    '5+0': number;
    '4+2': number;
    '4+1': number;
    '4+0': number;
    '3+2': number;
    '3+1': number;
    '3+0': number;
    '2+2': number;
    '2+1': number;
    '1+2': number;
};

export function Simulator({ history }: { history: Draw[] }) {
    const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
    const [selectedStars, setSelectedStars] = useState<Set<number>>(new Set());
    const [results, setResults] = useState<PrizeCounts | null>(null);

    const toggleNumber = (num: number) => {
        const newSet = new Set(selectedNumbers);
        if (newSet.has(num)) newSet.delete(num);
        else newSet.add(num);
        setSelectedNumbers(newSet);
    };

    const toggleStar = (num: number) => {
        const newSet = new Set(selectedStars);
        if (newSet.has(num)) newSet.delete(num);
        else newSet.add(num);
        setSelectedStars(newSet);
    };

    const calculatePrizes = () => {
        const counts: PrizeCounts = {
            '5+2': 0, '5+1': 0, '5+0': 0,
            '4+2': 0, '4+1': 0, '4+0': 0,
            '3+2': 0, '3+1': 0, '3+0': 0,
            '2+2': 0, '2+1': 0, '1+2': 0,
        };

        history.forEach(draw => {
            const numMatches = draw.numbers.filter(n => selectedNumbers.has(n)).length;
            const starMatches = draw.stars.filter(s => selectedStars.has(s)).length;
            const key = `${numMatches}+${starMatches}` as keyof PrizeCounts;

            if (counts[key] !== undefined) {
                counts[key]++;
            }
        });

        setResults(counts);
    };

    const getTierColor = (tier: string) => {
        if (tier === '5+2') return 'bg-red-600 text-white';
        if (tier === '5+1') return 'bg-red-500 text-white';
        if (tier === '5+0') return 'bg-orange-500 text-white';
        if (tier === '4+2') return 'bg-orange-400 text-white';
        if (tier === '4+1') return 'bg-amber-400 text-black';
        if (tier === '4+0') return 'bg-amber-300 text-black';
        if (tier === '3+2') return 'bg-yellow-300 text-black';
        if (tier === '3+1') return 'bg-yellow-200 text-black';
        if (tier === '3+0') return 'bg-yellow-100 text-black';
        if (tier === '2+2') return 'bg-blue-200 text-black';
        if (tier === '2+1') return 'bg-blue-100 text-black';
        if (tier === '1+2') return 'bg-zinc-200 text-black';
        return 'bg-zinc-100';
    };

    return (
        <div className="space-y-8">
            {/* Selection Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Numbers */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-bold mb-4 flex justify-between">
                        Números
                        <span className="text-sm font-normal text-zinc-500">{selectedNumbers.size} selecionados</span>
                    </h2>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                onClick={() => toggleNumber(num)}
                                className={`
                                    w-full aspect-square flex items-center justify-center rounded-md text-sm font-bold transition-all
                                    ${selectedNumbers.has(num)
                                        ? 'bg-blue-600 text-white shadow-md scale-105'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}
                                `}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stars */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-bold mb-4 flex justify-between">
                        Estrelas
                        <span className="text-sm font-normal text-zinc-500">{selectedStars.size} selecionadas</span>
                    </h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                onClick={() => toggleStar(num)}
                                className={`
                                    w-full aspect-square flex items-center justify-center rounded-full text-lg font-bold transition-all
                                    ${selectedStars.has(num)
                                        ? 'bg-yellow-500 text-white shadow-md scale-105'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}
                                `}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
                <button
                    onClick={calculatePrizes}
                    disabled={selectedNumbers.size === 0 && selectedStars.size === 0}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                    Simular Prémios 🎰
                </button>
            </div>

            {/* Results */}
            {results && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-bold mb-6 text-center">Resultados Históricos</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {Object.entries(results).map(([tier, count]) => (
                            <div key={tier} className={`p-4 rounded-lg flex flex-col items-center justify-center ${getTierColor(tier)}`}>
                                <span className="text-2xl font-bold">{count}</span>
                                <span className="text-xs font-medium uppercase tracking-wider opacity-80">Prémio {tier}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-xs text-zinc-400 mt-6">
                        * Total de prémios que esta combinação teria ganho em {history.length} sorteios passados.
                    </p>
                </div>
            )}
        </div>
    );
}
