import React from 'react';
import { GameType } from '@/types/game';

interface LatestDrawWidgetProps {
    latestDraw: {
        date: Date | string;
        numbers: number[] | string;
        stars: number[] | string;
        jackpot?: number | null;
    } | null;
    variant?: 'dark' | 'light' | 'neutral';
    game?: GameType;
}

// Mapeamento estático completo de classes literais do Tailwind CSS v4 por jogo e variante.
// Isto garante que o compilador estático do Tailwind v4 gera TODAS as classes no CSS bundle,
// prevenindo que as bolas de sorteios fiquem brancas/transparentes com números invisíveis.
const gameThemeMap = {
    [GameType.EUROMILLIONS]: {
        light: {
            container: 'bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/85 dark:border-zinc-800/85 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-300',
            title: 'text-zinc-400 dark:text-zinc-500',
            date: 'text-zinc-800 dark:text-zinc-100',
            jackpot: 'text-euro-600 dark:text-euro-400',
            ball: 'bg-gradient-to-b from-euro-500 to-euro-700 text-white shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold'
        },
        dark: {
            container: 'bg-zinc-900/90 border border-euro-900/50 text-white backdrop-blur-xl shadow-lg',
            title: 'text-euro-300 font-bold',
            date: 'text-white',
            jackpot: 'text-euro-400',
            ball: 'bg-gradient-to-b from-euro-600 to-euro-800 text-white shadow-md shadow-euro-950/40 hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'bg-gradient-to-b from-amber-400 to-amber-600 text-amber-950 shadow-md shadow-amber-600/30 hover:scale-105 transition-transform duration-200 cursor-default font-extrabold'
        }
    },
    [GameType.TOTOLOTO]: {
        light: {
            container: 'bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/85 dark:border-zinc-800/85 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-300',
            title: 'text-zinc-400 dark:text-zinc-500',
            date: 'text-zinc-800 dark:text-zinc-100',
            jackpot: 'text-toto-600 dark:text-toto-400',
            ball: 'bg-gradient-to-b from-toto-500 to-toto-700 text-white shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'bg-gradient-to-b from-toto-300 to-toto-500 text-toto-950 shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold'
        },
        dark: {
            container: 'bg-zinc-900/90 border border-toto-900/50 text-white backdrop-blur-xl shadow-lg',
            title: 'text-toto-300 font-bold',
            date: 'text-white',
            jackpot: 'text-toto-400',
            ball: 'bg-gradient-to-b from-toto-600 to-toto-800 text-white shadow-md shadow-toto-950/40 hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'bg-gradient-to-b from-toto-300 to-toto-500 text-toto-950 shadow-md shadow-toto-950/40 hover:scale-105 transition-transform duration-200 cursor-default font-extrabold'
        }
    },
    [GameType.EURODREAMS]: {
        light: {
            container: 'bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/85 dark:border-zinc-800/85 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-300',
            title: 'text-zinc-400 dark:text-zinc-500',
            date: 'text-zinc-800 dark:text-zinc-100',
            jackpot: 'text-dream-600 dark:text-dream-400',
            ball: 'bg-gradient-to-b from-dream-500 to-dream-700 text-white shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold'
        },
        dark: {
            container: 'bg-zinc-900/90 border border-dream-900/50 text-white backdrop-blur-xl shadow-lg',
            title: 'text-dream-300 font-bold',
            date: 'text-white',
            jackpot: 'text-dream-400',
            ball: 'bg-gradient-to-b from-dream-600 to-dream-800 text-white shadow-md shadow-dream-950/40 hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'bg-gradient-to-b from-amber-400 to-amber-600 text-amber-950 shadow-md shadow-amber-600/30 hover:scale-105 transition-transform duration-200 cursor-default font-extrabold'
        }
    }
};

export default function LatestDrawWidget({ latestDraw, variant = 'light', game = GameType.EUROMILLIONS }: LatestDrawWidgetProps) {
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

    // Mapeamento neutral de backup
    const neutralStyles = {
        container: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100',
        title: 'text-zinc-500 dark:text-zinc-400',
        date: 'text-zinc-800 dark:text-zinc-200',
        jackpot: 'text-zinc-500 dark:text-zinc-400',
        ball: 'bg-zinc-600 text-white shadow-md hover:scale-105 transition-transform duration-200',
        star: 'bg-zinc-500 text-white shadow-md hover:scale-105 transition-transform duration-200'
    };

    // Obter estilos de acordo com o jogo e variante
    const selectedGameTheme = gameThemeMap[game] || gameThemeMap[GameType.EUROMILLIONS];
    const selectedStyle = variant === 'neutral' ? neutralStyles : (selectedGameTheme[variant] || selectedGameTheme.light);

    return (
        <section className={`p-4 rounded-2xl shadow-sm border ${selectedStyle.container}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Left: Title & Date */}
                <div className="flex items-center gap-4">
                    <div className="text-center md:text-left">
                        <h2 className={`text-[10px] font-bold uppercase tracking-wider ${selectedStyle.title}`}>Último Sorteio</h2>
                        <p className={`text-xl font-bold capitalize leading-none ${selectedStyle.date}`} suppressHydrationWarning>
                            {new Date(latestDraw.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    {/* Jackpot (Desktop) */}
                    <div className={`hidden md:block pl-4 border-l border-current/10 ${selectedStyle.jackpot}`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                            {game === GameType.EURODREAMS ? 'Prémio' : 'Jackpot'}
                        </div>
                        <div className="text-lg font-bold leading-none">
                            {game === GameType.EURODREAMS && (!latestDraw.jackpot || latestDraw.jackpot === 0)
                                ? '€20K/mês'
                                : latestDraw.jackpot
                                    ? (latestDraw.jackpot >= 1000000
                                        ? `€${(latestDraw.jackpot / 1000000).toFixed(1).replace('.0', '')}M`
                                        : `€${(latestDraw.jackpot / 1000).toFixed(0)}K`)
                                    : '?'}
                        </div>
                    </div>
                </div>

                {/* Right: Numbers */}
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        {numbers.map((n: number) => (
                            <div key={n} className={`w-10 h-10 flex items-center justify-center text-xl font-bold rounded-full ${selectedStyle.ball}`}>
                                {n}
                            </div>
                        ))}
                    </div>
                    {stars.length > 0 && (
                        <>
                            <div className="text-2xl opacity-20 mx-1">+</div>
                            <div className="flex gap-2">
                                {stars.map((n: number) => (
                                    <div key={n} className={`w-10 h-10 flex items-center justify-center text-xl font-bold rounded-full ${selectedStyle.star}`}>
                                        {n}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Jackpot (Mobile) */}
                <div className={`md:hidden flex items-center gap-2 ${selectedStyle.jackpot}`}>
                    <span className="text-sm font-bold uppercase opacity-70">Jackpot:</span>
                    <span className="text-lg font-bold">{latestDraw.jackpot ? `€${(latestDraw.jackpot / 1000000).toFixed(0)}M` : '?'}</span>
                </div>
            </div>
        </section>
    );
}
