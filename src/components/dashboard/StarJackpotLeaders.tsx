import Link from 'next/link';
import { GameType } from '@/types/game';

interface Leader {
    systemName: string;
    jackpots: number;
}

interface Props {
    leaders: Leader[];
    game?: GameType;
}

export default function StarJackpotLeaders({ leaders, game = GameType.EUROMILLIONS }: Props) {
    if (leaders.length === 0) return null;

    const isTotoloto = game === GameType.TOTOLOTO;
    const isEuroDreams = game === GameType.EURODREAMS;

    // Star ranking pages might also need separation
    const rankingLink =
        isTotoloto ? '/totoloto/stars/ranking' :
            isEuroDreams ? '/eurodreams/stars/ranking' :
                '/analysis/stars/ranking';

    // Totoloto doesn't have stars like Euromillions, it has "Número da Sorte" (1-13). 
    // EuroDreams has "Dream Number" (1-5).
    // The visual theme should reflect this.
    // However, the component name is "StarJackpotLeaders". 
    // We can adapt the title based on game.

    const title = isTotoloto ? "Top Lucky Number" : isEuroDreams ? "Top Dream Number" : "Reis do Jackpot";
    const subtitle = isTotoloto ? "(Histórico)" : isEuroDreams ? "(Histórico)" : "(Histórico das Estrelas)";

    return (
        <div className={`p-4 h-full flex flex-col rounded-xl border-2 
            ${isTotoloto ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-teal-900/5' :
                isEuroDreams ? 'border-pink-500/20 bg-gradient-to-br from-pink-900/10 to-rose-900/5' :
                    'border-yellow-500/20 bg-gradient-to-br from-yellow-900/10 to-amber-900/5'} 
            dark:bg-opacity-10`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className={`font-bold text-lg flex items-center gap-2 
                    ${isTotoloto ? 'text-emerald-700 dark:text-emerald-400' :
                        isEuroDreams ? 'text-pink-700 dark:text-pink-400' :
                            'text-yellow-700 dark:text-yellow-400'}`}>
                    🏆 {title} <span className="text-xs font-normal opacity-70">{subtitle}</span>
                </h3>
            </div>

            <div className="flex-1 space-y-2">
                {leaders.map((leader, index) => (
                    <div key={leader.systemName} className={`flex items-center justify-between p-2 rounded-lg border bg-white/60 dark:bg-black/40 
                        ${isTotoloto ? 'border-emerald-200 dark:border-emerald-900/50' :
                            isEuroDreams ? 'border-pink-200 dark:border-pink-900/50' :
                                'border-yellow-200 dark:border-yellow-900/50'} 
                        hover:bg-white dark:hover:bg-black/60 transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${index === 0 ? (isTotoloto ? 'bg-emerald-400 text-emerald-900' : isEuroDreams ? 'bg-pink-400 text-pink-900' : 'bg-yellow-400 text-yellow-900') : ''}
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
                                    isEuroDreams ? 'text-pink-600 dark:text-pink-400' :
                                        'text-yellow-600 dark:text-yellow-400'}`}>
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
                        isEuroDreams ? 'bg-pink-600 hover:bg-pink-700' :
                            'bg-yellow-600 hover:bg-yellow-700'}`}
            >
                Ver Ranking Completo →
            </Link>
        </div>
    );
}
