'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  Calendar, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  History, 
  Layers, 
  Target, 
  Sparkles,
  Lock,
  ChevronDown,
  Info,
  HelpCircle
} from 'lucide-react';
import { DailyReportData } from '@/services/dailyReportService';

const GAMES = [
  { key: 'TOTOLOTO', name: 'Totoloto', balls: 49, color: 'from-blue-600 to-indigo-700' },
  { key: 'EUROMILLIONS', name: 'Euromilhões', balls: 50, color: 'from-amber-500 to-yellow-600' },
  { key: 'EURODREAMS', name: 'EuroDreams', balls: 40, color: 'from-purple-600 to-pink-600' },
  { key: 'MEGASENA', name: 'Mega-Sena', balls: 60, color: 'from-emerald-600 to-teal-700' },
  { key: 'LOTOFACIL', name: 'Lotofácil', balls: 25, color: 'from-fuchsia-600 to-rose-600' }
];

const FAMILY_CONFIG: Record<string, { label: string; icon: string; badge: string }> = {
  PRIORITÁRIO: { label: '✂️ Matriz de Corte V2 (Via Negativa)', icon: '✂️', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  INTELLIGENCE: { label: '🧠 Inteligência Artificial & Especialistas', icon: '🧠', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  INERTIA: { label: '🔥 Inércia, Calor & Recência', icon: '🔥', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  GEOMETRY: { label: '📐 Geometria & Matrizes Dimensionais', icon: '📐', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  CYCLES: { label: '🔄 Ciclos, Pêndulo & Probabilidade', icon: '🔄', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' }
};

const FAMILY_ORDER = ['PRIORITÁRIO', 'INTELLIGENCE', 'INERTIA', 'GEOMETRY', 'CYCLES'];

export default function AdminReportsPage() {
  const [selectedGame, setSelectedGame] = useState('EUROMILLIONS');
  const [report, setReport] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCalculationHelp, setShowCalculationHelp] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Auth protection (Admin secret)
  const [secret, setSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputSecret, setInputSecret] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

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
        body: JSON.stringify({ secret: pass })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setSecret(pass);
        sessionStorage.setItem('nm_admin_secret', pass);
        document.cookie = `admin_secret=${encodeURIComponent(pass)}; path=/; max-age=86400`;
      } else {
        setAuthError('Chave mestra incorreta.');
      }
    } catch {
      setAuthError('Erro de conexão ao validar credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (gameKey: string, specificId?: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const url = specificId 
        ? `/api/admin/reports?id=${specificId}`
        : `/api/admin/reports?game=${gameKey}&latest=true`;
      
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setReport(json.data);
      } else {
        // Auto-generate if not available
        await generateNewReport(gameKey);
      }

      // Load history
      const histRes = await fetch(`/api/admin/reports?game=${gameKey}`);
      const histJson = await histRes.json();
      if (histJson.success) {
        setHistoryList(histJson.data || []);
      }
    } catch (err: any) {
      console.error(err);
      setFeedback('Erro ao carregar relatório: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadReport(selectedGame);
    }
  }, [selectedGame, isAuthenticated]);

  const generateNewReport = async (gameKey = selectedGame) => {
    setGenerating(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: gameKey })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setReport(json.data);
        setFeedback(json.message || 'Novo relatório gerado e arquivado com sucesso!');
        // Refresh history
        const histRes = await fetch(`/api/admin/reports?game=${gameKey}`);
        const histJson = await histRes.json();
        if (histJson.success) setHistoryList(histJson.data || []);
      } else {
        setFeedback('Falha: ' + (json.error || 'Erro desconhecido'));
      }
    } catch (err: any) {
      setFeedback('Erro ao gerar relatório: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const scrollMatrix = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!tableContainerRef.current) return;
    const el = tableContainerRef.current;
    const stepX = 280;
    const stepY = 220;

    if (direction === 'left') el.scrollBy({ left: -stepX, behavior: 'smooth' });
    if (direction === 'right') el.scrollBy({ left: stepX, behavior: 'smooth' });
    if (direction === 'up') el.scrollBy({ top: -stepY, behavior: 'smooth' });
    if (direction === 'down') el.scrollBy({ top: stepY, behavior: 'smooth' });
  };

  const copyMarkdownReport = () => {
    if (!report) return;

    let text = `# 🎲 RELATÓRIO DIÁRIO DE PREVISÕES — ${report.gameName.toUpperCase()}\n`;
    text += `* **Data do Próximo Sorteio:** ${report.nextDrawWeekday}, ${report.nextDrawDate}\n`;
    text += `* **Data e Hora do Relatório:** ${new Date(report.createdAt).toLocaleString('pt-PT')}\n\n`;

    text += `## ✂️ 1. Matriz de Corte V2 (Via Negativa)\n`;
    text += `* **Sugeridos (${report.matrizCorte.survivingBalls.length}):** ${report.matrizCorte.survivingBalls.join(', ')}\n`;
    text += `* **Cortados (${report.matrizCorte.cutBalls.length}):** ${report.matrizCorte.cutBalls.join(', ')}\n\n`;

    text += `## 📡 2. Radar de Maturação (JPI Decrescente)\n`;
    report.radarTable.forEach((r, idx) => {
      text += `${idx + 1}. **${r.systemName}** | JPI: ${r.jpiScore} | ${r.statusLabel} | Atraso: ${r.currentDelay}s (Méd: ${r.cycleMean}s)\n`;
    });

    text += `\n## 🧩 3. Números Sugeridos por Sistema (Ordem de Importância)\n`;
    report.systemsMatrix.filter(s => s.family !== 'PRIORITÁRIO').forEach(s => {
      const sortedBalls = Object.entries(s.ranks)
        .map(([b, r]) => ({ ball: Number(b), rank: r }))
        .sort((a, b) => a.rank - b.rank)
        .slice(0, Math.ceil(report.totalBalls / 2))
        .map(x => x.ball);
      text += `* **${s.name}** (${s.recommendation === 'DIRECT' ? '☀️ Direto' : '🌑 Espelho'}): ${sortedBalls.join(', ')}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Acesso Confidencial ao Laboratório</h1>
            <p className="text-xs text-slate-400 mt-1">
              Área reservada ao Administrador para análise e arquivo diário de previsões.
            </p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); validateSecret(inputSecret); }} className="space-y-4">
            <input
              type="password"
              value={inputSecret}
              onChange={(e) => setInputSecret(e.target.value)}
              placeholder="Chave Mestra de Laboratório"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm font-mono tracking-widest focus:outline-none focus:border-indigo-500 transition"
              autoFocus
            />
            {authError && <p className="text-xs text-red-400 font-bold">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/30"
            >
              Desbloquear Dossiê
            </button>
          </form>
          <Link href="/admin" className="inline-block text-xs text-slate-500 hover:text-slate-300 transition">
            ← Voltar ao Backoffice Central
          </Link>
        </div>
      </div>
    );
  }

  const activeGameConfig = GAMES.find(g => g.key === selectedGame) || GAMES[0];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans p-4 md:p-8 space-y-8">
      <div className="max-w-[1700px] mx-auto space-y-8">
        
        {/* Top Breadcrumb & Actions */}
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Laboratório Central & Backoffice</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowCalculationHelp(!showCalculationHelp)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/60 transition border border-indigo-700/50"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Como Funciona o Cálculo?</span>
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition border border-slate-700"
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Arquivo Histórico ({historyList.length})</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={copyMarkdownReport}
                disabled={!report}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700 active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>

              <button
                onClick={() => generateNewReport()}
                disabled={generating}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-600/25 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                <span>{generating ? 'A Calcular...' : 'Gerar & Arquivar Novo'}</span>
              </button>
            </div>
          </div>

          {/* Title Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                    Dossiê & Relatório Diário de Previsões
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    ARQUIVADO
                  </span>
                </div>
                <p className="mt-1 text-xs md:text-sm text-slate-400">
                  Cruzamento algorítmico 1 a N, Matriz de Corte V2 e Radar de Maturação persistidos para auditoria pré-sorteio.
                </p>
              </div>
            </div>

            {/* Game Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              {GAMES.map(g => (
                <button
                  key={g.key}
                  onClick={() => setSelectedGame(g.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                    selectedGame === g.key
                      ? `bg-gradient-to-r ${g.color} text-white shadow-md`
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Explicação de Cálculo (Callout) */}
          {showCalculationHelp && (
            <div className="p-6 rounded-3xl bg-indigo-950/30 border border-indigo-800/60 text-xs text-slate-300 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-300">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span>Como Funciona o Cálculo e a Votação dos Amarelos?</span>
                </div>
                <button 
                  onClick={() => setShowCalculationHelp(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Fechar ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-500"></span> 1. Os Votos Amarelos (Top 5)
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    Cada sistema gera um ranking de preferência. As <strong>5 primeiras posições (1º ao 5º)</strong> de cada sistema são pintadas de <strong>Amarelo</strong>. A linha <em>Votos no Top 5 (🔥)</em> conta quantos sistemas independentes escolheram essa mesma bola para o seu quinteto de topo!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span> 2. Média Posição Geral
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    É a média aritmética exata da posição atribuída a essa bola por <strong>todos os sistemas</strong>. Quanto mais <strong>baixa</strong> for a média (ex: 16.4º vs 35.8º), mais próxima do topo ela ficou no conjunto total da inteligência do sistema.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-indigo-400" /> 3. Top 5 Consenso Geral
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    As 5 bolas recomendadas em consenso cruzam os dois critérios: <strong>são as que têm menor média de posição geral</strong> e <strong>maior densidade de votos nos Amarelos e Azuis</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {feedback && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-xs font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{feedback}</span>
            </div>
          )}

          {/* History Drawer */}
          {showHistory && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                <span>Relatórios Arquivados Anteriores — {activeGameConfig.name}</span>
                <span className="text-slate-500">{historyList.length} relatórios encontrados</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto">
                {historyList.map(h => (
                  <button
                    key={h.id}
                    onClick={() => { loadReport(selectedGame, h.id); setShowHistory(false); }}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-indigo-400">
                      <span>Sorteio: {h.nextDrawDate}</span>
                      <span className="text-[10px] text-slate-500">{new Date(h.createdAt).toLocaleDateString('pt-PT')}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Top Consenso: [{h.top5Consensus.slice(0, 5).join(', ')}]
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {loading ? (
          <div className="p-20 text-center text-slate-400 animate-pulse text-sm font-bold">
            A carregar dossiê e matriz comparativa...
          </div>
        ) : report ? (
          <div className="space-y-8">
            
            {/* Header Cards Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Próximo Sorteio Oficial
                </span>
                <div className="text-xl font-black text-white">{report.nextDrawDate}</div>
                <div className="text-xs font-bold text-indigo-400">{report.nextDrawWeekday}</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Top 5 Consenso Geral
                </span>
                <div className="text-xl font-mono font-black text-amber-300">
                  {report.summary.top5Consensus.join(', ')}
                </div>
                <div className="text-xs text-slate-500">Média mais forte entre todos os sistemas</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Matriz de Corte V2
                </span>
                <div className="text-xl font-black text-emerald-400">
                  {report.matrizCorte.survivingBalls.length} Sobreviventes
                </div>
                <div className="text-xs text-rose-400 font-semibold">
                  {report.matrizCorte.cutBalls.length} podados da Via Negativa
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-purple-400" /> Líder do Radar JPI
                </span>
                <div className="text-xl font-black text-purple-300 truncate">
                  {report.summary.radarLeader}
                </div>
                <div className="text-xs text-slate-500">Ponto óptimo de convergência</div>
              </div>
            </div>

            {/* SECÇÃO 1: A MATRIZ COMPARATIVA (1 a N) */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                    1. Matriz de Cruzamento Algorítmico (Números de 1 a {report.totalBalls})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Organizada por Família. Cada célula indica a <strong>ordem de importância (1º a {report.totalBalls}º)</strong> atribuída pelo sistema ao número.
                  </p>
                </div>
                
                {/* Navigation and Legend Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Directional Scroll Buttons */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">Mover:</span>
                    <button 
                      onClick={() => scrollMatrix('left')} 
                      title="Deslocar para a esquerda (bolas anteriores)"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => scrollMatrix('right')} 
                      title="Deslocar para a direita (bolas seguintes)"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => scrollMatrix('up')} 
                      title="Deslocar para cima"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => scrollMatrix('down')} 
                      title="Deslocar para baixo (consenso)"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> 1º - 5º
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 ml-2"></span> 6º - 10º
                    <span className="w-2.5 h-2.5 rounded bg-emerald-600/80 ml-2"></span> 11º - {Math.ceil(report.totalBalls / 2)}º
                    <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700 ml-2"></span> &gt;{Math.ceil(report.totalBalls / 2)}º
                  </div>
                </div>
              </div>

              {/* Table Container with Controlled Scroll */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div 
                  ref={tableContainerRef}
                  className="overflow-x-auto max-h-[660px] relative scroll-smooth"
                >
                  <table className="w-full text-center border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 sticky top-0 z-30">
                        <th className="p-3 text-left min-w-[240px] max-w-[240px] sticky left-0 z-40 bg-slate-950 border-r border-slate-800 shadow-md">
                          Sistema / Família
                        </th>
                        {Array.from({ length: report.totalBalls }, (_, i) => i + 1).map(num => (
                          <th
                            key={num}
                            onMouseEnter={() => setHoveredCol(num)}
                            onMouseLeave={() => setHoveredCol(null)}
                            className={`py-2 px-1 min-w-[34px] cursor-pointer transition ${
                              hoveredCol === num ? 'bg-indigo-600/20' : ''
                            }`}
                          >
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-200 font-black text-[11px] border border-slate-700">
                              {num}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {FAMILY_ORDER.map(famKey => {
                        const systemsInFamily = report.systemsMatrix.filter(s => s.family === famKey);
                        if (systemsInFamily.length === 0) return null;
                        const famConfig = FAMILY_CONFIG[famKey] || { label: famKey, icon: '⚙️', badge: 'bg-slate-800 text-slate-300' };

                        return (
                          <React.Fragment key={famKey}>
                            {/* Family Section Header Row */}
                            <tr className="bg-slate-950 font-bold border-y border-slate-800 text-left">
                              <td 
                                colSpan={report.totalBalls + 1}
                                className="py-2.5 px-3 sticky left-0 z-20 bg-slate-950 shadow-inner"
                              >
                                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black border ${famConfig.badge}`}>
                                  {famConfig.label}
                                </span>
                              </td>
                            </tr>

                            {/* Systems in this family */}
                            {systemsInFamily.map(sys => {
                              const isMatriz = sys.family === 'PRIORITÁRIO';
                              return (
                                <tr 
                                  key={sys.name}
                                  className={`hover:bg-slate-800/40 transition group ${isMatriz ? 'bg-amber-950/20 font-semibold' : ''}`}
                                >
                                  <td className="p-2.5 text-left sticky left-0 z-20 bg-slate-900 group-hover:bg-slate-800 transition border-r border-slate-800 font-sans shadow-sm whitespace-nowrap">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={isMatriz ? 'text-amber-400 font-black' : 'text-slate-200 font-semibold'}>
                                        {sys.name}
                                      </span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold ${
                                        isMatriz ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'
                                      }`}>
                                        {isMatriz ? 'CORTE' : (sys.recommendation === 'DIRECT' ? '☀️' : '🌑')}
                                      </span>
                                    </div>
                                  </td>

                                  {Array.from({ length: report.totalBalls }, (_, i) => i + 1).map(b => {
                                    const r = sys.ranks[b] || report.totalBalls;
                                    let cellStyle = 'bg-slate-900/40 text-slate-500';
                                    let badge: string | number = r;

                                    if (r <= 5) {
                                      cellStyle = 'bg-amber-500 text-slate-950 font-black shadow-sm';
                                    } else if (r <= 10) {
                                      cellStyle = 'bg-blue-600 text-white font-bold';
                                    } else if (r <= Math.ceil(report.totalBalls / 2)) {
                                      cellStyle = 'bg-emerald-950/60 text-emerald-300 font-medium border border-emerald-800/40';
                                    }

                                    if (isMatriz) {
                                      if (r <= report.matrizCorte.survivingBalls.length) {
                                        cellStyle = 'bg-emerald-600 text-white font-black';
                                        badge = '✓' + r;
                                      } else {
                                        cellStyle = 'bg-rose-950/50 text-rose-400 border border-rose-900/40 line-through';
                                        badge = '✕';
                                      }
                                    }

                                    return (
                                      <td
                                        key={b}
                                        onMouseEnter={() => setHoveredCol(b)}
                                        onMouseLeave={() => setHoveredCol(null)}
                                        className={`p-1 border-r border-slate-800/30 transition ${
                                          hoveredCol === b ? 'bg-indigo-600/15' : ''
                                        }`}
                                        title={`${sys.name} → Bola ${b}: Posição ${r}º`}
                                      >
                                        <span className={`inline-flex items-center justify-center w-full py-0.5 rounded ${cellStyle}`}>
                                          {badge}
                                        </span>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>

                    {/* Footer Consenso */}
                    <tfoot className="border-t-2 border-slate-700 bg-slate-950 text-[11px] font-bold sticky bottom-0 z-30">
                      <tr>
                        <td className="p-3 text-left sticky left-0 z-40 bg-slate-950 border-r border-slate-800 font-sans text-indigo-400 font-black shadow-md">
                          Média Posição Geral
                        </td>
                        {Array.from({ length: report.totalBalls }, (_, i) => i + 1).map(b => {
                          const item = report.consensus.find(c => c.ball === b) || { avgRank: 25, top5Votes: 0 };
                          const isBest = item.avgRank <= 20;
                          return (
                            <td 
                              key={b}
                              className={`p-1 border-r border-slate-800/50 font-mono ${
                                isBest ? 'text-emerald-400 font-black bg-emerald-950/30' : 'text-slate-400'
                              } ${hoveredCol === b ? 'bg-indigo-600/20' : ''}`}
                            >
                              {item.avgRank}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-2 text-left sticky left-0 z-40 bg-slate-950 border-r border-slate-800 font-sans text-amber-400 font-black shadow-md">
                          Votos no Top 5 (🔥)
                        </td>
                        {Array.from({ length: report.totalBalls }, (_, i) => i + 1).map(b => {
                          const item = report.consensus.find(c => c.ball === b) || { top5Votes: 0 };
                          const hot = item.top5Votes >= 4;
                          return (
                            <td
                              key={b}
                              className={`p-1 border-r border-slate-800/50 font-mono ${
                                hot ? 'text-amber-300 font-black bg-amber-500/20' : 'text-slate-500'
                              } ${hoveredCol === b ? 'bg-indigo-600/20' : ''}`}
                            >
                              {item.top5Votes > 0 ? item.top5Votes : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </section>

            {/* SECÇÃO 2: MATRIZ DE CORTE V2 */}
            <section className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  2. Matriz de Corte V2 (Via Negativa)
                </h2>
                <span className="text-xs text-slate-400">Total: {report.totalBalls} Bolas</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                  <div className="text-[11px] font-sans font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bolas Sobreviventes Recomendadas ({report.matrizCorte.survivingBalls.length})
                  </div>
                  <div className="text-emerald-200 font-bold tracking-wide">
                    {report.matrizCorte.survivingBalls.join(', ')}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 space-y-1">
                  <div className="text-[11px] font-sans font-bold text-rose-400">
                    ✕ Bolas Eliminadas / Risco Elevado ({report.matrizCorte.cutBalls.length})
                  </div>
                  <div className="text-slate-400 line-through tracking-wide">
                    {report.matrizCorte.cutBalls.join(', ')}
                  </div>
                </div>
              </div>
            </section>

            {/* SECÇÃO 3: RADAR DE MATURAÇÃO */}
            <section className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                3. Ferramenta de Maturação (Radar JPI Decrescente)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Sistema</th>
                      <th className="p-3">Estado Algorítmico</th>
                      <th className="p-3 text-center">JPI Score</th>
                      <th className="p-3 text-right">Atraso</th>
                      <th className="p-3 text-right">Média Ciclo</th>
                      <th className="p-3 text-center">Traves Ciclo</th>
                      <th className="p-3 text-center">Traves Recentes</th>
                      <th className="p-3 text-right">Jackpots</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {report.radarTable.map((r, idx) => (
                      <tr key={r.systemId} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="p-3 font-sans font-bold text-slate-200">{r.systemName}</td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.jpiScore >= 75 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            r.jpiScore >= 60 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {r.statusLabel}
                          </span>
                        </td>
                        <td className="p-3 text-center font-black text-amber-400 text-sm">{r.jpiScore}</td>
                        <td className="p-3 text-right text-slate-300">{r.currentDelay} s.</td>
                        <td className="p-3 text-right text-slate-400">{r.cycleMean} s.</td>
                        <td className="p-3 text-center text-slate-400">{r.travesSinceLastJackpot} / {r.travesPerJackpotMean}</td>
                        <td className="p-3 text-center text-indigo-300">{r.travesLast5} (5s) | {r.travesLast10} (10s)</td>
                        <td className="p-3 text-right font-black text-emerald-400">{r.totalJackpots}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        ) : null}

      </div>
    </div>
  );
}
