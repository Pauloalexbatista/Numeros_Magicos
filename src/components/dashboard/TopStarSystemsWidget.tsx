'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getStarRankingMetrics } from '@/app/analysis/stars/actions';
import Link from 'next/link';
import { GameType } from '@/types/game';
import { formatSystemName } from '@/utils/formatters';

interface StarRankingData {
  systemName: string;
  qualityScore: number;
  game?: GameType;
}

interface TopStarSystemsWidgetProps {
  data?: StarRankingData[];
  game?: GameType;
}

export default function TopStarSystemsWidget({ data: incoming, game = GameType.EUROMILLIONS }: TopStarSystemsWidgetProps) {
    const t = useTranslations('dashboard');
  const [topSystems, setTopSystems] = useState<StarRankingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        if (incoming) {
          if (!cancelled) setTopSystems(incoming.slice(0, 5));
        } else {
          const data = await getStarRankingMetrics(game);
          if (!cancelled && data) setTopSystems(data.slice(0, 5));
        }
      } catch (e) {
        if (!cancelled) console.error(e);
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [incoming, game]);

  const title =
    game === GameType.EUROMILLIONS
      ? 'Top Estrelas'
      : game === GameType.TOTOLOTO
        ? 'Top Número da Sorte'
        : game === GameType.EURODREAMS
          ? 'Top Número de Sonho'
          : 'Top Número de Sonho';

  return (
    <div className="glass-card flex flex-col p-4 gap-4 h-[420px]" data-game={game}>
      <div className="flex items-center justify-between border-b border-b border-[var(--border-default)] pb-3 text-[var(--text-primary)]">
        <span className="font-semibold text-sm">{title}</span>
        <span className="ml-auto text-[10px] font-bold uppercase text-muted-foreground">Score</span>
        <span className="text-[10px] font-bold uppercase text-muted-foreground">Live</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : topSystems.length > 0 ? (
            topSystems.map((sys, index) => {
              const sysGame = sys.game || game;
              const href = `/analysis/stars/ranking/${sysGame.toLowerCase()}/${encodeURIComponent(sys.systemName)}`;
              return (
                <Link key={`${sysGame}-${sys.systemName}`} href={href} className="block">
                  <RankingRow systemName={sys.systemName} score={sys.qualityScore} game={sysGame} index={index} />
                </Link>
              );
            })
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">Sem dados.</div>
          )}

          <Link
            href={`/analysis/stars/ranking/${game.toLowerCase()}`}
            className="mt-1 block w-full rounded-lg bg-foreground py-2 text-center text-sm font-medium text-background transition-colors hover:brightness-110"
          >
            Ver Ranking Completo
          </Link>
        </div>
      </div>
    </div>
  );
}

function RankingRow({ systemName, score, game, index }: { systemName: string; score: number; game: GameType; index: number }) {
  return (
    <div
      {...({ 'data-game': game })}
      className="flex items-center justify-between rounded-full border-2 border-[var(--border-strong)] bg-transparent px-3 py-2 transition-colors hover:border-[var(--text-primary)]"
    >
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${index === 0 ? "bg-accent text-white shadow-sm" : index === 1 ? "bg-accent text-white shadow-sm" : index === 2 ? "bg-accent text-white shadow-sm" : "bg-surface-2 text-muted-foreground border border-border"}`}>{index + 1}</span>
        <span className="truncate text-sm font-medium text-[var(--text-primary)]">{formatSystemName(systemName)}</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-accent">{score}</div>
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Score</div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between rounded-full border-2 border-[var(--border-strong)] bg-transparent px-3 py-2 transition-colors hover:border-[var(--text-primary)]">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-surface-3/70" />
        <div className="h-3 w-28 rounded-full bg-surface-3/70" />
      </div>
      <div className="h-4 w-10 rounded-full bg-surface-3/70" />
    </div>
  );
}
