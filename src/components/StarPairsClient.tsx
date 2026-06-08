
'use client';

import { Card } from '@/components/ui/card';

interface StarPairStat {
    pair: string; // "2-8"
    count: number;
    lastSeen: number; // Draws ago
}

interface StarPairsClientProps {
    pairs: StarPairStat[];
    game?: string;
}

export function StarPairsClient({ pairs, game = 'EUROMILLIONS' }: StarPairsClientProps) {
    const isTotoloto = game === 'TOTOLOTO';
    const isEuroDreams = game === 'EURODREAMS';
    const themeColor = isTotoloto ? 'emerald' : isEuroDreams ? 'rose' : 'yellow';

    // Pair analysis only makes sense for 2-star games
    if (isTotoloto || isEuroDreams) return null;

    const topPairs = pairs.slice(0, 10);

    return (
        <Card className={`p-6 bg-gradient-to-br from-${themeColor}-50 to-${themeColor}-100 dark:from-${themeColor}-950 dark:to-${themeColor}-900 border-${themeColor}-200 dark:border-${themeColor}-800 backdrop-blur-sm`}>
            <h2 className={`text-xl font-bold text-${themeColor}-800 dark:text-${themeColor}-200 mb-4 flex items-center gap-2`}>
                👯 Pares de Estrelas Mais Frequentes
            </h2>
            <p className={`text-${themeColor}-700 dark:text-${themeColor}-300 text-sm mb-6`}>
                As combinações das 2 estrelas vencedoras que mais saem juntas.
            </p>

            <div className="space-y-2">
                {topPairs.map((stat, index) => {
                    const [s1, s2] = stat.pair.split('-');

                    return (
                        <div key={stat.pair} className={`flex items-center justify-between p-2 rounded-lg bg-card/30 backdrop-blur-sm hover:bg-${themeColor}-200 dark:hover:bg-${themeColor}-800/50 transition-colors border border-${themeColor}-200/50 dark:border-${themeColor}-700/30`}>
                            <div className="flex items-center gap-4">
                                <div className={`
                                    flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs
                                    ${index === 0 ? `bg-${themeColor}-400 text-${themeColor}-900` :
                                        index === 1 ? 'bg-zinc-300 text-zinc-800' :
                                            index === 2 ? 'bg-orange-300 text-orange-900' :
                                                `bg-${themeColor}-200 dark:bg-${themeColor}-800 text-${themeColor}-700 dark:text-${themeColor}-300`}
                                `}>
                                    #{index + 1}
                                </div>

                                <div className="flex gap-1">
                                    <div className={`w-8 h-8 rounded-full bg-${themeColor}-400 dark:bg-${themeColor}-500 flex items-center justify-center text-${themeColor}-950 font-black shadow-sm`}>
                                        {s1}
                                    </div>
                                    <div className={`w-8 h-8 rounded-full bg-${themeColor}-400 dark:bg-${themeColor}-500 flex items-center justify-center text-${themeColor}-950 font-black shadow-sm`}>
                                        {s2}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className={`text-base font-bold text-${themeColor}-900 dark:text-${themeColor}-100`}>
                                    {stat.count}x
                                </div>
                                <div className={`text-[10px] text-${themeColor}-700 dark:text-${themeColor}-400`}>
                                    Há {stat.lastSeen}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
