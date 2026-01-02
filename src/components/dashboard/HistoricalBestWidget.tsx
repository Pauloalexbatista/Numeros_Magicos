
import Link from 'next/link';

interface HistoricalBestWidgetProps {
    leaders: {
        systemName: string;
        jackpots: number;
    }[];
}

export default function HistoricalBestWidget({ leaders }: HistoricalBestWidgetProps) {
    return (
        <div className="p-6 h-full flex flex-col rounded-xl border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-teal-900/5 dark:from-emerald-950/30 dark:to-teal-900/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    🏆 Reis do Jackpot <span className="text-xs font-normal opacity-70">(Histórico dos Números)</span>
                </h3>
            </div>

            <div className="flex-1 space-y-3">
                {leaders.map((leader, index) => (
                    <div key={leader.systemName} className="flex items-center justify-between p-2 rounded-lg border bg-white/60 dark:bg-black/40 border-emerald-200 dark:border-emerald-900/50 hover:bg-white dark:hover:bg-black/60 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${index === 0 ? 'bg-emerald-400 text-emerald-900 ring-2 ring-emerald-200' : ''}
                                ${index === 1 ? 'bg-zinc-300 text-zinc-800' : ''}
                                ${index === 2 ? 'bg-amber-600 text-amber-100' : ''}
                            `}>
                                {index + 1}
                            </div>
                            <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{leader.systemName}</span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                                {leader.jackpots}
                            </span>
                            <span className="text-[10px] ml-1 uppercase text-zinc-500">Jackpots</span>
                        </div>
                    </div>
                ))}
            </div>

            <Link
                href="/ranking"
                className="mt-4 w-full py-2 text-center text-sm font-medium rounded-lg transition-colors bg-emerald-600 hover:bg-emerald-700 text-white"
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
