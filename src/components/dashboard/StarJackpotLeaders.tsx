import Link from 'next/link';
import { GameType, GAMES } from '@/types/game';
import { Star } from 'lucide-react';
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
    const gameConfig = GAMES[game];
    const rankingLink = `/ranking/${gameConfig?.slug ?? 'euromillions'}`;
    const title = isTotoloto ? 'Reis do Numero da Sorte' : isEuroDreams ? 'Reis do Numero de Sonho' : 'Reis das Estrelas';

    return (
        <div className="glass-card flex flex-col p-4 gap-4 h-[420px]" data-game={game}>
            <div className="flex items-center justify-between border-b border-border pb-3 text-[var(--accent)]">
                <span className="font-semibold text-sm">{title}</span>
                <span className="ml-auto text-[10px] font-bold uppercase text-muted-foreground">(Historico)</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div className="space-y-2">
                    {leaders.length > 0 ? (
                        leaders.map((leader, index) => (
                            <div
                                key={leader.systemName}
                                className="flex items-center justify-between rounded-lg border border-border/50 bg-transparent px-3 py-2 transition-colors hover:bg-surface-2"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${index === 0 ? "bg-accent text-white" : index < 3 ? "bg-accent/20 text-accent" : "bg-surface-2 text-muted-foreground"}`}>
                                        {index + 1}
                                    </div>
                                    <span className="truncate text-sm font-medium text-foreground">{formatSystemName(leader.systemName)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-extrabold text-accent">{leader.jackpots}</span>
                                    <span className="ml-1 text-[10px] uppercase text-muted-foreground">Jackpots</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                            <span className="text-2xl">⭐</span>
                            <p className="mt-1 text-xs">A aguardar sucessos historicos...</p>
                        </div>
                    )}
                </div>
                <Link
                    href={rankingLink}
                    className="mt-3 block w-full rounded-lg bg-foreground py-2 text-center text-sm font-medium text-background transition-colors hover:brightness-110"
                >
                    Ver Ranking Completo
                </Link>
            </div>
        </div>
    );
}