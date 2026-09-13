import React from "react";
import { getMagicSquareData, NumberSquareStat } from "../services/wheeling";

interface MagicSquareDisplayProps {
    square: number[][];
    highlightedKey?: number; // Index of the key to highlight
    hoveredNumber?: number; // Number to highlight across the grid
    numberStats?: NumberSquareStat[];
}

export function MagicSquareDisplay({ square, highlightedKey, hoveredNumber, numberStats }: MagicSquareDisplayProps) {
    if (!square || square.length === 0) return null;

    const n = square.length;
    const data = getMagicSquareData(n * n);
    const name = data?.name || (n === 5 ? 'Marte' : 'Sol');
    const totalKeys = n * 2 + 2; // 12 for 5x5, 14 for 6x6

    // Determine which cells to highlight based on highlightedKey
    const isKeyHighlighted = (row: number, col: number): boolean => {
        if (highlightedKey === undefined) return false;
        if (highlightedKey < n) return row === highlightedKey;
        if (highlightedKey < 2 * n) return col === (highlightedKey - n);
        if (highlightedKey === 2 * n) return row === col;
        if (highlightedKey === 2 * n + 1) return row + col === n - 1;
        return false;
    };

    const isDiag1 = (r: number, c: number) => r === c;
    const isDiag2 = (r: number, c: number) => r + c === n - 1;

    const getCellWeight = (r: number, c: number): number => {
        let w = 2;
        if (isDiag1(r, c)) w++;
        if (isDiag2(r, c)) w++;
        return w;
    };

    const getCellWeightBadge = (weight: number) => {
        if (weight === 4) {
            return (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-black rounded-full bg-amber-500 text-slate-950 shadow-sm border border-amber-300 ring-2 ring-amber-400/30" title="Presente em 4 chaves (Linha, Coluna e 2 Diagonais)">
                    4x
                </span>
            );
        }
        if (weight === 3) {
            return (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-black rounded-full bg-purple-600 text-white shadow-sm border border-purple-400 ring-2 ring-purple-500/20" title="Presente em 3 chaves (Linha, Coluna e 1 Diagonal)">
                    3x
                </span>
            );
        }
        return (
            <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 text-[8px] font-bold rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300" title="Presente em 2 chaves (Linha e Coluna)">
                2x
            </span>
        );
    };

    return (
        <div className="w-full bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/80 dark:from-purple-950/20 dark:via-background dark:to-indigo-950/20 p-5 md:p-8 lg:p-10 rounded-[2rem] border-2 border-purple-200/70 dark:border-purple-800/60 shadow-xl overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <span>✨</span> Quadrado Mágico de {name} ({n}x{n})
                </div>
                <h3 className="text-xl md:text-2xl font-black text-purple-950 dark:text-purple-100 tracking-tight">
                    Distribuição Adaptativa em {totalKeys} Chaves
                </h3>
                <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mt-1">
                    Cada linha ({n}), coluna ({n}) e diagonal (2) forma uma chave completa de {n} números sem repetições.
                </p>
            </div>

            {/* Grid Container */}
            <div className="flex flex-col items-center justify-center">
                <div 
                    className="grid gap-2 md:gap-3 items-center justify-center p-4 md:p-6 bg-purple-100/50 dark:bg-purple-950/30 rounded-3xl border border-purple-200 dark:border-purple-800/50 shadow-inner"
                    style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
                >
                    {square.map((row, r) =>
                        row.map((num, c) => {
                            const weight = getCellWeight(r, c);
                            const isKeyActive = isKeyHighlighted(r, c);
                            const isNumActive = hoveredNumber !== undefined && hoveredNumber === num;
                            const isCenter = n === 5 && r === 2 && c === 2;

                            return (
                                <div
                                    key={`${r}-${c}`}
                                    className={`
                                        relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 flex flex-col items-center justify-center rounded-2xl font-black text-sm sm:text-lg md:text-xl
                                        transition-all duration-200 select-none border-2
                                        ${isNumActive
                                            ? 'bg-amber-400 text-slate-950 border-amber-300 scale-110 shadow-2xl z-30 ring-4 ring-amber-400/40'
                                            : isKeyActive
                                                ? 'bg-purple-600 text-white border-purple-300 scale-105 shadow-xl z-20 ring-4 ring-purple-500/30'
                                                : isCenter
                                                    ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-purple-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-md'
                                                    : weight === 3
                                                        ? 'bg-white dark:bg-zinc-800 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800/80 shadow-sm'
                                                        : 'bg-white/90 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 shadow-sm'
                                        }
                                    `}
                                    title={`Posição (${r + 1}, ${c + 1}) - Número ${num} presente em ${weight} chaves`}
                                >
                                    {getCellWeightBadge(weight)}
                                    <span>{num}</span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    {n === 5 && (
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block ring-2 ring-amber-300/50"></span>
                            <span><strong>Centro (4x)</strong>: 1 Linha + 1 Coluna + 2 Diagonais</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-purple-600 inline-block ring-2 ring-purple-400/50"></span>
                        <span><strong>Diagonais (3x)</strong>: 1 Linha + 1 Coluna + 1 Diagonal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 inline-block"></span>
                        <span><strong>Laterais (2x)</strong>: 1 Linha + 1 Coluna</span>
                    </div>
                </div>
            </div>

            {/* Statistics Table if available */}
            {numberStats && numberStats.length > 0 && (
                <div className="mt-8 border-t border-purple-100 dark:border-purple-900/50 pt-6">
                    <h5 className="font-bold text-xs md:text-sm text-purple-900 dark:text-purple-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>📊</span> Presenças por Ordem de Importância:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                        {numberStats.map((st) => (
                            <div
                                key={st.number}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                                    hoveredNumber === st.number
                                        ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105 shadow-md ring-2 ring-amber-400/50'
                                        : st.rank === 1
                                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                            : st.keysCount >= 5
                                                ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                                : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                }`}
                            >
                                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">#{st.rank}</span>
                                <span className="font-bold text-sm">{st.number}</span>
                                <span className="text-[10px] px-1 py-0.2 rounded-md bg-white/70 dark:bg-zinc-900/60 text-purple-700 dark:text-purple-300 font-bold">
                                    {st.keysCount} chaves
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
