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

    // Theme logic
    const themeClasses = {
        [GameType.EUROMILLIONS]: {
            border: 'border-euro-200 dark:border-euro-800',
            bg: 'bg-euro-50 dark:bg-euro-950/20',
            gradient: 'from-euro-50 to-blue-50 dark:from-euro-950/30 dark:to-blue-900/10',
            headerText: 'text-euro-800 dark:text-euro-200',
            headerIcon: 'text-euro-600',
            headerBorder: 'border-euro-200 dark:border-euro-800/50',
            badgeBg: 'bg-euro-500',
            badgeText: 'text-white',
            itemBg: 'bg-white/60 dark:bg-black/40',
            itemBorder: 'border-euro-100 dark:border-euro-900/50',
            hitBadgePerfect: 'bg-euro-500 text-white ring-2 ring-euro-300 dark:ring-euro-600',
            hitBadgeLow: 'bg-euro-200 dark:bg-euro-800 text-euro-800 dark:text-euro-200',
            perfectText: 'text-euro-600 dark:text-euro-400'
        },
        [GameType.TOTOLOTO]: {
            border: 'border-toto-200 dark:border-toto-800',
            bg: 'bg-toto-50 dark:bg-toto-950/20',
            gradient: 'from-toto-50 to-emerald-50 dark:from-toto-950/30 dark:to-emerald-900/10',
            headerText: 'text-toto-800 dark:text-toto-200',
            headerIcon: 'text-toto-600',
            headerBorder: 'border-toto-200 dark:border-toto-800/50',
            badgeBg: 'bg-toto-500',
            badgeText: 'text-white',
            itemBg: 'bg-white/60 dark:bg-black/40',
            itemBorder: 'border-toto-100 dark:border-toto-900/50',
            hitBadgePerfect: 'bg-toto-500 text-white ring-2 ring-toto-300 dark:ring-toto-600',
            hitBadgeLow: 'bg-toto-200 dark:bg-toto-800 text-toto-800 dark:text-toto-200',
            perfectText: 'text-toto-600 dark:text-toto-400'
        },
        [GameType.EURODREAMS]: {
            border: 'border-dream-200 dark:border-dream-800',
            bg: 'bg-dream-50 dark:bg-dream-950/20',
            gradient: 'from-dream-50 to-purple-50 dark:from-dream-950/30 dark:to-purple-900/10',
            headerText: 'text-dream-800 dark:text-dream-200',
            headerIcon: 'text-dream-600',
            headerBorder: 'border-dream-200 dark:border-dream-800/50',
            badgeBg: 'bg-dream-500',
            badgeText: 'text-white',
            itemBg: 'bg-white/60 dark:bg-black/40',
            itemBorder: 'border-dream-100 dark:border-dream-900/50',
            hitBadgePerfect: 'bg-dream-500 text-white ring-2 ring-dream-300 dark:ring-dream-600',
            hitBadgeLow: 'bg-dream-200 dark:bg-dream-800 text-dream-800 dark:text-dream-200',
            perfectText: 'text-dream-600 dark:text-dream-400'
        }
    }[game] || {};

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
            <div className={`rounded-xl p-4 border-2 ${themeClasses.border} ${themeClasses.bg} h-full flex items-center justify-center min-h-[160px]`}>
                <div className={`animate-spin ${themeClasses.headerIcon}`}>
                    <Star className="w-6 h-6" />
                </div>
            </div>
        );
    }

    // Filter only those with at least 1 hit
    const winners = results.filter(r => r.hits > 0);
    const perfectWinners = results.filter(r => r.hits === maxStars);

    return (
        <div className={`rounded-xl border-2 ${themeClasses.border} bg-gradient-to-br ${themeClasses.gradient} overflow-hidden relative shadow-sm`}>
            {/* Header */}
            <div className={`p-4 border-b ${themeClasses.headerBorder} flex justify-between items-center bg-white/50 dark:bg-black/20`}>
                <div>
                    <h3 className={`font-bold text-lg ${themeClasses.headerText} flex items-center gap-2`}>
                        <Trophy className={`w-5 h-5 ${themeClasses.headerIcon}`} />
                        Melhores Sistemas de {starLabel} em <span className="text-sm font-semibold opacity-90 underline decoration-dotted decoration-current cursor-help" title="Data do último sorteio analisado">({lastDrawDate})</span>
                    </h3>
                </div>
                {perfectWinners.length > 0 && (
                    <span className={`px-3 py-1 rounded-full ${themeClasses.badgeBg} ${themeClasses.badgeText} text-xs font-bold shadow-lg animate-pulse`}>
                        {perfectWinners.length} JACKPOTS!
                    </span>
                )}
            </div>

            {/* List */}
            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {winners.length > 0 ? (
                    <div className="space-y-2">
                        {winners.map((result, idx) => (
                            <div key={result.systemName} className={`flex items-center justify-between p-3 rounded-lg ${themeClasses.itemBg} border ${themeClasses.itemBorder} hover:scale-[1.01] transition-all`}>
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        h-8 px-3 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm min-w-[3.5rem]
                                        ${result.hits === maxStars ? themeClasses.hitBadgePerfect : themeClasses.hitBadgeLow}
                                    `}>
                                        {result.hits}/{maxStars}
                                    </div>
                                    <span className="font-bold text-zinc-700 dark:text-zinc-200">
                                        {formatSystemName(result.systemName)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    {result.hits === maxStars && <span className={`text-xs font-bold ${themeClasses.perfectText}`}>PERFEITO!</span>}
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
