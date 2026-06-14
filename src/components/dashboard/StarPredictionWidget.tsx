'use client';

import { useEffect, useState } from 'react';
import { getStarSuggestions } from '@/app/analysis/stars/actions';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { GameType } from '@/types/game';

export default function StarPredictionWidget({ game = GameType.EUROMILLIONS }: { game?: GameType }) {
    const [suggestions, setSuggestions] = useState<any>(null);

    useEffect(() => {
        getStarSuggestions(game).then(setSuggestions);
    }, [game]);

    if (!suggestions) return <div className="animate-pulse h-48 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />;

    const formatPair = (pair: string) => pair.split('-').map(n => n.padStart(2, '0')).join('+');
    
    // Automatic labels
    const starLabel = game === GameType.TOTOLOTO ? 'Previsões de Nº da Sorte' : game === GameType.EURODREAMS ? 'Previsões de Sonho' : 'Previsões de Estrelas';

    return (
        <div data-game={game} className="h-full">
            <Card className="flex h-full flex-col justify-between rounded-2xl border border-border p-6 shadow-sm backdrop-blur-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-accent">
                            ⭐ {starLabel}
                        </h3>
                        <Link href="/analysis/stars" className="text-xs text-muted-foreground transition-colors hover:text-white">
                            Ver Análise &rarr;
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-border p-2" style={{ background: 'rgba(0,0,0,0.15)' }}>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-accent">Ouro 👑</span>
                                <span className="text-xs text-muted-foreground">Historico</span>
                            </div>
                            <div className="text-xl font-black text-white tracking-tight">
                                {formatPair(suggestions.golden.pair)}
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border p-2" style={{ background: 'rgba(0,0,0,0.15)' }}>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Momento 🔥</span>
                                <span className="text-xs text-muted-foreground">Ultimos 100</span>
                            </div>
                            <div className="text-xl font-black text-white tracking-tight">
                                {formatPair(suggestions.hot.pair)}
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border p-2" style={{ background: 'rgba(0,0,0,0.15)' }}>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Racional 🧠</span>
                                <span className="text-xs text-muted-foreground">Estatistico</span>
                            </div>
                            <div className="text-xl font-black text-white tracking-tight">
                                {formatPair(suggestions.rational.pair)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-center text-[10px] text-muted-foreground">
                    Sugestoes baseadas em IA e estatistica pura.
                </div>
            </Card>
        </div>
    );
}