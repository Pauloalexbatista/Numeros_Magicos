'use client';
import { useState } from 'react';
import Link from 'next/link';
import ResponsibleGamingFooter from './ResponsibleGamingFooter';

interface DrawData {
    date: string;
    numbers: number[];
}

interface MatrixClientProps {
    draws: DrawData[];
    limit: number;
}

/**
 * Calculates pyramid totals for each column.
 * For column `c`, we sum:
 *   Row 0 (most recent): col-1, col, col+1 (3 cells)
 *   Row 1: col-2, col+2 (2 cells, no center)
 *   Row 2: col-3, col+3 (2 cells, no center)
 *   etc.
 */
function calculatePyramidTotals(draws: DrawData[], columns: number[]): number[] {
    return columns.map(col => {
        let sum = 0;
        draws.forEach((draw, rowIdx) => {
            if (rowIdx === 0) {
                // First row: count left, center, right (3 cells)
                const left = col - 1;
                const right = col + 1;

                if (left >= 1 && draw.numbers.includes(left)) sum += 1;
                if (draw.numbers.includes(col)) sum += 1;
                if (right <= 50 && draw.numbers.includes(right)) sum += 1;
            } else {
                // Other rows: only count left and right neighbors (2 cells)
                const spread = rowIdx + 1;
                const left = col - spread;
                const right = col + spread;

                if (left >= 1 && draw.numbers.includes(left)) sum += 1;
                if (right <= 50 && draw.numbers.includes(right)) sum += 1;
            }
        });
        return sum;
    });
}

export default function MatrixClient({ draws, limit }: MatrixClientProps) {
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

    const columns = Array.from({ length: 50 }, (_, i) => i + 1);
    const pyramidTotals = calculatePyramidTotals(draws, columns);

    const maxTotal = Math.max(...pyramidTotals);
    const getTotalColor = (value: number) => {
        if (maxTotal === 0) return 'rgb(255,255,255)';
        const intensity = Math.round((value / maxTotal) * 255);
        const greenBlue = 255 - intensity;
        return `rgb(255,${greenBlue},${greenBlue})`;
    };

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 p-4 font-sans">
            <main className="max-w-[95vw] mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Matrix Binária 🧬</h1>
                        <p className="text-sm text-zinc-500">
                            Visualização completa de todos os sorteios (1 = Saiu, 0 = Não Saiu). Totais são calculados em forma de pirâmide.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                        <form method="GET" className="flex items-center gap-2">
                            <span className="text-sm text-zinc-500">Linhas:</span>
                            <input
                                type="number"
                                name="limit"
                                defaultValue={limit}
                                className="w-20 text-sm rounded border border-zinc-300 bg-white p-2"
                                placeholder="Qtd"
                            />
                            <button type="submit" className="px-3 py-2 text-sm font-medium text-white bg-zinc-800 rounded hover:bg-zinc-600">
                                Atualizar
                            </button>
                        </form>
                        <Link href="/matrix/validation" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors">
                            📊 Validação
                        </Link>
                        <Link href="/" className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-md hover:bg-zinc-300 transition-colors">
                            ← Voltar
                        </Link>
                    </div>
                </div>

                <div className="relative overflow-auto max-h-[80vh] bg-card/50 backdrop-blur-sm rounded-xl shadow-sm border border-border">
                    <table className="w-full text-xs border-collapse">
                        <thead>
                            <tr className="text-muted-foreground bg-zinc-100 dark:bg-zinc-800">
                                <th className="p-3 text-left sticky left-0 top-0 z-40 bg-zinc-100 dark:bg-zinc-800 border-b border-border min-w-[120px]">Data</th>
                                <th className="p-3 text-left sticky left-[120px] top-0 z-40 bg-zinc-100 dark:bg-zinc-800 border-b border-border min-w-[100px] border-r">Números</th>
                                {columns.map(num => (
                                    <th
                                        key={num}
                                        className={`p-1 text-center border-b border-l border-border w-8 font-normal cursor-pointer ${selectedNumber === num ? 'bg-indigo-200 dark:bg-indigo-800' : ''}`}
                                        onClick={() => setSelectedNumber(num)}
                                    >
                                        {num}
                                    </th>
                                ))}
                            </tr>
                            <tr className="sticky top-[41px] z-50 bg-zinc-50 dark:bg-zinc-800/80 font-bold">
                                <th className="p-2 text-left sticky left-0 top-[41px] z-40 bg-zinc-50 dark:bg-zinc-800/80 border-b border-border text-xs uppercase tracking-wider text-right">Totais</th>
                                <th className="p-2 text-left sticky left-[120px] top-[41px] z-40 bg-zinc-50 dark:bg-zinc-800/80 border-b border-border border-r" />
                                {pyramidTotals.map((total, i) => (
                                    <th
                                        key={i}
                                        className="p-1 text-center border-b border-l border-border"
                                        style={{ backgroundColor: getTotalColor(total), color: total === 0 ? '#000' : '#fff' }}
                                    >
                                        {total}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {draws.map((draw, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-border">
                                    <td className="p-3 sticky left-0 bg-card/50 backdrop-blur-sm z-20 font-medium whitespace-nowrap border-r border-border">
                                        {new Date(draw.date).toLocaleDateString('pt-PT')}
                                    </td>
                                    <td className="p-3 sticky left-[120px] bg-card/50 backdrop-blur-sm z-20 text-muted-foreground whitespace-nowrap border-r border-border">
                                        {draw.numbers.join(', ')}
                                    </td>
                                    {columns.map(col => {
                                        const isHit = draw.numbers.includes(col);
                                        let highlight = false;

                                        if (selectedNumber !== null) {
                                            if (rowIdx === 0) {
                                                // Row 0: highlight col-1, col, col+1
                                                highlight = (col === selectedNumber - 1 || col === selectedNumber || col === selectedNumber + 1);
                                            } else {
                                                // Other rows: highlight col-spread and col+spread
                                                const spread = rowIdx + 1;
                                                highlight = (col === selectedNumber - spread || col === selectedNumber + spread);
                                            }
                                        }

                                        return (
                                            <td
                                                key={col}
                                                className={`p-1 text-center border-l border-zinc-100 ${highlight
                                                    ? isHit
                                                        ? 'bg-yellow-300 text-green-800 font-bold'
                                                        : 'bg-yellow-300 text-zinc-700'
                                                    : isHit
                                                        ? 'bg-green-100 text-green-700 font-bold'
                                                        : 'text-zinc-200'
                                                    }`}
                                            >
                                                {isHit ? '1' : '0'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ResponsibleGamingFooter />
            </main>
        </div>
    );
}
