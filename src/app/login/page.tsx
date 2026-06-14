'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trophy, TrendingUp, BarChart3, LockOpen, ChevronRight } from 'lucide-react';

type Draw = { date: string; numbers: string | number[]; stars: string | number[] };
type Ranking = { systemName: string; avgAccuracy: number; totalPredictions: number };

export default function LoginPage() {
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [latestDraw, setLatestDraw] = useState<Draw | null>(null);
  const [topSystem, setTopSystem] = useState<Ranking | null>(null);
  const [drawsUsed, setDrawsUsed] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<'euro' | 'toto' | 'dream'>('euro');

  useEffect(() => {
    async function fetchData() {
      try {
        const [drawsRes, rankingRes, meanRes] = await Promise.all([
          fetch('/api/draws').then(res => res.json().catch(() => [])),
          fetch('/api/ranking').then(res => res.json().catch(() => ({}))),
          fetch('/api/mean').then(res => res.json().catch(() => ({})))
        ]);

        if (Array.isArray(drawsRes) && drawsRes.length > 0) setLatestDraw(drawsRes[0]);
        if (rankingRes?.ranking?.length) {
          const valid = rankingRes.ranking.filter((r: any) =>
            !r.systemName.includes('Random Forest') && !r.systemName.includes('ML Classifier')
          );
          if (valid.length) setTopSystem(valid[0]);
        }
        if (typeof meanRes?.drawsUsed === 'number') setDrawsUsed(meanRes.drawsUsed);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
    } catch {
      return dateString;
    }
  };

  const handleEnter = () => router.push('/games');

  const gameConfig: Record<'euro' | 'toto' | 'dream', any> = {
    euro: { label: 'Euromilhões', accent: 'var(--euro-accent)', accent2: 'var(--euro-accent-2)', glow: 'var(--euro-glow)', border: 'var(--euro-border)', surface: 'var(--euro-surface)', text: 'var(--euro-text)' },
    toto: { label: 'Totoloto', accent: 'var(--toto-accent)', accent2: 'var(--toto-accent-2)', glow: 'var(--toto-glow)', border: 'var(--toto-border)', surface: 'var(--toto-surface)', text: 'var(--toto-text)' },
    dream: { label: 'EuroDreams', accent: 'var(--dream-accent)', accent2: 'var(--dream-accent-2)', glow: 'var(--dream-glow)', border: 'var(--dream-border)', surface: 'var(--dream-surface)', text: 'var(--dream-text)' },
  }[game];

  const gameLabel = { euro: 'Euromilhões', toto: 'Totoloto', dream: 'EuroDreams' }[game];

  const fixedPanelStyle: React.CSSProperties = {
    backgroundColor: '#0f1f3d',
    borderColor: '#1f3a5f',
    color: '#e5e7eb',
    boxShadow: '0 24px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.05)',
  };

  const fixedBadgeStyle: React.CSSProperties = {
    backgroundColor: 'rgba(148,163,184,0.14)',
    color: '#cbd5e1',
    border: '1px solid #1f3a5f',
  };

  const fixedWarningStyle: React.CSSProperties = {
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderColor: 'rgba(251,191,36,0.35)',
    color: '#fcd8a8',
  };

  const accentForState = (active: boolean) => (active ? '#2563eb' : '#94a3b8');

  return (
    <div className="min-h-screen bg-background text-foreground font-dm-sans relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.07]" />
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${gameConfig.glow}, transparent 60%)` }} />
      </div>

      <div className="relative z-20 flex justify-center pt-6">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface-1/70 p-1">
          {([
              ['euro', 'Euromilhões'],
              ['toto', 'Totoloto'],
              ['dream', 'EuroDreams'],
            ] as const).map(([id, label]) => {
              const active = game === id;
              const cfg = { euro: { accent: 'var(--euro-accent)', border: 'var(--euro-border)' }, toto: { accent: 'var(--toto-accent)', border: 'var(--toto-border)' }, dream: { accent: 'var(--dream-accent)', border: 'var(--dream-border)' } }[id];
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
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{gameLabel} • Análise estatística</p>

                {!loading && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard label="Último Sorteio" value={latestDraw ? formatDate(latestDraw.date) : '—'} icon={<Trophy className="w-5 h-5" />} />
                    <StatCard label="Top Sistema Atual" value={topSystem?.systemName || '—'} sub={topSystem ? `+${topSystem.avgAccuracy > 1 ? topSystem.avgAccuracy.toFixed(1) : (topSystem.avgAccuracy * 100).toFixed(1)}% acerto` : ''} icon={<TrendingUp className="w-5 h-5" />} />
                    <StatCard label="Sorteios Analisados" value={String(drawsUsed || '—')} icon={<BarChart3 className="w-5 h-5" />} />
                  </div>
                )}

                <div className="rounded-2xl border border-dashed border-border/70 bg-surface-1/40 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Espaço publicitário</p>
                    <p className="text-xs text-muted-foreground">728 × 90 • Banner topo (em breve)</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Ad</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-24 rounded-3xl border p-6 lg:p-8 shadow-2xl" style={fixedPanelStyle}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: '#e5e7eb' }}>Acesso aos dados</h2>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={fixedBadgeStyle}>Gratuito</span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-5">Para continuares, confirma que compreendes que se trata apenas de análise estatística e que não existem garantias de ganhos.</p>

                <div className="rounded-xl border p-4 mb-6" style={fixedWarningStyle}>
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                      Aviso legal: O jogo pode ser viciante. Os dados apresentados são estritamente estatísticos, históricos e académicos, não garantindo quaisquer ganhos futuros. Jogue responsavelmente e com moderação. Mais informações em{' '}
                      <a href="https://www.sicad.pt" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:opacity-80">sicad.pt</a>.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 w-5 h-5 rounded border-input bg-background" style={{ color: gameConfig.accent }} />
                  <span className="text-sm text-foreground font-medium leading-relaxed">Li, compreendi os riscos e aceito os termos descritos. Quero explorar os dados com responsabilidade.</span>
                </label>

                <button disabled={!acceptedTerms} onClick={handleEnter} className="w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 inline-flex items-center justify-center gap-2" style={{ backgroundColor: acceptedTerms ? gameConfig.accent : 'var(--surface-2)', color: acceptedTerms ? '#fff' : 'var(--text-disabled)', cursor: acceptedTerms ? 'pointer' : 'not-allowed', boxShadow: acceptedTerms ? `0 14px 40px ${gameConfig.accent}35` : 'none' }}>
                  {acceptedTerms ? <><LockOpen className="w-4 h-4" /><span>Entrar e explorar os dados</span><ChevronRight className="w-4 h-4" /></> : <span>Confirma para continuar</span>}
                </button>

                <p className="text-[11px] text-muted-foreground text-center mt-4">Acesso gratuito • Sem login • Apenas análise estatística</p>
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
    <div className="rounded-2xl border border-border/70 bg-surface-1/60 px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="text-base font-semibold text-foreground">{value}</div>
      {sub && <div className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{sub}</div>}
    </div>
  );
}
