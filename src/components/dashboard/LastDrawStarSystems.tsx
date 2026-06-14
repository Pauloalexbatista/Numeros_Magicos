'use client';

import { useEffect, useState } from 'react';
import { Star, Trophy, Minus } from 'lucide-react';
import { getLastDrawStarResults } from '@/app/analysis/stars/actions';
import { formatSystemName } from '@/utils/formatters';
import { GameType } from '@/types/game';

interface SystemResult {
    systemName: string;
    hits: number;
    stars: number[];
}

interface LastDrawStarSystemsProps {
    game?: GameType;
}

export default function LastDrawStarSystems({ game = GameType.EUROMILLIONS }: LastDrawStarSystemsProps) {
    const [results, setResults] = useState<SystemResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastDrawDate, setLastDrawDate] = useState<string>('');

    const isTotoloto = game === GameType.TOTOLOTO;
    const isEuroDreams = game === GameType.EURODREAMS;
    const maxStars = isTotoloto ? 1 : isEuroDreams ? 1 : 2;
    const starLabel = isTotoloto ? 'Numero da Sorte' : isEuroDreams ? 'Sonho' : 'Estrelas';

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const data = await getLastDrawStarResults(game);
                if (!cancelled && data) {
                    if (data.lastDrawDate) setLastDrawDate(data.lastDrawDate);
                    setResults(data.results.sort((a: SystemResult, b: SystemResult) => b.hits - a.hits));
                }
            } catch (e) {
                if (!cancelled) console.error('Failed to load last draw star systems', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [game]);

    if (loading) {
        return (
            <div className="rounded-xl p-4 border-2 border-accent-border bg-surface-1/60 h-full flex items-center justify-center min-h-[160px]">
                <div className="animate-spin text-accent">
                    <Star className="w-6 h-6" />
                </div>
            </div>
        );
    }

    const winners = results.filter(r => r.hits > 0);
    const perfectWinners = results.filter(r => r.hits === maxStars);

    return (
        <div className="rounded-xl border-2 border-accent-border overflow-hidden relative shadow-sm" style={{ background: 'color-mix(in srgb, var(--accent) 6%, var(--surface-1))' }}>
            {/* Header */}
            <div className="p-4 border-b border-accent-border flex justify-between items-center bg-surface-1/30 backdrop-blur-sm">
                <div>
                    <h3 className="font-bold text-lg text-accent flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-accent" />
                        Melhores Sistemas de {starLabel} em{' '}
                        <span className="text-sm font-semibold opacity-90 underline decoration-dotted cursor-help" title="Data do ultimo sorteio analisado">
                            ({lastDrawDate})
                        </span>
                    </h3>
                </div>
                {perfectWinners.length > 0 && (
                    <span className="shrink-0 shrink-0 px-3 py-1 rounded-full bg-accent text-white text-xs font-bold shadow-lg animate-pulse">
                        {perfectWinners.length} JACKPOTS!
                    </span>
                )}
            </div>

            {/* List */}
            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {winners.length > 0 ? (
                    <div className="space-y-2">
                        {winners.map((result) => (
                            <div key={result.systemName} className="flex items-center justify-between p-3 rounded-lg bg-surface-1/60 border border-accent-border hover:scale-[1.01] transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 px-3 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm min-w-[3.5rem] ${
                                        result.hits === maxStars
                                            ? 'bg-accent text-white'
                                            : 'bg-surface-2 text-accent'
                                    }`}>
                                        {result.hits}/{maxStars}
                                    </div>
                                    <span className="font-bold text-foreground">
                                        {formatSystemName(result.systemName)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {result.hits === maxStars && (
                                        <span className="text-xs font-bold text-accent">PERFEITO!</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Minus className="w-8 h-8 mb-3 opacity-50" />
                        <p className="text-sm">Nenhum sistema acertou {starLabel} neste sorteio.</p>
                    </div>
                )}
            </div>
        </div>
    );
}