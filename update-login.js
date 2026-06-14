const fs = require('fs');

const content = `'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Trophy, TrendingUp, BarChart3, LockOpen, ChevronRight, History } from 'lucide-react';

type Draw = { date: string; numbers: string | number[]; stars: string | number[] };
type Ranking = { systemName: string; avgAccuracy: number; totalPredictions: number };

function getNumbers(val: string | number[] | undefined | null): number[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

export default function LoginPage() {
  const t = useTranslations('login');
  const tNav = useTranslations('nav');
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [latestDraws, setLatestDraws] = useState<Draw[]>([]);
  const [topSystem, setTopSystem] = useState<Ranking | null>(null);
  const [drawsUsed, setDrawsUsed] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<'euro' | 'toto' | 'dream' | 'mega'>('euro');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const slug = { euro: 'euromillions', toto: 'totoloto', dream: 'eurodreams', mega: 'megasena' }[game];
      try {
        const [drawsRes, rankingRes, meanRes] = await Promise.all([
          fetch(`/api/draws?game=${slug}`).then(res => res.json().catch(() => [])),
          fetch(`/api/ranking?game=${slug}`).then(res => res.json().catch(() => ({}))),
          fetch(`/api/mean?game=${slug}`).then(res => res.json().catch(() => ({})))
        ]);

        if (Array.isArray(drawsRes)) setLatestDraws(drawsRes.slice(0, 3));
        if (rankingRes?.ranking?.length) {
          const valid = rankingRes.ranking.filter((r: any) =>
            !r.systemName.includes('Random Forest') && !r.systemName.includes('ML Classifier')
          );
          setTopSystem(valid.length ? valid[0] : null);
        } else {
          setTopSystem(null);
        }
        if (typeof meanRes?.drawsUsed === 'number') setDrawsUsed(meanRes.drawsUsed);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [game]);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
    } catch {
      return dateString;
    }
  };

  const gameConfig = {
    euro: { label: 'Euromilhões', slug: 'euromillions', enum: 'EUROMILLIONS', accent: 'var(--euro-accent)', border: 'var(--euro-border)', glow: 'var(--euro-glow)' },
    toto: { label: 'Totoloto', slug: 'totoloto', enum: 'TOTOLOTO', accent: 'var(--toto-accent)', border: 'var(--toto-border)', glow: 'var(--toto-glow)' },
    dream: { label: 'EuroDreams', slug: 'eurodreams', enum: 'EURODREAMS', accent: 'var(--dream-accent)', border: 'var(--dream-border)', glow: 'var(--dream-glow)' },
    mega: { label: 'Mega-Sena', slug: 'megasena', enum: 'MEGASENA', accent: 'var(--mega-accent)', border: 'rgba(245, 158, 11, 0.3)', glow: 'rgba(245, 158, 11, 0.15)' },
  }[game];

  const handleEnter = () => {
    document.cookie = "terms_accepted=true; path=/; max-age=31536000";
    router.push('/dashboard/' + gameConfig.slug);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-dm-sans relative overflow-hidden flex flex-col" data-game={gameConfig.enum}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.07]" />
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${gameConfig.glow}, transparent 60%)` }} />
      </div>

      <div className="relative z-20 flex justify-center pt-6">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface-1/70 p-1">
          {([
              ['euro', tNav('euromillions')],
              ['toto', tNav('totoloto')],
              ['dream', tNav('eurodreams')],
              ['mega', tNav('megasena')],
            ] as const).map(([id, label]) => {
              const active = game === id;
              const cfg = { euro: { accent: 'var(--euro-accent)', border: 'var(--euro-border)' }, toto: { accent: 'var(--toto-accent)', border: 'var(--toto-border)' }, dream: { accent: 'var(--dream-accent)', border: 'var(--dream-border)' }, mega: { accent: 'var(--mega-accent)', border: 'rgba(245, 158, 11, 0.3)' } }[id];
              return (
                <button key={id} onClick={() => setGame(id)} className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200" style={{ color: active ? cfg.accent : 'var(--text-tertiary)', backgroundColor: active ? `${cfg.accent}15` : 'transparent', border: active ? `1px solid ${cfg.border}` : '1px solid transparent', boxShadow: active ? `0 0 18px ${cfg.accent}22` : 'none' }}>
                  {label}
                </button>
              );
            })}
        </div>
      </div>

      <main className="relative z-10 flex-1 w-full">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{gameConfig.label} • Análise estatística</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-h-[100px]">
                  {!loading && (
                    <>
                      <StatCard label={t("last_draw")} value={latestDraws[0] ? formatDate(latestDraws[0].date) : '-'} icon={<Trophy className="w-5 h-5 text-[var(--accent)]" />} />
                      <StatCard label={t("top_system")} value={topSystem?.systemName || '-'} sub={topSystem ? `+${topSystem.avgAccuracy > 1 ? topSystem.avgAccuracy.toFixed(1) : (topSystem.avgAccuracy * 100).toFixed(1)}% ${t("accuracy")}` : ''} icon={<TrendingUp className="w-5 h-5 text-[var(--accent)]" />} />
                      <StatCard label={t("draws_analyzed")} value={String(drawsUsed || '-')} icon={<BarChart3 className="w-5 h-5 text-[var(--accent)]" />} />
                    </>
                  )}
                  {loading && (
                    <div className="col-span-3 flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/30 border-t-[var(--accent)]" />
                    </div>
                  )}
                </div>

                {!loading && latestDraws.length > 0 && (
                  <div className="mt-8 space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <History className="w-4 h-4" />
                      Últimos 3 Sorteios
                    </h3>
                    <div className="grid gap-3">
                      {latestDraws.map((draw) => (
                        <div key={draw.date} className="glass-card px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-sm font-semibold whitespace-nowrap">{formatDate(draw.date)}</span>
                          <div className="flex flex-wrap items-center gap-1">
                            {getNumbers(draw.numbers).map((n, i) => (
                              <div key={`n-${i}`} className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-[var(--accent)]/30">
                                {n}
                              </div>
                            ))}
                            {getNumbers(draw.stars).length > 0 && <span className="text-muted-foreground mx-1 font-bold">+</span>}
                            {getNumbers(draw.stars).map((s, i) => (
                              <div key={`s-${i}`} className="w-6 h-6 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] flex items-center justify-center text-xs font-bold">
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-24 rounded-3xl border border-border bg-surface-1/60 p-6 lg:p-8 shadow-sm backdrop-blur-md transition-all duration-500">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold font-display text-foreground">{t("access_data")}</h2>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-surface-2 text-muted-foreground border border-border">{t("free")}</span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t("disclaimer_text")}</p>

                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-6 text-yellow-700 dark:text-yellow-400">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                      {t("warning_text")}{' '}
                      <a href="https://www.sicad.pt" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:opacity-80">sicad.pt</a>.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 w-5 h-5 rounded border-input bg-background cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
                  <span className="text-sm text-foreground font-medium leading-relaxed">{t("accept_checkbox")}</span>
                </label>

                <button disabled={!acceptedTerms} onClick={handleEnter} className="glass-button w-full py-3.5 px-4 text-sm font-semibold transition-all" style={acceptedTerms ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' } : {}}>
                  {acceptedTerms ? <><LockOpen className="w-4 h-4 mr-2 inline-block" /><span>{t("btn_enter")}</span></> : <span>{t("btn_confirm")}</span>}
                </button>

                <p className="text-[11px] text-muted-foreground text-center mt-4">{t("footer_info")}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="glass-card px-4 py-4 relative group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="text-base font-semibold text-foreground">{value}</div>
      {sub && <div className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{sub}</div>}
    </div>
  );
}
`;

fs.writeFileSync('src/app/login/page.tsx', content, 'utf8');
console.log("Updated login page");
