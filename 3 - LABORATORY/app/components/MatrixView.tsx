'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Check, X, TrendingUp, Layers, AlertCircle, Trophy, Calendar,
    ArrowDown, Loader2
} from 'lucide-react';

interface MatrixData {
    id: number;
    date: string;
    numbers: string; // "1, 2, 3..."
    systems: Record<string, number>;
}

export default function MatrixView() {
    const [draws, setDraws] = useState<MatrixData[]>([]);
    const [availableSystems, setAvailableSystems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(50);

    // Selection state
    const [selectedSystems, setSelectedSystems] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/lab-matrix?limit=${limit}`);
            const data = await res.json();
            if (data.success) {
                setDraws(data.draws);
                setAvailableSystems(data.availableSystems);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSystem = (name: string) => {
        if (selectedSystems.includes(name)) {
            setSelectedSystems(prev => prev.filter(s => s !== name));
        } else {
            if (selectedSystems.length < 4) {
                setSelectedSystems(prev => [...prev, name]);
            }
        }
    };

    // Calculation Logic
    const analysis = useMemo(() => {
        if (selectedSystems.length < 2) return null;

        let combinedJackpots = 0;
        let combinedWins = 0; // 3+ hits
        let rescues = 0;

        // Process rows for display
        const rows = draws.map(draw => {
            let maxHits = 0;
            let hasFailure = false;
            let hasSuccess = false;

            selectedSystems.forEach(sys => {
                const hits = draw.systems[sys] || 0;
                if (hits > maxHits) maxHits = hits;
                if (hits < 3) hasFailure = true;
                if (hits >= 3) hasSuccess = true;
            });

            if (maxHits >= 5) combinedJackpots++; // Ideally check for true 5
            if (maxHits >= 3) combinedWins++;
            if (hasFailure && hasSuccess) rescues++;

            return {
                ...draw,
                bestHit: maxHits,
                isJackpot: maxHits >= 5,
                isWin: maxHits >= 3
            };
        });

        return {
            rows,
            stats: {
                total: draws.length,
                jackpots: combinedJackpots,
                wins: combinedWins,
                rescues,
                coverage: (combinedWins / draws.length) * 100
            }
        };

    }, [selectedSystems, draws]);

    if (loading && draws.length === 0) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-500" />
                        Selecione até 4 Sistemas
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">Últimos:</span>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="bg-slate-800 border-none rounded text-white text-sm"
                        >
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {availableSystems.map(sys => (
                        <button
                            key={sys}
                            onClick={() => toggleSystem(sys)}
                            disabled={!selectedSystems.includes(sys) && selectedSystems.length >= 4}
                            className={`
                                px-3 py-1 rounded-full text-xs font-medium transition-all
                                ${selectedSystems.includes(sys)
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}
                                disabled:opacity-30 disabled:cursor-not-allowed
                            `}
                        >
                            {sys}
                        </button>
                    ))}
                </div>
            </div>

            {/* Analysis Dashboard */}
            {analysis ? (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-green-400" />
                                <div>
                                    <h4 className="text-2xl font-black text-white">{analysis.stats.jackpots}</h4>
                                    <p className="text-xs text-green-400 uppercase font-bold">Jackpots Combinados</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-blue-400" />
                                <div>
                                    <h4 className="text-2xl font-black text-white">{analysis.stats.coverage.toFixed(1)}%</h4>
                                    <p className="text-xs text-blue-400 uppercase font-bold">Cobertura Total (3+)</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-8 h-8 text-amber-400" />
                                <div>
                                    <h4 className="text-2xl font-black text-white">{analysis.stats.rescues}</h4>
                                    <p className="text-xs text-amber-400 uppercase font-bold">Salvamentos</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Matrix Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-slate-950">
                                        <th className="p-3 text-left text-slate-500 font-mono">Data</th>
                                        {selectedSystems.map(sys => (
                                            <th key={sys} className="p-3 text-center text-slate-300 font-medium border-l border-slate-800">
                                                {sys}
                                            </th>
                                        ))}
                                        <th className="p-3 text-center text-purple-400 font-bold border-l border-purple-500/20 bg-purple-500/10">
                                            Combinado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analysis.rows.map(row => (
                                        <tr key={row.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                            <td className="p-3 text-slate-500 font-mono whitespace-nowrap text-xs">
                                                {new Date(row.date).toLocaleDateString()}
                                            </td>
                                            {selectedSystems.map(sys => (
                                                <td key={sys} className="p-3 text-center border-l border-slate-800">
                                                    <HitBadge hits={row.systems[sys] || 0} />
                                                </td>
                                            ))}
                                            <td className="p-3 text-center border-l border-purple-500/20 bg-purple-500/5">
                                                <HitBadge hits={row.bestHit} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                    <ArrowDown className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500">Selecione pelo menos 2 sistemas para visualizar a matriz</p>
                </div>
            )}
        </div>
    );
}

function HitBadge({ hits }: { hits: number }) {
    if (hits >= 5) return <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-green-500 text-white font-bold text-xs">5</span>;
    if (hits === 4) return <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">4</span>;
    if (hits === 3) return <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-blue-500/20 text-blue-400 font-bold text-xs">3</span>;
    if (hits === 2) return <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-slate-800 text-slate-500 font-bold text-xs">2</span>;
    return <span className="inline-flex w-6 h-6 items-center justify-center text-slate-700 text-xs shadow-none">.</span>;
}
