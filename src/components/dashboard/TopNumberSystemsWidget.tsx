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
            ${isTotoloto ? 'border-toto-500/20 bg-gradient-to-br from-toto-900/10 to-toto-900/5' :
                isEuroDreams ? 'border-dream-500/20 bg-gradient-to-br from-dream-900/10 to-dream-900/5' :
                    'border-euro-500/20 bg-gradient-to-br from-euro-900/10 to-euro-900/5'}
            dark:bg-opacity-10 shadow-sm`}>

            <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-200/50 dark:border-zinc-700/50">
                <h3 className={`font-bold text-lg flex items-center gap-2 tracking-tight
                    ${isTotoloto ? 'text-toto-700 dark:text-toto-300' :
                        isEuroDreams ? 'text-dream-700 dark:text-dream-300' :
                            'text-euro-700 dark:text-euro-300'}`}>
                    🏆 Top Sistemas <span className="text-[10px] font-bold uppercase opacity-60 ml-1 bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Pontuação</span>
                </h3>
                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md shadow-sm border animate-pulse
                    ${isTotoloto ? 'bg-toto-50 text-toto-700 dark:bg-toto-900/30 dark:text-toto-300 border-toto-200 dark:border-toto-800' :
                        isEuroDreams ? 'bg-dream-50 text-dream-700 dark:bg-dream-900/30 dark:text-dream-300 border-dream-200 dark:border-dream-800' :
                            'bg-euro-50 text-euro-700 dark:bg-euro-900/30 dark:text-euro-300 border-euro-200 dark:border-euro-800'}`}>
                    Ao Vivo
                </span>
            </div>

            <div className="space-y-1.5 flex-1">
                {systems.length > 0 ? (
                    systems.map((sys, index) => (
                        <div key={sys.systemName} className={`flex items-center justify-between p-2 rounded-lg border bg-white/60 dark:bg-black/40
                            ${isTotoloto ? 'border-toto-200 dark:border-toto-900/50 hover:bg-toto-50 dark:hover:bg-toto-900/20' :
                                isEuroDreams ? 'border-dream-200 dark:border-dream-900/50 hover:bg-dream-50 dark:hover:bg-dream-900/20' :
                                    'border-euro-200 dark:border-euro-900/50 hover:bg-euro-50 dark:hover:bg-euro-900/20'}
                            transition-colors`}>
                            <div className="flex items-center gap-3 w-full">
                                <div className={`
                                    w-8 h-8 flex shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-md ring-2 ring-white/50 dark:ring-black/50
                                    ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-900 shadow-yellow-500/40 transform scale-110' : ''}
                                    ${index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-slate-400/30' : ''}
                                    ${index === 2 ? 'bg-gradient-to-br from-orange-300 to-red-400 text-red-900 shadow-orange-500/30' : ''}
                                `}>
                                    #{index + 1}
                                </div>
                                <div className="flex flex-col flex-1 truncate pr-2">
                                    <span className="font-bold text-[13px] text-zinc-800 dark:text-zinc-200 truncate">{formatSystemName(sys.systemName)}</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className={`font-black tracking-tight text-lg
                                    ${isTotoloto ? 'text-toto-700 dark:text-toto-400' :
                                        isEuroDreams ? 'text-dream-700 dark:text-dream-400' :
                                            'text-euro-700 dark:text-euro-400'}`}>
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
                    ${isTotoloto ? 'bg-toto-700 hover:bg-toto-900' :
                        isEuroDreams ? 'bg-dream-700 hover:bg-dream-900' :
                            'bg-euro-700 hover:bg-euro-900'}`}
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
