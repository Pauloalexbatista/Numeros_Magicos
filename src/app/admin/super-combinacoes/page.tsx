'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Sparkles,
  Flame,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  Lock,
  Plus,
  Trash2,
  Play,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

type Polarity = 'D' | 'E';
type FusionMethod = 'INTERCALADO' | 'BORDA';

interface SystemComponent {
  systemId: string;
  polarity: Polarity;
}

interface PresetFormula {
  id: string;
  title: string;
  subtitle: string;
  targetPool: 10 | 15 | 20 | 25 | 30;
  focus: 'JACKPOT_5' | 'HIGH_45' | 'HOT_20';
  method: FusionMethod;
  components: SystemComponent[];
  badge: string;
}

export default function SuperCombinacoesAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputSecret, setInputSecret] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [presets, setPresets] = useState<PresetFormula[]>([]);
  const [systemLabels, setSystemLabels] = useState<Record<string, string>>({});
  const [activePresetId, setActivePresetId] = useState<string>('20b_jackpot_5s');
  const [selectedPool, setSelectedPool] = useState<10 | 15 | 20 | 25 | 30>(20);
  const [filterPoolTab, setFilterPoolTab] = useState<'ALL' | 10 | 15 | 20 | 25 | 30>('ALL');

  const [customComponents, setCustomComponents] = useState<SystemComponent[]>([]);
  const [customMethod, setCustomMethod] = useState<FusionMethod>('INTERCALADO');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [evaluation, setEvaluation] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('nm_admin_secret');
    if (saved) {
      validateSecret(saved);
    } else {
      const match = document.cookie.match(new RegExp('(^| )admin_secret=([^;]+)'));
      if (match && match[2]) {
        validateSecret(decodeURIComponent(match[2]));
      } else {
        setLoading(false);
      }
    }
  }, []);

  const validateSecret = async (pass: string) => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: pass }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('nm_admin_secret', pass);
        loadPreset('20b_jackpot_5s');
      } else {
        setAuthError('Chave mestra incorreta.');
        setLoading(false);
      }
    } catch {
      setAuthError('Erro de comunicação com o servidor.');
      setLoading(false);
    }
  };

  const loadPreset = async (presetId: string) => {
    setLoading(true);
    setIsCustomMode(false);
    try {
      const res = await fetch(`/api/admin/super-combinacoes?presetId=${encodeURIComponent(presetId)}`);
      const json = await res.json();
      if (json.success) {
        setPresets(json.presets);
        setSystemLabels(json.systemLabels);
        setActivePresetId(json.activePreset.id);
        setSelectedPool(json.activePreset.targetPool);
        setCustomComponents(json.activePreset.components);
        setCustomMethod(json.activePreset.method);
        setEvaluation(json.evaluation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runCustomSimulation = async () => {
    if (customComponents.length === 0) return;
    setLoading(true);
    setIsCustomMode(true);
    try {
      const res = await fetch('/api/admin/super-combinacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          components: customComponents,
          method: customMethod,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEvaluation(json.evaluation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPool = () => {
    if (!evaluation?.nextDrawPools?.[selectedPool]) return;
    const nums = [...evaluation.nextDrawPools[selectedPool]].sort((a: number, b: number) => a - b);
    navigator.clipboard.writeText(nums.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAuthError(null);
            validateSecret(inputSecret);
          }}
          className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-5"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Super-Combinações (Área Reservada)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Insira a chave mestra do Laboratório para aceder ao motor de evolução de 10 a 30 bolas.
            </p>
          </div>
          <input
            type="password"
            placeholder="Master Secret"
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono"
          />
          {authError && <p className="text-xs text-red-500 font-bold text-center">{authError}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm"
          >
            Entrar no Laboratório Privado
          </button>
        </form>
      </div>
    );
  }

  const filteredPresets =
    filterPoolTab === 'ALL'
      ? presets
      : presets.filter((p) => p.targetPool === filterPoolTab);

  const activePoolNums: number[] = evaluation?.nextDrawPools?.[selectedPool] || [];
  const sortedActivePoolNums = [...activePoolNums].sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Laboratório Central & Backoffice
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                🏆 Super-Combinações & Evolução (10 a 30 Bolas)
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                USO PRIVADO • EUROMILHÕES
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              Cruzamento cirúrgico de 2 a 5 especialistas (Intercalação Top-N vs Consenso Borda). Acompanhe a evolução nos últimos 20 sorteios e extraia a chave do próximo sorteio.
            </p>
          </div>

          {evaluation && (
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-right">
                <div className="text-[11px] font-bold uppercase text-slate-400">Sorteios Auditados</div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {evaluation.totalDraws} concursos
                </div>
                <div className="text-[10px] text-slate-400">Último: {evaluation.latestDrawDate}</div>
              </div>
            </div>
          )}
        </header>

        {/* Filter by Pool Size */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> 1. Fórmulas Campeãs Descobertas
            </h2>
            <div className="flex flex-wrap gap-1.5 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl border border-slate-300/60 dark:border-slate-800">
              {(['ALL', 10, 15, 20, 25, 30] as const).map((tab) => (
                <button
                  key={String(tab)}
                  onClick={() => setFilterPoolTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterPoolTab === tab
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'ALL' ? 'Todas (11)' : `${tab} Bolas`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresets.map((preset) => {
              const isSelected = !isCustomMode && activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset.id)}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-600/10 dark:bg-indigo-500/15 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/40'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                        {preset.targetPool} BOLAS • {preset.method}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        {preset.badge}
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {preset.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {preset.components.map((c, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          c.polarity === 'D'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {systemLabels[c.systemId] || c.systemId} [{c.polarity}]
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Custom Builder / Simulator */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" /> Bancada de Fusão Personalizada (1 a 5 Sistemas)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Altere os sistemas abaixo, inverta a polaridade ([D] Direto vs [E] Espelho) ou troque entre Intercalação Cirúrgica e Consenso Borda.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value as FusionMethod)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                <option value="INTERCALADO">Método: Intercalado Cirúrgico (Top-N)</option>
                <option value="BORDA">Método: Consenso de Borda (Soma Rankings)</option>
              </select>

              <button
                onClick={runCustomSimulation}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/20"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Simular Combinação
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {customComponents.map((comp, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <span className="text-[11px] font-black text-indigo-500">#{idx + 1}</span>
                <select
                  value={comp.systemId}
                  onChange={(e) => {
                    const updated = [...customComponents];
                    updated[idx] = { ...updated[idx], systemId: e.target.value };
                    setCustomComponents(updated);
                  }}
                  className="bg-transparent text-xs font-bold focus:outline-none"
                >
                  {Object.entries(systemLabels).map(([id, label]) => (
                    <option key={id} value={id} className="bg-white dark:bg-slate-900">
                      {label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const updated = [...customComponents];
                    updated[idx] = {
                      ...updated[idx],
                      polarity: updated[idx].polarity === 'D' ? 'E' : 'D',
                    };
                    setCustomComponents(updated);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                    comp.polarity === 'D'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                  title="Alternar Direto [D] / Espelho [E]"
                >
                  {comp.polarity === 'D' ? 'DIRETO [D]' : 'ESPELHO [E]'}
                </button>

                {customComponents.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setCustomComponents(customComponents.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-500 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {customComponents.length < 5 && (
              <button
                type="button"
                onClick={() =>
                  setCustomComponents([
                    ...customComponents,
                    { systemId: 'tiro_certeiro', polarity: 'D' },
                  ])
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-indigo-400 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-500/10"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Sistema
              </button>
            )}
          </div>
        </section>

        {evaluation && (
          <>
            {/* Next Draw Suggested Balls */}
            <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 border border-indigo-500/30 shadow-xl space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                    <Sparkles className="w-4 h-4" /> Previsão Ativa para o Próximo Sorteio
                  </div>
                  <h2 className="text-xl md:text-2xl font-black">
                    Chave Sugerida ({selectedPool} Bolas) — Ordem de Força & Ordem Crescente
                  </h2>
                  <p className="text-xs text-slate-300">
                    Selecione o escalão de bolas que pretende jogar para ver a sugestão exata gerada pela fórmula ativa.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {([10, 15, 20, 25, 30] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPool(p)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                        selectedPool === p
                          ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/25 scale-105'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {p} Bolas
                    </button>
                  ))}
                </div>
              </div>

              {/* Balls ordered by Ascending Order */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  As {selectedPool} Bolas Sugeridas (Ordem Crescente — Prontas a Jogar):
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {sortedActivePoolNums.map((num) => (
                    <div
                      key={num}
                      className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black text-base flex items-center justify-center shadow-md shadow-amber-500/20"
                    >
                      {String(num).padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>

              {/* Balls ordered by Entry Rank (1 to 30) */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ordem Cirúrgica de Entrada (1.ª à {selectedPool}.ª bola mais forte):
                </div>
                <div className="flex flex-wrap gap-2">
                  {activePoolNums.map((num, idx) => (
                    <div
                      key={num}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center gap-1.5 text-xs"
                    >
                      <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                      <span className="font-black text-amber-300">{String(num).padStart(2, '0')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleCopyPool}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado para a Área de Transferência!' : `Copiar ${selectedPool} Bolas`}
                </button>

                <Link
                  href={`/wheeling?numbers=${sortedActivePoolNums.join(',')}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <span>Enviar {selectedPool} Bolas para o Desdobrador (GCI)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>

            {/* Multi-Pool Performance Table (10, 15, 20, 25, 30 Balls) */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 2. Radiografia Completa por Escalão (10, 15, 20, 25 e 30 Bolas)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-400 font-black">
                      <th className="py-3 px-4">Escalão da Pool</th>
                      <th className="py-3 px-4">Jackpots (5/5)</th>
                      <th className="py-3 px-4">Esperado (Acaso)</th>
                      <th className="py-3 px-4">2.º Prémio (4/5)</th>
                      <th className="py-3 px-4">Total 4+5 Acertos</th>
                      <th className="py-3 px-4">3 Acertos (3/5)</th>
                      <th className="py-3 px-4 text-amber-600 dark:text-amber-400">Últimos 20 (5/5)</th>
                      <th className="py-3 px-4 text-emerald-600 dark:text-emerald-400">Últimos 20 (4+5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {([10, 15, 20, 25, 30] as const).map((p) => {
                      const st = evaluation.statsByPool[p];
                      const lift5 = st.expected5 > 0 ? (st.hits5 / st.expected5).toFixed(2) : '0';
                      const isTarget = selectedPool === p;
                      return (
                        <tr
                          key={p}
                          onClick={() => setSelectedPool(p)}
                          className={`cursor-pointer transition-colors ${
                            isTarget
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/30 font-bold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-black text-indigo-600 dark:text-indigo-400">
                            {p} Bolas {isTarget && '★'}
                          </td>
                          <td className="py-3.5 px-4 font-black text-base text-slate-900 dark:text-white">
                            {st.hits5}{' '}
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ml-1">
                              {lift5}x
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">{st.expected5}</td>
                          <td className="py-3.5 px-4 font-bold">{st.hits4}</td>
                          <td className="py-3.5 px-4 font-black text-indigo-600 dark:text-indigo-300">
                            {st.hits45}{' '}
                            <span className="text-[11px] font-normal text-slate-400">
                              (vs {st.expected45})
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{st.hits3}</td>
                          <td className="py-3.5 px-4 font-black text-amber-600 dark:text-amber-400">
                            {st.last20_5} em 20
                          </td>
                          <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">
                            {st.last20_45} em 20 ({Math.round((st.last20_45 / 20) * 100)}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Last 20 Draws Evolution Table */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" /> 3. Comportamento e Evolução nos Últimos 20 Sorteios
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Veja sorteio a sorteio quantas bolas acertou nos escalões de 10, 15, 20, 25 e 30 bolas. As bolas verdes saíram dentro do escalão selecionado ({selectedPool} bolas).
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 font-black">
                      <th className="py-3 px-3">Data</th>
                      <th className="py-3 px-3">Chave Premiada</th>
                      <th className="py-3 px-2 text-center">10b</th>
                      <th className="py-3 px-2 text-center">15b</th>
                      <th className="py-3 px-2 text-center">20b</th>
                      <th className="py-3 px-2 text-center">25b</th>
                      <th className="py-3 px-2 text-center">30b</th>
                      <th className="py-3 px-3">Bolas da Sugestão ({selectedPool}b) que acertaram</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {evaluation.recent20Draws.map((d: any) => {
                      const poolSlice: number[] = d.rankedPool30.slice(0, selectedPool);
                      const poolSet = new Set(poolSlice);
                      const matchedBalls = d.winningNumbers.filter((w: number) => poolSet.has(w));
                      return (
                        <tr key={d.drawId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">{d.date}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              {d.winningNumbers.map((w: number) => {
                                const hit = poolSet.has(w);
                                return (
                                  <span
                                    key={w}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                                      hit
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {w}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          {([10, 15, 20, 25, 30] as const).map((p) => {
                            const h = d.hitsByPool[p];
                            return (
                              <td key={p} className="py-3 px-2 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-md font-black ${
                                    h === 5
                                      ? 'bg-amber-400 text-slate-950 shadow'
                                      : h === 4
                                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      : h === 3
                                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {h}/5
                                </span>
                              </td>
                            );
                          })}
                          <td className="py-3 px-3">
                            {matchedBalls.length > 0 ? (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                Acertou {matchedBalls.length}: [{matchedBalls.join(', ')}]
                              </span>
                            ) : (
                              <span className="text-slate-400">0 acertos</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
