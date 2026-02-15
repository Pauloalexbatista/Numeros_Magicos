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

            <div className="flex justify-between items-center mb-3">
                <h3 className={`font-bold text-lg flex items-center gap-2
                    ${isTotoloto ? 'text-toto-700 dark:text-toto-300' :
                        isEuroDreams ? 'text-dream-700 dark:text-dream-300' :
                            'text-euro-700 dark:text-euro-300'}`}>
                    📊 Top Sistemas <span className="text-xs font-normal opacity-70">(Pontuação)</span>
                </h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full
                    ${isTotoloto ? 'bg-toto-100 text-toto-900 dark:bg-toto-900/30 dark:text-toto-100' :
                        isEuroDreams ? 'bg-dream-100 text-dream-900 dark:bg-dream-900/30 dark:text-dream-100' :
                            'bg-euro-100 text-euro-900 dark:bg-euro-900/30 dark:text-euro-100'}`}>
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
                            <div className="flex items-center gap-3">
                                <div className={`
                                    w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                    ${index === 0 ? (isTotoloto ? 'bg-toto-500 text-white' : isEuroDreams ? 'bg-dream-500 text-white' : 'bg-euro-500 text-white') : ''}
                                    ${index === 1 ? 'bg-zinc-300 text-zinc-800' : ''}
                                    ${index === 2 ? 'bg-amber-700 text-amber-100' : ''}
                                `}>
                                    {index + 1}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{formatSystemName(sys.systemName)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold text-sm
                                    ${isTotoloto ? 'text-toto-700 dark:text-toto-300' :
                                        isEuroDreams ? 'text-dream-700 dark:text-dream-300' :
                                            'text-euro-700 dark:text-euro-300'}`}>
                                    {sys.qualityScore}
                                </div>
                                <div className="text-[10px] opacity-60 uppercase tracking-wider">Pontuação</div>
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
