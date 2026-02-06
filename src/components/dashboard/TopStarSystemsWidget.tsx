'use client';

import { useEffect, useState } from 'react';
import { getStarRankingMetrics } from '@/app/analysis/stars/actions';
import Link from 'next/link';
import { GameType } from '@/types/game';
import { formatSystemName } from '@/utils/formatters';

interface StarRankingData {
    systemName: string;
    qualityScore: number;
}

interface TopStarSystemsWidgetProps {
    variant?: 'dark' | 'light' | 'neutral';
    game?: GameType;
}

export default function TopStarSystemsWidget({ variant = 'light', game = GameType.EUROMILLIONS }: TopStarSystemsWidgetProps) {
    const [topSystems, setTopSystems] = useState<StarRankingData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getStarRankingMetrics(game);
                if (data) {
                    setTopSystems(data.slice(0, 3));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [game]);

    // Color Styles Mapping (Exact match with RankingSummaryWidget)
    const styles = {
        dark: {
            container: 'bg-indigo-950 border-indigo-900 text-white',
            title: 'text-white',
            badge: 'bg-indigo-800 text-indigo-200',
            item: 'bg-indigo-900/50 border-indigo-800 text-indigo-100',
            medal: {
                1: 'bg-yellow-500/20 text-yellow-300',
                2: 'bg-zinc-500/20 text-zinc-300',
                3: 'bg-orange-500/20 text-orange-300'
            },
            accuracy: 'text-indigo-300',
            button: 'bg-indigo-600 hover:bg-indigo-500 text-white'
        },
        light: {
            container: `rounded-xl border-2 shadow-sm
                ${game === GameType.TOTOLOTO ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30' :
                    game === GameType.EURODREAMS ? 'border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30' :
                        'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30'}`,
            title: `${game === GameType.TOTOLOTO ? 'text-emerald-800 dark:text-emerald-200' :
                game === GameType.EURODREAMS ? 'text-pink-800 dark:text-pink-200' :
                    'text-blue-800 dark:text-blue-200'}`,
            badge: `${game === GameType.TOTOLOTO ? 'bg-emerald-500 text-white' :
                game === GameType.EURODREAMS ? 'bg-pink-500 text-white' :
                    'bg-blue-500 text-white'}`,
            item: `bg-white/60 dark:bg-black/40 border
                ${game === GameType.TOTOLOTO ? 'border-emerald-100 dark:border-emerald-900/50' :
                    game === GameType.EURODREAMS ? 'border-pink-100 dark:border-pink-900/50' :
                        'border-blue-100 dark:border-blue-900/50'} hover:bg-white dark:hover:bg-black/60 transition-colors`,
            medal: {
                1: `${game === GameType.TOTOLOTO ? 'bg-emerald-500 text-white' :
                    game === GameType.EURODREAMS ? 'bg-pink-500 text-white' :
                        'bg-blue-500 text-white'} ring-2 ring-opacity-30`,
                2: 'bg-zinc-300 text-zinc-800',
                3: 'bg-amber-600 text-amber-100'
            },
            accuracy: `${game === GameType.TOTOLOTO ? 'text-emerald-700 dark:text-emerald-300' :
                game === GameType.EURODREAMS ? 'text-pink-700 dark:text-pink-300' :
                    'text-blue-700 dark:text-blue-300'}`,
            button: `${game === GameType.TOTOLOTO ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                game === GameType.EURODREAMS ? 'bg-pink-600 hover:bg-pink-700 text-white' :
                    'bg-blue-600 hover:bg-blue-700 text-white'}`
        },
        neutral: {
            container: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100',
            title: 'text-zinc-700 dark:text-zinc-300',
            badge: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400',
            item: 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700',
            medal: {
                1: 'bg-zinc-200 text-zinc-700',
                2: 'bg-zinc-200 text-zinc-700',
                3: 'bg-zinc-200 text-zinc-700'
            },
            accuracy: 'text-zinc-600 dark:text-zinc-400',
            button: 'bg-zinc-600 hover:bg-zinc-500 text-white'
        }
    };

    const currentStyle = styles[variant] || styles.light;

    if (loading) {
        return (
            <div className={`rounded-xl p-4 border h-full flex items-center justify-center ${currentStyle.container}`}>
                <div className="animate-pulse w-full space-y-4">
                    <div className="h-4 bg-current opacity-10 rounded w-1/2"></div>
                    <div className="space-y-2">
                        <div className="h-12 bg-current opacity-5 rounded"></div>
                        <div className="h-12 bg-current opacity-5 rounded"></div>
                        <div className="h-12 bg-current opacity-5 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-3 flex flex-col ${currentStyle.container}`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className={`font-bold text-lg flex items-center gap-2 ${currentStyle.title}`}>
                    🏆 Top {game === GameType.EUROMILLIONS ? 'Estrelas' : game === GameType.TOTOLOTO ? 'Número da Sorte' : 'Número de Sonho'} <span className="text-xs font-normal opacity-70">(Score)</span>
                </h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${currentStyle.badge}`}>
                    Live
                </span>
            </div>

            <div className="space-y-1.5">
                {topSystems.map((sys, index) => (
                    <div key={sys.systemName} className={`flex items-center justify-between p-2 rounded-lg border ${currentStyle.item}`}>
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${index === 0 ? currentStyle.medal[1] : ''}
                                ${index === 1 ? currentStyle.medal[2] : ''}
                                ${index === 2 ? currentStyle.medal[3] : ''}
                            `}>
                                {index + 1}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{formatSystemName(sys.systemName)}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`font-bold text-sm ${currentStyle.accuracy}`}>
                                {sys.qualityScore}
                            </div>
                            <div className="text-[10px] opacity-60 uppercase tracking-wider">Score</div>
                        </div>
                    </div>
                ))}
                {topSystems.length === 0 && (
                    <div className="text-center text-sm opacity-50 py-4">Sem dados.</div>
                )}
            </div>

            <Link
                href={game === GameType.EURODREAMS ? "/eurodreams/stars/ranking" : game === GameType.TOTOLOTO ? "/totoloto/stars/ranking" : "/analysis/stars/ranking"}
                className={`mt-4 w-full py-2 text-center text-sm font-medium rounded-lg transition-colors ${currentStyle.button}`}
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
