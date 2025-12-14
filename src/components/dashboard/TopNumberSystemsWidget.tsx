
import Link from 'next/link';

interface SystemMetric {
    systemName: string;
    qualityScore: number;
    winRate: number;
}

interface TopNumberSystemsWidgetProps {
    systems: SystemMetric[];
}

export default function TopNumberSystemsWidget({ systems }: TopNumberSystemsWidgetProps) {
    return (
        <div className="p-6 h-full flex flex-col rounded-xl border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
                    🏆 Top Sistemas de Números <span className="text-xs font-normal opacity-70">(Score)</span>
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500 text-white">
                    Live
                </span>
            </div>

            <div className="flex-1 space-y-3">
                {systems.map((sys, index) => (
                    <div key={sys.systemName} className="flex items-center justify-between p-2 rounded-lg border bg-white/60 dark:bg-black/40 border-green-100 dark:border-green-900/50 hover:bg-white dark:hover:bg-black/60 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${index === 0 ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-200' : ''}
                                ${index === 1 ? 'bg-zinc-300 text-zinc-800' : ''}
                                ${index === 2 ? 'bg-amber-600 text-amber-100' : ''}
                            `}>
                                {index + 1}
                            </div>
                            <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{sys.systemName}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-green-700 dark:text-green-300">
                                {sys.qualityScore}
                            </div>
                            <div className="text-[10px] text-green-600/70 dark:text-green-400/70 uppercase">Score</div>
                        </div>
                    </div>
                ))}
            </div>

            <Link
                href="/ranking"
                className="mt-4 w-full py-2 text-center text-sm font-medium rounded-lg transition-colors bg-green-600 hover:bg-green-700 text-white"
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
