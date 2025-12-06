
'use client';

import { Card } from '@/components/ui/card';

interface StarPairStat {
    pair: string; // "2-8"
    count: number;
    lastSeen: number; // Draws ago
}

interface StarPairsClientProps {
    pairs: StarPairStat[];
}

export function StarPairsClient({ pairs }: StarPairsClientProps) {
    const topPairs = pairs.slice(0, 10);

    return (
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center gap-2">
                👯 Pares de Estrelas Mais Frequentes
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-6">
                As combinações de 2 estrelas que mais saem juntas.
            </p>

            <div className="space-y-2">
                {topPairs.map((stat, index) => {
                    const [s1, s2] = stat.pair.split('-');

                    return (
                        <div key={stat.pair} className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors border border-yellow-200/50 dark:border-yellow-700/30">
                            <div className="flex items-center gap-4">
                                <div className={`
                                    flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs
                                    ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                        index === 1 ? 'bg-zinc-300 text-zinc-800' :
                                            index === 2 ? 'bg-orange-300 text-orange-900' :
                                                'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300'}
                                `}>
                                    #{index + 1}
                                </div>

                                <div className="flex gap-1">
                                    <div className="w-8 h-8 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center text-yellow-950 font-black shadow-sm">
                                        {s1}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center text-yellow-950 font-black shadow-sm">
                                        {s2}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-base font-bold text-yellow-900 dark:text-yellow-100">
                                    {stat.count}x
                                </div>
                                <div className="text-[10px] text-yellow-700 dark:text-yellow-400">
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
