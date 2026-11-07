'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Database,
  Search,
  Filter,
  Trophy,
  Target,
  Zap,
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Lock,
  Calendar,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { DrawSummaryItem, DrawAuditResult, SystemAuditItem } from '@/services/raio-x-service';

const GAMES = [
  { id: 'EUROMILLIONS', name: 'Euromilhões', color: 'blue', borderActive: 'border-blue-500', bgActive: 'bg-blue-600 text-white shadow-blue-500/20' },
  { id: 'TOTOLOTO', name: 'Totoloto', color: 'emerald', borderActive: 'border-emerald-500', bgActive: 'bg-emerald-600 text-white shadow-emerald-500/20' },
  { id: 'EURODREAMS', name: 'EuroDreams', color: 'purple', borderActive: 'border-purple-500', bgActive: 'bg-purple-600 text-white shadow-purple-500/20' },
  { id: 'MEGASENA', name: 'Mega-Sena', color: 'amber', borderActive: 'border-amber-500', bgActive: 'bg-amber-500 text-slate-950 font-black shadow-amber-500/20' },
  { id: 'LOTOFACIL', name: 'Lotofácil', color: 'pink', borderActive: 'border-pink-500', bgActive: 'bg-pink-600 text-white shadow-pink-500/20' }
];

export default function RaioXClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputSecret, setInputSecret] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeGame, setActiveGame] = useState('EUROMILLIONS');
  const [draws, setDraws] = useState<DrawSummaryItem[]>([]);
  const [selectedDrawId, setSelectedDrawId] = useState<number | null>(null);
  const [audit, setAudit] = useState<DrawAuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'CHAMPIONS' | 'PRIZES' | 'ZEROS' | 'ENSEMBLE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSystemIds, setExpandedSystemIds] = useState<Set<number>>(new Set());

  // 1. Auth check
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

  const validateSecret = async (secret: string) => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('nm_admin_secret', secret);
        setAuthError(null);
        fetchData(activeGame, null);
      } else {
        setIsAuthenticated(false);
        setAuthError('Chave mestra inválida.');
        setLoading(false);
      }
    } catch {
      setIsAuthenticated(false);
      setAuthError('Falha ao autenticar.');
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSecret) return;
    setLoading(true);
    validateSecret(inputSecret);
  };

  // 2. Data fetching
  const fetchData = async (game: string, drawId: number | null) => {
    setLoading(true);
    try {
      const url = drawId 
        ? `/api/admin/raio-x?game=${game}&drawId=${drawId}`
        : `/api/admin/raio-x?game=${game}`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setDraws(data.draws || []);
        setAudit(data.audit || null);
        if (data.audit?.draw) {
          setSelectedDrawId(data.audit.draw.id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar auditoria Raio-X:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGameChange = (gameId: string) => {
    setActiveGame(gameId);
    setSelectedDrawId(null);
    setSearchTerm('');
    setFilterType('ALL');
    fetchData(gameId, null);
  };

  const handleDrawChange = (drawId: number) => {
    setSelectedDrawId(drawId);
    fetchData(activeGame, drawId);
  };

  // Navegação anterior / seguinte
  const currentIndex = draws.findIndex(d => d.id === selectedDrawId);
  const hasNewer = currentIndex > 0;
  const hasOlder = currentIndex >= 0 && currentIndex < draws.length - 1;

  const handleOlder = () => {
    if (hasOlder) handleDrawChange(draws[currentIndex + 1].id);
  };

  const handleNewer = () => {
    if (hasNewer) handleDrawChange(draws[currentIndex - 1].id);
  };

  const toggleExpand = (id: number) => {
    setExpandedSystemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (!audit) return;
    if (expandedSystemIds.size === audit.systems.length) {
      setExpandedSystemIds(new Set());
    } else {
      setExpandedSystemIds(new Set(audit.systems.map(s => s.id)));
    }
  };

  // Filtros de sistemas
  const filteredSystems = useMemo(() => {
    if (!audit) return [];
    let list = audit.systems;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s => s.systemName.toLowerCase().includes(term));
    }

    if (filterType === 'CHAMPIONS') {
      list = list.filter(s => s.hitCount === audit.summary.maxHits);
    } else if (filterType === 'PRIZES') {
      list = list.filter(s => s.isJackpot || s.isTrave);
    } else if (filterType === 'ZEROS') {
      list = list.filter(s => s.isAntiJackpot);
    } else if (filterType === 'ENSEMBLE') {
      list = list.filter(s => s.systemType === 'ensemble');
    }

    return list;
  }, [audit, searchTerm, filterType]);

  // Se não autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Acesso Reservado
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs text-center mt-1">
              Raio-X de Sorteio e Máquina do Tempo Histórica
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Chave mestra de administrador"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={inputSecret}
              onChange={(e) => setInputSecret(e.target.value)}
            />
            {authError && (
              <p className="text-xs text-red-500 font-semibold text-center bg-red-50 dark:bg-red-950/40 py-2 rounded-lg">
                {authError}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !inputSecret}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm"
            >
              {loading ? 'A validar...' : 'Entrar no Raio-X'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/admin" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
              ← Voltar ao Backoffice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d19] text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin"
                className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Backoffice Admin
              </Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Auditoria Histórica
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>🔬 Raio-X de Sorteio & Máquina do Tempo</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Auditoria determinística e factual: inspecione qualquer concurso da história em qualquer um dos 5 jogos. Veja as bolas oficiais, todos os 20 sistemas lado a lado e as listas de corte exatas sem nenhum cálculo dinâmico.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(activeGame, selectedDrawId)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 rounded-xl transition-all shadow-sm text-slate-700 dark:text-slate-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Recarregar</span>
            </button>
          </div>
        </div>

        {/* Game Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900/90 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {GAMES.map(g => {
            const isActive = activeGame === g.id;
            return (
              <button
                key={g.id}
                onClick={() => handleGameChange(g.id)}
                className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? g.bgActive
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{g.name}</span>
              </button>
            );
          })}
        </div>

        {/* Time Machine Bar: Sorteio Selector & Step Buttons */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Draw Selector Dropdown */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Escolher Sorteio:</span>
              </label>

              <div className="relative flex-1 max-w-xl">
                <select
                  value={selectedDrawId || ''}
                  onChange={(e) => handleDrawChange(Number(e.target.value))}
                  disabled={loading || draws.length === 0}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-10 cursor-pointer"
                >
                  {draws.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.date} • {d.sequenceNumber ? `Concurso #${d.sequenceNumber}` : `ID #${d.id}`} • Bolas: [{d.numbers.join(', ')}]
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Stepper Buttons (Anterior / Seguinte) */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleOlder}
                disabled={!hasOlder || loading}
                className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all flex items-center gap-1"
                title="Sorteio Mais Antigo"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/50 rounded-lg text-xs font-mono font-bold text-slate-500">
                {currentIndex >= 0 ? `${currentIndex + 1} de ${draws.length}` : '-'}
              </div>

              <button
                onClick={handleNewer}
                disabled={!hasNewer || loading}
                className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all flex items-center gap-1"
                title="Sorteio Mais Recente"
              >
                <span>Seguinte</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Official Drawn Result Card */}
          {audit?.draw && (
            <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {audit.draw.gameName}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {audit.draw.date} {audit.draw.sequenceNumber ? `• Concurso #${audit.draw.sequenceNumber}` : `• ID #${audit.draw.id}`}
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Bolas Oficiais Sorteadas:
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {audit.draw.numbers.map(num => (
                  <div
                    key={num}
                    className="w-10 h-10 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white font-black text-base flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30"
                  >
                    {num}
                  </div>
                ))}

                {audit.draw.stars && audit.draw.stars.length > 0 && (
                  <>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />
                    {audit.draw.stars.map(star => (
                      <div
                        key={star}
                        className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center shadow-lg shadow-amber-400/25 border border-amber-300"
                        title={audit.spec.starName}
                      >
                        ★ {star}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Global Draw Performance Metrics */}
        {audit?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Sistemas Testados
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-5 h-5 text-indigo-500" />
                <span>{audit.summary.totalSystems}</span>
              </div>
              <span className="text-[10px] text-slate-400">Total registado na BD</span>
            </div>

            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                Jackpots ({audit.spec.jackpotHits}/{audit.spec.jackpotHits})
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Trophy className="w-5 h-5" />
                <span>{audit.summary.jackpotCount}</span>
              </div>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">100% no Top Sugerido</span>
            </div>

            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 shadow-sm">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                Traves ({audit.spec.traveHits}/{audit.spec.drawnBalls})
              </span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Target className="w-5 h-5" />
                <span>{audit.summary.traveCount}</span>
              </div>
              <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80">Jackpot - 1 no Top</span>
            </div>

            <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 shadow-sm">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block mb-1">
                Anti-Jackpot (0)
              </span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Zap className="w-5 h-5" />
                <span>{audit.summary.antiJackpotCount}</span>
              </div>
              <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80">100% no Anti-Sistema</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Média de Acertos
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>{audit.summary.averageHits}</span>
                <span className="text-xs font-bold text-slate-400">/{audit.spec.drawnBalls}</span>
              </div>
              <span className="text-[10px] text-slate-400">Máximo obtido: {audit.summary.maxHits}</span>
            </div>
          </div>
        )}

        {/* Filter and Search Controls */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtro:</span>
            </span>

            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              Todos ({audit?.systems.length || 0})
            </button>

            <button
              onClick={() => setFilterType('CHAMPIONS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                filterType === 'CHAMPIONS'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Campeões ({audit?.systems.filter(s => s.hitCount === audit.summary.maxHits).length || 0})</span>
            </button>

            <button
              onClick={() => setFilterType('PRIZES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                filterType === 'PRIZES'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Jackpot / Trave ({(audit?.summary.jackpotCount || 0) + (audit?.summary.traveCount || 0)})</span>
            </button>

            <button
              onClick={() => setFilterType('ZEROS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                filterType === 'ZEROS'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Anti-Jackpot ({audit?.summary.antiJackpotCount || 0})</span>
            </button>

            <button
              onClick={() => setFilterType('ENSEMBLE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                filterType === 'ENSEMBLE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ensembles</span>
            </button>
          </div>

          {/* Search Box & Expand All */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar sistema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 md:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <button
              onClick={toggleExpandAll}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all whitespace-nowrap"
            >
              {expandedSystemIds.size === (audit?.systems.length || 0) ? 'Recolher Tudo' : 'Expandir Tudo'}
            </button>
          </div>
        </div>

        {/* Systems List */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              A carregar predições factuais da base de dados...
            </p>
          </div>
        ) : filteredSystems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              Nenhum sistema corresponde ao filtro selecionado.
            </p>
            <button
              onClick={() => { setFilterType('ALL'); setSearchTerm(''); }}
              className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSystems.map(system => {
              const isExpanded = expandedSystemIds.has(system.id);
              const isChampion = system.hitCount === audit?.summary.maxHits;

              return (
                <div
                  key={system.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all ${
                    system.isJackpot
                      ? 'border-emerald-400 dark:border-emerald-700 shadow-md shadow-emerald-500/10'
                      : system.isTrave
                      ? 'border-indigo-400 dark:border-indigo-700 shadow-md shadow-indigo-500/10'
                      : system.isAntiJackpot
                      ? 'border-rose-300 dark:border-rose-900/60'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* System Header */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-300">
                        {system.systemType === 'ensemble' ? (
                          <Layers className="w-5 h-5 text-indigo-500" />
                        ) : (
                          <Database className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            {system.systemName}
                          </h3>
                          {system.systemType === 'ensemble' ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                              Ensemble
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Base
                            </span>
                          )}
                          {isChampion && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                              <Trophy className="w-3 h-3" /> Campeão do Sorteio
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Corte: Top {system.cutSize} Sugeridos vs {system.totalBalls - system.cutSize} Restantes (Anti-Sistema)
                        </p>
                      </div>
                    </div>

                    {/* Hits Badge & Expand Button */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {system.isJackpot ? (
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500 text-white shadow-md shadow-emerald-500/25 flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5" /> JACKPOT ({system.hitCount}/{system.totalDrawn})
                            </span>
                          ) : system.isTrave ? (
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-indigo-600 text-white shadow-md shadow-indigo-600/25 flex items-center gap-1">
                              <Target className="w-3.5 h-3.5" /> TRAVE ({system.hitCount}/{system.totalDrawn})
                            </span>
                          ) : system.isAntiJackpot ? (
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-500 text-white shadow-md shadow-rose-500/25 flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5" /> ANTI-JACKPOT (0/{system.totalDrawn})
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {system.hitCount}/{system.totalDrawn} Acertos
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {system.remainingHits.length} {system.remainingHits.length === 1 ? 'bola no Anti-Sistema' : 'bolas no Anti-Sistema'}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleExpand(system.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                        title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body: Drawn Balls Destination & Rankings */}
                  <div className="p-5 space-y-4">
                    
                    {/* Position of each drawn ball */}
                    <div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                        <span>Destino das {system.totalDrawn} Bolas Sorteadas no Ranking deste Sistema:</span>
                        <span className="text-[11px] font-normal normal-case text-slate-400">
                          (Linha de corte: #{system.cutSize})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                        {system.ballPositions.map(bp => (
                          <div
                            key={bp.ball}
                            className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
                              bp.inCut
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center text-white shadow-sm ${
                                bp.inCut ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}>
                                {bp.ball}
                              </span>
                              <div className="leading-tight">
                                <span className="text-[11px] font-black block">
                                  Pos #{bp.position}
                                </span>
                                <span className="text-[9px] font-medium opacity-80">
                                  {bp.inCut ? 'No Top' : 'Fora do corte'}
                                </span>
                              </div>
                            </div>

                            {bp.inCut ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expanded details: Full Balls Comparison */}
                    {isExpanded && (
                      <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                        
                        {/* Sugeridos (Top X) */}
                        <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span>Sugeridos pelo Sistema (Top {system.cutSize})</span>
                            </span>
                            <span className="text-xs font-black text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                              {system.suggestedHits.length} / {system.totalDrawn} Acertos
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {system.suggestedBalls.map((ball, idx) => {
                              const isHit = system.suggestedHits.includes(ball);
                              return (
                                <div
                                  key={ball}
                                  className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
                                    isHit
                                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400 scale-110 z-10'
                                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                  }`}
                                  title={`Posição #${idx + 1}: Bola ${ball}${isHit ? ' (ACERTOU!)' : ''}`}
                                >
                                  {ball}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Restantes (Anti-Top X) */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Zap className="w-4 h-4 text-slate-400" />
                              <span>Restantes / Anti-Sistema ({system.totalBalls - system.cutSize} Bolas)</span>
                            </span>
                            <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                              {system.remainingHits.length} Bolas Sorteadas Aqui
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {system.remainingBalls.map((ball, idx) => {
                              const isHit = system.remainingHits.includes(ball);
                              return (
                                <div
                                  key={ball}
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                                    isHit
                                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400 scale-110 z-10'
                                      : 'bg-white/60 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/40'
                                  }`}
                                  title={`Posição #${system.cutSize + idx + 1}: Bola ${ball}${isHit ? ' (Sorteada no Anti-Sistema)' : ''}`}
                                >
                                  {ball}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
