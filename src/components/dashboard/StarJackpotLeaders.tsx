import Link from 'next/link';
import { GameType } from '@/types/game';
import { formatSystemName } from '@/utils/formatters';

interface Leader {
    systemName: string;
    jackpots: number;
}

interface Props {
    leaders: Leader[];
    game?: GameType;
}

export default function StarJackpotLeaders({ leaders, game = GameType.EUROMILLIONS }: Props) {
    const isTotoloto = game === GameType.TOTOLOTO;
    const isEuroDreams = game === GameType.EURODREAMS;

    const rankingLink = game === GameType.TOTOLOTO ? '/analysis/stars/ranking/totoloto' :
        game === GameType.EURODREAMS ? '/analysis/stars/ranking/eurodreams' :
            '/analysis/stars/ranking/euromillions';

    // Totoloto doesn't have stars like Euromillions, it has "Número da Sorte" (1-13). 
    // EuroDreams has "Dream Number" (1-5).
    // The visual theme should reflect this.
    // However, the component name is "StarJackpotLeaders". 
    // We can adapt the title based on game.

    const title = isTotoloto ? "Reis do Número da Sorte" : isEuroDreams ? "Reis do Número de Sonho" : "Reis das Estrelas";
    const subtitle = "(Histórico)";

    return (
        <div className={`p-3 flex flex-col rounded-xl border-2 
            ${isTotoloto ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-teal-900/5' :
                isEuroDreams ? 'border-pink-500/20 bg-gradient-to-br from-pink-900/10 to-rose-900/5' :
                    'border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-indigo-900/5'} 
            dark:bg-opacity-10 shadow-sm`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className={`font-bold text-lg flex items-center gap-2 
                    ${isTotoloto ? 'text-foreground' :
                        isEuroDreams ? 'text-pink-700 dark:text-pink-400' :
                            'text-foreground'}`}>
                    🏆 {title} <span className="text-xs font-normal opacity-70">{subtitle}</span>
                </h3>
            </div>

            <div className="space-y-1.5">
                {leaders.length > 0 ? (
                    leaders.map((leader, index) => (
                        <div key={leader.systemName} className={`flex items-center justify-between p-2 rounded-lg border bg-card 
                            ${isTotoloto ? 'border-emerald-200 dark:border-emerald-900/50' :
                                isEuroDreams ? 'border-pink-200 dark:border-pink-900/50' :
                                    'border-blue-200 dark:border-blue-900/50'} 
                            hover:bg-white dark:hover:bg-black/60 transition-colors`}>
                            <div className="flex items-center gap-3">
                                <div className={`
                                    w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                    ${index === 0 ? (isTotoloto ? 'bg-emerald-400 text-emerald-900' : isEuroDreams ? 'bg-pink-400 text-pink-900' : 'bg-blue-400 text-white') : ''}
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
                                        isEuroDreams ? 'text-pink-600 dark:text-pink-400' :
                                            'text-blue-600 dark:text-blue-400'}`}>
                                    {leader.jackpots}
                                </span>
                                <span className="text-[10px] ml-1 uppercase text-zinc-500">Jackpots</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-8">
                        <span className="text-3xl mb-2">⭐</span>
                        <p className="text-xs">A aguardar sucessos históricos...</p>
                    </div>
                )}
            </div>

            <Link
                href={rankingLink}
                className={`mt-4 w-full py-2 text-center text-sm font-medium rounded-lg transition-colors text-white
                    ${isTotoloto ? 'bg-emerald-600 hover:bg-emerald-700' :
                        isEuroDreams ? 'bg-pink-600 hover:bg-pink-700' :
                            'bg-blue-600 hover:bg-blue-700'}`}
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
