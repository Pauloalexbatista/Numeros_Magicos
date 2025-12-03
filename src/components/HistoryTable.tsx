'use client';

import { useState } from 'react';

import { Draw } from '@/models/types';

export function HistoryTable({ initialDraws, userRole }: { initialDraws: Draw[], userRole?: string }) {
    const [draws] = useState<Draw[]>(initialDraws);

    // Calculate total draws for numbering (newest first in array, but we want oldest = 1)
    const totalDraws = draws.length;

    const canCopy = userRole === 'PRO' || userRole === 'ADMIN';

    return (
        <div className="overflow-x-auto">
            <table className={`w-full border-collapse border border-zinc-300 dark:border-zinc-700 text-sm ${!canCopy ? 'select-none' : ''}`}>
                <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800">
                        <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">#</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">Date</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">N1</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">N2</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">N3</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">N4</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">N5</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">E1</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">E2</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">Soma</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">P/I</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">B/A</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">Consec</th>
                        <th className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-100">Σ★</th>
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
                                className={`${isEven ? 'bg-white dark:bg-zinc-950' : 'bg-zinc-50 dark:bg-zinc-900'} hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors`}
                            >
                                <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400 text-center">
                                    {drawNumber}
                                </td>
                                <td className="border border-zinc-300 dark:border-zinc-700 px-4 py-3 font-medium text-zinc-900 dark:text-white text-center whitespace-nowrap">
                                    {new Date(draw.date).toLocaleDateString('pt-PT')}
                                </td>
                                {draw.numbers.map((n, i) => (
                                    <td key={i} className="border border-zinc-300 dark:border-zinc-700 px-3 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-blue-600 rounded-full">
                                            {n}
                                        </span>
                                    </td>
                                ))}
                                {draw.stars.map((n, i) => (
                                    <td key={i} className="border border-zinc-300 dark:border-zinc-700 px-3 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-yellow-500 rounded-full">
                                            {n}
                                        </span>
                                    </td>
                                ))}
                                <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-3 text-center font-semibold text-zinc-900 dark:text-zinc-100">
                                    {sum}
                                </td>
                                <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-3 text-center text-zinc-700 dark:text-zinc-300">
                                    {evenCount}-{oddCount}
                                </td>
                                <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-3 text-center text-zinc-700 dark:text-zinc-300">
                                    {lowCount}-{highCount}
                                </td>
                                <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-3 text-center text-zinc-700 dark:text-zinc-300">
                                    {consecutiveCount}
                                </td>
                                <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-3 text-center font-semibold text-zinc-900 dark:text-zinc-100">
                                    {starSum}
                                </td>
                            </tr>
                        );
                    })}
                    {draws.length === 0 && (
                        <tr>
                            <td colSpan={14} className="border border-zinc-300 dark:border-zinc-700 px-4 py-8 text-center text-zinc-500">
                                No history available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
