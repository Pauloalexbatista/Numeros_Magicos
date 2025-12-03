'use client';

import { useRef, useState } from 'react';

// Reusable component for displaying probability table in a tooltip
// Shows hypergeometric distribution probabilities for EuroMillions (50 numbers, 5 drawn)

function combinations(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
    }
    return res;
}

function hypergeometric(N: number, K: number, n: number, k: number): number {
    const waysToChooseWinners = combinations(K, k);
    const waysToChooseLosers = combinations(N - K, n - k);
    const totalWays = combinations(N, n);
    if (totalWays === 0) return 0;
    return (waysToChooseWinners * waysToChooseLosers) / totalWays;
}

const getCellColor = (prob: number) => {
    const p = prob * 100;
    if (p >= 40) return 'bg-blue-600 text-white';
    if (p >= 30) return 'bg-blue-500 text-white';
    if (p >= 20) return 'bg-blue-400 text-white';
    if (p >= 10) return 'bg-blue-300 text-zinc-900';
    if (p >= 5) return 'bg-blue-200 text-zinc-900';
    if (p >= 1) return 'bg-blue-100 text-zinc-900';
    return 'bg-white dark:bg-zinc-900 text-zinc-500';
};

export default function ProbabilityTableTooltip() {
    const N = 50;
    const K = 5;
    const iconRef = useRef<HTMLSpanElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Generate table data (only show key rows to keep tooltip manageable)
    const keyRows = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    const rows = keyRows.map(n => {
        const rowData = { picks: n, probs: [] as number[] };
        for (let k = 1; k <= 5; k++) {
            rowData.probs.push(hypergeometric(N, K, n, k));
        }
        return rowData;
    });

    // Calculate tooltip position
    const getTooltipStyle = () => {
        if (!iconRef.current) return {};
        const rect = iconRef.current.getBoundingClientRect();
        return {
            position: 'fixed' as const,
            left: `${rect.left + rect.width / 2}px`,
            top: `${rect.bottom + 8}px`,
            transform: 'translateX(-50%)',
        };
    };

    return (
        <span
            className="relative inline-block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span
                ref={iconRef}
                className="cursor-help text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                title="Ver probabilidades esperadas"
            >
                📊
            </span>

            {/* Tooltip with probability table - uses fixed positioning to escape overflow */}
            {isHovered && (
                <div
                    style={getTooltipStyle()}
                    className="w-auto bg-white dark:bg-zinc-800 rounded-lg shadow-2xl border-2 border-purple-400 dark:border-purple-500 z-[9999] p-3"
                >
                    <div className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-2 text-center border-b border-purple-200 dark:border-purple-700 pb-2">
                        📊 Probabilidades Esperadas (%)
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        <table className="text-xs text-center border-collapse">
                            <thead className="sticky top-0 bg-gray-100 dark:bg-zinc-700">
                                <tr className="text-gray-800 dark:text-gray-200">
                                    <th className="p-1 border border-gray-300 dark:border-zinc-600 font-semibold w-12">
                                        #
                                    </th>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <th key={num} className="p-1 border border-gray-300 dark:border-zinc-600 font-bold w-16">
                                            {num}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.picks} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                        <td className="p-1 border border-gray-300 dark:border-zinc-600 font-bold bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                                            {row.picks}
                                        </td>
                                        {row.probs.map((prob, idx) => (
                                            <td key={idx} className={`p-1 border border-gray-300 dark:border-zinc-600 ${getCellColor(prob)}`}>
                                                {(prob * 100).toFixed(2)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-[10px] text-gray-600 dark:text-gray-400 text-center mt-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
                        Distribuição Hipergeométrica (N=50, K=5)
                        <br />
                        <a href="/probabilities" target="_blank" className="text-purple-600 hover:underline dark:text-purple-400">
                            Ver tabela completa →
                        </a>
                    </div>
                </div>
            )}
        </span>
    );
}
