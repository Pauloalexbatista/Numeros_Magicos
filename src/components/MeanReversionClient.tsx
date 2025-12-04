'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, Minus, Activity } from 'lucide-react';

interface Draw {
    id: number;
    date: Date;
    numbers: string;
}

interface MeanReversionClientProps {
    draws: Draw[];
}

export function MeanReversionClient({ draws }: MeanReversionClientProps) {
    const [windowSize, setWindowSize] = useState(50); // 50 or 100

    const analysisData = useMemo(() => {
        // Process data in chronological order (oldest first) to calculate moving averages
        const chronological = [...draws].reverse();

        const processed = chronological.map((draw, index) => {
            try {
                const numbers = JSON.parse(draw.numbers);
                const h1 = numbers[0];
                const h2 = numbers[1];

                // Calculate Moving Average for previous N draws
                const startIdx = Math.max(0, index - windowSize);
                const historyWindow = chronological.slice(startIdx, index);

                let h1Avg = 0;
                let h2Avg = 0;

                if (historyWindow.length > 0) {
                    const h1Sum = historyWindow.reduce((sum, d) => sum + JSON.parse(d.numbers)[0], 0);
                    const h2Sum = historyWindow.reduce((sum, d) => sum + JSON.parse(d.numbers)[1], 0);
                    h1Avg = h1Sum / historyWindow.length;
                    h2Avg = h2Sum / historyWindow.length;
                }

                // Trend (vs Previous Draw)
                const prevDraw = index > 0 ? chronological[index - 1] : null;
                const prevH1 = prevDraw ? JSON.parse(prevDraw.numbers)[0] : h1;
                const prevH2 = prevDraw ? JSON.parse(prevDraw.numbers)[1] : h2;

                return {
                    ...draw,
                    h1,
                    h2,
                    h1Avg,
                    h2Avg,
                    h1Diff: h1 - h1Avg,
                    h2Diff: h2 - h2Avg,
                    h1Trend: h1 > prevH1 ? 'up' : h1 < prevH1 ? 'down' : 'same',
                    h2Trend: h2 > prevH2 ? 'up' : h2 < prevH2 ? 'down' : 'same',
                    gap: h2 - h1
                };
            } catch (e) {
                return null;
            }
        }).filter(Boolean);

        // Return to newest first for display
        return processed.reverse();
    }, [draws, windowSize]);

    const TrendIcon = ({ trend }: { trend: string }) => {
        if (trend === 'up') return <ArrowUp className="w-4 h-4 text-emerald-500" />;
        if (trend === 'down') return <ArrowDown className="w-4 h-4 text-rose-500" />;
        return <Minus className="w-4 h-4 text-slate-500" />;
    };

    const StatusBadge = ({ val, avg }: { val: number, avg: number }) => {
        const diff = val - avg;
        const isHigh = diff > 0;
        const intensity = Math.abs(diff) > 3 ? 'bg-opacity-100' : 'bg-opacity-50';

        return (
            <div className={`flex items-center gap-1 text-xs font-medium ${isHigh ? 'text-amber-400' : 'text-cyan-400'}`}>
                {isHigh ? 'ACIMA' : 'ABAIXO'} ({diff.toFixed(1)})
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <Card className="p-4 bg-slate-950/80 border-slate-700/50">
                <div className="flex items-center gap-4">
                    <span className="text-slate-400">Média Móvel:</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setWindowSize(50)}
                            className={`px-3 py-1 rounded text-sm ${windowSize === 50 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                            50 Sorteios
                        </button>
                        <button
                            onClick={() => setWindowSize(100)}
                            className={`px-3 py-1 rounded text-sm ${windowSize === 100 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                            100 Sorteios
                        </button>
                    </div>
                </div>
            </Card>

            {/* Main Table */}
            <Card className="bg-slate-950/80 border-slate-700/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-slate-700/50 bg-slate-900/50">
                            <TableHead className="text-slate-400">Data</TableHead>

                            {/* House 1 */}
                            <TableHead className="text-center border-l border-slate-700/30 bg-slate-800/30">
                                <div className="flex flex-col items-center">
                                    <span className="text-cyan-400 font-bold">1ª Casa</span>
                                    <span className="text-xs text-slate-500">Média: {analysisData[0]?.h1Avg.toFixed(2)}</span>
                                </div>
                            </TableHead>
                            <TableHead className="text-center bg-slate-800/30 text-slate-400">Estado</TableHead>
                            <TableHead className="text-center bg-slate-800/30 text-slate-400">Tendência</TableHead>

                            {/* Connection */}
                            <TableHead className="text-center border-l border-r border-slate-700/30 bg-slate-800/50">
                                <div className="flex flex-col items-center">
                                    <Activity className="w-4 h-4 text-indigo-400 mb-1" />
                                    <span className="text-xs text-indigo-400">Gap (H2-H1)</span>
                                </div>
                            </TableHead>

                            {/* House 2 */}
                            <TableHead className="text-center bg-slate-800/30">
                                <div className="flex flex-col items-center">
                                    <span className="text-emerald-400 font-bold">2ª Casa</span>
                                    <span className="text-xs text-slate-500">Média: {analysisData[0]?.h2Avg.toFixed(2)}</span>
                                </div>
                            </TableHead>
                            <TableHead className="text-center bg-slate-800/30 text-slate-400">Estado</TableHead>
                            <TableHead className="text-center bg-slate-800/30 text-slate-400">Tendência</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {analysisData.slice(0, 50).map((row: any) => (
                            <TableRow key={row.id} className="border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                                <TableCell className="font-mono text-slate-400">
                                    {new Date(row.date).toLocaleDateString('pt-PT')}
                                </TableCell>

                                {/* House 1 */}
                                <TableCell className="text-center border-l border-slate-700/30 font-bold text-xl text-cyan-100">
                                    {row.h1}
                                </TableCell>
                                <TableCell className="text-center">
                                    <StatusBadge val={row.h1} avg={row.h1Avg} />
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        <TrendIcon trend={row.h1Trend} />
                                    </div>
                                </TableCell>

                                {/* Gap */}
                                <TableCell className="text-center border-l border-r border-slate-700/30 font-mono text-indigo-300">
                                    +{row.gap}
                                </TableCell>

                                {/* House 2 */}
                                <TableCell className="text-center font-bold text-xl text-emerald-100">
                                    {row.h2}
                                </TableCell>
                                <TableCell className="text-center">
                                    <StatusBadge val={row.h2} avg={row.h2Avg} />
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center">
                                        <TrendIcon trend={row.h2Trend} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
