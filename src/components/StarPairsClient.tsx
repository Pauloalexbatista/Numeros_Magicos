
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
        <Card className="p-6 bg-slate-900/60 border-slate-800 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                👯 Pares de Estrelas Mais Frequentes
            </h2>
            <p className="text-slate-400 text-sm mb-6">
                As combinações de 2 estrelas que mais saem juntas.
            </p>

            <div className="space-y-3">
                {topPairs.map((stat, index) => {
                    const [s1, s2] = stat.pair.split('-');
                    const isTop3 = index < 3;

                    return (
                        <div key={stat.pair} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50">
                            <div className="flex items-center gap-4">
                                <div className={`
                                    flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm
                                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                        index === 1 ? 'bg-slate-400/20 text-slate-400 border border-slate-400/30' :
                                            index === 2 ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                                                'text-slate-500'}
                                `}>
                                    #{index + 1}
                                </div>

                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-amber-900/20">
                                        {s1}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-amber-900/20">
                                        {s2}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-lg font-bold text-white">
                                    {stat.count}x
                                </div>
                                <div className="text-xs text-slate-500">
                                    Há {stat.lastSeen} sorteios
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
