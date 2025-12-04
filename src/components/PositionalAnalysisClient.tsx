'use client';

import { useState, useMemo } from 'react';
import { Draw } from '@/models/types';
import { analyzePositions } from '@/services/positional';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

interface Props {
    history: Draw[];
}

export default function PositionalAnalysisClient({ history }: Props) {
    const [windowSize, setWindowSize] = useState(100);
    // Multipliers for Standard Deviation for each position (1-5)
    // Default to 1.0 (Mean +/- 1 SD)
    const [multipliers, setMultipliers] = useState<number[]>([1.0, 1.0, 1.0, 1.0, 1.0]);

    const stats = useMemo(() => {
        return analyzePositions(history, windowSize);
    }, [history, windowSize]);

    const pool = useMemo(() => {
        // Custom pool generation based on dynamic multipliers
        const p = new Set<number>();
        stats.forEach((stat, idx) => {
            const mult = multipliers[idx];
            const range = stat.stdDev * mult;
            const min = Math.max(1, Math.round(stat.mean - range));
            const max = Math.min(50, Math.round(stat.mean + range));

            for (let n = min; n <= max; n++) {
                p.add(n);
            }
        });
        return Array.from(p).sort((a, b) => a - b);
    }, [stats, multipliers]);

    const handleMultiplierChange = (index: number, value: number) => {
        const newMults = [...multipliers];
        newMults[index] = value;
        setMultipliers(newMults);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pool.join(', '));
        alert('Números copiados para a área de transferência!');
    };

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-bold mb-2 flex justify-between">
                            <span>📅 Histórico de Análise</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{windowSize} Sorteios</span>
                        </label>
                        <input
                            type="range"
                            min="20"
                            max={Math.min(1000, history.length)}
                            step="10"
                            value={windowSize}
                            onChange={(e) => setWindowSize(parseInt(e.target.value))}
                            className="w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-zinc-400 mt-1">
                            <span>Recente (20)</span>
                            <span>Longo Prazo (1000)</span>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col items-end">
                        <button
                            onClick={copyToClipboard}
                            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            📋 Copiar Números
                        </button>
                    </div>
                </div>
            </div>

            {/* Pool Display (Moved to Top) */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Pool Final ({pool.length})</h3>
                    <span className="text-xs text-zinc-500">Números selecionados pelos intervalos abaixo</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {pool.map(num => (
                        <div key={num} className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold shadow-sm">
                            {num}
                        </div>
                    ))}
                </div>
            </div>

            {/* Interactive Number Lines */}
            <div className="space-y-6">
                {stats.map((stat, idx) => {
                    const mult = multipliers[idx];
                    const rangeVal = stat.stdDev * mult;
                    const rangeMin = Math.max(1, Math.round(stat.mean - rangeVal));
                    const rangeMax = Math.min(50, Math.round(stat.mean + rangeVal));

                    return (
                        <div key={stat.position} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm">
                                            {stat.position}º
                                        </span>
                                        Posição
                                    </h3>
                                    <div className="text-xs text-zinc-500 mt-1">
                                        Média: <span className="font-mono font-bold">{stat.mean.toFixed(1)}</span> |
                                        Desvio Padrão: <span className="font-mono font-bold">{stat.stdDev.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                                    <span className="text-xs font-bold uppercase text-zinc-400">Tolerância (Desvios)</span>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="3.0"
                                        step="0.1"
                                        value={mult}
                                        onChange={(e) => handleMultiplierChange(idx, parseFloat(e.target.value))}
                                        className="w-32 accent-amber-500"
                                    />
                                    <span className="font-mono font-bold w-8 text-center">{mult.toFixed(1)}</span>
                                </div>
                            </div>

                            {/* Number Line Visualization */}
                            <div className="relative h-16 mt-6 select-none">
                                {/* Base Line */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full transform -translate-y-1/2" />

                                {/* Numbers */}
                                <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-1">
                                    {Array.from({ length: 50 }, (_, i) => i + 1).map(num => {
                                        const isMean = Math.round(stat.mean) === num;
                                        const inRange = num >= rangeMin && num <= rangeMax;

                                        return (
                                            <div key={num} className="relative flex flex-col items-center group" style={{ width: '2%' }}>
                                                {/* Tick/Dot */}
                                                <div
                                                    className={`w-1 h-1 rounded-full mb-1 transition-all ${isMean ? 'w-2 h-2 bg-indigo-600 dark:bg-indigo-400 z-20' :
                                                        inRange ? 'bg-amber-500 dark:bg-amber-400 w-1.5 h-1.5 z-10' :
                                                            'bg-zinc-300 dark:bg-zinc-600'
                                                        }`}
                                                />

                                                {/* Number Label */}
                                                <div className={`text-[10px] font-mono transition-all ${isMean ? 'font-bold text-indigo-600 dark:text-indigo-400 -translate-y-6 scale-125' :
                                                    inRange ? 'text-zinc-900 dark:text-zinc-100 font-bold' :
                                                        'text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100'
                                                    }`}>
                                                    {num}
                                                </div>

                                                {/* Range Bar Background */}
                                                {inRange && (
                                                    <div className="absolute top-1/2 left-0 w-full h-4 bg-amber-500/10 dark:bg-amber-400/10 -translate-y-1/2 pointer-events-none rounded-sm" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-2 text-center text-xs text-zinc-400">
                                Intervalo Selecionado: <span className="text-amber-600 dark:text-amber-400 font-bold">[{rangeMin} - {rangeMax}]</span> ({rangeMax - rangeMin + 1} números)
                            </div>
                        </div>
                    );
                })}
            </div>
            <ResponsibleGamingFooter />
        </div>
    );
}
