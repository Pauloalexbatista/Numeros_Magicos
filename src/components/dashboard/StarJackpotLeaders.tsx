import Link from 'next/link';

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
        <div className="p-6 h-full flex flex-col rounded-xl border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-900/10 to-amber-900/5 dark:from-yellow-950/30 dark:to-amber-900/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                    🏆 Reis do Jackpot <span className="text-xs font-normal opacity-70">(Histórico das Estrelas)</span>
                </h3>
            </div>

            <div className="flex-1 space-y-3">
                {leaders.map((leader, index) => (
                    <div key={leader.systemName} className="flex items-center justify-between p-2 rounded-lg border bg-white/60 dark:bg-black/40 border-yellow-200 dark:border-yellow-900/50 hover:bg-white dark:hover:bg-black/60 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${index === 0 ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-200' : ''}
                                ${index === 1 ? 'bg-zinc-300 text-zinc-800' : ''}
                                ${index === 2 ? 'bg-amber-600 text-amber-100' : ''}
                            `}>
                                {index + 1}
                            </div>
                            <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{leader.systemName}</span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-sm text-yellow-600 dark:text-yellow-400">
                                {leader.jackpots}
                            </span>
                            <span className="text-[10px] ml-1 uppercase text-zinc-500">Jackpots</span>
                        </div>
                    </div>
                ))}
            </div>

            <Link
                href="/analysis/stars/ranking"
                className="mt-4 w-full py-2 text-center text-sm font-medium rounded-lg transition-colors bg-yellow-600 hover:bg-yellow-700 text-white"
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
