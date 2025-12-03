'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RankingData {
    systemName: string;
    avgAccuracy: number;
    system: {
        name: string;
    };
}

interface RankingSummaryWidgetProps {
    variant?: 'dark' | 'light' | 'neutral';
}

export default function RankingSummaryWidget({ variant = 'light' }: RankingSummaryWidgetProps) {
    const [ranking, setRanking] = useState<RankingData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/ranking?limit=3')
            .then(res => res.json())
            .then(data => {
                if (data.ranking) {
                    setRanking(data.ranking.slice(0, 3));
                }
            })
            .catch(err => console.error('Failed to load ranking summary', err))
            .finally(() => setLoading(false));
    }, []);

    // Color Styles Mapping
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
            container: 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100',
            title: 'text-zinc-900 dark:text-zinc-100',
            badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            item: 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800',
            medal: {
                1: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                2: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
                3: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            },
            accuracy: 'text-blue-600 dark:text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-700 text-white'
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
        <div className={`rounded-xl p-6 border h-full flex flex-col ${currentStyle.container}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className={`font-bold text-lg flex items-center gap-2 ${currentStyle.title}`}>
                    🏆 Top Sistemas <span className="text-xs font-normal opacity-70">(esperado 50%)</span>
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
                            <span className="font-medium text-sm">{item.system.name}</span>
                        </div>
                        <span className={`font-bold text-sm ${currentStyle.accuracy}`}>
                            {item.avgAccuracy.toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>

            <Link
                href="/ranking"
                className={`mt-4 w-full py-2 text-center text-sm font-medium rounded-lg transition-colors ${currentStyle.button}`}
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
