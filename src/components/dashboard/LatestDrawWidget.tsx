'use client';

import React from 'react';
import { GameType } from '@/types/game';

interface LatestDraw {
    date: Date | string;
    numbers: number[] | string;
    stars: number[] | string;
    jackpot?: number | null;
}

interface LatestDrawWidgetProps {
    latestDraw: LatestDraw | null;
    variant?: 'dark' | 'light' | 'neutral';
    game?: GameType;
}

function getNumbers(val: number[] | string): number[] {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
}

export default function LatestDrawWidget({ latestDraw, game = GameType.EUROMILLIONS }: LatestDrawWidgetProps) {
    if (!latestDraw) return null;

    const numbers = getNumbers(latestDraw.numbers);
    const stars = getNumbers(latestDraw.stars);

    return (
        <section className="rounded-2xl border border-border bg-surface-1/60 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ultimo Sorteio</h2>
                        <p className="text-xl font-bold capitalize leading-none text-foreground" suppressHydrationWarning>
                            {new Date(latestDraw.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <div className="hidden md:block pl-4 border-l border-border/60 text-muted-foreground">
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                            {game === GameType.EURODREAMS ? 'Premio' : 'Jackpot'}
                        </div>
                        <div className="text-lg font-bold leading-none text-foreground">
                            {game === GameType.EURODREAMS && (!latestDraw.jackpot || latestDraw.jackpot === 0)
                                ? '20K/mes'
                                : latestDraw.jackpot
                                    ? (latestDraw.jackpot >= 1000000
                                        ? `${(latestDraw.jackpot / 1000000).toFixed(1).replace('.0', '')}M`
                                        : `${(latestDraw.jackpot / 1000).toFixed(0)}K`)
                                    : '?'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        {numbers.map((n: number) => (
                            <div
                                key={n}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold shadow-md ring-2 ring-white/10 transition-transform duration-200 hover:scale-105 bg-accent text-white"
                                style={{ boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent)' }}
                            >
                                {n}
                            </div>
                        ))}
                    </div>
                    {stars.length > 0 && (
                        <>
                            <div className="text-2xl opacity-20 mx-1">+</div>
                            <div className="flex gap-2">
                                {stars.map((n: number) => (
                                    <div
                                        key={n}
                                        className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold shadow-md ring-2 ring-white/10 transition-transform duration-200 hover:scale-105 text-white"
                                        style={{ background: 'color-mix(in srgb, var(--accent) 60%, #f59e0b)', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}
                                    >
                                        {n}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="md:hidden flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm font-bold uppercase opacity-70">Jackpot:</span>
                    <span className="text-lg font-bold text-foreground">{latestDraw.jackpot ? `${(latestDraw.jackpot / 1000000).toFixed(0)}M` : '?'}</span>
                </div>
            </div>
        </section>
    );
}

interface LatestDrawCardProps {
    latestDraw: LatestDraw | null;
}

export function LatestDrawCard({ latestDraw }: LatestDrawCardProps) {
    if (!latestDraw) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-border bg-surface-1/60 p-6 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    A carregar sorteio mais recente...
                </span>
            </div>
        );
    }

    const numbers = getNumbers(latestDraw.numbers);
    const stars = getNumbers(latestDraw.stars);

    return (
        <div className="rounded-2xl border border-border bg-surface-1/60 p-4 shadow-sm">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ultimo Sorteio</h2>
                        <p className="text-xl font-bold capitalize leading-none text-foreground" suppressHydrationWarning>
                            {new Date(latestDraw.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 text-muted-foreground">Jackpot</div>
                        <div className="text-lg font-bold leading-none text-foreground">
                            {latestDraw.jackpot
                                ? latestDraw.jackpot >= 1000000
                                    ? `${(latestDraw.jackpot / 1000000).toFixed(1).replace('.0', '')}M`
                                    : `${(latestDraw.jackpot / 1000).toFixed(0)}K`
                                : '?'}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {numbers.map((n: number) => (
                        <div key={n} className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold shadow-md ring-2 ring-white/10 bg-accent text-white">
                            {n}
                        </div>
                    ))}
                    {stars.length > 0 && (
                        <>
                            <div className="text-2xl opacity-20 mx-1">+</div>
                            {stars.map((n: number) => (
                                <div key={n} className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold shadow-md ring-2 ring-white/10 text-white" style={{ background: 'color-mix(in srgb, var(--accent) 60%, #f59e0b)' }}>
                                    {n}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}