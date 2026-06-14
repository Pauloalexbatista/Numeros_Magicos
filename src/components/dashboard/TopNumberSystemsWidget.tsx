import Link from 'next/link';
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
  const items = (data ?? []).slice(0, 5);
  const slug = game.toLowerCase();

  return (
    <div className="glass-card flex flex-col p-4 gap-4 h-[420px]" data-game={game}>
      <div className="flex items-center justify-between border-b border-border pb-3 text-[var(--accent)]">
        <span className="font-semibold text-sm">Top Sistemas</span>
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
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-transparent px-3 py-2 transition-colors hover:bg-surface-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${index === 0 ? "bg-accent text-white" : index < 3 ? "bg-accent/20 text-accent" : "bg-surface-2 text-muted-foreground"}`}>
                        {index + 1}
                      </span>
                      <span className="truncate text-sm font-medium text-foreground">{formatSystemName(entry.systemName)}</span>
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