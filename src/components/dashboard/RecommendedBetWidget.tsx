
'use client';

import { useEffect, useState } from 'react';
import { getStarSuggestions } from '@/app/analysis/stars/actions';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface RecommendedBetData {
    numbers: number[];
    stars: {
        golden: string;
        hot: string;
    };
}

export default function RecommendedBetWidget() {
    const [data, setData] = useState<RecommendedBetData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Fetch Gold System Numbers
                const goldResp = await fetch('/api/predictions/latest?system=Sistema Ouro');
                const goldData = await goldResp.json();

                // 2. Fetch Star Suggestions
                const starData = await getStarSuggestions();

                if (goldData.numbers && goldData.numbers.length >= 5) {
                    setData({
                        numbers: goldData.numbers.slice(0, 5).sort((a: number, b: number) => a - b),
                        stars: {
                            golden: starData.golden.pair,
                            hot: starData.hot.pair
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to load recommendation:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) return <div className="animate-pulse h-64 bg-slate-800/50 rounded-xl" />;
    if (!data) return null;

    const formatPair = (pair: string) => pair.split('-').map(n => parseInt(n));

    return (
        <Card className="h-full p-0 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col group hover:border-emerald-500/40 transition-all relative">
            {/* Header */}
            <div className="p-4 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-sm">
                    🍀 Aposta Recomendada
                </h3>
                <div className="bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    AMANHÃ
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-center">

                {/* Numbers */}
                <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Números (Ouro)</div>
                    <div className="flex flex-wrap gap-1.5">
                        {data.numbers.map(n => (
                            <div key={n} className="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white font-bold rounded-full shadow-lg shadow-emerald-500/30 dark:shadow-emerald-900/50 text-sm">
                                {n}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stars Options */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <div className="text-[9px] uppercase font-bold text-yellow-600 dark:text-yellow-500 tracking-wider">Histórico</div>
                        <div className="flex gap-1.5">
                            {formatPair(data.stars.golden).map(n => (
                                <div key={`g-${n}`} className="w-7 h-7 flex items-center justify-center bg-yellow-500 text-white font-bold rounded-full shadow-lg shadow-yellow-500/30 dark:shadow-yellow-900/50 text-xs">
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-[9px] uppercase font-bold text-red-600 dark:text-red-500 tracking-wider">Momento</div>
                        <div className="flex gap-1.5">
                            {formatPair(data.stars.hot).map(n => (
                                <div key={`h-${n}`} className="w-7 h-7 flex items-center justify-center bg-red-500 text-white font-bold rounded-full shadow-lg shadow-red-500/30 dark:shadow-red-900/50 text-xs">
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </Card>
    );
}
