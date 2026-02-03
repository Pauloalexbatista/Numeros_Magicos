import Link from 'next/link';
import { GameType } from '@/types/game';

interface HistoricalBestWidgetProps {
    leaders: {
        systemName: string;
        jackpots: number;
    }[];
    game?: GameType;
}

export default function HistoricalBestWidget({ leaders, game = GameType.EUROMILLIONS }: HistoricalBestWidgetProps) {
    const isTotoloto = game === GameType.TOTOLOTO;
    const isEuroDreams = game === GameType.EURODREAMS;

    // Determine base path for "View All"
    // Since we don't have dedicated ranking pages yet, we might need to route to /ranking?game=X
    // OR create the folders. For now, let's assume we want to route to specific pages if they existed,
    // or keep it simple. The user request implied separate pages.
    // If I link to /totoloto/ranking, I need to create that page.
    // For now, let's just make the link context-aware.

    const rankingLink =
        isTotoloto ? '/totoloto/ranking' :
            isEuroDreams ? '/eurodreams/ranking' :
                '/ranking';

    return (
        <div className={`p-4 h-full flex flex-col rounded-xl border-2 
            ${isTotoloto ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-teal-900/5' :
                isEuroDreams ? 'border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-pink-900/5' :
                    'border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-indigo-900/5'} 
            dark:bg-opacity-10`}>
            {/* ... styles need to serve game colors ... */}
            {/* For brevity, keeping existing styles but ideally they should be dynamic */}
            <div className="flex justify-between items-center mb-3">
                <h3 className={`font-bold text-lg flex items-center gap-2 
                    ${isTotoloto ? 'text-emerald-700 dark:text-emerald-400' :
                        isEuroDreams ? 'text-purple-700 dark:text-purple-400' :
                            'text-blue-700 dark:text-blue-400'}`}>
                    🏆 Reis do Jackpot <span className="text-xs font-normal opacity-70">(Histórico)</span>
                </h3>
            </div>

            <div className="flex-1 space-y-2">
                {leaders.map((leader, index) => (
                    <div key={leader.systemName} className={`flex items-center justify-between p-2 rounded-lg border bg-white/60 dark:bg-black/40 
                        ${isTotoloto ? 'border-emerald-200 dark:border-emerald-900/50' :
                            isEuroDreams ? 'border-purple-200 dark:border-purple-900/50' :
                                'border-blue-200 dark:border-blue-900/50'} 
                        hover:bg-white dark:hover:bg-black/60 transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${index === 0 ? (isTotoloto ? 'bg-emerald-400 text-emerald-900' : isEuroDreams ? 'bg-purple-400 text-purple-900' : 'bg-blue-400 text-blue-900') : ''}
                                ${index === 1 ? 'bg-zinc-300 text-zinc-800' : ''}
                                ${index === 2 ? 'bg-amber-600 text-amber-100' : ''}
                            `}>
                                {index + 1}
                            </div>
                            <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{leader.systemName}</span>
                        </div>
                        <div className="text-right">
                            <span className={`font-bold text-sm 
                                ${isTotoloto ? 'text-emerald-600 dark:text-emerald-400' :
                                    isEuroDreams ? 'text-purple-600 dark:text-purple-400' :
                                        'text-blue-600 dark:text-blue-400'}`}>
                                {leader.jackpots}
                            </span>
                            <span className="text-[10px] ml-1 uppercase text-zinc-500">Jackpots</span>
                        </div>
                    </div>
                ))}
            </div>

            <Link
                href={rankingLink}
                className={`mt-4 w-full py-2 text-center text-sm font-medium rounded-lg transition-colors text-white
                    ${isTotoloto ? 'bg-emerald-600 hover:bg-emerald-700' :
                        isEuroDreams ? 'bg-purple-600 hover:bg-purple-700' :
                            'bg-blue-600 hover:bg-blue-700'}`}
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
