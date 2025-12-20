'use client';

import { Card } from '@/components/ui/card';
import { Users, Star } from 'lucide-react';

interface ConsensusItem {
    star: number;
    count: number;
}

interface Props {
    consensus: ConsensusItem[];
}

export default function StarConsensusWidget({ consensus }: Props) {
    const maxVotes = Math.max(...consensus.map(c => c.count), 1);
    const topStars = consensus.slice(0, 3); // Top 3 consensus stars

    return (
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 backdrop-blur-md">
            <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                Consenso dos Sistemas
                <span className="text-xs font-normal text-yellow-600/60 dark:text-yellow-400/60 ml-2">Acordo entre 8 algoritmos</span>
            </h2>

            <div className="space-y-4">
                {consensus.slice(0, 6).map((item, index) => {
                    const widthPct = (item.count / maxVotes) * 100;
                    const isTop = index < 2;

                    return (
                        <div key={item.star} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center font-black transition-all
                                        ${isTop ? 'bg-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/20' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}
                                    `}>
                                        {item.star}
                                    </div>
                                    <span className={isTop ? 'font-bold text-yellow-900 dark:text-yellow-100' : 'text-yellow-700 dark:text-yellow-400 font-medium'}>
                                        {item.count} votos de confiança
                                    </span>
                                </div>
                                <span className="text-xs font-mono text-yellow-600 dark:text-yellow-500">{Math.round((item.count / 8) * 100)}% de acordo</span>
                            </div>
                            <div className="h-1.5 w-full bg-yellow-200/50 dark:bg-yellow-900/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${isTop ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-yellow-400/60'}`}
                                    style={{ width: `${widthPct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
                    💡 **Dica Estratégica:** As estrelas com maior consenso representam a concordância de diferentes lógicas (IA, Estatística e Markov). Foca os teus jogos nas top 3.
                </p>
            </div>
        </Card>
    );
}
