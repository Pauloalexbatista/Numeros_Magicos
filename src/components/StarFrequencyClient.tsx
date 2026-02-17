
'use client';

import { Card } from '@/components/ui/card';

interface StarFrequencyClientProps {
    frequency: Record<number, number>;
    totalDraws: number;
    game?: string;
}

export function StarFrequencyClient({ frequency, totalDraws, game = 'EUROMILLIONS' }: StarFrequencyClientProps) {
    const g = game.toUpperCase();
    const maxStar = g === 'TOTOLOTO' ? 13 : g === 'EURODREAMS' ? 5 : 12;
    const maxFreq = Math.max(...Object.values(frequency), 1);
    const stars = Array.from({ length: maxStar }, (_, i) => i + 1);

    const isTotoloto = g === 'TOTOLOTO';
    const isEuroDreams = g === 'EURODREAMS';
    const themeColor = isTotoloto ? 'emerald' : isEuroDreams ? 'rose' : 'yellow';

    return (
        <Card className={`p-6 bg-gradient-to-br from-${themeColor}-50 to-${themeColor}-100 dark:from-${themeColor}-950 dark:to-${themeColor}-900 border-${themeColor}-200 dark:border-${themeColor}-800 backdrop-blur-sm`}>
            <h2 className={`text-xl font-bold text-${themeColor}-800 dark:text-${themeColor}-200 mb-4 flex items-center gap-2`}>
                📊 Frequência {isTotoloto ? 'do Número da Sorte' : isEuroDreams ? 'do Número de Sonho' : 'das Estrelas'}
            </h2>
            <p className={`text-${themeColor}-700 dark:text-${themeColor}-300 text-sm mb-6`}>
                Quantas vezes cada {isTotoloto ? 'número' : 'estrela'} saiu nos últimos {totalDraws} sorteios.
            </p>

            <div className={`grid grid-cols-${maxStar} gap-1 md:gap-2 h-48 items-end`}>
                {stars.map(star => {
                    const count = frequency[star] || 0;
                    const heightPct = (count / maxFreq) * 100;
                    const isHot = count > maxFreq * 0.8;
                    const isCold = count < maxFreq * 0.3;

                    return (
                        <div key={star} className="flex flex-col items-center gap-2 h-full justify-end group">
                            <div className={`text-xs font-bold text-${themeColor}-900 dark:text-${themeColor}-100 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                {count}
                            </div>
                            <div
                                className={`w-full rounded-t-sm transition-all duration-500 relative
                                    ${isHot ? 'bg-gradient-to-t from-red-500 to-red-400' :
                                        isCold ? 'bg-gradient-to-t from-blue-500 to-blue-400' :
                                            `bg-gradient-to-t from-${themeColor}-500 to-${themeColor}-400 dark:from-${themeColor}-600 dark:to-${themeColor}-500`}
                                `}
                                style={{ height: `${heightPct}%` } as any}
                            >
                                {isHot && (
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                )}
                            </div>
                            <div className={`text-xs md:text-sm font-bold text-${themeColor}-800 dark:text-${themeColor}-200`}>
                                {star}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={`flex flex-wrap justify-center gap-4 md:gap-6 mt-6 text-xs text-${themeColor}-700 dark:text-${themeColor}-400`}>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm" /> Quente ({'>'}80%)
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 bg-${themeColor}-500 dark:bg-${themeColor}-600 rounded-sm`} /> Normal
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm" /> Frio ({'<'}30%)
                </div>
            </div>
        </Card>
    );
}
