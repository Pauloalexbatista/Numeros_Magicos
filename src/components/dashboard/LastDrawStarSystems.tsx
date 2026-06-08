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
            border: 'border-blue-200 dark:border-blue-800',
            bg: 'bg-blue-50 dark:bg-blue-950/20',
            gradient: 'from-blue-50 to-blue-50 dark:from-blue-950/30 dark:to-blue-900/10',
            headerText: 'text-foreground',
            headerIcon: 'text-blue-600',
            headerBorder: 'border-blue-200 dark:border-blue-800/50',
            badgeBg: 'bg-blue-500',
            badgeText: 'text-white',
            itemBg: 'bg-card',
            itemBorder: 'border-blue-100 dark:border-blue-900/50',
            hitBadgePerfect: 'bg-blue-500 text-white ring-2 ring-blue-300 dark:ring-blue-600',
            hitBadgeLow: 'bg-blue-200 dark:bg-blue-800 text-foreground',
            perfectText: 'text-blue-600 dark:text-blue-400'
        },
        [GameType.TOTOLOTO]: {
            border: 'border-emerald-200 dark:border-emerald-800',
            bg: 'bg-emerald-50 dark:bg-emerald-950/20',
            gradient: 'from-emerald-50 to-emerald-50 dark:from-emerald-950/30 dark:to-emerald-900/10',
            headerText: 'text-foreground',
            headerIcon: 'text-emerald-600',
            headerBorder: 'border-emerald-200 dark:border-emerald-800/50',
            badgeBg: 'bg-emerald-500',
            badgeText: 'text-white',
            itemBg: 'bg-card',
            itemBorder: 'border-emerald-100 dark:border-emerald-900/50',
            hitBadgePerfect: 'bg-emerald-500 text-white ring-2 ring-emerald-300 dark:ring-emerald-600',
            hitBadgeLow: 'bg-emerald-200 dark:bg-emerald-800 text-foreground',
            perfectText: 'text-emerald-600 dark:text-emerald-400'
        },
        [GameType.EURODREAMS]: {
            border: 'border-purple-200 dark:border-purple-800',
            bg: 'bg-purple-50 dark:bg-purple-950/20',
            gradient: 'from-purple-50 to-purple-50 dark:from-purple-950/30 dark:to-purple-900/10',
            headerText: 'text-foreground',
            headerIcon: 'text-purple-600',
            headerBorder: 'border-purple-200 dark:border-purple-800/50',
            badgeBg: 'bg-purple-500',
            badgeText: 'text-white',
            itemBg: 'bg-card',
            itemBorder: 'border-purple-100 dark:border-purple-900/50',
            hitBadgePerfect: 'bg-purple-500 text-white ring-2 ring-purple-300 dark:ring-purple-600',
            hitBadgeLow: 'bg-purple-200 dark:bg-purple-800 text-foreground',
            perfectText: 'text-purple-600 dark:text-purple-400'
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
            <div className={`p-4 border-b ${themeClasses.headerBorder} flex justify-between items-center bg-card/30 backdrop-blur-sm`}>
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
                                    <span className="font-bold text-foreground">
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
