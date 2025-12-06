'use client';

import { useEffect, useState } from 'react';
import { getStarSystemRanking } from '@/app/analysis/stars/actions';
import Link from 'next/link';

interface StarRankingData {
    id: number;
    systemName: string;
    avgAccuracy: number;
    totalPredictions: number;
}

interface TopStarSystemsWidgetProps {
    variant?: 'dark' | 'light' | 'neutral';
}

export default function TopStarSystemsWidget({ variant = 'light' }: TopStarSystemsWidgetProps) {
    const [topSystems, setTopSystems] = useState<StarRankingData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getStarSystemRanking();
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
    }, []);

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
            container: 'rounded-xl border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-900/10',
            title: 'text-yellow-800 dark:text-yellow-200',
            badge: 'bg-yellow-500 text-black',
            item: 'bg-white/60 dark:bg-black/40 border border-yellow-100 dark:border-yellow-900/50 hover:bg-white dark:hover:bg-black/60 transition-colors',
            medal: {
                1: 'bg-yellow-500 text-black ring-2 ring-yellow-300 dark:ring-yellow-600',
                2: 'bg-zinc-300 text-zinc-800',
                3: 'bg-amber-600 text-amber-100'
            },
            accuracy: 'text-yellow-700 dark:text-yellow-300',
            button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
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
        <div className={`p-6 h-full flex flex-col ${currentStyle.container}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className={`font-bold text-lg flex items-center gap-2 ${currentStyle.title}`}>
                    🏆 Top Sistemas de Estrelas <span className="text-xs font-normal opacity-70">(esperado 33%)</span>
                </h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${currentStyle.badge}`}>
                    Live
                </span>
            </div>

            <div className="flex-1 space-y-3">
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
                                <span className="font-medium text-sm">{sys.systemName}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`font-bold text-sm ${currentStyle.accuracy}`}>
                                {sys.avgAccuracy.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                ))}
                {topSystems.length === 0 && (
                    <div className="text-center text-sm opacity-50 py-4">Sem dados.</div>
                )}
            </div>

            <Link
                href="/analysis/stars/ranking"
                className={`mt-4 w-full py-2 text-center text-sm font-medium rounded-lg transition-colors ${currentStyle.button}`}
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
