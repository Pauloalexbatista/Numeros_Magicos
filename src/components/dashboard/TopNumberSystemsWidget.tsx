import Link from 'next/link';
import { GameType } from '@/types/game';
import { formatSystemName } from '@/utils/formatters';

interface RankingMetric {
    systemName: string;
    qualityScore: number;
    winRate: number;
}

interface TopNumberSystemsWidgetProps {
    systems: RankingMetric[];
    game?: GameType;
}

export default function TopNumberSystemsWidget({ systems, game = GameType.EUROMILLIONS }: TopNumberSystemsWidgetProps) {
    const isTotoloto = game === GameType.TOTOLOTO;
    const isEuroDreams = game === GameType.EURODREAMS;

    const rankingLink =
        isTotoloto ? '/ranking/totoloto' :
            isEuroDreams ? '/ranking/eurodreams' :
                '/ranking/euromillions';

    return (
        <div className={`p-3 flex flex-col rounded-xl border-2
            ${isTotoloto ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-emerald-900/5' :
                isEuroDreams ? 'border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-purple-900/5' :
                    'border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-blue-900/5'}
            dark:bg-opacity-10 shadow-sm`}>

            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
                <h3 className={`font-bold text-lg flex items-center gap-2 tracking-tight
                    ${isTotoloto ? 'text-foreground' :
                        isEuroDreams ? 'text-foreground' :
                            'text-foreground'}`}>
                    🏆 Top Sistemas <span className="text-[10px] font-bold uppercase opacity-60 ml-1 bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Pontuação</span>
                </h3>
                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md shadow-sm border animate-pulse
                    ${isTotoloto ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                        isEuroDreams ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                            'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'}`}>
                    Ao Vivo
                </span>
            </div>

            <div className="space-y-1.5 flex-1">
                {systems.length > 0 ? (
                    systems.map((sys, index) => (
                        <div key={sys.systemName} className={`flex items-center justify-between p-2 rounded-lg border bg-card
                            ${isTotoloto ? 'border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' :
                                isEuroDreams ? 'border-purple-200 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/20' :
                                    'border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
                            transition-colors`}>
                            <div className="flex items-center gap-3 w-full">
                                <div className={`
                                    w-8 h-8 flex shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-md ring-2 ring-white/50 dark:ring-black/50
                                    ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-900 shadow-yellow-500/40 transform scale-110' : ''}
                                    ${index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-foreground shadow-slate-400/30' : ''}
                                    ${index === 2 ? 'bg-gradient-to-br from-orange-300 to-red-400 text-red-900 shadow-orange-500/30' : ''}
                                `}>
                                    #{index + 1}
                                </div>
                                <div className="flex flex-col flex-1 truncate pr-2">
                                    <span className="font-bold text-[13px] text-foreground truncate">{formatSystemName(sys.systemName)}</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className={`font-black tracking-tight text-lg
                                    ${isTotoloto ? 'text-foreground' :
                                        isEuroDreams ? 'text-foreground' :
                                            'text-foreground'}`}>
                                    {sys.qualityScore}
                                </div>
                                <div className="text-[9px] font-bold opacity-50 uppercase tracking-widest -mt-1">PONTOS</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-zinc-400 dark:text-zinc-500">
                        <p className="text-sm">Sem dados disponíveis.</p>
                    </div>
                )}
            </div>

            <Link
                href={rankingLink}
                className={`mt-4 w-full py-2 text-center text-sm font-medium rounded-lg transition-colors text-white
                    ${isTotoloto ? 'bg-emerald-700 hover:bg-emerald-900' :
                        isEuroDreams ? 'bg-purple-700 hover:bg-purple-900' :
                            'bg-blue-700 hover:bg-blue-900'}`}
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
