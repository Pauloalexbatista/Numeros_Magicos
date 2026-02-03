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

    // Game Specifics
    const maxStars = game === GameType.EUROMILLIONS ? 2 : 1;
    const isTotoloto = game === GameType.TOTOLOTO;
    const isEuroDreams = game === GameType.EURODREAMS;

    // Determines label (Star / Lucky Number / Dream) based on game - optional visual enhancement
    const starLabel = isTotoloto ? 'Número da Sorte' : isEuroDreams ? 'Sonho' : 'Estrelas';

    useEffect(() => {
        async function load() {
            try {
                const data = await getLastDrawStarResults(game);
                setResults(data.results);
                setLastDrawDate(data.lastDrawDate);
            } catch (e) {
                console.error("Failed to load last draw star systems", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [game]);

    if (loading) {
        return (
            <div className="rounded-xl p-4 border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 h-full flex items-center justify-center min-h-[160px]">
                <div className="animate-spin text-yellow-500">
                    <Star className="w-6 h-6" />
                </div>
            </div>
        );
    }

    // Filter only those with at least 1 hit
    const winners = results.filter(r => r.hits > 0);
    const perfectWinners = results.filter(r => r.hits === maxStars);

    return (
        <div className="rounded-xl border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-900/10 overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-yellow-200 dark:border-yellow-800/50 flex justify-between items-center bg-white/50 dark:bg-black/20">
                <div>
                    <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        Melhores Sistemas de {starLabel} em <span className="text-sm font-semibold opacity-90 text-yellow-700 dark:text-yellow-300">({lastDrawDate})</span>
                    </h3>
                </div>
                {perfectWinners.length > 0 && (
                    <span className="px-3 py-1 rounded-full bg-yellow-500 text-black text-xs font-bold shadow-lg animate-pulse">
                        {perfectWinners.length} JACKPOTS!
                    </span>
                )}
            </div>

            {/* List */}
            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {winners.length > 0 ? (
                    <div className="space-y-2">
                        {winners.map((result, idx) => (
                            <div key={result.systemName} className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-black/40 border border-yellow-100 dark:border-yellow-900/50 hover:bg-white dark:hover:bg-black/60 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        h-8 px-3 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm min-w-[3.5rem]
                                        ${result.hits === maxStars ? 'bg-yellow-500 text-black ring-2 ring-yellow-300 dark:ring-yellow-600' : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'}
                                    `}>
                                        {result.hits}/{maxStars}
                                    </div>
                                    <span className="font-bold text-zinc-700 dark:text-zinc-200">
                                        {formatSystemName(result.systemName)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    {/* Visual representation of hits if we had prediction data, but simple text is fine */}
                                    {result.hits === maxStars && <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">PERFEITO!</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-zinc-400 dark:text-zinc-500">
                        <Minus className="w-8 h-8 mb-3 opacity-50" />
                        <p className="text-sm">Nenhum sistema acertou {starLabel} neste sorteio.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
