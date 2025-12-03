'use client';

import React, { useEffect, useState } from 'react';
import { Draw } from '@prisma/client';
import { getSystemPerformancesForDraw } from '@/app/actions';

// Define a flexible interface that handles both Prisma (string) and Parsed (number[])
interface LatestDrawProps {
    id: number;
    date: Date | string;
    numbers: string | number[];
    stars: string | number[];
    jackpot?: number | null;
}

interface LatestDrawCardProps {
    latestDraw: LatestDrawProps;
    variant?: 'dark' | 'light';
}

export default function LatestDrawCard({ latestDraw, variant = 'light' }: LatestDrawCardProps) {
    const [topSystems, setTopSystems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper to ensure array
    const getNumbers = (val: string | number[]) => {
        if (Array.isArray(val)) return val;
        try {
            return JSON.parse(val);
        } catch {
            return [];
        }
    };

    const numbers = getNumbers(latestDraw.numbers);
    const stars = getNumbers(latestDraw.stars);

    useEffect(() => {
        async function load() {
            try {
                const data = await getSystemPerformancesForDraw(latestDraw.id);
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
    }, [latestDraw.id]);

    // Styles (matching other cards)
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
            accuracy: 'text-green-600 dark:text-green-400',
            button: 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }
    };

    const currentStyle = styles[variant] || styles.light;

    return (
        <div className={`rounded-xl p-6 border h-full flex flex-col ${currentStyle.container}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className={`font-bold text-lg flex items-center gap-2 ${currentStyle.title}`}>
                    🔮 Último Sorteio
                </h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${currentStyle.badge}`}>
                    {new Date(latestDraw.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
                </span>
            </div>

            <div className="flex-1 space-y-3">
                <div className="text-xs font-bold uppercase opacity-50 mb-2">Melhores Previsões</div>

                {loading ? (
                    <div className="text-center text-sm opacity-50 py-2 italic">A carregar...</div>
                ) : topSystems.length > 0 ? (
                    topSystems.map((sys, i) => (
                        <div key={sys.id} className={`flex justify-between items-center text-sm p-2 rounded ${currentStyle.item}`}>
                            <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? currentStyle.medal[1] :
                                    i === 1 ? currentStyle.medal[2] :
                                        currentStyle.medal[3]
                                    }`}>{i + 1}</span>
                                <span className="font-medium truncate max-w-[120px]">{sys.systemName}</span>
                            </div>
                            <span className={`font-bold ${currentStyle.accuracy}`}>{sys.hits}/5</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-sm opacity-50 py-2">Sem dados de performance.</div>
                )}
            </div>
        </div>
    );
}
