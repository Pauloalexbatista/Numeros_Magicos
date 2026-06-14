import Link from 'next/link';
import { GameType, GAMES } from '@/types/game';
import { formatSystemName } from '@/utils/formatters';

interface HistoricalBestWidgetProps {
    leaders: {
        systemName: string;
        jackpots: number;
    }[];
    game?: GameType;
}

export default function HistoricalBestWidget({ leaders, game = GameType.EUROMILLIONS }: HistoricalBestWidgetProps) {
    const gameConfig = GAMES[game];
    const rankingLink = `/ranking/${gameConfig?.slug ?? 'euromillions'}`;

    return (
        <div className="game-card" data-game={game}>
            <div className="game-card-header">
                <span className="dot" />
                <span className="font-semibold text-sm">Reis do Jackpot</span>
                <span className="ml-auto text-[10px] font-bold uppercase text-muted-foreground">(Historico)</span>
            </div>
            <div className="game-card-body">
                <div className="space-y-2">
                    {leaders.map((leader, index) => (
                        <div
                            key={leader.systemName}
                            className="flex items-center justify-between rounded-lg border border-accent-border bg-surface-1/60 px-3 py-2 transition-colors hover:bg-accent-muted"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${index === 0 ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-900 shadow-yellow-500/40" : index === 1 ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-slate-400/30" : index === 2 ? "bg-gradient-to-br from-orange-300 to-red-400 text-red-900 shadow-orange-500/30" : "bg-surface-2 text-muted-foreground border border-border"}`}>
                                    {index + 1}
                                </div>
                                <span className="truncate text-sm font-medium text-foreground">{formatSystemName(leader.systemName)}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-extrabold text-accent">{leader.jackpots}</span>
                                <span className="ml-1 text-[10px] uppercase text-muted-foreground">Jackpots</span>
                            </div>
                        </div>
                    ))}
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