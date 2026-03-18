
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
                const gameParam = game ? `&game=${game}` : '';
                let numbers: number[] = [];
                let systemUsed = '';

                // Get the #1 system from rankings
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
        <Card className="h-full p-6 flex items-center justify-center border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 backdrop-blur-sm">
            <div className="text-center">
                <p className="text-sm font-medium">Aposta recomendada em carregamento...</p>
            </div>
        </Card>
    );

    const formatPair = (pair: string) => pair.split('-').map(n => parseInt(n));

    // Dynamic gradient themes for games
    const themeGradients = {
        [GameType.TOTOLOTO]: 'from-emerald-600 to-teal-500 shadow-emerald-500/30',
        [GameType.EURODREAMS]: 'from-rose-600 to-pink-500 shadow-rose-500/30',
        [GameType.EUROMILLIONS]: 'from-amber-500 to-orange-400 shadow-amber-500/30'
    };

    const bgHeader = game === GameType.TOTOLOTO ? 'bg-emerald-100 dark:bg-emerald-500/10' : game === GameType.EURODREAMS ? 'bg-rose-100 dark:bg-rose-500/10' : 'bg-amber-100 dark:bg-amber-500/10';
    const textHeader = game === GameType.TOTOLOTO ? 'text-emerald-600 dark:text-emerald-400' : game === GameType.EURODREAMS ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400';
    const borderHeader = game === GameType.TOTOLOTO ? 'border-emerald-200 dark:border-emerald-500/20' : game === GameType.EURODREAMS ? 'border-rose-200 dark:border-rose-500/20' : 'border-amber-200 dark:border-amber-500/20';

    const currentGradient = themeGradients[game] || themeGradients[GameType.EUROMILLIONS];

    return (
        <Card className={`h-full p-0 overflow-hidden bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 shadow-lg flex flex-col group hover:shadow-xl transition-all duration-300 relative`}>
            {/* Header */}
            <div className="p-4 pb-3 border-b border-zinc-100/50 dark:border-zinc-800/50 flex justify-between items-center bg-gradient-to-r from-transparent via-transparent to-zinc-50/10">
                <h3 className={`font-bold ${textHeader} flex items-center gap-2 text-[15px] tracking-tight`}>
                    ✨ O Teu Bilhete Dourado
                </h3>
                <div className={`${bgHeader} px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${textHeader} border ${borderHeader} animate-pulse`}>
                    A Próxima Jogada
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6 flex-1 flex flex-col justify-center">

                {/* Numbers */}
                <div className="space-y-3">
                    <div className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-widest">
                        Combinação Principal
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {data.numbers.map((n, i) => (
                            <div 
                                key={n} 
                                className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${currentGradient} text-white font-bold rounded-full shadow-lg text-base ring-2 ring-white/20 dark:ring-black/20 transform hover:scale-110 transition-transform cursor-default`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                {n}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stars Options */}
                <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                    <div className="space-y-2">
                        <div className="text-[10px] uppercase font-bold tracking-widest bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                            {game === GameType.EUROMILLIONS ? 'Estrelas (G)' : game === GameType.TOTOLOTO ? 'Sorte (G)' : 'Sonho (G)'}
                        </div>
                        <div className="flex gap-2">
                            {formatPair(data.stars.golden).map(n => (
                                <div key={`g-${n}`} className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500 text-white font-bold rounded-full shadow-md shadow-yellow-500/25 text-sm ring-2 ring-white/10 transform hover:-translate-y-1 transition-transform">
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 border-l border-zinc-200/50 dark:border-zinc-700/50 pl-4">
                        <div className="text-[10px] uppercase font-bold tracking-widest bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-transparent">
                            {game === GameType.EUROMILLIONS ? 'Estrelas (H)' : game === GameType.TOTOLOTO ? 'Sorte (H)' : 'Sonho (H)'}
                        </div>
                        <div className="flex gap-2">
                            {formatPair(data.stars.hot).map(n => (
                                <div key={`h-${n}`} className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-rose-500 to-red-600 text-white font-bold rounded-full shadow-md shadow-red-500/25 text-sm ring-2 ring-white/10 transform hover:-translate-y-1 transition-transform">
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
