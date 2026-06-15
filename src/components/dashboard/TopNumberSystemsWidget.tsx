import { useTranslations } from 'next-intl';
﻿import Link from 'next/link';
import { GameType } from '@/types/game';
import { formatSystemName } from '@/utils/formatters';

interface RankingEntry {
  systemName: string;
  qualityScore: number;
  game?: GameType;
}

interface TopNumberSystemsWidgetProps {
  data: RankingEntry[];
  game?: GameType;
}

export default function TopNumberSystemsWidget({ data, game = GameType.EUROMILLIONS }: TopNumberSystemsWidgetProps) {
    const t = useTranslations('dashboard');
  const items = (data ?? []).slice(0, 5);
  const slug = game.toLowerCase();

  return (
    <div className="glass-card flex flex-col p-4 gap-4 h-[420px]" data-game={game}>
      <div className="flex items-center justify-between border-b border-b border-[var(--border-default)] pb-3 text-[var(--text-primary)]">
        <span className="font-semibold text-sm">{t("top_systems")}</span>
        <span className="ml-auto text-[10px] font-bold uppercase text-muted-foreground">Pontuacao</span>
        <span className="text-[10px] font-bold uppercase text-muted-foreground">Live</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Sem dados disponiveis.</div>
          ) : (
            items.map((entry, index) => {
              const entryGame = entry.game || game;
              const href = `/ranking/${entryGame.toLowerCase()}/${encodeURIComponent(entry.systemName)}`;
              return (
                <Link key={`${entryGame}-${entry.systemName}`} href={href} className="block">
                  <div
                    data-game={entryGame}
                    className="flex items-center justify-between rounded-full border-2 border-[var(--border-strong)] bg-transparent px-3 py-2 transition-colors hover:border-[var(--text-primary)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${"bg-accent text-white shadow-sm"}`}>
                        {index + 1}
                      </span>
                      <span className="truncate text-sm font-medium text-[var(--text-primary)]">{formatSystemName(entry.systemName)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-accent">{entry.qualityScore}</div>
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Pontos</div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
        <Link
          href={`/ranking/${slug}`}
          className="mt-3 block w-full rounded-lg bg-foreground py-2 text-center text-sm font-medium text-background transition-colors hover:brightness-110"
        >
          Ver Ranking Completo
        </Link>
      </div>
    </div>
  );
}