'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GameType } from '@/types/game';
import { formatSystemName } from '@/utils/formatters';

interface RankingData {
    systemName: string;
    avgAccuracy: number;
    system: {
        name: string;
    };
}

interface RankingSummaryWidgetProps {
    variant?: 'dark' | 'light' | 'neutral';
    game?: GameType;
}

export default function RankingSummaryWidget({ variant = 'light', game = GameType.EUROMILLIONS }: RankingSummaryWidgetProps) {
    const [ranking, setRanking] = useState<RankingData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const gameParam = game ? `&game=${game}` : '';
        fetch(`/api/ranking?limit=3${gameParam}`)
            .then(res => res.json())
            .then(data => {
                if (data.ranking) {
                    setRanking(data.ranking.slice(0, 3));
                }
            })
            .catch(err => console.error('Failed to load ranking summary', err))
            .finally(() => setLoading(false));
    }, [game]);

    // Color Styles Mapping
    const colorPrefix =
        game === GameType.TOTOLOTO ? 'toto' :
            game === GameType.EURODREAMS ? 'dream' :
                'euro';

    const styles = {
        dark: {
            container: `bg-${colorPrefix}-950 border-${colorPrefix}-900 text-white`,
            title: 'text-white',
            badge: `bg-${colorPrefix}-800 text-${colorPrefix}-200`,
            item: `bg-${colorPrefix}-900/50 border-${colorPrefix}-800 text-${colorPrefix}-100`,
            medal: {
                1: 'bg-yellow-500/20 text-yellow-300',
                2: 'bg-zinc-500/20 text-zinc-300',
                3: 'bg-orange-500/20 text-orange-300'
            },
            accuracy: `text-${colorPrefix}-300`,
            button: `bg-${colorPrefix}-600 hover:bg-${colorPrefix}-500 text-white`
        },
        light: {
            container: `rounded-xl border-2 border-${colorPrefix}-200 dark:border-${colorPrefix}-800 bg-gradient-to-br from-${colorPrefix}-100/50 to-${colorPrefix}-300/30 dark:from-${colorPrefix}-900/50 dark:to-${colorPrefix}-900/30`,
            title: `text-${colorPrefix}-900 dark:text-${colorPrefix}-200`,
            badge: `bg-${colorPrefix}-500 text-white`,
            item: `bg-white/60 dark:bg-black/40 border border-${colorPrefix}-200 dark:border-${colorPrefix}-900/50 hover:bg-white dark:hover:bg-black/60 transition-colors`,
            medal: {
                1: 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-200',
                2: 'bg-zinc-300 text-zinc-800',
                3: 'bg-amber-600 text-amber-100'
            },
            accuracy: `text-${colorPrefix}-700 dark:text-${colorPrefix}-300`,
            button: `bg-${colorPrefix}-600 hover:bg-${colorPrefix}-700 text-white`
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
            <div className={`rounded-xl p-6 border h-full flex items-center justify-center ${currentStyle.container}`}>
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-current opacity-20 rounded w-3/4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-current opacity-20 rounded"></div>
                            <div className="h-4 bg-current opacity-20 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-6 h-full flex flex-col ${currentStyle.container}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className={`font-bold text-lg flex items-center gap-2 ${currentStyle.title}`}>
                    🏆 Top Sistemas de Números <span className="text-xs font-normal opacity-70">(esperado 50%)</span>
                </h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${currentStyle.badge}`}>
                    Live
                </span>
            </div>

            <div className="flex-1 space-y-3">
                {ranking.map((item, index) => (
                    <div key={item.systemName} className={`flex items-center justify-between p-2 rounded-lg border ${currentStyle.item}`}>
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${index === 0 ? currentStyle.medal[1] : ''}
                                ${index === 1 ? currentStyle.medal[2] : ''}
                                ${index === 2 ? currentStyle.medal[3] : ''}
                            `}>
                                {index + 1}
                            </div>
                            <span className="font-medium text-sm">{formatSystemName(item.system.name)}</span>
                        </div>
                        <span className={`font-bold text-sm ${currentStyle.accuracy}`}>
                            {item.avgAccuracy.toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>

            <Link
                href={game === GameType.EURODREAMS ? "/ranking/eurodreams" : game === GameType.TOTOLOTO ? "/ranking/totoloto" : "/ranking/euromillions"}
                className={`mt-4 w-full py-2 text-center text-sm font-medium rounded-lg transition-colors ${currentStyle.button}`}
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
