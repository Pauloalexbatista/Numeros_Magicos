import Link from 'next/link';
import { GameType } from '@/types/game';
import { formatSystemName } from '@/utils/formatters';

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

    const colorPrefix =
        isTotoloto ? 'emerald' :
            isEuroDreams ? 'purple' :
                'blue';

    const rankingLink =
        isTotoloto ? '/totoloto/ranking' :
            isEuroDreams ? '/eurodreams/ranking' :
                '/ranking';

    return (
        <div className={`p-3 flex flex-col rounded-xl border-2 
            ${isTotoloto ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-teal-900/5' :
                isEuroDreams ? 'border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-pink-900/5' :
                    'border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-indigo-900/5'} 
            dark:bg-opacity-10 shadow-sm`}>
            {/* ... styles need to serve game colors ... */}
            {/* For brevity, keeping existing styles but ideally they should be dynamic */}
            <div className="flex justify-between items-center mb-3">
                <h3 className={`font-bold text-lg flex items-center gap-2 
                    ${isTotoloto ? 'text-foreground' :
                        isEuroDreams ? 'text-foreground' :
                            'text-foreground'}`}>
                    🏆 Reis do Jackpot <span className="text-xs font-normal opacity-70">(Histórico)</span>
                </h3>
            </div>

            <div className="space-y-1.5">
                {leaders.map((leader, index) => (
                    <div key={leader.systemName} className={`flex items-center justify-between p-2 rounded-lg border bg-card 
                        ${isTotoloto ? 'border-emerald-200 dark:border-emerald-900/50' :
                            isEuroDreams ? 'border-purple-200 dark:border-purple-900/50' :
                                'border-blue-200 dark:border-blue-900/50'} 
                        hover:bg-white dark:hover:bg-black/60 transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${index === 0 ? (isTotoloto ? 'bg-emerald-400 text-emerald-900' : isEuroDreams ? 'bg-purple-400 text-purple-900' : 'bg-blue-400 text-blue-900') : ''}
                                ${index === 1 ? 'bg-zinc-300 text-foreground' : ''}
                                ${index === 2 ? 'bg-amber-600 text-amber-100' : ''}
                            `}>
                                {index + 1}
                            </div>
                            <span className="font-medium text-sm text-foreground">{formatSystemName(leader.systemName)}</span>
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
