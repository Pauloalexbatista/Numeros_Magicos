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
            container: 'bg-card/50 backdrop-blur-sm border border-border shadow-xl transition-all duration-700',
            title: 'text-muted-foreground',
            date: 'text-foreground',
            jackpot: 'text-blue-600 dark:text-blue-400',
            ball: 'ball-euro text-white shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'ball-star shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold'
        },
        dark: {
            container: 'bg-card/50 backdrop-blur-sm border border-border text-foreground shadow-xl transition-all duration-700',
            title: 'text-foreground font-bold',
            date: 'text-white',
            jackpot: 'text-blue-400',
            ball: 'ball-euro text-white shadow-md shadow-blue-950/40 hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'ball-star shadow-md shadow-amber-600/30 hover:scale-105 transition-transform duration-200 cursor-default font-extrabold'
        }
    },
    [GameType.TOTOLOTO]: {
        light: {
            container: 'bg-card/50 backdrop-blur-sm border border-border shadow-xl transition-all duration-700',
            title: 'text-muted-foreground',
            date: 'text-foreground',
            jackpot: 'text-emerald-600 dark:text-emerald-400',
            ball: 'ball-toto text-white shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'bg-gradient-to-b from-emerald-300 to-emerald-500 text-emerald-950 shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold'
        },
        dark: {
            container: 'bg-card/50 backdrop-blur-sm border border-border text-foreground shadow-xl transition-all duration-700',
            title: 'text-foreground font-bold',
            date: 'text-white',
            jackpot: 'text-emerald-400',
            ball: 'ball-toto text-white shadow-md shadow-emerald-950/40 hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'bg-gradient-to-b from-emerald-300 to-emerald-500 text-emerald-950 shadow-md shadow-emerald-950/40 hover:scale-105 transition-transform duration-200 cursor-default font-extrabold'
        }
    },
    [GameType.EURODREAMS]: {
        light: {
            container: 'bg-card/50 backdrop-blur-sm border border-border shadow-xl transition-all duration-700',
            title: 'text-muted-foreground',
            date: 'text-foreground',
            jackpot: 'text-purple-600 dark:text-purple-400',
            ball: 'ball-dream text-white shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'ball-star shadow-sm hover:scale-105 transition-transform duration-200 cursor-default font-bold'
        },
        dark: {
            container: 'bg-card/50 backdrop-blur-sm border border-border text-foreground shadow-xl transition-all duration-700',
            title: 'text-foreground font-bold',
            date: 'text-white',
            jackpot: 'text-purple-400',
            ball: 'ball-dream text-white shadow-md shadow-purple-950/40 hover:scale-105 transition-transform duration-200 cursor-default font-bold',
            star: 'ball-star shadow-md shadow-amber-600/30 hover:scale-105 transition-transform duration-200 cursor-default font-extrabold'
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
        container: 'bg-card/50 border border-border text-foreground',
        title: 'text-muted-foreground',
        date: 'text-foreground',
        jackpot: 'text-muted-foreground',
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
