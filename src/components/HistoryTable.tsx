'use client';

import { useState } from 'react';

import { Draw } from '@/lib/types';

export function HistoryTable({ initialDraws, userRole }: { initialDraws: Draw[], userRole?: string }) {
    const [draws] = useState<Draw[]>(initialDraws);

    // Calculate total draws for numbering (newest first in array, but we want oldest = 1)
    const totalDraws = draws.length;

    const canCopy = userRole === 'PRO' || userRole === 'ADMIN';

    return (
        <div className="overflow-x-auto">
            <table className={`w-full border-collapse border border-border text-sm ${!canCopy ? 'select-none' : ''}`}>
                <thead>
                    <tr className="bg-surface-2 text-foreground">
                        <th className="border border-border px-4 py-2 text-center font-semibold text-foreground">#</th>
                        <th className="border border-border px-4 py-2 text-center font-semibold text-foreground">Date</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">N1</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">N2</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">N3</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">N4</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">N5</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">E1</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">E2</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">Soma</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">P/I</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">B/A</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">Consec</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold text-foreground">Σ★</th>
                    </tr>
                </thead>
                <tbody>
                    {draws.map((draw, index) => {
                        const drawNumber = totalDraws - index;
                        const isEven = index % 2 === 0;

                        // Calculate statistics
                        const sum = draw.numbers.reduce((a, b) => a + b, 0);
                        const evenCount = draw.numbers.filter(n => n % 2 === 0).length;
                        const oddCount = 5 - evenCount;
                        const lowCount = draw.numbers.filter(n => n <= 25).length;
                        const highCount = 5 - lowCount;

                        // Count consecutive numbers
                        let consecutiveCount = 0;
                        for (let i = 0; i < draw.numbers.length - 1; i++) {
                            if (draw.numbers[i + 1] - draw.numbers[i] === 1) {
                                consecutiveCount++;
                            }
                        }

                        const starSum = draw.stars.reduce((a, b) => a + b, 0);

                        return (
                            <tr
                                key={draw.id}
                                className={`${isEven ? 'bg-card/50 backdrop-blur-sm' : 'bg-zinc-50 dark:bg-zinc-900'} hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors`}
                            >
                                <td className="border border-border px-4 py-3 font-mono text-muted-foreground text-center">
                                    {drawNumber}
                                </td>
                                <td className="border border-border px-4 py-3 font-medium text-zinc-900 dark:text-white text-center whitespace-nowrap">
                                    {new Date(draw.date).toLocaleDateString('pt-PT')}
                                </td>
                                {draw.numbers.map((n, i) => (
                                    <td key={i} className="border border-border px-3 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-blue-600 rounded-full">
                                            {n}
                                        </span>
                                    </td>
                                ))}
                                {draw.stars.map((n, i) => (
                                    <td key={i} className="border border-border px-3 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-yellow-500 rounded-full">
                                            {n}
                                        </span>
                                    </td>
                                ))}
                                <td className="border border-border px-3 py-3 text-center font-semibold text-foreground">
                                    {sum}
                                </td>
                                <td className="border border-border px-3 py-3 text-center text-zinc-700 dark:text-zinc-300">
                                    {evenCount}-{oddCount}
                                </td>
                                <td className="border border-border px-3 py-3 text-center text-zinc-700 dark:text-zinc-300">
                                    {lowCount}-{highCount}
                                </td>
                                <td className="border border-border px-3 py-3 text-center text-zinc-700 dark:text-zinc-300">
                                    {consecutiveCount}
                                </td>
                                <td className="border border-border px-3 py-3 text-center font-semibold text-foreground">
                                    {starSum}
                                </td>
                            </tr>
                        );
                    })}
                    {draws.length === 0 && (
                        <tr>
                            <td colSpan={14} className="border border-border px-4 py-8 text-center text-zinc-500">
                                No history available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
