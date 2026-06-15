import { useTranslations } from 'next-intl';
﻿import Link from 'next/link';
import { GameType, GAMES } from '@/types/game';
import { Trophy } from 'lucide-react';
import { formatSystemName } from '@/utils/formatters';

interface HistoricalBestWidgetProps {
    leaders: {
        systemName: string;
        jackpots: number;
    }[];
    game?: GameType;
}

export default function HistoricalBestWidget({ leaders, game = GameType.EUROMILLIONS }: HistoricalBestWidgetProps) {
    const t = useTranslations('dashboard');
    const gameConfig = GAMES[game];
    const rankingLink = `/ranking/${gameConfig?.slug ?? 'euromillions'}`;

    return (
        <div className="glass-card flex flex-col p-4 gap-4 h-[420px]" data-game={game}>
            <div className="flex items-center justify-between border-b border-b border-[var(--border-default)] pb-3 text-[var(--text-primary)]">
                <span className="font-semibold text-sm">{t("jackpot_kings")}</span>
                <span className="ml-auto text-[10px] font-bold uppercase text-muted-foreground">(Historico)</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div className="space-y-2">
                    {leaders.filter(l => l.jackpots > 0).length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                              <Trophy className="mb-2 h-8 w-8 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">A aguardar sucessos históricos...</p>
                          </div>
                      ) : leaders.filter(l => l.jackpots > 0).map((leader, index) => (
                        <div
                            key={leader.systemName}
                            className="flex items-center justify-between rounded-full border-2 border-[var(--border-strong)] bg-transparent px-3 py-2 transition-colors hover:border-[var(--text-primary)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${"bg-accent text-white shadow-sm"}`}>
                                    {index + 1}
                                </div>
                                <span className="truncate text-sm font-medium text-[var(--text-primary)]">{formatSystemName(leader.systemName)}</span>
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