
'use client';

import { useEffect, useState } from 'react';
import { getStarSuggestions } from '@/app/analysis/stars/actions';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { GameType } from '@/types/game';

interface RecommendedBetData {
    numbers: number[];
    stars: {
        golden: string;
        hot: string;
    };
    game: GameType;
}

interface RecommendedBetWidgetProps {
    game?: GameType;
}

export default function RecommendedBetWidget({ game = GameType.EUROMILLIONS }: RecommendedBetWidgetProps) {
    const [data, setData] = useState<RecommendedBetData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Try to fetch Gold System Numbers
                const gameParam = game ? `&game=${game}` : '';
                let numbers: number[] = [];
                let systemUsed = 'Sistema Ouro';

                const goldResp = await fetch(`/api/predictions/latest?system=Sistema Ouro${gameParam}`);
                const goldData = await goldResp.json();

                if (goldData.numbers && goldData.numbers.length > 0) {
                    numbers = goldData.numbers;
                } else {
                    // Fallback: Get the #1 system from rankings
                    const rankResp = await fetch(`/api/ranking?limit=1${gameParam}`);
                    const rankData = await rankResp.json();
                    if (rankData.ranking && rankData.ranking.length > 0) {
                        systemUsed = rankData.ranking[0].systemName;
                        const topPredResp = await fetch(`/api/predictions/latest?system=${systemUsed}${gameParam}`);
                        const topPredData = await topPredResp.json();
                        if (topPredData.numbers) {
                            numbers = topPredData.numbers;
                        }
                    }
                }

                // 2. Fetch Star Suggestions
                const starData = await getStarSuggestions(game);

                const maxNums = game === GameType.EURODREAMS ? 6 : 5;

                if (numbers.length >= maxNums) {
                    setData({
                        numbers: numbers.slice(0, maxNums).sort((a: number, b: number) => a - b),
                        stars: {
                            golden: String(starData.golden.pair),
                            hot: String(starData.hot.pair)
                        },
                        game
                    });
                }
            } catch (error) {
                console.error("Failed to load recommendation:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [game]);

    if (loading) return <div className="animate-pulse h-64 bg-slate-100 dark:bg-zinc-800 rounded-xl" />;

    // IF NO DATA: Return a placeholder card to maintain layout
    if (!data) return (
        <Card className="h-full p-6 flex items-center justify-center border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-400">
            <div className="text-center">
                <p className="text-sm">Aposta recomendada em breve</p>
            </div>
        </Card>
    );

    const formatPair = (pair: string) => pair.split('-').map(n => parseInt(n));

    const themeColor = game === GameType.TOTOLOTO ? 'emerald' : game === GameType.EURODREAMS ? 'rose' : 'amber';
    const bgHeader = game === GameType.TOTOLOTO ? 'bg-emerald-100 dark:bg-emerald-500/10' : game === GameType.EURODREAMS ? 'bg-rose-100 dark:bg-rose-500/10' : 'bg-amber-100 dark:bg-amber-500/10';
    const textHeader = game === GameType.TOTOLOTO ? 'text-emerald-600 dark:text-emerald-400' : game === GameType.EURODREAMS ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400';
    const borderHeader = game === GameType.TOTOLOTO ? 'border-emerald-200 dark:border-emerald-500/20' : game === GameType.EURODREAMS ? 'border-rose-200 dark:border-rose-500/20' : 'border-amber-200 dark:border-amber-500/20';

    return (
        <Card className={`h-full p-0 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col group hover:border-${themeColor}-500/40 transition-all relative`}>
            {/* Header */}
            <div className="p-4 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className={`font-bold ${textHeader} flex items-center gap-2 text-sm`}>
                    🍀 Aposta Recomendada
                </h3>
                <div className={`${bgHeader} px-1.5 py-0.5 rounded text-[9px] font-bold ${textHeader} border ${borderHeader}`}>
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
                            <div key={n} className={`w-8 h-8 flex items-center justify-center bg-${themeColor}-600 text-white font-bold rounded-full shadow-lg shadow-${themeColor}-500/30 dark:shadow-${themeColor}-900/50 text-sm`}>
                                {n}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stars Options */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <div className="text-[9px] uppercase font-bold text-yellow-600 dark:text-yellow-500 tracking-wider">
                            {game === GameType.EUROMILLIONS ? 'Estrelas (G)' : game === GameType.TOTOLOTO ? 'Sorte (G)' : 'Sonho (G)'}
                        </div>
                        <div className="flex gap-1.5">
                            {formatPair(data.stars.golden).map(n => (
                                <div key={`g-${n}`} className="w-7 h-7 flex items-center justify-center bg-yellow-500 text-white font-bold rounded-full shadow-lg shadow-yellow-500/30 dark:shadow-yellow-900/50 text-xs">
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-[9px] uppercase font-bold text-red-600 dark:text-red-500 tracking-wider">
                            {game === GameType.EUROMILLIONS ? 'Estrelas (H)' : game === GameType.TOTOLOTO ? 'Sorte (H)' : 'Sonho (H)'}
                        </div>
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
