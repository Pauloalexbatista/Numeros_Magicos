import React from 'react';

interface LatestDrawWidgetProps {
    latestDraw: {
        date: Date | string;
        numbers: number[] | string;
        stars: number[] | string;
        jackpot?: number | null;
    } | null;
    variant?: 'dark' | 'light' | 'neutral';
}

export default function LatestDrawWidget({ latestDraw, variant = 'light' }: LatestDrawWidgetProps) {
    if (!latestDraw) return null;

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

    // Color Styles Mapping
    const styles = {
        dark: {
            container: 'bg-indigo-950 border-indigo-900 text-white',
            title: 'text-indigo-200',
            date: 'text-white',
            jackpot: 'text-indigo-300',
            ball: 'bg-blue-600 text-white shadow-lg shadow-blue-900/50',
            star: 'bg-yellow-500 text-white shadow-lg shadow-yellow-900/50'
        },
        light: {
            container: 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100',
            title: 'text-zinc-400',
            date: 'text-zinc-900 dark:text-white',
            jackpot: 'text-zinc-500',
            ball: 'bg-blue-600 text-white shadow-md',
            star: 'bg-yellow-500 text-white shadow-md'
        },
        neutral: {
            container: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100',
            title: 'text-zinc-500 dark:text-zinc-400',
            date: 'text-zinc-800 dark:text-zinc-200',
            jackpot: 'text-zinc-500 dark:text-zinc-400',
            ball: 'bg-zinc-600 text-white shadow-md',
            star: 'bg-zinc-500 text-white shadow-md'
        }
    };

    const currentStyle = styles[variant] || styles.light;

    return (
        <section className={`p-4 rounded-2xl shadow-sm border ${currentStyle.container}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Left: Title & Date */}
                <div className="flex items-center gap-4">
                    <div className="text-center md:text-left">
                        <h2 className={`text-[10px] font-bold uppercase tracking-wider ${currentStyle.title}`}>Último Sorteio</h2>
                        <p className={`text-xl font-bold capitalize leading-none ${currentStyle.date}`}>
                            {new Date(latestDraw.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    {/* Jackpot (Desktop) */}
                    <div className={`hidden md:block pl-4 border-l border-current/10 ${currentStyle.jackpot}`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Jackpot</div>
                        <div className="text-lg font-bold leading-none">{latestDraw.jackpot ? `€${(latestDraw.jackpot / 1000000).toFixed(0)}M` : '?'}</div>
                    </div>
                </div>

                {/* Right: Numbers */}
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        {numbers.map((n: number) => (
                            <div key={n} className={`w-10 h-10 flex items-center justify-center text-xl font-bold rounded-full ${currentStyle.ball}`}>
                                {n}
                            </div>
                        ))}
                    </div>
                    <div className="text-2xl opacity-20 mx-1">+</div>
                    <div className="flex gap-2">
                        {stars.map((n: number) => (
                            <div key={n} className={`w-10 h-10 flex items-center justify-center text-xl font-bold rounded-full ${currentStyle.star}`}>
                                {n}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Jackpot (Mobile) */}
                <div className={`md:hidden flex items-center gap-2 ${currentStyle.jackpot}`}>
                    <span className="text-sm font-bold uppercase opacity-70">Jackpot:</span>
                    <span className="text-lg font-bold">{latestDraw.jackpot ? `€${(latestDraw.jackpot / 1000000).toFixed(0)}M` : '?'}</span>
                </div>
            </div>
        </section>
    );
}
