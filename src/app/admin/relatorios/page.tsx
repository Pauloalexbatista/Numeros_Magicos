'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw, 
  Calendar, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  History, 
  Sparkles,
  Lock,
  ChevronDown,
  Info,
  HelpCircle,
  ExternalLink,
  Send,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { DailyReportData } from '@/services/dailyReportService';
import { exportReportToExcel } from '@/utils/excelReportExport';

const GAMES = [
  { key: 'TOTOLOTO', name: 'Totoloto', balls: 49, color: 'from-blue-600 to-indigo-700' },
  { key: 'EUROMILLIONS', name: 'Euromilhões', balls: 50, color: 'from-amber-500 to-yellow-600' },
  { key: 'EURODREAMS', name: 'EuroDreams', balls: 40, color: 'from-purple-600 to-pink-600' },
  { key: 'MEGASENA', name: 'Mega-Sena', balls: 60, color: 'from-emerald-600 to-teal-700' },
  { key: 'LOTOFACIL', name: 'Lotofácil', balls: 25, color: 'from-fuchsia-600 to-rose-600' }
];

const FAMILY_CONFIG: Record<string, { label: string; icon: string; badge: string }> = {
  PRIORITÁRIO: { label: 'Matriz de Corte', icon: '✂️', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  INTELLIGENCE: { label: 'Inteligência Artificial & Especialistas', icon: '🧠', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  INERTIA: { label: 'Inércia, Calor & Recência', icon: '🔥', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  GEOMETRY: { label: 'Geometria & Matrizes Dimensionais', icon: '📐', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  CYCLES: { label: 'Ciclos, Pêndulo & Probabilidade', icon: '🔄', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' }
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

  // Density & View Mode
  const [isCompact, setIsCompact] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Manual Selection Scratchpad
  const [manualSelection, setManualSelection] = useState<number[]>([]);
  const [manualInputText, setManualInputText] = useState('');

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

  // Load saved manual selection from localStorage per game
  useEffect(() => {
    const saved = localStorage.getItem(`nm_report_draft_selection_${selectedGame}`);
    if (saved) {
      try {
        setManualSelection(JSON.parse(saved));
      } catch {
        setManualSelection([]);
      }
    } else {
      setManualSelection([]);
    }
  }, [selectedGame]);

  const updateManualSelection = (nums: number[]) => {
    const maxBalls = activeGameConfig.balls;
    const valid = Array.from(new Set(nums))
      .filter(n => Number.isInteger(n) && n >= 1 && n <= maxBalls)
      .sort((a, b) => a - b);
    setManualSelection(valid);
    localStorage.setItem(`nm_report_draft_selection_${selectedGame}`, JSON.stringify(valid));
  };

  const toggleBallSelection = (ball: number) => {
    if (manualSelection.includes(ball)) {
      updateManualSelection(manualSelection.filter(b => b !== ball));
    } else {
      updateManualSelection([...manualSelection, ball]);
    }
  };

  const handleManualInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInputText.trim()) return;
    const parsed = manualInputText
      .split(/[\s,;]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    updateManualSelection([...manualSelection, ...parsed]);
    setManualInputText('');
  };

  const selectTop5Consensus = () => {
    if (!report?.summary.top5Consensus) return;
    updateManualSelection([...manualSelection, ...report.summary.top5Consensus]);
  };

  const selectTop5MostSystems = () => {
    if (!report?.summary.top5MostSystems) return;
    updateManualSelection([...manualSelection, ...report.summary.top5MostSystems]);
  };

  const selectSurvivingCorte = () => {
    if (!report?.matrizCorte.survivingBalls) return;
    updateManualSelection([...manualSelection, ...report.matrizCorte.survivingBalls]);
  };

  const sendToWheeling = () => {
    if (manualSelection.length === 0) return;
    const url = `/wheeling?numbers=${manualSelection.join(',')}&game=${selectedGame.toLowerCase()}`;
    window.open(url, '_blank');
  };

  const openMatrixStandaloneWindow = () => {
    window.open(
      `/admin/relatorios/matriz?game=${selectedGame}`,
      'matriz_dedicada',
      'width=1750,height=950,menubar=no,toolbar=no,location=no,status=no'
    );
  };

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

  const deleteArchivedReport = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    if (!confirm('Tem a certeza que deseja apagar este relatório do arquivo histórico?')) return;
    try {
      const res = await fetch(`/api/admin/reports?id=${encodeURIComponent(reportId)}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        setFeedback('Relatório apagado com sucesso.');
        const histRes = await fetch(`/api/admin/reports?game=${selectedGame}`);
        const histJson = await histRes.json();
        if (histJson.success) setHistoryList(histJson.data || []);
      } else {
        setFeedback('Erro ao apagar: ' + (json.error || 'Erro desconhecido'));
      }
    } catch (err: any) {
      setFeedback('Erro ao apagar relatório: ' + err.message);
    }
  };

  const deleteAllArchivedReports = async () => {
    if (!confirm(`Tem a certeza que deseja APAGAR TODOS os relatórios arquivados de ${activeGameConfig.name}? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/admin/reports?all=true&game=${selectedGame}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(json.message || 'Todos os relatórios arquivados foram removidos.');
        setHistoryList([]);
      } else {
        setFeedback('Erro ao apagar histórico: ' + (json.error || 'Erro desconhecido'));
      }
    } catch (err: any) {
      setFeedback('Erro ao apagar histórico: ' + err.message);
    }
  };

  const scrollMatrix = (direction: 'left' | 'right' | 'up' | 'down' | 'start' | 'end') => {
    if (!tableContainerRef.current) return;
    const el = tableContainerRef.current;
    const stepX = isCompact ? 220 : 360;
    const stepY = 240;

    if (direction === 'left') el.scrollBy({ left: -stepX, behavior: 'smooth' });
    if (direction === 'right') el.scrollBy({ left: stepX, behavior: 'smooth' });
    if (direction === 'up') el.scrollBy({ top: -stepY, behavior: 'smooth' });
    if (direction === 'down') el.scrollBy({ top: stepY, behavior: 'smooth' });
    if (direction === 'start') el.scrollTo({ left: 0, behavior: 'smooth' });
    if (direction === 'end') el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
  };

  const copyMarkdownReport = () => {
    if (!report) return;

    let text = `# 🎲 RELATÓRIO DIÁRIO DE PREVISÕES — ${report.gameName.toUpperCase()}\n`;
    text += `* **Data do Próximo Sorteio:** ${report.nextDrawWeekday}, ${report.nextDrawDate}\n`;
    text += `* **Data e Hora do Relatório:** ${new Date(report.createdAt).toLocaleString('pt-PT')}\n\n`;

    text += `## ✂️ 1. Matriz de Corte\n`;
    text += `* **Sugeridos (${report.matrizCorte.survivingBalls.length}):** ${report.matrizCorte.survivingBalls.join(', ')}\n`;
    text += `* **Cortados (${report.matrizCorte.cutBalls.length}):** ${report.matrizCorte.cutBalls.join(', ')}\n\n`;

    text += `## 📡 2. Radar de Maturação (JPI Decrescente)\n`;
    report.radarTable.forEach((r, idx) => {
      text += `${idx + 1}. **${r.systemName}** (${r.family || 'CYCLES'}) | JPI: ${r.jpiScore} | ${r.statusLabel} | Atraso: ${r.currentDelay}s (Méd: ${r.cycleMean}s)\n`;
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
    <div className={`min-h-screen bg-[#0B1120] text-slate-100 font-sans p-3 md:p-8 space-y-8 ${
      isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto p-4 bg-[#070B14]' : ''
    }`}>
      <div className="max-w-[1780px] mx-auto space-y-8">
        
        {/* Top Breadcrumb & Actions */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Laboratório Central & Backoffice</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {/* Abrir em Nova Janela */}
              <button
                onClick={openMatrixStandaloneWindow}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 transition border border-indigo-700/60 shadow-sm active:scale-95"
                title="Abre a matriz algorítmica numa nova janela dedicada independente"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                <span>Abrir Matriz em Nova Janela</span>
              </button>

              {/* Exportar para Excel (.xlsx) */}
              <button
                onClick={() => report && exportReportToExcel(report)}
                disabled={!report}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-600 text-white transition border border-emerald-500/80 shadow-md shadow-emerald-700/25 active:scale-95"
                title="Exportar todas as tabelas para Excel (.xlsx) com cada valor e bola numa coluna separada"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar Excel (.xlsx)</span>
              </button>

              {/* Explicação de Cálculo */}
              <button
                onClick={() => setShowCalculationHelp(!showCalculationHelp)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition border border-slate-700"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Como Funciona o Cálculo?</span>
              </button>

              {/* Arquivo Histórico */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition border border-slate-700"
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Arquivo Histórico ({historyList.length})</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Copiar Texto Markdown */}
              <button
                onClick={copyMarkdownReport}
                disabled={!report}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700 active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>

              {/* Gerar Novo */}
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                    Dossiê & Relatório Diário de Previsões
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    AUDITADO & PERSISTIDO
                  </span>
                </div>
                <p className="mt-1 text-xs md:text-sm text-slate-400">
                  Cruzamento algorítmico 1 a N, Matriz de Corte, Radar de Maturação JPI e Prancheta de Análise Direcional para Desdobramentos.
                </p>
              </div>
            </div>

            {/* Game Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
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
                  <span>Como Funcionam as Decisões de Valor e o Cálculo Algorítmico?</span>
                </div>
                <button 
                  onClick={() => setShowCalculationHelp(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Fechar ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-500"></span> 1. Os Votos no Top 5 (🔥)
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    Cada sistema gera um ranking de 1 a {report?.totalBalls || 50}. As <strong>5 primeiras posições (1º ao 5º)</strong> de cada sistema são pintadas de <strong>Amarelo</strong>. A linha <em>Votos no Top 5</em> indica exatamente quantos sistemas independentes coincidiram na escolha dessa bola para o seu quinteto de ouro.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span> 2. Média Posição Geral
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    É a média aritmética exata da posição de preferência atribuída a essa bola por <strong>todos os sistemas do catálogo</strong>. Quanto menor for a média (ex: 15.2º vs 36.4º), mais perto do topo absoluto essa bola ficou no consenso geral.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-indigo-400" /> 3. Top 5 Consenso vs Votos
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    Separamos duas métricas essenciais: o <strong>Top 5 por Menor Média</strong> (equilíbrio em todos os algoritmos) e o <strong>Top 5 em Mais Sistemas</strong> (bolas que reúnem mais votos no quinteto inicial).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> 4. Radar JPI de Maturação
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    Cruza o atraso atual com o ciclo médio histórico e a densidade de quase-jackpots recentes. Quando atinge o <strong>Ponto Óptimo (≥75)</strong>, o sistema está maduro e com probabilidade geométrica de rutura.
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
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-300 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  <span>Relatórios Arquivados Anteriores — {activeGameConfig.name}</span>
                  <span className="text-slate-500 font-normal">({historyList.length} encontrados)</span>
                </div>
                {historyList.length > 0 && (
                  <button
                    type="button"
                    onClick={deleteAllArchivedReports}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition text-[11px] font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                    title={`Apagar todos os ${historyList.length} relatórios guardados deste jogo`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Limpar Arquivo ({historyList.length})</span>
                  </button>
                )}
              </div>
              {historyList.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Nenhum relatório arquivado encontrado para este jogo.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                  {historyList.map(h => (
                    <div
                      key={h.id}
                      onClick={() => { loadReport(selectedGame, h.id); setShowHistory(false); }}
                      className="group relative p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 text-left transition text-xs space-y-2 cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center justify-between font-bold text-indigo-300">
                        <div className="flex flex-col">
                          <span className="text-indigo-400 font-extrabold">Sorteio: {h.nextDrawDate}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{new Date(h.createdAt).toLocaleString('pt-PT')}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => deleteArchivedReport(e, h.id)}
                          title="Apagar permanentemente este relatório guardado"
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm shrink-0 active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Apagar</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800/80">
                        Top Consenso: <strong className="text-slate-200">[{h.top5Consensus?.slice(0, 5).join(', ')}]</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </header>

        {loading ? (
          <div className="p-20 text-center text-slate-400 animate-pulse text-sm font-bold">
            A carregar dossiê e matriz comparativa...
          </div>
        ) : report ? (
          <div className="space-y-8">
            
            {/* ========================================================= */}
            {/* DECISÕES DE VALOR & CONSENSO PRÉ-SORTEIO (CARDS DE TOPO)  */}
            {/* ========================================================= */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Decisões de Valor & Consenso Central
                </h2>
                <span className="text-xs text-slate-500">
                  Próximo Sorteio: <strong className="text-white">{report.nextDrawWeekday}, {report.nextDrawDate}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CARD 1: SISTEMA MAIS MATURADO */}
                <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 p-5 rounded-3xl space-y-3 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-purple-400" /> Sistema Mais Maturado
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      JPI: {report.summary.radarLeaderJpi || report.radarTable[0]?.jpiScore || 90}
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-black text-white truncate" title={report.summary.radarLeader}>
                      {report.summary.radarLeader}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Atraso: <strong className="text-purple-300">{report.summary.radarLeaderDelay || report.radarTable[0]?.currentDelay || 0}s</strong> (Méd: {report.summary.radarLeaderMean || report.radarTable[0]?.cycleMean || 0}s)
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Estado:</span>
                    <span className="text-emerald-400 font-bold">{report.radarTable[0]?.statusLabel || 'Ponto Óptimo'}</span>
                  </div>
                </div>

                {/* CARD 2: TOP 5 MENOR MÉDIA GERAL */}
                <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 rounded-3xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-emerald-400" /> Top 5 Menor Média Geral
                    </span>
                    <button
                      onClick={selectTop5Consensus}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition border border-emerald-500/40 flex items-center gap-1"
                      title="Adicionar estes 5 números à prancheta de desdobramentos"
                    >
                      <Plus className="w-3 h-3" /> Prancheta
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {report.summary.top5Consensus.map(b => {
                      const item = report.consensus.find(c => c.ball === b);
                      return (
                        <div 
                          key={b} 
                          onClick={() => toggleBallSelection(b)}
                          className="flex flex-col items-center cursor-pointer group"
                          title={`Bola ${b} (Média ${item?.avgRank}º). Clica para selecionar.`}
                        >
                          <span className="w-8 h-8 rounded-full bg-emerald-600 group-hover:scale-110 text-white font-black text-xs flex items-center justify-center shadow-md transition">
                            {b}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-300 mt-0.5">
                            {item?.avgRank}º
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    Posições médias mais altas em todos os sistemas
                  </div>
                </div>

                {/* CARD 3: TOP 5 EM MAIS SISTEMAS */}
                <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-5 rounded-3xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Top 5 em Mais Sistemas
                    </span>
                    <button
                      onClick={selectTop5MostSystems}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition border border-amber-500/40 flex items-center gap-1"
                      title="Adicionar estes 5 números à prancheta de desdobramentos"
                    >
                      <Plus className="w-3 h-3" /> Prancheta
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(report.summary.top5MostSystems || report.summary.top5Consensus).map(b => {
                      const item = report.consensus.find(c => c.ball === b);
                      return (
                        <div 
                          key={b} 
                          onClick={() => toggleBallSelection(b)}
                          className="flex flex-col items-center cursor-pointer group"
                          title={`Bola ${b} (${item?.top5Votes} votos no Top 5). Clica para selecionar.`}
                        >
                          <span className="w-8 h-8 rounded-full bg-amber-500 group-hover:scale-110 text-slate-950 font-black text-xs flex items-center justify-center shadow-md transition">
                            {b}
                          </span>
                          <span className="text-[9px] font-mono text-amber-300 font-bold mt-0.5">
                            {item?.top5Votes} sist.
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    Mais votadas pelos quintetos de ouro independentes
                  </div>
                </div>

                {/* CARD 4: MATRIZ DE CORTE */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Matriz de Corte
                    </span>
                    <button
                      onClick={selectSurvivingCorte}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition border border-indigo-500/40 flex items-center gap-1"
                      title="Adicionar todas as bolas sobreviventes à prancheta"
                    >
                      <Plus className="w-3 h-3" /> Sobreviventes
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black text-emerald-400">
                      {report.matrizCorte.survivingBalls.length} Sobreviventes
                    </div>
                    <div className="text-xs text-rose-400 font-semibold">
                      {report.matrizCorte.cutBalls.length} bolas podadas (Via Negativa)
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                    Filtro prévio de risco estatístico
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* PRANCHETA DE ANÁLISE MANUAL & DESDOBRAMENTOS              */}
            {/* ========================================================= */}
            <section className="p-6 rounded-3xl bg-slate-900/90 border-2 border-indigo-500/30 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-purple-400" />
                    🎯 Prancheta de Análise & Seleção Manual para Desdobramentos
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Escolhe livremente os teus números (clicando nas bolas, adicionando dos botões ou escrevendo) e envia diretamente para a ferramenta de desdobramentos.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={selectTop5Consensus}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 transition border border-slate-700"
                  >
                    + Top 5 Menor Média
                  </button>
                  <button
                    onClick={selectTop5MostSystems}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 transition border border-slate-700"
                  >
                    + Top 5 Mais Votados
                  </button>
                  <button
                    onClick={selectSurvivingCorte}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 transition border border-slate-700"
                  >
                    + Sobreviventes Corte ({report.matrizCorte.survivingBalls.length})
                  </button>
                  {manualSelection.length > 0 && (
                    <button
                      onClick={() => updateManualSelection([])}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 transition border border-rose-800/60 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Number Selector Grid & Quick Input */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto">
                  {Array.from({ length: report.totalBalls }, (_, i) => i + 1).map(num => {
                    const isSelected = manualSelection.includes(num);
                    return (
                      <button
                        key={num}
                        onClick={() => toggleBallSelection(num)}
                        className={`w-8 h-8 rounded-full text-xs font-black transition flex items-center justify-center ${
                          isSelected
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105 ring-2 ring-emerald-300'
                            : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-indigo-400 hover:text-white'
                        }`}
                        title={`Bola ${num} (${isSelected ? 'Selecionada - clica para retirar' : 'Clica para selecionar'})`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                {/* Input Manual Box & Action Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <form onSubmit={handleManualInputSubmit} className="flex items-center gap-2 w-full md:w-auto">
                    <input
                      type="text"
                      value={manualInputText}
                      onChange={(e) => setManualInputText(e.target.value)}
                      placeholder="Ex: 7, 12, 19, 23, 37"
                      className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition w-48 sm:w-60"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700"
                    >
                      Adicionar
                    </button>
                  </form>

                  {/* Summary and Send Button */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="text-right">
                      <div className="text-xs font-black text-white">
                        {manualSelection.length > 0 ? (
                          <span className="text-emerald-400 font-mono text-sm">{manualSelection.length} Bolas Selecionadas</span>
                        ) : (
                          <span className="text-slate-500">Nenhuma bola selecionada</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">
                        {manualSelection.length > 0 ? `[ ${manualSelection.join(', ')} ]` : 'Clica nas bolas acima para escolher'}
                      </div>
                    </div>

                    <button
                      onClick={sendToWheeling}
                      disabled={manualSelection.length === 0}
                      className="px-5 py-2.5 rounded-xl font-black text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white transition shadow-lg shadow-purple-600/30 flex items-center gap-2 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar para Desdobramentos</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECÇÃO 1: A MATRIZ COMPARATIVA (1 a N) COM CONTROLOS V2  */}
            {/* ========================================================= */}
            <section className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                    1. Matriz de Cruzamento Algorítmico (Números de 1 a {report.totalBalls})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Organizada por Família. Cada célula indica a <strong>ordem de importância intrínseca (1º a {report.totalBalls}º)</strong> atribuída pelo sistema ao número.
                  </p>
                </div>
                
                {/* Secondary Actions & View Options */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Density Switch */}
                  <button
                    onClick={() => setIsCompact(!isCompact)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                      isCompact
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                    title="Aperta os números ao máximo para que caiba tudo na largura do teu ecrã sem ter de fazer scroll"
                  >
                    {isCompact ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    <span>{isCompact ? '📐 Caber no Ecrã (Ativo)' : '🔍 Modo Confortável'}</span>
                  </button>

                  {/* Open in Standalone Window */}
                  <button
                    onClick={openMatrixStandaloneWindow}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 transition shadow-sm flex items-center gap-1.5 active:scale-95"
                    title="Abre só a tabela da matriz numa nova janela inteira sem barras para análise máxima"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Nova Janela</span>
                  </button>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    {isFullscreen ? '✕ Sair de Ecrã Inteiro' : '⛶ Ecrã Inteiro'}
                  </button>

                  {/* Export Excel */}
                  <button
                    onClick={() => exportReportToExcel(report)}
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/80 transition shadow-md shadow-emerald-700/25 flex items-center gap-1.5 active:scale-95"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {/* High-Visibility Navigation Toolbar (Big Visible Buttons) */}
              <div className="p-3 bg-slate-900 border-2 border-indigo-500/40 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    Mover Tabela:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => scrollMatrix('start')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-xs font-black transition border border-slate-700 shadow flex items-center gap-1 active:scale-95"
                      title="Ir para o início (Bola 1)"
                    >
                      <span>⏮ Início</span>
                    </button>
                    <button
                      onClick={() => scrollMatrix('left')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition shadow-md shadow-indigo-600/30 flex items-center gap-1 active:scale-95"
                      title="Ver bolas anteriores à esquerda"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Bolas Anteriores</span>
                    </button>
                    <button
                      onClick={() => scrollMatrix('right')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition shadow-md shadow-indigo-600/30 flex items-center gap-1 active:scale-95"
                      title="Ver bolas seguintes à direita"
                    >
                      <span>Bolas Seguintes</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollMatrix('end')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-xs font-black transition border border-slate-700 shadow flex items-center gap-1 active:scale-95"
                      title="Ir para o final (Bola N)"
                    >
                      <span>Fim ⏭</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollMatrix('up')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black transition border border-slate-700 shadow flex items-center gap-1 active:scale-95"
                    title="Deslocar para o topo da tabela"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>Topo</span>
                  </button>
                  <button
                    onClick={() => scrollMatrix('down')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black transition border border-slate-700 shadow flex items-center gap-1 active:scale-95"
                    title="Deslocar para o consenso e médias no fundo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>Consenso / Médias</span>
                  </button>

                  <div className="hidden xl:flex items-center gap-2 text-[11px] font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 ml-2">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> 1º - 5º
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 ml-1.5"></span> 6º - 10º
                    <span className="w-2.5 h-2.5 rounded bg-emerald-600/80 ml-1.5"></span> 11º - {Math.ceil(report.totalBalls / 2)}º
                    <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700 ml-1.5"></span> &gt;{Math.ceil(report.totalBalls / 2)}º
                  </div>
                </div>
              </div>

              {/* Table Container with Controlled Scroll */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div 
                  ref={tableContainerRef}
                  className="overflow-x-auto max-h-[700px] relative scroll-smooth"
                >
                  <table className="w-full text-center border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 sticky top-0 z-30">
                        <th className={`p-3 text-left sticky left-0 z-40 bg-slate-950 border-r border-slate-800 shadow-md ${
                          isCompact ? 'min-w-[170px] max-w-[170px] text-[11px]' : 'min-w-[240px] max-w-[240px]'
                        }`}>
                          Sistema / Família
                        </th>
                        {Array.from({ length: report.totalBalls }, (_, i) => i + 1).map(num => {
                          const isSelected = manualSelection.includes(num);
                          return (
                            <th
                              key={num}
                              onMouseEnter={() => setHoveredCol(num)}
                              onMouseLeave={() => setHoveredCol(null)}
                              onClick={() => toggleBallSelection(num)}
                              className={`cursor-pointer transition select-none ${
                                isCompact ? 'py-1 px-0.5 min-w-[22px] max-w-[24px]' : 'py-2 px-1 min-w-[34px]'
                              } ${hoveredCol === num ? 'bg-indigo-600/25' : ''} ${isSelected ? 'bg-emerald-950/60' : ''}`}
                              title={`Bola ${num} (Clica para adicionar/remover da tua prancheta de desdobramentos)`}
                            >
                              <span className={`inline-flex items-center justify-center rounded-full font-black transition ${
                                isCompact ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-[11px]'
                              } ${
                                isSelected
                                  ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 font-black'
                                  : 'bg-slate-800 text-slate-200 border border-slate-700 hover:border-indigo-400'
                              }`}>
                                {num}
                              </span>
                            </th>
                          );
                        })}
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
                                  {famConfig.icon} {famConfig.label}
                                </span>
                              </td>
                            </tr>

                            {/* Systems in this family */}
                            {systemsInFamily.map(sys => {
                              const isMatriz = sys.family === 'PRIORITÁRIO' || sys.name.toLowerCase().includes('corte');
                              return (
                                <tr 
                                  key={sys.name}
                                  className={`hover:bg-slate-800/40 transition group ${isMatriz ? 'bg-amber-950/20 font-semibold' : ''}`}
                                >
                                  <td className={`p-2.5 text-left sticky left-0 z-20 bg-slate-900 group-hover:bg-slate-800 transition border-r border-slate-800 font-sans shadow-sm whitespace-nowrap ${
                                    isCompact ? 'min-w-[170px] max-w-[170px] text-[11px]' : 'min-w-[240px] max-w-[240px]'
                                  }`}>
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className={`truncate ${isMatriz ? 'text-amber-400 font-black' : 'text-slate-200 font-semibold'}`} title={sys.name}>
                                        {sys.name}
                                      </span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold shrink-0 ${
                                        isMatriz ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'
                                      }`}>
                                        {isMatriz ? 'CORTE' : (sys.recommendation === 'DIRECT' ? '☀️' : (sys.recommendation === 'MIRROR' ? '🌑' : '⚖️'))}
                                      </span>
                                    </div>
                                  </td>

                                  {Array.from({ length: report.totalBalls }, (_, i) => i + 1).map(b => {
                                    const r = sys.ranks[b] || report.totalBalls;
                                    const isSelected = manualSelection.includes(b);
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
                                      badge = r;
                                      if (r <= report.matrizCorte.survivingBalls.length) {
                                        cellStyle = 'bg-emerald-600 text-white font-black shadow-sm';
                                      } else {
                                        cellStyle = 'bg-rose-950/60 text-rose-300 border border-rose-900/50 font-semibold';
                                      }
                                    }

                                    return (
                                      <td
                                        key={b}
                                        onMouseEnter={() => setHoveredCol(b)}
                                        onMouseLeave={() => setHoveredCol(null)}
                                        onClick={() => toggleBallSelection(b)}
                                        className={`cursor-pointer border-r border-slate-800/30 transition select-none ${
                                          isCompact ? 'p-0.5' : 'p-1'
                                        } ${hoveredCol === b ? 'bg-indigo-600/15' : ''} ${isSelected ? 'bg-emerald-950/40' : ''}`}
                                        title={`${sys.name} → Bola ${b}: Posição ${r}º (Clica para selecionar)`}
                                      >
                                        <span className={`inline-flex items-center justify-center w-full rounded ${
                                          isCompact ? 'py-0.5 text-[10px]' : 'py-0.5 text-xs'
                                        } ${cellStyle}`}>
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
                        <td className={`p-3 text-left sticky left-0 z-40 bg-slate-950 border-r border-slate-800 font-sans text-indigo-400 font-black shadow-md ${
                          isCompact ? 'text-[11px]' : ''
                        }`}>
                          Média Posição Geral
                        </td>
                        {Array.from({ length: report.totalBalls }, (_, i) => i + 1).map(b => {
                          const item = report.consensus.find(c => c.ball === b) || { avgRank: 25, top5Votes: 0 };
                          const isBest = item.avgRank <= 20;
                          return (
                            <td 
                              key={b}
                              onClick={() => toggleBallSelection(b)}
                              className={`cursor-pointer border-r border-slate-800/50 font-mono ${
                                isCompact ? 'p-0.5 text-[10px]' : 'p-1'
                              } ${
                                isBest ? 'text-emerald-400 font-black bg-emerald-950/30' : 'text-slate-400'
                              } ${hoveredCol === b ? 'bg-indigo-600/20' : ''}`}
                              title={`Bola ${b}: Média de posição ${item.avgRank}º entre todos os sistemas (Clica para selecionar)`}
                            >
                              {item.avgRank}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className={`p-2 text-left sticky left-0 z-40 bg-slate-950 border-r border-slate-800 font-sans text-amber-400 font-black shadow-md ${
                          isCompact ? 'text-[11px]' : ''
                        }`}>
                          Votos no Top 5 (🔥)
                        </td>
                        {Array.from({ length: report.totalBalls }, (_, i) => i + 1).map(b => {
                          const item = report.consensus.find(c => c.ball === b) || { top5Votes: 0 };
                          const hot = item.top5Votes >= 4;
                          return (
                            <td
                              key={b}
                              onClick={() => toggleBallSelection(b)}
                              className={`cursor-pointer border-r border-slate-800/50 font-mono ${
                                isCompact ? 'p-0.5 text-[10px]' : 'p-1'
                              } ${
                                hot ? 'text-amber-300 font-black bg-amber-500/20' : 'text-slate-500'
                              } ${hoveredCol === b ? 'bg-indigo-600/20' : ''}`}
                              title={`Bola ${b}: ${item.top5Votes} sistemas escolheram para o seu Top 5 (Clica para selecionar)`}
                            >
                              {item.top5Votes > 0 ? item.top5Votes : '-'}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className={`p-1.5 text-left sticky left-0 z-40 bg-slate-950 border-r border-slate-800 font-sans text-blue-400 font-semibold shadow-md ${
                          isCompact ? 'text-[10px]' : 'text-[10px]'
                        }`}>
                          Votos no Top 10
                        </td>
                        {Array.from({ length: report.totalBalls }, (_, i) => i + 1).map(b => {
                          const item = report.consensus.find(c => c.ball === b) || { top10Votes: 0 };
                          return (
                            <td
                              key={b}
                              onClick={() => toggleBallSelection(b)}
                              className={`cursor-pointer border-r border-slate-800/50 font-mono text-[10px] ${
                                item.top10Votes >= 8 ? 'text-blue-300 font-bold bg-blue-950/20' : 'text-slate-500'
                              } ${hoveredCol === b ? 'bg-indigo-600/20' : ''}`}
                              title={`Bola ${b}: ${item.top10Votes} sistemas no Top 10`}
                            >
                              {item.top10Votes > 0 ? item.top10Votes : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECÇÃO 2: MATRIZ DE CORTE                                 */}
            {/* ========================================================= */}
            <section className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  2. Matriz de Corte
                </h2>
                <span className="text-xs text-slate-400">Total: {report.totalBalls} Bolas</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
                  <div className="text-[11px] font-sans font-bold text-emerald-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Bolas Sobreviventes Recomendadas ({report.matrizCorte.survivingBalls.length})
                    </span>
                    <button
                      onClick={selectSurvivingCorte}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-sans text-[10px] font-bold transition border border-emerald-500/40"
                    >
                      + Enviar para Prancheta
                    </button>
                  </div>
                  <div className="text-emerald-200 font-bold tracking-wide flex flex-wrap gap-1.5 pt-1">
                    {report.matrizCorte.survivingBalls.map(num => (
                      <span
                        key={num}
                        onClick={() => toggleBallSelection(num)}
                        className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center cursor-pointer hover:bg-emerald-500 hover:text-white transition"
                        title={`Bola ${num} sobrevivente. Clica para alternar na prancheta.`}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 space-y-2">
                  <div className="text-[11px] font-sans font-bold text-rose-400">
                    ✕ Bolas Eliminadas / Risco Elevado ({report.matrizCorte.cutBalls.length})
                  </div>
                  <div className="text-slate-400 tracking-wide flex flex-wrap gap-1.5 pt-1">
                    {report.matrizCorte.cutBalls.map(num => (
                      <span
                        key={num}
                        className="w-7 h-7 rounded-full bg-slate-900/80 border border-rose-900/50 text-rose-300 flex items-center justify-center text-[11px] font-semibold"
                        title={`Bola ${num} podada da Via Negativa`}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* SECÇÃO 3: RADAR DE MATURAÇÃO COM FAMÍLIA DO SISTEMA       */}
            {/* ========================================================= */}
            <section className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    3. Ferramenta de Maturação (Radar JPI Decrescente)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ordenado pelo índice JPI. Inclui a família do sistema, atraso atual, ciclo médio e densidade de quase-jackpots.
                  </p>
                </div>
                <button
                  onClick={() => exportReportToExcel(report)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exportar Esta Tabela</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Sistema</th>
                      <th className="p-3">Família</th>
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
                    {report.radarTable.map((r, idx) => {
                      const famConfig = FAMILY_CONFIG[r.family || 'CYCLES'] || { label: r.family || 'Geral', icon: '⚙️', badge: 'bg-slate-800 text-slate-300' };
                      return (
                        <tr key={r.systemId} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 text-slate-500 font-bold">{idx + 1}</td>
                          <td className="p-3 font-sans font-bold text-slate-200">
                            <Link 
                              href={`/ranking/${selectedGame.toLowerCase()}/${encodeURIComponent(r.systemName)}`}
                              className="hover:text-indigo-400 transition"
                              target="_blank"
                            >
                              {r.systemName}
                            </Link>
                          </td>
                          <td className="p-3 font-sans">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${famConfig.badge}`}>
                              <span>{famConfig.icon}</span>
                              <span>{famConfig.label}</span>
                            </span>
                          </td>
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
                      );
                    })}
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
