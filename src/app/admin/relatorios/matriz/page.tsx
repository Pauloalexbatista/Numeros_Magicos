'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw, 
  FileSpreadsheet, 
  Send,
  Maximize2,
  Minimize2,
  Info
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
  PRIORITÁRIO: { label: '✂️ Matriz de Corte', icon: '✂️', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  INTELLIGENCE: { label: '🧠 Inteligência Artificial & Especialistas', icon: '🧠', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  INERTIA: { label: '🔥 Inércia, Calor & Recência', icon: '🔥', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  GEOMETRY: { label: '📐 Geometria & Matrizes Dimensionais', icon: '📐', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  CYCLES: { label: '🔄 Ciclos, Pêndulo & Probabilidade', icon: '🔄', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' }
};

const FAMILY_ORDER = ['PRIORITÁRIO', 'INTELLIGENCE', 'INERTIA', 'GEOMETRY', 'CYCLES'];

function MatrizStandaloneContent() {
  const searchParams = useSearchParams();
  const initialGame = searchParams.get('game')?.toUpperCase() || 'EUROMILLIONS';
  const [selectedGame, setSelectedGame] = useState(initialGame);
  const [report, setReport] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [manualSelection, setManualSelection] = useState<number[]>([]);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`nm_report_draft_selection_${selectedGame}`);
    if (saved) {
      try {
        setManualSelection(JSON.parse(saved));
      } catch {
        setManualSelection([]);
      }
    }
  }, [selectedGame]);

  const updateManualSelection = (nums: number[]) => {
    const sorted = Array.from(new Set(nums)).sort((a, b) => a - b);
    setManualSelection(sorted);
    localStorage.setItem(`nm_report_draft_selection_${selectedGame}`, JSON.stringify(sorted));
  };

  const toggleBallSelection = (ball: number) => {
    if (manualSelection.includes(ball)) {
      updateManualSelection(manualSelection.filter(b => b !== ball));
    } else {
      updateManualSelection([...manualSelection, ball]);
    }
  };

  const loadReport = async (gameKey: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?game=${gameKey}&latest=true`);
      const json = await res.json();
      if (json.success && json.data) {
        setReport(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(selectedGame);
  }, [selectedGame]);

  const scrollMatrix = (direction: 'left' | 'right' | 'up' | 'down' | 'start' | 'end') => {
    if (!tableContainerRef.current) return;
    const el = tableContainerRef.current;
    const stepX = isCompact ? 180 : 320;
    const stepY = 240;

    if (direction === 'left') el.scrollBy({ left: -stepX, behavior: 'smooth' });
    if (direction === 'right') el.scrollBy({ left: stepX, behavior: 'smooth' });
    if (direction === 'up') el.scrollBy({ top: -stepY, behavior: 'smooth' });
    if (direction === 'down') el.scrollBy({ top: stepY, behavior: 'smooth' });
    if (direction === 'start') el.scrollTo({ left: 0, behavior: 'smooth' });
    if (direction === 'end') el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
  };

  const sendToWheeling = () => {
    if (manualSelection.length === 0) return;
    const url = `/wheeling?numbers=${manualSelection.join(',')}&game=${selectedGame.toLowerCase()}`;
    window.open(url, '_blank');
  };

  const activeGameConfig = GAMES.find(g => g.key === selectedGame) || GAMES[0];

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans p-2 sm:p-4 flex flex-col space-y-3">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black">
            M
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              Matriz Algorítmica 1 a {report?.totalBalls || 50} — {activeGameConfig.name}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                JANELA DEDICADA
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Próximo sorteio: {report?.nextDrawDate} ({report?.nextDrawWeekday})
            </p>
          </div>
        </div>

        {/* Game Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {GAMES.map(g => (
            <button
              key={g.key}
              onClick={() => setSelectedGame(g.key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedGame === g.key
                  ? `bg-gradient-to-r ${g.color} text-white shadow`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Density Toggle */}
          <button
            onClick={() => setIsCompact(!isCompact)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              isCompact
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Alternar entre modo normal e ultra compacto para caber todo o volante no ecrã"
          >
            {isCompact ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isCompact ? '📐 Caber no Ecrã (Ativo)' : '🔍 Modo Confortável'}</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => report && exportReportToExcel(report)}
            disabled={!report}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500 transition shadow-md shadow-emerald-700/30 flex items-center gap-1.5 active:scale-95"
            title="Exportar toda a matriz e relatório para Excel (.xlsx) com cada valor numa coluna"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Manual Selection Floating Strip */}
      <div className="p-2.5 px-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1">
            🎯 Seleção Manual:
          </span>
          <span className="text-xs font-bold text-slate-300">
            {manualSelection.length > 0 ? (
              <span className="text-emerald-400 font-black">{manualSelection.length} bolas</span>
            ) : (
              <span className="text-slate-500">Clica em qualquer bola da tabela para selecionar</span>
            )}
          </span>
          {manualSelection.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 ml-2">
              {manualSelection.map(num => (
                <button
                  key={num}
                  onClick={() => toggleBallSelection(num)}
                  className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center hover:bg-rose-600 transition"
                  title={`Remover bola ${num}`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => updateManualSelection([])}
                className="text-[10px] text-slate-400 hover:text-rose-400 ml-2 underline"
              >
                Limpar
              </button>
            </div>
          )}
        </div>

        {manualSelection.length > 0 && (
          <button
            onClick={sendToWheeling}
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-500 text-white transition shadow flex items-center gap-1.5 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar {manualSelection.length} para Desdobramentos</span>
          </button>
        )}
      </div>

      {/* Main Navigation Toolbar (High Visibility) */}
      <div className="p-3 bg-slate-900 border-2 border-indigo-500/40 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1">
            Navegar Tabela:
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
            <span className="w-2.5 h-2.5 rounded bg-emerald-600/80 ml-1.5"></span> 11º - {report ? Math.ceil(report.totalBalls / 2) : 25}º
          </div>
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center p-20 text-slate-400 font-bold animate-pulse">
          A carregar matriz completa...
        </div>
      ) : report ? (
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          <div 
            ref={tableContainerRef}
            className="overflow-auto flex-1 relative scroll-smooth max-h-[calc(100vh-210px)]"
          >
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 sticky top-0 z-30">
                  <th className={`p-2 text-left sticky left-0 z-40 bg-slate-950 border-r border-slate-800 shadow-md ${
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
                        title={`Bola ${num} (Clica para adicionar/remover da seleção manual)`}
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
                      {/* Family Header */}
                      <tr className="bg-slate-950 font-bold border-y border-slate-800 text-left">
                        <td 
                          colSpan={report.totalBalls + 1}
                          className="py-2 px-3 sticky left-0 z-20 bg-slate-950 shadow-inner"
                        >
                          <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black border ${famConfig.badge}`}>
                            {famConfig.label}
                          </span>
                        </td>
                      </tr>

                      {/* Systems */}
                      {systemsInFamily.map(sys => {
                        const isMatriz = sys.family === 'PRIORITÁRIO' || sys.name.toLowerCase().includes('corte');
                        return (
                          <tr 
                            key={sys.name}
                            className={`hover:bg-slate-800/40 transition group ${isMatriz ? 'bg-amber-950/20 font-semibold' : ''}`}
                          >
                            <td className={`p-2 text-left sticky left-0 z-20 bg-slate-900 group-hover:bg-slate-800 transition border-r border-slate-800 font-sans shadow-sm whitespace-nowrap ${
                              isCompact ? 'min-w-[170px] max-w-[170px] text-[11px]' : 'min-w-[240px] max-w-[240px]'
                            }`}>
                              <div className="flex items-center justify-between gap-1.5">
                                <span className={`truncate ${isMatriz ? 'text-amber-400 font-black' : 'text-slate-200 font-semibold'}`} title={sys.name}>
                                  {sys.name}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold shrink-0 ${
                                  isMatriz ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'
                                }`}>
                                  {isMatriz ? 'CORTE' : (sys.recommendation === 'DIRECT' ? '☀️' : '🌑')}
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

              {/* Footers */}
              <tfoot className="border-t-2 border-slate-700 bg-slate-950 text-[11px] font-bold sticky bottom-0 z-30">
                <tr>
                  <td className={`p-2.5 text-left sticky left-0 z-40 bg-slate-950 border-r border-slate-800 font-sans text-indigo-400 font-black shadow-md ${
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
                        } ${isBest ? 'text-emerald-400 font-black bg-emerald-950/30' : 'text-slate-400'} ${
                          hoveredCol === b ? 'bg-indigo-600/20' : ''
                        }`}
                        title={`Bola ${b}: Média de posição ${item.avgRank}º entre todos os sistemas`}
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
                        } ${hot ? 'text-amber-300 font-black bg-amber-500/20' : 'text-slate-500'} ${
                          hoveredCol === b ? 'bg-indigo-600/20' : ''
                        }`}
                        title={`Bola ${b}: ${item.top5Votes} sistemas colocaram-na no seu Top 5`}
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
      ) : null}
    </div>
  );
}

export default function MatrizStandalonePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-400 font-bold">A carregar matriz...</div>}>
      <MatrizStandaloneContent />
    </Suspense>
  );
}
