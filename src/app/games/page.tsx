'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type RankingEntry = { systemName: string; avgAccuracy: number; totalPredictions: number };

const GAMES = [
  {
    id: 'europoker',
    game: 'EUROMILLIONS',
    title: 'Euromilhões',
    shortCode: 'EURO',
    drawDays: 'TERÇA & SEXTA',
    numbers: '1–50',
    supplement: '2 estrelas (1–12)',
    format: '5 números + 2 estrelas',
    scope: 'Europa (países aderentes)',
    born: '2004',
    accent: 'rgb(59, 130, 246)',
    glow: 'rgb(59, 130, 246)',
    border: 'rgb(59, 130, 246)',
    gradient: 'linear-gradient(180deg, rgba(59,130,246,0.07), rgba(147,197,253,0.03) 60%, transparent 100%)',
    href: '/dashboard/euromillions',
    routes: [
      { label: 'Dashboard', href: '/dashboard/euromillions' },
      { label: 'Ranking', href: '/ranking/euromillions' },
      { label: 'Probabilidades', href: '/probabilities' },
      { label: 'Padrões', href: '/patterns' },
    ],
  },
  {
    id: 'totoloto',
    game: 'TOTOLOTO',
    title: 'Totoloto',
    shortCode: 'TOTO',
    drawDays: 'QUARTA & SÁBADO',
    numbers: '1–49',
    supplement: '1 número suplementar',
    format: '6 números + 1 suplementar',
    scope: 'Portugal',
    born: '1985',
    accent: 'rgb(34, 197, 94)',
    glow: 'rgb(34, 197, 94)',
    border: 'rgb(34, 197, 94)',
    gradient: 'linear-gradient(180deg, rgba(34,197,94,0.07), rgba(134,239,172,0.03) 60%, transparent 100%)',
    href: '/dashboard/totoloto',
    routes: [
      { label: 'Dashboard', href: '/dashboard/totoloto' },
      { label: 'Ranking', href: '/ranking/totoloto' },
      { label: 'Probabilidades', href: '/probabilities' },
      { label: 'Padrões', href: '/patterns' },
    ],
  },
  {
    id: 'eurodreams',
    game: 'EURODREAMS',
    title: 'EuroDreams',
    shortCode: 'DREAM',
    drawDays: 'SEGUNDA & QUINTA',
    numbers: '1–50',
    supplement: '1 Dream number',
    format: '5 números + 1 Dream number',
    scope: 'Europa',
    born: '2023',
    accent: 'rgb(168, 85, 247)',
    glow: 'rgb(168, 85, 247)',
    border: 'rgb(168, 85, 247)',
    gradient: 'linear-gradient(180deg, rgba(168,85,247,0.07), rgba(216,180,254,0.03) 60%, transparent 100%)',
    href: '/dashboard/eurodreams',
    routes: [
      { label: 'Dashboard', href: '/dashboard/eurodreams' },
      { label: 'Ranking', href: '/ranking/eurodreams' },
      { label: 'Probabilidades', href: '/probabilities' },
      { label: 'Padrões', href: '/patterns' },
    ],
  },
  {
    id: 'megasena',
    game: 'MEGASENA',
    title: 'Mega-Sena',
    shortCode: 'MEGA',
    drawDays: 'TERÇA & SÁBADO',
    numbers: '1–60',
    supplement: 'Sem suplementar',
    format: '6 números',
    scope: 'Brasil',
    born: '1996',
    accent: 'rgb(245, 158, 11)',
    glow: 'rgb(245, 158, 11)',
    border: 'rgb(245, 158, 11)',
    gradient: 'linear-gradient(180deg, rgba(245,158,11,0.07), rgba(253,224,71,0.03) 60%, transparent 100%)',
    href: '/dashboard/megasena',
    routes: [
      { label: 'Dashboard', href: '/dashboard/megasena' },
      { label: 'Ranking', href: '/ranking/megasena' },
      { label: 'Probabilidades', href: '/probabilities' },
      { label: 'Padrões', href: '/patterns' },
    ],
  },
];

