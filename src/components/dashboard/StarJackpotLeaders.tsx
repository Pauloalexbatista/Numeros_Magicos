'use client';

import { Card } from '@/components/ui/card';
import { Trophy, Star } from 'lucide-react';

interface Leader {
    systemName: string;
    jackpots: number;
}

interface Props {
    leaders: Leader[];
}

export default function StarJackpotLeaders({ leaders }: Props) {
    if (leaders.length === 0) return null;

    return (
        <Card className="p-6 bg-gradient-to-br from-yellow-900/40 to-amber-900/20 border-yellow-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-16 h-16 text-yellow-500" />
            </div>

            <h2 className="text-xl font-bold text-yellow-100 mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Reis do Jackpot (Estrelas)
                <span className="text-xs font-normal text-yellow-500/60 ml-2">Historico</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {leaders.map((leader, index) => (
                    <div
                        key={leader.systemName}
                        className="relative group bg-slate-900/40 border border-yellow-500/20 rounded-xl p-4 hover:border-yellow-500/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                ${index === 0 ? 'bg-yellow-500 text-black' :
                                    index === 1 ? 'bg-zinc-400 text-black' :
                                        'bg-amber-700 text-white'}
                            `}>
                                {index + 1}
                            </div>
                            <div className="flex-grow min-w-0">
                                <h3 className="text-white font-bold text-sm truncate">{leader.systemName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-2xl font-black text-yellow-500">{leader.jackpots}</span>
                                    <span className="text-[10px] text-yellow-500/60 uppercase font-bold tracking-wider">Jackpots</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