export default function GamesPage() {
  const [active, setActive] = useState<string>('europoker');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [starRanking, setStarRanking] = useState<RankingEntry[]>([]);
  const [loadingStarRanking, setLoadingStarRanking] = useState(true);

  const selected = GAMES.find(g => g.id === active)!;

  useEffect(() => {
    let cancelled = false;
    setLoadingRanking(true);
    setRanking([]);

    fetch(`/api/ranking?game=${encodeURIComponent(selected.game)}`, {
      headers: { accept: 'application/json' },
    })
      .then(res => res.ok ? res.json().catch(() => ({ ranking: [] })) : Promise.resolve({ ranking: [] }))
      .then((json: any) => {
        if (!cancelled && Array.isArray(json.ranking)) {
          const items = (json.ranking || [])
            .slice(0, 5)
            .map((r: any) => {
              const accuracy = typeof r.avgAccuracy === 'number'
                ? r.avgAccuracy > 1 ? r.avgAccuracy : Number((r.avgAccuracy * 100).toFixed(1))
                : 0;
              return { systemName: r.systemName || 'Sistema', avgAccuracy: accuracy };
            })
            .filter((r: any) => r.systemName);
          setRanking(items);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingRanking(false); });

    return () => { cancelled = true; };
  }, [active]);

  useEffect(() => {
    let cancelled = false;
    setLoadingStarRanking(true);
    setStarRanking([]);

    fetch(`/api/star-ranking?game=${encodeURIComponent(selected.game)}`, {
      headers: { accept: 'application/json' },
    })
      .then(res => res.ok ? res.json().catch(() => ({ ranking: [] })) : Promise.resolve({ ranking: [] }))
      .then((json: any) => {
        if (!cancelled && Array.isArray(json.ranking)) {
          const items = (json.ranking || [])
            .slice(0, 5)
            .map((r: any) => {
              const accuracy =
                typeof r.winRate === 'number'
                  ? Number(r.winRate.toFixed(1))
                  : typeof r.avgAccuracy === 'number'
                    ? Number(r.avgAccuracy.toFixed(1))
                    : 0;
              return { systemName: r.systemName || 'Sistema', avgAccuracy: Math.max(0, Math.min(100, accuracy)) };
            })
            .filter((r: any) => r.systemName);
          setStarRanking(items);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingStarRanking(false); });

    return () => { cancelled = true; };
  }, [selected.game]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--surface-1)' }}>
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: selected.gradient }} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14">
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full" style={{ backgroundColor: selected.accent }} />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1
                  className="text-2xl lg:text-3xl font-bold tracking-tight"
                  style={{ color: selected.accent }}
                >
                  {selected.title}
                </h1>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  análise estatística
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {GAMES.map(game => (
              <button
                key={game.id}
                onClick={() => setActive(game.id)}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                style={{
                  color: active === game.id ? game.accent : 'var(--text-tertiary)',
                  backgroundColor: active === game.id ? 'rgba(255,255,255,0.06)' : 'var(--surface-2)',
                  border: `1px solid ${active === game.id ? game.border : 'var(--border-subtle)'}`,
                  boxShadow: active === game.id ? `0 0 18px ${game.glow}` : 'none',
                }}
              >
                {game.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-9 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="rounded-2xl border border-border/70 bg-surface-1/60 px-4 py-3 shadow-sm" style={{ borderColor: selected.accent }}>
                <div className="text-[11px] font-medium text-muted-foreground mb-1">Formato</div>
                <div className="text-sm font-semibold text-foreground break-words">{selected.format}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-surface-1/60 px-4 py-3 shadow-sm" style={{ borderColor: selected.accent }}>
                <div className="text-[11px] font-medium text-muted-foreground mb-1">Números</div>
                <div className="text-sm font-semibold text-foreground">{selected.numbers}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-surface-1/60 px-4 py-3 shadow-sm" style={{ borderColor: selected.accent }}>
                <div className="text-[11px] font-medium text-muted-foreground mb-1">Suplementar</div>
                <div className="text-sm font-semibold text-foreground">{selected.supplement}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-surface-1/60 px-4 py-3 shadow-sm" style={{ borderColor: selected.accent }}>
                <div className="text-[11px] font-medium text-muted-foreground mb-1">Âmbito</div>
                <div className="text-sm font-semibold text-foreground">{selected.scope}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-surface-1/60 px-4 py-3 shadow-sm" style={{ borderColor: selected.accent }}>
                <div className="text-[11px] font-medium text-muted-foreground mb-1">Sorteios</div>
                <div className="text-sm font-semibold text-foreground">{selected.drawDays}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Sobre {selected.title}</p>
              <p className="text-sm text-secondary leading-relaxed">
                {selected.title} é um jogo com edições regulares desde {selected.born}. A estrutura actual usa {selected.format}.
                Aqui a análise não garante prémios: só registamos desempenho histórico de sistemas estatísticos sobre sorteios reais.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: selected.accent }}
                  />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top 5 sistemas — números principais</span>
                </div>
                <div className="space-y-3">
                  {loadingRanking ? (
                    <SkeletonLines count={5} />
                  ) : ranking.length ? (
                    ranking.map((r, idx) => (
                      <div key={r.systemName} className="flex items-center gap-3">
                        <span className="text-foreground font-medium text-sm w-6 shrink-0">{idx + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate mb-1">{r.systemName}</div>
                          <div className="h-2 w-full rounded-full" style={{ backgroundColor: 'var(--surface-3)' }}>
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${Math.max(0, Math.min(100, r.avgAccuracy))}%`, backgroundColor: selected.accent }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-semibold w-14 text-right" style={{ color: selected.accent }}>
                          +{Number(r.avgAccuracy.toFixed(1))}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/70 bg-surface-2/40 px-3 py-4 text-xs text-muted-foreground">
                      Ranking disponível em breve — aguarda atualização da próxima recolha de desempenho.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-surface-1/60 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: selected.accent }}
                  />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top 5 sistemas — estrelas / suplementares</span>
                </div>
                <div className="space-y-3">
                  {loadingStarRanking ? (
                    <SkeletonLines count={5} />
                  ) : starRanking.length ? (
                    (starRanking as any[]).map((r, idx) => (
                      <div key={`star-${r.systemName}-${idx}`} className="flex items-center gap-3">
                        <span className="text-foreground font-medium text-sm w-6 shrink-0">{idx + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate mb-1">{r.systemName}</div>
                          <div className="h-2 w-full rounded-full" style={{ backgroundColor: 'var(--surface-3)' }}>
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${Math.max(0, Math.min(100, r.avgAccuracy))}%`, backgroundColor: selected.accent }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-semibold w-14 text-right" style={{ color: selected.accent }}>
                          {Number(r.avgAccuracy.toFixed(1))}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/70 bg-surface-2/40 px-3 py-4 text-xs text-muted-foreground">
                      Em {selected.title}, a componente suplementar/estrelas tem comportamento diferente dos números principais. Estamos a separar rankings para comparação justa.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Espaço publicitário</p>
                <p className="text-xs text-muted-foreground">728 × 90 • Banner topo (em breve)</p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Ad</span>
            </div>
          </div>

          <aside className="xl:col-span-3">
            <div className="sticky top-24 rounded-3xl border border-border/70 bg-surface-1/60 p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Acessos rápidos</h3>
              <div className="grid grid-cols-1 gap-2">
                {selected.routes.map(route => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="inline-flex items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-xs font-semibold transition-colors duration-200"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span>{route.label}</span>
                    <span style={{ color: selected.accent }}>Abrir →</span>
                  </Link>
                ))}
              </div>

              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  As análises são puramente estatísticas e não garantem ganhos. Jogue com responsabilidade.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SystemRow({ rank, systemName, accuracy, accent }: { rank: number; systemName: string; accuracy: number; accent: string }) {
  const pct = Math.max(0, Math.min(100, accuracy));
  return (
    <div className="flex items-center gap-3">
      <span className="text-foreground font-medium text-sm w-6 shrink-0">{rank + 1}.</span>
      <div className="flex-1">
        <div className="h-2 w-full rounded-full" style={{ backgroundColor: 'var(--surface-3)' }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: accent }} />
        </div>
      </div>
      <span className="text-xs font-semibold w-14 text-right" style={{ color: accent }}>
        +{Number(pct.toFixed(1))}%
      </span>
    </div>
  );
}

function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-3 w-6 rounded-full bg-surface-3/60" />
          <div className="flex-1 h-2 rounded-full bg-surface-3/60" />
          <div className="h-3 w-10 rounded-full bg-surface-3/60" />
        </div>
      ))}
    </div>
  );
}
